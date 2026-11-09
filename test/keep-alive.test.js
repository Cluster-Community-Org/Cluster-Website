/**
 * test/keep-alive.test.js
 *
 * Comprehensive unit test suite for Supabase Keep-Alive system.
 * Run with: node --test test/keep-alive.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {
  parseEnv,
  parseEnvFile,
  maskKey,
  sanitizeHeaders,
  normalizeUrl,
  resolveConfig,
  isDebugEnabled,
  pingWithRetry,
  pingSupabase,
  runKeepAlive,
  PRIMARY_ENDPOINT,
  FALLBACK_ENDPOINT,
} = require('../scripts/keep-alive.js');

// -----------------------------------------------------------------------------
// Suite 1: Environment Parser (parseEnv & parseEnvFile)
// -----------------------------------------------------------------------------
test('parseEnv: parses standard key=value pairs', () => {
  const content = 'KEY1=val1\nKEY2=val2\nKEY3=val3';
  const result = parseEnv(content);
  assert.deepEqual(result, { KEY1: 'val1', KEY2: 'val2', KEY3: 'val3' });
});

test('parseEnv: ignores comments and empty lines', () => {
  const content = `
    # Leading comment
    FOO=bar

    # Middle comment
    BAZ=qux
  `;
  const result = parseEnv(content);
  assert.equal(result.FOO, 'bar');
  assert.equal(result.BAZ, 'qux');
  assert.equal(Object.keys(result).length, 2);
});

test('parseEnv: strips double and single quotes', () => {
  const content = `
    D_QUOTE="hello world"
    S_QUOTE='secret value'
    UNQUOTED=clean
  `;
  const result = parseEnv(content);
  assert.equal(result.D_QUOTE, 'hello world');
  assert.equal(result.S_QUOTE, 'secret value');
  assert.equal(result.UNQUOTED, 'clean');
});

test('parseEnv: supports leading export keyword', () => {
  const content = 'export SUPABASE_URL="https://example.supabase.co"';
  const result = parseEnv(content);
  assert.equal(result.SUPABASE_URL, 'https://example.supabase.co');
});

test('parseEnv: correctly handles values containing equal signs', () => {
  const content = 'DATABASE_URL=postgres://user:pass@host:5432/db?ssl=true&key=val';
  const result = parseEnv(content);
  assert.equal(result.DATABASE_URL, 'postgres://user:pass@host:5432/db?ssl=true&key=val');
});

test('parseEnv: handles empty values and non-string inputs safely', () => {
  assert.deepEqual(parseEnv('EMPTY='), { EMPTY: '' });
  assert.deepEqual(parseEnv(''), {});
  assert.deepEqual(parseEnv(null), {});
  assert.deepEqual(parseEnv(undefined), {});
});

test('parseEnvFile: reads existing file and handles non-existent file gracefully', () => {
  const existingClientEnv = path.resolve(__dirname, '..', 'client', '.env');
  if (fs.existsSync(existingClientEnv)) {
    const parsed = parseEnvFile(existingClientEnv);
    assert.ok(typeof parsed === 'object');
    assert.ok(parsed.VITE_SUPABASE_URL || parsed.SUPABASE_URL);
  }
  const nonExistent = parseEnvFile(path.resolve(__dirname, 'does-not-exist.env'));
  assert.deepEqual(nonExistent, {});
  assert.deepEqual(parseEnvFile(null), {});
});

// -----------------------------------------------------------------------------
// Suite 2: Secret Key Masking (maskKey)
// -----------------------------------------------------------------------------
test('maskKey: masks keys longer than 10 characters showing first 6 and last 4', () => {
  const key = 'sb_publishable_dummy_synthetic_key_for_test_1234';
  const masked = maskKey(key);
  assert.equal(masked, 'sb_pub...1234');
});

test('maskKey: masks short keys (<=10 chars) with *** to prevent leaks', () => {
  assert.equal(maskKey('short'), '***');
  assert.equal(maskKey('0123456789'), '***');
});

test('maskKey: handles null, undefined, empty string gracefully', () => {
  assert.equal(maskKey(''), '(not set)');
  assert.equal(maskKey(null), '(not set)');
  assert.equal(maskKey(undefined), '(not set)');
});

// -----------------------------------------------------------------------------
// Suite 2b: Request Header Sanitization (sanitizeHeaders)
// -----------------------------------------------------------------------------
test('sanitizeHeaders: masks apikey and authorization Bearer token', () => {
  const headers = {
    apikey: 'sb_publishable_dummy_synthetic_key_for_test_1234',
    Authorization: 'Bearer sb_publishable_dummy_synthetic_key_for_test_1234',
    Accept: 'application/json',
    'User-Agent': 'supabase-keep-alive/1.0',
  };
  const sanitized = sanitizeHeaders(headers);
  assert.equal(sanitized.apikey, 'sb_pub...1234');
  assert.equal(sanitized.Authorization, 'Bearer sb_pub...1234');
  assert.equal(sanitized.Accept, 'application/json');
  assert.equal(sanitized['User-Agent'], 'supabase-keep-alive/1.0');
});

test('sanitizeHeaders: handles non-bearer authorization and case-insensitivity', () => {
  const headers = {
    apiKey: 'mysecrettoken123456',
    authorization: 'mysecrettoken123456',
  };
  const sanitized = sanitizeHeaders(headers);
  assert.equal(sanitized.apiKey, 'mysecr...3456');
  assert.equal(sanitized.authorization, 'mysecr...3456');
});

test('sanitizeHeaders: handles null, undefined, empty object gracefully', () => {
  assert.deepEqual(sanitizeHeaders({}), {});
  assert.deepEqual(sanitizeHeaders(null), {});
  assert.deepEqual(sanitizeHeaders(undefined), {});
});

// -----------------------------------------------------------------------------
// Suite 3: URL Normalization (normalizeUrl)
// -----------------------------------------------------------------------------
test('normalizeUrl: strips trailing slashes', () => {
  assert.equal(normalizeUrl('https://example.supabase.co/'), 'https://example.supabase.co');
  assert.equal(normalizeUrl('https://example.supabase.co///'), 'https://example.supabase.co');
  assert.equal(normalizeUrl('https://example.supabase.co'), 'https://example.supabase.co');
});

test('normalizeUrl: handles empty or invalid inputs', () => {
  assert.equal(normalizeUrl(''), '');
  assert.equal(normalizeUrl(null), '');
  assert.equal(normalizeUrl(undefined), '');
});

// -----------------------------------------------------------------------------
// Suite 4: Environment Resolution (resolveConfig)
// -----------------------------------------------------------------------------
test('resolveConfig: prioritizes direct process.env over files', () => {
  const mockEnv = {
    SUPABASE_URL: 'https://ci-env.supabase.co',
    SUPABASE_ANON_KEY: 'ci-secret-token-key-123456',
  };
  const config = resolveConfig(mockEnv);
  assert.equal(config.url, 'https://ci-env.supabase.co');
  assert.equal(config.key, 'ci-secret-token-key-123456');
  assert.equal(config.source, 'process.env');
  assert.equal(config.isConfigured, true);
});

test('resolveConfig: supports VITE_ prefixed environment variables', () => {
  const mockEnv = {
    VITE_SUPABASE_URL: 'https://vite-env.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_token_123456',
  };
  const config = resolveConfig(mockEnv);
  assert.equal(config.url, 'https://vite-env.supabase.co');
  assert.equal(config.key, 'sb_publishable_token_123456');
  assert.equal(config.isConfigured, true);
});

test('resolveConfig: falls back to client/.env file when env is empty', () => {
  const config = resolveConfig({}, path.resolve(__dirname, '..'));
  assert.equal(config.isConfigured, true);
  assert.ok(config.url.includes('supabase.co'));
  assert.ok(config.key.startsWith('sb_publishable_') || config.key.length > 0);
  assert.ok(config.source.endsWith('.env'));
});

test('resolveConfig: marks isConfigured false when no variables exist', () => {
  const config = resolveConfig({}, path.resolve(__dirname, 'empty-dir-test'));
  assert.equal(config.isConfigured, false);
  assert.equal(config.url, '');
  assert.equal(config.key, '');
});

// -----------------------------------------------------------------------------
// Suite 5: Retry Loop & AbortSignal (pingWithRetry / pingSupabase)
// -----------------------------------------------------------------------------
test('pingWithRetry: succeeds on first attempt on HTTP 200', async () => {
  let callCount = 0;
  const mockFetch = async (url, opts) => {
    callCount++;
    assert.ok(opts.headers.apikey);
    assert.ok(opts.signal);
    return { ok: true, status: 200, statusText: 'OK' };
  };

  const res = await pingWithRetry('https://example.com', {
    fetchFn: mockFetch,
    headers: { apikey: 'test' },
  });

  assert.equal(res.success, true);
  assert.equal(res.attempt, 1);
  assert.equal(res.status, 200);
  assert.equal(callCount, 1);
});

test('pingSupabase: alias works identically to pingWithRetry', async () => {
  const mockFetch = async () => ({ ok: true, status: 200, statusText: 'OK' });
  const res = await pingSupabase('https://example.com', { fetchFn: mockFetch });
  assert.equal(res.success, true);
  assert.equal(res.status, 200);
});

test('pingWithRetry: retries on network rejection and succeeds on attempt 2', async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    if (callCount === 1) throw new TypeError('fetch failed');
    return { ok: true, status: 200, statusText: 'OK' };
  };

  const res = await pingWithRetry('https://example.com', {
    fetchFn: mockFetch,
    sleepFn: () => Promise.resolve(),
    backoffDelays: [1, 1],
    logger: { warn: () => {} },
  });

  assert.equal(res.success, true);
  assert.equal(res.attempt, 2);
  assert.equal(callCount, 2);
});

test('pingWithRetry: fails fast without retrying on 401 Unauthorized', async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    return { ok: false, status: 401, statusText: 'Unauthorized' };
  };

  const res = await pingWithRetry('https://example.com', {
    fetchFn: mockFetch,
    sleepFn: () => Promise.resolve(),
    logger: { warn: () => {} },
  });

  assert.equal(res.success, false);
  assert.equal(res.attempt, 1);
  assert.equal(res.status, 401);
  assert.equal(callCount, 1);
});

test('pingWithRetry: retries on 503 Server Error and exhausts retries', async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    return { ok: false, status: 503, statusText: 'Service Unavailable' };
  };

  const res = await pingWithRetry('https://example.com', {
    maxAttempts: 3,
    fetchFn: mockFetch,
    sleepFn: () => Promise.resolve(),
    backoffDelays: [1, 1],
    logger: { warn: () => {} },
  });

  assert.equal(res.success, false);
  assert.equal(res.attempt, 3);
  assert.equal(res.status, 503);
  assert.equal(callCount, 3);
});

// -----------------------------------------------------------------------------
// Suite 6: Full Keep-Alive Orchestration & Fallback (runKeepAlive)
// -----------------------------------------------------------------------------
test('runKeepAlive: returns exitCode 0 when primary endpoint succeeds', async () => {
  const mockFetch = async (url) => {
    assert.ok(url.includes('homepage_config'));
    return { ok: true, status: 200, statusText: 'OK' };
  };

  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-key-123456' },
    fetchFn: mockFetch,
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 0);
  assert.equal(res.endpoint, 'primary');
  assert.equal(res.status, 200);
});

test('runKeepAlive: falls back to events endpoint when primary returns 404', async () => {
  const calledUrls = [];
  const mockFetch = async (url) => {
    calledUrls.push(url);
    if (url.includes('homepage_config')) {
      return { ok: false, status: 404, statusText: 'Not Found' };
    }
    if (url.includes('events')) {
      return { ok: true, status: 200, statusText: 'OK' };
    }
  };

  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-key-123456' },
    fetchFn: mockFetch,
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 0);
  assert.equal(res.endpoint, 'fallback');
  assert.equal(res.status, 200);
  assert.equal(calledUrls.length, 2);
  assert.ok(calledUrls[0].includes('homepage_config'));
  assert.ok(calledUrls[1].includes('events'));
});

test('runKeepAlive: respects endpointOverride parameter', async () => {
  let targetCalled = '';
  const mockFetch = async (url) => {
    targetCalled = url;
    return { ok: true, status: 200, statusText: 'OK' };
  };

  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-key-123456' },
    fetchFn: mockFetch,
    endpointOverride: '/rest/v1/custom_table?select=id',
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 0);
  assert.ok(targetCalled.includes('/rest/v1/custom_table'));
});

test('runKeepAlive: returns exitCode 1 when configuration is missing', async () => {
  const res = await runKeepAlive({
    env: {},
    cwd: path.resolve(__dirname, 'non-existent-directory'),
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 1);
  assert.equal(res.error, 'MISSING_CONFIG');
});

test('runKeepAlive: returns exitCode 1 when both primary and fallback fail', async () => {
  const mockFetch = async () => {
    return { ok: false, status: 500, statusText: 'Internal Server Error' };
  };

  const res = await runKeepAlive({
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-key-123456' },
    fetchFn: mockFetch,
    sleepFn: () => Promise.resolve(),
    backoffDelays: [1, 1],
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });

  assert.equal(res.exitCode, 1);
  assert.equal(res.error, 'ALL_ENDPOINTS_FAILED');
});

// -----------------------------------------------------------------------------
// Suite 7: Debug Mode Detection & Diagnostics (isDebugEnabled)
// -----------------------------------------------------------------------------
test('isDebugEnabled: respects options.debug boolean directly', () => {
  assert.equal(isDebugEnabled({ debug: true }, { DEBUG: 'false' }), true);
  assert.equal(isDebugEnabled({ debug: false }, { DEBUG: 'true' }), false);
});

test('isDebugEnabled: correctly parses env.DEBUG without boolean string coercion bugs', () => {
  // Truthy variants
  assert.equal(isDebugEnabled({}, { DEBUG: 'true' }), true);
  assert.equal(isDebugEnabled({}, { DEBUG: 'TRUE' }), true);
  assert.equal(isDebugEnabled({}, { DEBUG: '1' }), true);
  assert.equal(isDebugEnabled({}, { DEBUG: 'yes' }), true);
  assert.equal(isDebugEnabled({}, { DEBUG: ' YES ' }), true);

  // Falsy variants (critical: Boolean("false") is true, but isDebugEnabled must be false)
  assert.equal(isDebugEnabled({}, { DEBUG: 'false' }), false);
  assert.equal(isDebugEnabled({}, { DEBUG: 'FALSE' }), false);
  assert.equal(isDebugEnabled({}, { DEBUG: '0' }), false);
  assert.equal(isDebugEnabled({}, { DEBUG: 'no' }), false);
  assert.equal(isDebugEnabled({}, { DEBUG: '' }), false);
  assert.equal(isDebugEnabled({}, {}), false);
  assert.equal(isDebugEnabled({}, null), false);
});

test('isDebugEnabled: recognizes GitHub Actions RUNNER_DEBUG=1', () => {
  assert.equal(isDebugEnabled({}, { RUNNER_DEBUG: '1' }), true);
  assert.equal(isDebugEnabled({}, { RUNNER_DEBUG: '0' }), false);
});

test('isDebugEnabled: recognizes --debug CLI argument', () => {
  assert.equal(isDebugEnabled({ args: ['node', 'script.js', '--debug'] }, {}), true);
  assert.equal(isDebugEnabled({ args: ['node', 'script.js'] }, {}), false);
});

test('runKeepAlive: logs diagnostic output in debug mode without leaking raw secret keys', async () => {
  const logged = [];
  const mockLogger = {
    info: (msg) => logged.push(msg),
    warn: (msg) => logged.push(msg),
    error: (msg) => logged.push(msg),
  };

  const rawKey = 'sb_publishable_dummy_secret_for_debug_test_5678';
  const mockFetch = async (url, opts) => {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify([{ id: 1 }]),
      headers: new Map([
        ['cf-ray', 'ray-123456789'],
        ['sb-request-id', 'req-abcdef'],
        ['x-envoy-upstream-service-time', '42'],
        ['content-type', 'application/json'],
      ]),
    };
  };

  const res = await runKeepAlive({
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: rawKey,
      DEBUG: 'true',
    },
    fetchFn: mockFetch,
    logger: mockLogger,
  });

  assert.equal(res.exitCode, 0);

  const fullLog = logged.join('\n');
  // Must contain debug banners and diagnostic details
  assert.ok(fullLog.includes('[CONFIG] Debug Mode:  ENABLED'));
  assert.ok(fullLog.includes('[DEBUG] Cloudflare Ray ID: ray-123456789'));
  assert.ok(fullLog.includes('[DEBUG] Supabase Request ID: req-abcdef'));
  assert.ok(fullLog.includes('[DEBUG] Envoy Upstream Latency: 42ms'));

  // CRITICAL: Raw secret key must NEVER appear in logs
  assert.equal(fullLog.includes(rawKey), false);
  // Masked key must appear
  assert.ok(fullLog.includes('sb_pub...5678'));
});


