// Next.js App Router convention — served at /robots.txt.
// Keeps authenticated/private and mid-flow pages out of the crawl budget so
// search engines spend it on the public storefront/browse pages instead.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afrochow.ca';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    // Authenticated customer pages
                    '/cart',
                    '/checkout',
                    '/orders',
                    '/order-confirmation',
                    '/favorites',
                    '/notifications',
                    '/profile',
                    '/settings',
                    // Mid-flow / post-registration pages — no standalone SEO value,
                    // and indexing them would surface broken/empty states to crawlers
                    // that land without the required session/step state.
                    '/register/vendor/step-2',
                    '/register/vendor/step-3',
                    '/register/vendor/step-4',
                    '/register/vendor/step-5',
                    '/register/vendor/step-6',
                    '/register/vendor/review',
                    '/register/vendor/success',
                    '/register/admin',
                    '/reset-password',
                    '/verify-email',
                    '/onboarding',
                    // Dashboards — vendor and admin, both behind auth
                    '/vendor',
                    '/vendor/*',
                    '/admin',
                    '/admin/*',
                    // API routes are not pages
                    '/api/*',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
