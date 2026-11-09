/**
 * scripts/keep-alive.js
 *
 * Automated keep-alive ping script for Supabase backend.
 * Prevents free-tier project pausing by querying PostgREST endpoints.
 *
 * - Zero external dependencies (uses native fetch, node:fs, node:path)
 * - Multi-tier env resolution (.env, client/.env, process.env)
 * - Key masking in stdout (sb_pub...2EG0)
 * - 10s timeout per request with AbortSignal.timeout
 * - 3-attempt exponential backoff retry loop
 * - Automated fallback from homepage_config to events
 * - Exit 0 on HTTP 200-299; Exit 1 on errors
 */

const fs = require('node:fs');
const path = require('node:path');

const PRIMARY_ENDPOINT = '/rest/v1/homepage_config?select=id&limit=1';
const FALLBACK_ENDPOINT = '/rest/v1/events?select=id&limit=1';

/**
 * Parses a .env file content string into a key-value dictionary without external dependencies.
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnv(content) {
  const result = {};
  if (!content || typeof content !== 'string') return result;

  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();

    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;

    const key = line.slice(0, equalIndex).trim();
    let val = line.slice(equalIndex + 1).trim();

    // Remove wrapping double or single quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    result[key] = val;
  }
  return result;
}

/**
 * Reads and parses an environment file at the specified path.
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return {};
  try {
    if (fs.existsSync(filePath)) {
      return parseEnv(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // Ignore read errors
  }
  return {};
}

/**
 * Masks a secret key for safe stdout logging.
 * Shows first 6 and last 4 characters (e.g. sb_pub...2EG0).
 * @param {string} key
 * @returns {string}
 */
