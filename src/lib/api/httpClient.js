
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
 * Wrapper for fetch with credentials and response unwrapping.
 *
 * - Attaches `error.status` to every thrown error so callers can
 *   distinguish 401 (expired/invalid token) from 500 (server fault)
 *   from network failures (status undefined).
 * - Silences console noise for 401 on /auth/me (passive auth checks).
 */
export const fetchWithCredentials = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorMessage = extractErrorMessage(json, 'Request failed');

    const isSilent = response.status === 401 && url.includes('/auth/me');

    if (!isSilent) {
      console.error('API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        response: json,
      });
    }


    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return json;
};

export { API_BASE_URL };