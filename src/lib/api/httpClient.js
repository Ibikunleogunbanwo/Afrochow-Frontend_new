const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Extract meaningful error message from wrapped API response
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
 * Silences 401 errors on /auth/me (used for passive auth checks).
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

    throw new Error(errorMessage);
  }

  return json;
};

export { API_BASE_URL };