function maskKey(key) {
  if (!key || typeof key !== 'string') return '(not set)';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '***';
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

/**
 * Sanitizes request headers for safe stdout logging without leaking secrets.
 * @param {Record<string, string>} [headers={}]
 * @returns {Record<string, string>}
 */
function sanitizeHeaders(headers = {}) {
  const sanitized = {};
  if (!headers || typeof headers !== 'object') return sanitized;
  for (const [k, v] of Object.entries(headers)) {
    const lowerKey = k.toLowerCase();
    if (lowerKey === 'apikey') {
      sanitized[k] = maskKey(v);
    } else if (lowerKey === 'authorization') {
      sanitized[k] = typeof v === 'string' && v.startsWith('Bearer ')
        ? `Bearer ${maskKey(v.slice(7))}`
        : maskKey(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

/**
 * Normalizes a base URL by trimming whitespace and removing trailing slashes.
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '');
}

/**
 * Resolves Supabase credentials across process.env and local .env files.
 * @param {Record<string, string>} [customEnv=process.env]
 * @param {string} [customCwd=process.cwd()]
 * @returns {{ url: string, key: string, source: string, isConfigured: boolean }}
 */
function resolveConfig(customEnv = process.env, customCwd = process.cwd()) {
  let url = (customEnv && (customEnv.SUPABASE_URL || customEnv.VITE_SUPABASE_URL)) || '';
  let key =
    (customEnv &&
      (customEnv.SUPABASE_ANON_KEY ||
        customEnv.VITE_SUPABASE_ANON_KEY ||
        customEnv.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
    '';
  let source = 'process.env';

  if (!url || !key) {
    const searchDirs = [
      customCwd,
      path.resolve(customCwd, 'client'),
    ];

    // Also search relative to script directory if using default process.cwd()
    if (customCwd === process.cwd()) {
      searchDirs.push(path.resolve(__dirname, '..'));
      searchDirs.push(path.resolve(__dirname, '..', 'client'));
    }

    const searchedFiles = new Set();

    for (const dir of searchDirs) {
      const envPath = path.resolve(dir, '.env');
      if (searchedFiles.has(envPath)) continue;
      searchedFiles.add(envPath);

      if (fs.existsSync(envPath)) {
        try {
          const parsed = parseEnv(fs.readFileSync(envPath, 'utf8'));
          if (!url) {
            url = parsed.SUPABASE_URL || parsed.VITE_SUPABASE_URL || '';
            if (url) source = envPath;
          }
          if (!key) {
            key =
              parsed.SUPABASE_ANON_KEY ||
              parsed.VITE_SUPABASE_ANON_KEY ||
              parsed.VITE_SUPABASE_PUBLISHABLE_KEY ||
              '';
            if (key) source = envPath;
          }
          if (url && key) break;
        } catch {
          // Continue if file read fails
        }
      }
    }
  }

  return {
    url: normalizeUrl(url),
    key: (key || '').trim(),
    source,
    isConfigured: Boolean(url && key),
  };
}

/**
 * Determines whether debug logging is enabled from options, environment, or CLI flags.
 * Safely avoids Boolean('false') truthiness bugs.
 * @param {object} [options={}]
 * @param {Record<string, string>} [env=process.env]
 * @returns {boolean}
 */
function isDebugEnabled(options = {}, env = process.env) {
  if (options && typeof options.debug === 'boolean') {
    return options.debug;
  }
  if (env) {
    if (typeof env.DEBUG === 'string') {
      const normalized = env.DEBUG.trim().toLowerCase();
      if (['true', '1', 'yes'].includes(normalized)) {
        return true;
      }
    }
    if (env.RUNNER_DEBUG === '1') {
      return true;
    }
  }
  if (options && Array.isArray(options.args)) {
    return options.args.includes('--debug');
  }
  if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv.includes('--debug')) {
    return true;
  }
  return false;
}

/**
 * Pings an HTTP endpoint with retry loop, backoff, and 10s AbortSignal timeout.
 * @param {string} url
 * @param {object} options
 * @returns {Promise<{ success: boolean, status?: number, statusText?: string, attempt: number, elapsedMs?: number, error?: Error }>}
 */
async function pingWithRetry(url, options = {}) {
  const {
    maxAttempts = 3,
    backoffDelays = [1000, 2000],
    timeoutMs = 10000,
    headers = {},
    fetchFn = globalThis.fetch,
    sleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    logger = console,
    debug = false,
  } = options;

  let lastError = null;
  let lastResponse = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();
    const attemptTimeIso = new Date().toISOString();

    if (debug && logger && typeof logger.info === 'function') {
      logger.info(`[DEBUG] Attempt ${attempt}/${maxAttempts} starting at ${attemptTimeIso}`);
      logger.info(`[DEBUG] Target URL: ${url}`);
      logger.info(`[DEBUG] Request Headers: ${JSON.stringify(sanitizeHeaders(headers))}`);
    }

    try {
      const signal = AbortSignal.timeout(timeoutMs);
      const res = await fetchFn(url, {
        method: 'GET',
        headers,
        signal,
      });

      let responseBody = '';
      try {
        if (typeof res.text === 'function') {
          responseBody = await res.text();
        }
      } catch {
        // Ignore read errors
      }

      const elapsed = Date.now() - startTime;

      if (debug && logger && typeof logger.info === 'function') {
        logger.info(`[DEBUG] Attempt ${attempt} finished in ${elapsed}ms with HTTP ${res.status} ${res.statusText || ''}`);

        const diagHeaders = {};
        if (res.headers) {
          if (typeof res.headers.forEach === 'function') {
            res.headers.forEach((val, key) => {
              diagHeaders[String(key).toLowerCase()] = val;
            });
          } else if (typeof res.headers.entries === 'function') {
            for (const [k, v] of res.headers.entries()) {
              diagHeaders[String(k).toLowerCase()] = v;
            }
          } else if (typeof res.headers === 'object') {
            for (const [k, v] of Object.entries(res.headers)) {
              diagHeaders[String(k).toLowerCase()] = v;
            }
          }
        }

        if (diagHeaders['cf-ray']) {
          logger.info(`[DEBUG] Cloudflare Ray ID: ${diagHeaders['cf-ray']}`);
        }
        if (diagHeaders['sb-request-id']) {
          logger.info(`[DEBUG] Supabase Request ID: ${diagHeaders['sb-request-id']}`);
        }
        if (diagHeaders['x-envoy-upstream-service-time']) {
          logger.info(`[DEBUG] Envoy Upstream Latency: ${diagHeaders['x-envoy-upstream-service-time']}ms`);
        }
        if (diagHeaders['x-kong-upstream-latency']) {
          logger.info(`[DEBUG] Kong Upstream Latency: ${diagHeaders['x-kong-upstream-latency']}ms`);
        }
        if (diagHeaders['content-range']) {
          logger.info(`[DEBUG] Content-Range: ${diagHeaders['content-range']}`);
        }
        if (diagHeaders['content-type']) {
          logger.info(`[DEBUG] Content-Type: ${diagHeaders['content-type']}`);
        }
        if (responseBody) {
          const preview = responseBody.length > 300
            ? `${responseBody.slice(0, 300)}... (${responseBody.length} bytes)`
            : responseBody;
          logger.info(`[DEBUG] Response Body Preview: ${preview.trim()}`);
        }
      }

      if (res.ok) {
        return {
          success: true,
          status: res.status,
          statusText: res.statusText || 'OK',
          attempt,
          elapsedMs: elapsed,
        };
      }

      lastResponse = res;
      // 401/403/404 are non-retryable client errors: fail fast without retrying
      const isRetryable = res.status === 429 || res.status >= 500;
      if (!isRetryable || attempt === maxAttempts) {
        return {
          success: false,
          status: res.status,
          statusText: res.statusText || 'Error',
          attempt,
          elapsedMs: elapsed,
        };
      }

      const delay = backoffDelays[attempt - 1] ?? 1000;
      if (debug && logger && typeof logger.info === 'function') {
        logger.info(`[DEBUG] Non-success status ${res.status}. Retryable: ${isRetryable}. Next attempt in ${delay}ms`);
      }
      if (logger && typeof logger.warn === 'function') {
        logger.warn(`[RETRY] Attempt ${attempt} returned status ${res.status}. Retrying in ${delay}ms...`);
      }
      await sleepFn(delay);
    } catch (err) {
      lastError = err;
      const elapsed = Date.now() - startTime;
      if (debug && logger && typeof logger.warn === 'function') {
        logger.warn(`[DEBUG] Attempt ${attempt} failed with exception after ${elapsed}ms: ${err.name} - ${err.message}`);
        if (err.cause) {
          logger.warn(`[DEBUG] Exception Cause: ${err.cause}`);
        }
      }
      if (attempt === maxAttempts) {
        return {
          success: false,
          error: err,
          attempt,
          elapsedMs: elapsed,
        };
      }
      const delay = backoffDelays[attempt - 1] ?? 1000;
      if (logger && typeof logger.warn === 'function') {
        logger.warn(`[RETRY] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
      }
      await sleepFn(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    status: lastResponse ? lastResponse.status : undefined,
    attempt: maxAttempts,
  };
}

/**
 * Alias for pingWithRetry for interface compliance.
 */
const pingSupabase = pingWithRetry;

/**
 * Main keep-alive runner.
 * @param {object} [options={}]
 * @returns {Promise<{ exitCode: number, endpoint?: string, status?: number, error?: string, elapsedMs?: number }>}
 */
async function runKeepAlive(options = {}) {
  const {
    env = process.env,
    cwd = process.cwd(),
    fetchFn = globalThis.fetch,
    sleepFn,
    logger = console,
    timeoutMs = 10000,
    backoffDelays = [1000, 2000],
    endpointOverride = (env && env.ENDPOINT_OVERRIDE) || '',
  } = options;

  const debug = isDebugEnabled(options, env);
  const config = resolveConfig(env, cwd);

  if (logger && typeof logger.info === 'function') {
    logger.info('========================================================');
    logger.info(`[KEEP-ALIVE] Supabase Ping Execution — ${new Date().toISOString()}`);
    logger.info('========================================================');
    logger.info(`[CONFIG] Source:      ${config.source}`);
    logger.info(`[CONFIG] Base URL:    ${config.url || '(missing)'}`);
    logger.info(`[CONFIG] Secret Key:  ${maskKey(config.key)}`);
    if (debug) {
      logger.info(`[CONFIG] Debug Mode:  ENABLED (DEBUG=${env && env.DEBUG})`);
      logger.info(`[CONFIG] Node Version:${process.version} (${process.platform} ${process.arch})`);
      logger.info(`[CONFIG] Timeout:     ${timeoutMs}ms`);
      logger.info(`[CONFIG] Max Attempts:${options.maxAttempts || 3}`);
      logger.info(`[CONFIG] Backoff:     ${JSON.stringify(backoffDelays)}ms`);
      logger.info(`[CONFIG] Override:    ${endpointOverride || '(none)'}`);
    }
  }

  if (!config.isConfigured) {
    if (logger && typeof logger.error === 'function') {
      logger.error('[ERROR] Missing required configuration: SUPABASE_URL and/or SUPABASE_ANON_KEY.');
      logger.error('[ERROR] Please set SUPABASE_URL & SUPABASE_ANON_KEY or configure client/.env.');
    }
    return { exitCode: 1, error: 'MISSING_CONFIG' };
  }

  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: 'application/json',
    'User-Agent': 'supabase-keep-alive/1.0',
  };

  const primaryTarget = endpointOverride || PRIMARY_ENDPOINT;
  const primaryUrl = `${config.url}${primaryTarget}`;
  const fallbackUrl = `${config.url}${FALLBACK_ENDPOINT}`;

  // 1. Try Primary Endpoint
  if (logger && typeof logger.info === 'function') {
    logger.info(`[EXEC] Calling primary endpoint: ${primaryTarget}`);
  }
  const primaryResult = await pingWithRetry(primaryUrl, {
    headers,
    fetchFn,
    sleepFn,
    logger,
    timeoutMs,
    backoffDelays,
    debug,
  });

  if (primaryResult.success) {
    if (logger && typeof logger.info === 'function') {
      logger.info(`[SUCCESS] Primary ping succeeded! Status: ${primaryResult.status} ${primaryResult.statusText}`);
      logger.info(`[SUCCESS] Database active. Latency: ${primaryResult.elapsedMs}ms, Attempts: ${primaryResult.attempt}`);
    }
    return {
      exitCode: 0,
      endpoint: 'primary',
      status: primaryResult.status,
      elapsedMs: primaryResult.elapsedMs,
    };
  }

  if (logger && typeof logger.warn === 'function') {
    logger.warn(`[WARN] Primary endpoint failed (Status: ${primaryResult.status || 'Network Error'}).`);
    logger.warn(`[WARN] Triggering fallback endpoint: ${FALLBACK_ENDPOINT}`);
  }

  // 2. Try Fallback Endpoint
  const fallbackResult = await pingWithRetry(fallbackUrl, {
    headers,
    fetchFn,
    sleepFn,
    logger,
    timeoutMs,
    backoffDelays,
    debug,
  });

  if (fallbackResult.success) {
    if (logger && typeof logger.info === 'function') {
      logger.info(`[SUCCESS] Fallback ping succeeded! Status: ${fallbackResult.status} ${fallbackResult.statusText}`);
      logger.info(`[SUCCESS] Database active. Latency: ${fallbackResult.elapsedMs}ms, Attempts: ${fallbackResult.attempt}`);
    }
    return {
      exitCode: 0,
      endpoint: 'fallback',
      status: fallbackResult.status,
      elapsedMs: fallbackResult.elapsedMs,
    };
  }

  if (logger && typeof logger.error === 'function') {
    logger.error('[FATAL] Both primary and fallback endpoints failed to reach Supabase.');
    if (fallbackResult.error) {
      logger.error(`[FATAL] Error detail: ${fallbackResult.error.message}`);
    } else {
      logger.error(`[FATAL] Response status: ${fallbackResult.status} ${fallbackResult.statusText}`);
    }
  }

  return { exitCode: 1, error: 'ALL_ENDPOINTS_FAILED', primaryResult, fallbackResult };
}

// CLI Execution Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Supabase Keep-Alive CLI

Usage:
  node scripts/keep-alive.js [options]

Options:
  --debug             Enable verbose diagnostic logging (headers, latency, body)
  --endpoint <path>   Override target PostgREST endpoint
  --help, -h          Show this help message

Environment Variables:
  SUPABASE_URL        Supabase project URL
  SUPABASE_ANON_KEY   Supabase public anon/publishable API key
  DEBUG               Set to 'true' or '1' to enable verbose logging
  ENDPOINT_OVERRIDE   Custom PostgREST endpoint
`);
    process.exit(0);
  }

  let endpointOverride;
  const epIndex = args.indexOf('--endpoint');
  if (epIndex !== -1 && args[epIndex + 1]) {
    endpointOverride = args[epIndex + 1];
  }

  runKeepAlive({ endpointOverride })
    .then((result) => {
      process.exitCode = result.exitCode;
    })
    .catch((err) => {
      console.error('[FATAL] Unhandled exception:', err);
      process.exitCode = 1;
    });
}

module.exports = {
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
};
