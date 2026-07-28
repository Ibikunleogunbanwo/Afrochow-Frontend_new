// Next.js App Router convention file — this is the actual 404 handler,
// automatically rendered (with a real HTTP 404 status) for any unmatched
// route, and for any route that explicitly calls notFound() from a Server
// Component (see restaurant/[publicVendorId]/layout.jsx for an example).
//
// Kept as a server component so it can export metadata (in particular,
// robots: noindex — a 404 page should never itself be indexed). The actual
// animated/interactive UI lives in the client component it renders, since
// framer-motion and router hooks require "use client".

import NotFoundContent from "@/components/NotFoundContent";

export const metadata = {
    title: "Page Not Found | Afrochow",
    description: "The page you're looking for doesn't exist or may have moved.",
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return <NotFoundContent />;
}
