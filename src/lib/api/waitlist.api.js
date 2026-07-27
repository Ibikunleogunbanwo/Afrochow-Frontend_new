import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const WaitlistAPI = {
    join: (payload) => fetchWithCredentials(`${API_BASE_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        silent: true,
    }),
};
