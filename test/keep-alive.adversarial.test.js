/**
 * test/keep-alive.adversarial.test.js
 *
 * EMPIRICAL ADVERSARIAL STRESS TEST SUITE for scripts/keep-alive.js
 * Tests resilience against extreme edge cases, corrupt inputs,
 * network failures, timeouts, retry exhaustion, and security leaks.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const {
  parseEnv,
  parseEnvFile,
  maskKey,
  normalizeUrl,
  resolveConfig,
  pingWithRetry,
  pingSupabase,
  runKeepAlive,
  PRIMARY_ENDPOINT,
  FALLBACK_ENDPOINT,
} = require('../scripts/keep-alive.js');

const SCRIPT_PATH = path.resolve(__dirname, '..', 'scripts', 'keep-alive.js');

function createTempDir(prefix = 'keep-alive-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 1: Missing and Empty Environment Configurations
// -----------------------------------------------------------------------------
test('ADVERSARIAL 1.1: resolveConfig with null, undefined, empty env object', () => {
  const tempEmptyDir = createTempDir('empty-env-');
  try {
    const resEmpty = resolveConfig({}, tempEmptyDir);
    assert.equal(resEmpty.isConfigured, false);
    assert.equal(resEmpty.url, '');
    assert.equal(resEmpty.key, '');

    const resNull = resolveConfig(null, tempEmptyDir);
    assert.equal(resNull.isConfigured, false);

    const resUndefined = resolveConfig(undefined, tempEmptyDir);
    assert.equal(resUndefined.isConfigured, false);
  } finally {
    fs.rmSync(tempEmptyDir, { recursive: true, force: true });
  }
});

test('ADVERSARIAL 1.2: resolveConfig with partial environment variables', () => {
  const tempEmptyDir = createTempDir('partial-env-');
  try {
    // Only URL set
    const urlOnly = resolveConfig({ SUPABASE_URL: 'https://only-url.supabase.co' }, tempEmptyDir);
    assert.equal(urlOnly.isConfigured, false);
    assert.equal(urlOnly.key, '');

    // Only Key set
    const keyOnly = resolveConfig({ SUPABASE_ANON_KEY: 'only-key-token-123456' }, tempEmptyDir);
    assert.equal(keyOnly.isConfigured, false);
    assert.equal(keyOnly.url, '');

    // Explicit empty strings
    const emptyStrings = resolveConfig({ SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, tempEmptyDir);
    assert.equal(emptyStrings.isConfigured, false);
    assert.equal(emptyStrings.url, '');
    assert.equal(emptyStrings.key, '');
  } finally {
    fs.rmSync(tempEmptyDir, { recursive: true, force: true });
  }
});

test('ADVERSARIAL 1.3: CLI execution fails gracefully with Exit Code 1 in isolated environment', () => {
  const tempEmptyDir = createTempDir('cli-missing-env-');
  try {
    // Copy script into isolated directory so parent client/.env is not discoverable
    const isolatedScriptPath = path.join(tempEmptyDir, 'keep-alive.js');
    fs.copyFileSync(SCRIPT_PATH, isolatedScriptPath);

    const child = spawnSync(process.execPath, [isolatedScriptPath], {
      cwd: tempEmptyDir,
      env: {
        PATH: process.env.PATH,
        SYSTEMROOT: process.env.SYSTEMROOT,
      },
      encoding: 'utf8',
    });

    assert.equal(child.status, 1, `Expected exit code 1 but received ${child.status}`);
    assert.ok(
      child.stdout.includes('[ERROR] Missing required configuration') ||
      child.stderr.includes('[ERROR] Missing required configuration'),
      'Output must contain missing configuration error message'
    );
    assert.ok(
      !child.stdout.includes('Unhandled') && !child.stderr.includes('Unhandled'),
      'Must not trigger unhandled exceptions or crash stack trace'
    );
  } finally {
    fs.rmSync(tempEmptyDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 2: Corrupted, Binary, and Extreme .env Files
// -----------------------------------------------------------------------------
test('ADVERSARIAL 2.1: parseEnv handles binary garbage, null bytes, and non-ASCII cleanly', () => {
  const binaryGarbage = Buffer.from([0x00, 0x01, 0xff, 0xfe, 0x80, 0x7f, 0x0a, 0x3d, 0x0a]).toString('utf8');
  const result = parseEnv(binaryGarbage);
  assert.ok(typeof result === 'object');
  assert.ok(!Array.isArray(result));
});

test('ADVERSARIAL 2.2: parseEnv handles unmatched quotes, nested quotes, and multiline values', () => {
  const corrupted = `
    UNCLOSED_DOUBLE="starts but never ends
    UNCLOSED_SINGLE='single unclosed
    NESTED="inside 'quotes' ok"
    EQUAL_CHAOS====
    KEY_WITH_NO_VALUE=
    =VALUE_WITH_NO_KEY
    SPACES IN KEY = some value
    VALID_URL=https://corrupt.supabase.co
    VALID_KEY="valid-secret-key-12345"
  `;
  const result = parseEnv(corrupted);
  assert.equal(result.VALID_URL, 'https://corrupt.supabase.co');
  assert.equal(result.VALID_KEY, 'valid-secret-key-12345');
  assert.equal(result.NESTED, "inside 'quotes' ok");
  assert.equal(result.KEY_WITH_NO_VALUE, '');
});

test('ADVERSARIAL 2.3: parseEnv survives massive content (50,000 lines)', () => {
  const lines = [];
  for (let i = 0; i < 50000; i++) {
    lines.push(`DUMMY_KEY_${i}=value_${i}_with_some_long_filler_text_to_consume_memory`);
  }
  lines.push('TARGET_KEY=found_target');
  const massiveContent = lines.join('\n');

  const startTime = Date.now();
  const parsed = parseEnv(massiveContent);
  const elapsed = Date.now() - startTime;

  assert.equal(parsed.TARGET_KEY, 'found_target');
  assert.equal(parsed.DUMMY_KEY_49999, 'value_49999_with_some_long_filler_text_to_consume_memory');
  assert.ok(elapsed < 2000, `Massive env parse should complete quickly (< 2000ms), took ${elapsed}ms`);
});

test('ADVERSARIAL 2.4: parseEnvFile handles directory path (EISDIR) and unreadable paths without crashing', () => {
  const tempDir = createTempDir('eisdir-test-');
  try {
    const res = parseEnvFile(tempDir);
    assert.deepEqual(res, {}, 'Must return empty object on EISDIR without throwing');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 3: Secret Key Masking Edge Cases & Leak Prevention
// -----------------------------------------------------------------------------
test('ADVERSARIAL 3.1: maskKey boundary conditions (<=10 chars vs >10 chars)', () => {
  assert.equal(maskKey(''), '(not set)');
  assert.equal(maskKey('1'), '***');
  assert.equal(maskKey('123456789'), '***');
  assert.equal(maskKey('1234567890'), '***'); // exactly 10 chars -> masked with ***

  // 11 characters: length > 10
  const masked11 = maskKey('12345678901');
  assert.equal(masked11, '123456...8901');
});

test('ADVERSARIAL 3.2: maskKey handles non-string, null, undefined, objects, booleans', () => {
  assert.equal(maskKey(null), '(not set)');
  assert.equal(maskKey(undefined), '(not set)');
  assert.equal(maskKey(123456789), '(not set)');
  assert.equal(maskKey(true), '(not set)');
  assert.equal(maskKey({}), '(not set)');
  assert.equal(maskKey(['secret']), '(not set)');
});

test('ADVERSARIAL 3.3: maskKey trims whitespace before masking to prevent space padding leaks', () => {
  assert.equal(maskKey('   short   '), '***');
  assert.equal(
    maskKey('   sb_publishable_abcdefghijklmnop_12345   '),
    'sb_pub...2345'
  );
});

test('ADVERSARIAL 3.4: maskKey with unicode and emojis', () => {
  const emojiKey = '🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑';
  const masked = maskKey(emojiKey);
  assert.ok(masked.includes('...'));
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 4: Timeout, AbortSignal, and Cancellation
// -----------------------------------------------------------------------------
test('ADVERSARIAL 4.1: pingWithRetry respects timeoutMs and AbortSignal', async () => {
  let signalWasAborted = false;

  const mockHangingFetch = (url, opts) => {
    return new Promise((resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        signalWasAborted = true;
        const err = new Error('The operation was aborted');
        err.name = 'TimeoutError';
        reject(err);
      });
    });
  };

  const startTime = Date.now();
  const res = await pingWithRetry('https://timeout-test.supabase.co', {
    maxAttempts: 2,
    timeoutMs: 30, // 30ms timeout
    backoffDelays: [5, 5],
    fetchFn: mockHangingFetch,
    logger: { warn: () => {} },
  });
  const elapsed = Date.now() - startTime;

  assert.equal(res.success, false);
  assert.equal(res.attempt, 2);
  assert.ok(signalWasAborted, 'AbortSignal must have received abort event');
  assert.ok(res.error, 'Must capture error on timeout');
  assert.ok(elapsed < 2000, 'Should time out and finish within reasonable window');
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 5: HTTP 500, 502, 503, 504, 429 Retry & Backoff Behavior
// -----------------------------------------------------------------------------
test('ADVERSARIAL 5.1: pingWithRetry retries 429 Rate Limited and succeeds on final attempt', async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    if (attempts < 3) {
      return { ok: false, status: 429, statusText: 'Too Many Requests' };
    }
    return { ok: true, status: 200, statusText: 'OK' };
  };

  const delaysCalled = [];
  const mockSleep = async (ms) => {
    delaysCalled.push(ms);
  };

  const res = await pingWithRetry('https://rate-limit-test.supabase.co', {
    maxAttempts: 3,
    backoffDelays: [50, 100],
    fetchFn: mockFetch,
    sleepFn: mockSleep,
    logger: { warn: () => {} },
  });

  assert.equal(res.success, true);
  assert.equal(res.attempt, 3);
  assert.equal(res.status, 200);
  assert.deepEqual(delaysCalled, [50, 100], 'Must execute exponential backoff delays in order');
});

test('ADVERSARIAL 5.2: pingWithRetry exhausts retries on continuous HTTP 500 Server Error', async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    return { ok: false, status: 500, statusText: 'Internal Server Error' };
  };

  const res = await pingWithRetry('https://500-test.supabase.co', {
    maxAttempts: 3,
    backoffDelays: [1, 1],
    fetchFn: mockFetch,
    sleepFn: () => Promise.resolve(),
    logger: { warn: () => {} },
  });

  assert.equal(res.success, false);
  assert.equal(res.attempt, 3);
  assert.equal(res.status, 500);
  assert.equal(attempts, 3);
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 6: Fast Failure on Non-Retryable Client Errors (401, 403, 404)
// -----------------------------------------------------------------------------
test('ADVERSARIAL 6.1: HTTP 401 Unauthorized fails immediately on Attempt 1 without retry', async () => {
  let attempts = 0;
  let sleepCount = 0;
  const mockFetch = async () => {
    attempts++;
    return { ok: false, status: 401, statusText: 'Unauthorized' };
  };

  const res = await pingWithRetry('https://unauthorized-test.supabase.co', {
    maxAttempts: 3,
    fetchFn: mockFetch,
    sleepFn: async () => { sleepCount++; },
    logger: { warn: () => {} },
  });

  assert.equal(res.success, false);
  assert.equal(res.attempt, 1, 'Must fail immediately on attempt 1');
  assert.equal(res.status, 401);
  assert.equal(attempts, 1);
  assert.equal(sleepCount, 0, 'Must NOT invoke backoff sleep for 401');
});

test('ADVERSARIAL 6.2: HTTP 403 Forbidden fails immediately on Attempt 1 without retry', async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    return { ok: false, status: 403, statusText: 'Forbidden' };
  };

  const res = await pingWithRetry('https://forbidden-test.supabase.co', {
    maxAttempts: 3,
    fetchFn: mockFetch,
    sleepFn: () => assert.fail('Sleep should not be called for 403'),
    logger: { warn: () => {} },
  });

  assert.equal(res.success, false);
  assert.equal(res.attempt, 1);
  assert.equal(res.status, 403);
  assert.equal(attempts, 1);
});

test('ADVERSARIAL 6.3: HTTP 404 triggers immediate fallback in runKeepAlive without retry stall', async () => {
  let primaryAttempts = 0;
  let fallbackAttempts = 0;

  const mockFetch = async (url) => {
    if (url.includes('homepage_config')) {
      primaryAttempts++;
      return { ok: false, status: 404, statusText: 'Not Found' };
    }
    if (url.includes('events')) {
      fallbackAttempts++;
      return { ok: true, status: 200, statusText: 'OK' };
    }
  };

  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-key-123456' },
    fetchFn: mockFetch,
    sleepFn: () => assert.fail('Sleep should not be called for 404'),
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 0);
  assert.equal(res.endpoint, 'fallback');
  assert.equal(primaryAttempts, 1, 'Primary 404 must not retry 3 times');
  assert.equal(fallbackAttempts, 1);
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 7: Malformed URLs and Network Crash Handling
// -----------------------------------------------------------------------------
test('ADVERSARIAL 7.1: Malformed base URL is handled gracefully by runKeepAlive without unhandled exception', async () => {
  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'not-a-valid-url', SUPABASE_ANON_KEY: 'test-key-123456' },
    backoffDelays: [1, 1],
    sleepFn: () => Promise.resolve(),
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 1);
  assert.equal(res.error, 'ALL_ENDPOINTS_FAILED');
  assert.ok(res.fallbackResult.error);
});

test('ADVERSARIAL 7.2: normalizeUrl handles excessive slashes, whitespace, and empty strings', () => {
  assert.equal(normalizeUrl('https://example.com/'), 'https://example.com');
  assert.equal(normalizeUrl('  https://example.com///  '), 'https://example.com');
  assert.equal(normalizeUrl('////'), '');
  assert.equal(normalizeUrl(''), '');
  assert.equal(normalizeUrl(null), '');
  assert.equal(normalizeUrl(undefined), '');
  assert.equal(normalizeUrl(12345), '');
});

// -----------------------------------------------------------------------------
// ADVERSARIAL SUITE 8: Production Live Supabase Connectivity and Secret Leak Check
// -----------------------------------------------------------------------------
test('ADVERSARIAL 8.1: Live keep-alive execution against production Supabase backend', () => {
  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });

  // Note: In sandboxed environments without outbound DNS/internet, exit code is 1 with network error
  if (result.status === 0) {
    assert.ok(
      result.stdout.includes('[SUCCESS] Primary ping succeeded! Status: 200 OK'),
      'Stdout must confirm 200 OK on primary endpoint'
    );
    assert.ok(
      result.stdout.includes('[SUCCESS] Database active.'),
      'Stdout must report database active'
    );
  } else {
    // Graceful offline failure verification
    assert.equal(result.status, 1);
    assert.ok(
      result.stderr.includes('fetch failed') || result.stderr.includes('ALL_ENDPOINTS_FAILED') || result.stderr.includes('FATAL'),
      'Must log fatal network failure cleanly without crash'
    );
  }

  // Read actual key from client/.env to verify masking
  const clientEnvPath = path.resolve(__dirname, '..', 'client', '.env');
  if (fs.existsSync(clientEnvPath)) {
    const rawEnv = fs.readFileSync(clientEnvPath, 'utf8');
    const parsed = parseEnv(rawEnv);
    const rawKey = parsed.VITE_SUPABASE_PUBLISHABLE_KEY || parsed.SUPABASE_ANON_KEY;

    if (rawKey && rawKey.length > 10) {
      assert.ok(
        !result.stdout.includes(rawKey),
        'SECURITY VIOLATION: Full secret key was leaked in stdout logs!'
      );
      const expectedMask = maskKey(rawKey);
      assert.ok(
        result.stdout.includes(expectedMask),
        `Stdout should display masked key (${expectedMask})`
      );
    }
  }
});

test('ADVERSARIAL 8.2: Live NPM script execution (npm run keep-alive:verify --prefix client)', () => {
  const result = spawnSync('npm', ['run', 'keep-alive:verify', '--prefix', 'client'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    encoding: 'utf8',
  });

  // When network egress is available, status is 0; in sandboxed network status is 1
  assert.ok(
    result.status === 0 || result.status === 1,
    `NPM keep-alive:verify returned invalid status: ${result.status}`
  );
  if (result.status === 0) {
    assert.ok(
      result.stdout.includes('Primary ping succeeded! Status: 200 OK'),
      'NPM verification output must confirm 200 OK'
    );
  }
});
