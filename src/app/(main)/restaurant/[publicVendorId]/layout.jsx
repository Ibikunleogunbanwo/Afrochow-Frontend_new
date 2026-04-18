// Server component that injects per-vendor Open Graph + Twitter metadata so
// that links shared to WhatsApp / iMessage / Facebook / X render a proper
// preview card (name, cuisine, rating, cover image) instead of a bare URL.
//
// The companion `page.jsx` is a client component ("use client") which cannot
// export `generateMetadata`. A server layout is the standard Next.js escape
// hatch and runs once per request on the edge.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afrochow.com';

async function fetchVendorForMetadata(publicVendorId) {
    try {
        // Public endpoint — no auth needed. Short revalidate so a freshly
        // renamed restaurant propagates to share cards within the hour.
        const res = await fetch(`${API_BASE_URL}/vendors/${publicVendorId}`, {
            next: { revalidate: 600 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
    } catch {
        // Never block rendering on metadata fetch failure — just fall back.
        return null;
    }
}

export async function generateMetadata({ params }) {
    // Next.js 15 made `params` an async Promise in server components — destructuring
    // it directly (as we used to) yielded `undefined`, which was then interpolated
    // into `/vendors/undefined` and flooded prod logs with 404 warnings.
    const { publicVendorId } = await params;
    const vendor = await fetchVendorForMetadata(publicVendorId);

    const fallback = {
        title: 'Discover local African flavours — Afrochow',
        description:
            'Order from trusted African restaurants and grocery stores across Canada on Afrochow.',
    };
    if (!vendor) return fallback;

    const name = vendor.restaurantName || vendor.businessName || 'Afrochow vendor';
    const cityLine = [vendor.city, vendor.province].filter(Boolean).join(', ');
    const cuisine = vendor.storeCategory || 'African food';
    const rating = typeof vendor.averageRating === 'number'
        ? ` · ★ ${vendor.averageRating.toFixed(1)}`
        : '';

    const title = `${name} — ${cuisine} on Afrochow${rating}`;
    const description = cityLine
        ? `${name} in ${cityLine}. Order ${cuisine.toLowerCase()} on Afrochow.`
        : `Order from ${name} on Afrochow — ${cuisine.toLowerCase()}.`;

    const image = vendor.bannerImageUrl || vendor.profileImageUrl || `${SITE_URL}/og-default.png`;
    const canonical = `${SITE_URL}/restaurant/${publicVendorId}`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type: 'website',
            url: canonical,
            title,
            description,
            siteName: 'Afrochow',
            images: [{ url: image, alt: name }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default function RestaurantLayout({ children }) {
    return children;
}
