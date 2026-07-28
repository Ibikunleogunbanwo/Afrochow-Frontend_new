// Dynamic sitemap — Next.js App Router convention (served at /sitemap.xml).
// Includes static marketing/browse pages plus one entry per active, verified
// vendor storefront so search engines can discover restaurant pages without
// relying purely on internal-link crawling.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afrochow.ca';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchVerifiedVendors() {
    try {
        // Public, unauthenticated endpoint — see SearchController#getVerifiedVendors.
        const res = await fetch(`${API_BASE_URL}/search/vendors/verified`, {
            next: { revalidate: 3600 }, // vendor list changes slowly; refresh hourly
        });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
    } catch {
        // Never let a backend hiccup take the whole sitemap down.
        return [];
    }
}

// Public, indexable static routes. Everything behind auth (cart, checkout,
// orders, profile, settings, notifications, favorites), the admin/vendor
// dashboards, and mid-flow registration steps are intentionally excluded —
// see app/robots.js for the matching disallow list.
const STATIC_ROUTES = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/restaurants', changeFrequency: 'daily', priority: 0.9 },
    { path: '/allstore', changeFrequency: 'daily', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/help', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/waitlist', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/register/customer', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/register/vendor/step-1', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap() {
    const now = new Date();

    const staticEntries = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }));

    const vendors = await fetchVerifiedVendors();
    const vendorEntries = vendors
        .map((v) => v.publicUserId)
        .filter(Boolean)
        .map((id) => ({
            url: `${SITE_URL}/restaurant/${id}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        }));

    return [...staticEntries, ...vendorEntries];
}
