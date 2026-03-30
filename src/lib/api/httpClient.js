const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Extract meaningful error message from a wrapped API response body.
 */
export const extractErrorMessage = (errorData, defaultMessage) => {
  return (
      errorData?.message ||
      errorData?.error ||
      errorData?.details ||
      errorData?.data?.message ||
      (typeof errorData === 'string' ? errorData : null) ||
      defaultMessage
  );
};

/**
 * Safely parse response body — handles empty bodies (204 No Content)
 * and non-JSON responses without throwing.
 */
const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text || text.trim() === '') return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

// Tracks whether a token refresh is already in flight so concurrent 401s
// all await the same single refresh call rather than each spawning one.
let _refreshPromise = null;

/**
 * Attempt to refresh the access token once.
 * Returns true on success, false if the refresh token itself is expired/invalid.
 */
const tryRefreshToken = async () => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
};

/**
 * Wrapper for fetch with credentials and response unwrapping.
 *
 * - Attaches `error.status` to every thrown error so callers can
 *   distinguish 401 (expired/invalid token) from 500 (server fault)
 *   from network failures (status undefined).
 * - Silences console noise for 401 on /auth/me (passive auth checks).
 * - Safely handles empty or non-JSON response bodies.
 * - On 401, automatically attempts a token refresh and retries the
 *   original request once before throwing — EXCEPT for /auth/me which
 *   is a passive check and should never trigger a refresh attempt.
 */
export const fetchWithCredentials = async (url, options = {}, retries = 3, retryDelayMs = 1000) => {
  let response;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      break;
    } catch (networkError) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        console.error('Network Error —', networkError.message, '| url:', url);
        const error = new Error('Network error — please check your connection');
        error.status = undefined;
        throw error;
      }

      console.warn(`Network error on attempt ${attempt}/${retries}, retrying in ${retryDelayMs}ms...`, url);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  // ── 401 handling ─────────────────────────────────────────────────────────
  // Skip refresh for:
  //   - /auth/me      → passive check, 401 means no session, just clear auth
  //   - /auth/refresh → already refreshing, avoid infinite loop
  //   - /auth/login   → credentials wrong, refresh won't help
  //   - /auth/logout  → session already gone
  const skipRefresh =
      url.includes('/auth/me') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/logout');

  if (response.status === 401 && !skipRefresh) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      try {
        response = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      } catch {
        // Network error on retry — fall through to error handling below
      }
    }
    // If refresh failed, fire a global event so layouts can redirect to login
    if (!refreshed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('session-expired'));
      }
    }
  }

  const json = await safeParseJson(response);

  if (!response.ok || json.success === false) {
    const errorMessage = extractErrorMessage(json, `Request failed (${response.status})`);

    // Silence 401 on /auth/me — it's an expected outcome of a passive check.
    // Callers can also pass options.silent = true to suppress console noise
    // for endpoints where errors are handled gracefully (e.g. notifications).
    const isSilent =
        (response.status === 401 && url.includes('/auth/me')) ||
        options.silent === true;

    if (!isSilent) {
      console.error('API Error —', response.status, errorMessage, '| url:', url);
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data   = json;
    throw error;
  }

  return json;
};

export { API_BASE_URL };