import "./globals.css";
import ClientProviders from "@/app/ClientProviders";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://afrochow.ca";

export const metadata = {
    // Required for relative Open Graph/Twitter image URLs (used by pages that
    // don't set their own absolute image) to resolve correctly.
    metadataBase: new URL(SITE_URL),
    title: "Afrochow - African Food Delivery",
    description: "Order authentic African and Caribbean food, groceries and farm produce from verified local vendors — delivered across Canada, starting in Calgary.",
    keywords: [
        "African food delivery",
        "African restaurants Canada",
        "African food Calgary",
        "Caribbean food delivery",
        "African groceries online",
        "African food delivery Calgary",
        "authentic African cuisine",
        "halal food delivery",
    ],
    icons: {
        icon: [
            { url: "/favicon.ico",  sizes: "any" },
            { url: "/icon.png",     type: "image/png", sizes: "512x512" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
        ],
    },
    openGraph: {
        type: "website",
        url: SITE_URL,
        siteName: "Afrochow",
        title: "Afrochow - African Food Delivery",
        description: "Order authentic African and Caribbean food, groceries and farm produce from verified local vendors — delivered across Canada.",
        images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Afrochow — Taste of Africa" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Afrochow - African Food Delivery",
        description: "Order authentic African and Caribbean food, groceries and farm produce from verified local vendors — delivered across Canada.",
        images: ["/og-default.png"],
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#059669",
};

// Site-wide structured data — helps search engines associate the site with
// the Afrochow brand/logo (Organization) and enables a sitelinks search box
// (WebSite). Vendor-specific Restaurant JSON-LD is injected separately by
// app/(main)/restaurant/[publicVendorId]/layout.jsx.
const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Afrochow",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [
        "https://facebook.com/afrochow",
        "https://twitter.com/afrochow",
        "https://instagram.com/afrochow",
        "https://tiktok.com/@afrochow",
    ],
};

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Afrochow",
    url: SITE_URL,
    potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/restaurants?query={search_term_string}`,
        "query-input": "required name=search_term_string",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger -- static JSON, no user-controlled HTML
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger -- static JSON, no user-controlled HTML
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ClientProviders>
            <Toaster position="bottom-right" />
            {children}
        </ClientProviders>
        </body>
        </html>
    );
}