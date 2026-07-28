// Server component that injects per-vendor Open Graph + Twitter metadata so
// that links shared to WhatsApp / iMessage / Facebook / X render a proper
// preview card (name, cuisine, rating, cover image) instead of a bare URL,
// plus Restaurant structured data (JSON-LD) so search engines can surface
// rich results (name, cuisine, rating) directly in search.
//
// The companion `page.jsx` is a client component ("use client") which cannot
// export `generateMetadata`. A server layout is the standard Next.js escape
// hatch and runs once per request on the edge.

import { notFound } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afrochow.ca';

// Sentinel distinguishing "the backend explicitly said this vendor doesn't
// exist" (HTTP 404 — see SearchService#getVendorByPublicId's
// EntityNotFoundException) from any other failure (network hiccup, 5xx,
// malformed response). Only the former should trigger a hard 404 — a
// transient backend outage must never take down a real vendor's page.
const VENDOR_NOT_FOUND = Symbol('vendor-not-found');

async function fetchVendorForMetadata(publicVendorId) {
    try {
        // Public endpoint — no auth needed. Short revalidate so a freshly
        // renamed restaurant propagates to share cards within the hour.
        // NOTE: the real route is /api/search/vendors/{id} (SearchController
        // has a class-level @RequestMapping("/search")). Calling /api/vendors/{id}
        // directly falls through every mapping and Spring returns a
        // "No static resource" 404, which flooded production logs.
        //
        // Called from both generateMetadata() and the layout component below —
        // Next.js dedupes identical fetch() calls within the same request, so
        // this only hits the network once per page load.
        const res = await fetch(`${API_BASE_URL}/search/vendors/${publicVendorId}`, {
            next: { revalidate: 600 },
        });
        if (res.status === 404) return VENDOR_NOT_FOUND;
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
    } catch {
        // Never block rendering on metadata fetch failure — just fall back.
        return null;
    }
}

// Shared derivation so generateMetadata() and the JSON-LD block below never
// drift out of sync on name/cuisine/image/canonical.
function deriveVendorMeta(vendor, publicVendorId) {
    const name = vendor.restaurantName || vendor.businessName || 'Afrochow vendor';
    // City/province live under the nested address object (AddressResponseDto),
    // not top-level vendor.city/vendor.province — those fields don't exist on
    // VendorProfileResponseDto and previously always evaluated to undefined.
    const cityLine = [vendor.address?.city, vendor.address?.province].filter(Boolean).join(', ');
    const cuisine = vendor.storeCategory || 'African food';
    // bannerUrl/logoUrl are the real VendorProfileResponseDto field names
    // (bannerImageUrl/profileImageUrl don't exist on the DTO and previously
    // always fell through to the default share image).
    const image = vendor.bannerUrl || vendor.logoUrl || `${SITE_URL}/og-default.png`;
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    const canonical = `${SITE_URL}/restaurant/${publicVendorId}`;

    return { name, cityLine, cuisine, image: absoluteImage, canonical };
}

export async function generateMetadata({ params }) {
    // Next.js 15 made `params` an async Promise in server components — destructuring
    // it directly (as we used to) yielded `undefined`, which was then interpolated
    // into `/vendors/undefined` and flooded prod logs with 404 warnings.
    const { publicVendorId } = await params;
    const vendor = await fetchVendorForMetadata(publicVendorId);

    const fallback = {
        title: 'Discover local African flavours | Afrochow',
        description:
            'Order from trusted African restaurants and grocery stores across Canada on Afrochow.',
    };
    if (!vendor || vendor === VENDOR_NOT_FOUND) return fallback;

    const { name, cityLine, cuisine, image, canonical } = deriveVendorMeta(vendor, publicVendorId);
    const rating = typeof vendor.averageRating === 'number'
        ? ` · ★ ${vendor.averageRating.toFixed(1)}`
        : '';

    const title = `${name} | ${cuisine} on Afrochow${rating}`;
    const description = cityLine
        ? `${name} in ${cityLine}. Order ${cuisine.toLowerCase()} on Afrochow.`
        : `Order from ${name} on Afrochow, ${cuisine.toLowerCase()}.`;

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

export default async function RestaurantLayout({ children, params }) {
    const { publicVendorId } = await params;
    const vendor = await fetchVendorForMetadata(publicVendorId);

    // Vendor genuinely doesn't exist (backend returned 404) — render the real
    // not-found boundary with a true 404 status instead of letting the client
    // page's "Store Not Found" soft-error state render as a 200. Any other
    // failure (network hiccup, 5xx) falls through and lets the client page's
    // own fetch/retry logic handle it, so a transient outage can't 404 a real
    // vendor's page.
    if (vendor === VENDOR_NOT_FOUND) notFound();

    if (!vendor) return children;

    const { name, cityLine, cuisine, image, canonical } = deriveVendorMeta(vendor, publicVendorId);
    const [city, province] = cityLine ? cityLine.split(', ') : [undefined, undefined];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name,
        image,
        servesCuisine: cuisine,
        url: canonical,
        ...(city && {
            address: {
                '@type': 'PostalAddress',
                addressLocality: city,
                ...(province && { addressRegion: province }),
                addressCountry: 'CA',
            },
        }),
        ...(typeof vendor.averageRating === 'number' && vendor.reviewCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: vendor.averageRating,
                reviewCount: vendor.reviewCount,
            },
        }),
    };

    return (
        <>
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger -- static JSON, no user-controlled HTML
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
