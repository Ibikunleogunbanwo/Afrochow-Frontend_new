import { API_BASE_URL, fetchWithCredentials } from './httpClient';

// Help-centre FAQs and policy pages are owned by the backend (ContentController)
// so the website and the AI assistant answer from the same source.

// Matches the backend's Cache-Control max-age on /public/content/**.
const CONTENT_REVALIDATE_SECONDS = 300;

/**
 * Server-side fetch for public content. Returns the document, or null if the
 * backend is unreachable or returns an error — pages render a fallback rather
 * than crashing on a transient outage.
 */
async function fetchPublicContent(path) {
    try {
        const res = await fetch(`${API_BASE_URL}/public/content/${path}`, {
            next: { revalidate: CONTENT_REVALIDATE_SECONDS },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
    } catch {
        return null;
    }
}

/** @param {'customer' | 'vendor'} audience */
export const getPublicFaqs = (audience) => fetchPublicContent(`faqs/${audience}`);

/** @param {'privacy' | 'terms' | 'cookies'} slug */
export const getPolicy = (slug) => fetchPublicContent(`policies/${slug}`);

// Admin help requires the admin session cookie, so it is fetched client-side.
export const AdminContentAPI = {
    getFaqs: () => fetchWithCredentials(`${API_BASE_URL}/admin/content/faqs`),
};
