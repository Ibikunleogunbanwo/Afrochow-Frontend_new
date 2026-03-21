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
    // Server returned non-JSON (HTML error page, plain text, etc.)
    return { message: text };
  }
};

/**
 * Wrapper for fetch with credentials and response unwrapping.
 *
 * - Attaches `error.status` to every thrown error so callers can
 *   distinguish 401 (expired/invalid token) from 500 (server fault)
 *   from network failures (status undefined).
 * - Silences console noise for 401 on /auth/me (passive auth checks).
 * - Safely handles empty or non-JSON response bodies.
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
      break; // success — exit retry loop
    } catch (networkError) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        console.error('Network Error —', networkError.message, '| url:', url);
        const error = new Error('Network error — please check your connection');
        error.status = undefined;
        throw error;
      }

      // Backend not ready yet — wait and retry
      console.warn(`Network error on attempt ${attempt}/${retries}, retrying in ${retryDelayMs}ms...`, url);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  const json = await safeParseJson(response);

  if (!response.ok || json.success === false) {
    const errorMessage = extractErrorMessage(json, `Request failed (${response.status})`);

    const isSilent = response.status === 401 && url.includes('/auth/me');

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