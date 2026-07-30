"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Store, Star } from "lucide-react";
import { SearchAPI } from "@/lib/api/search.api";
import { resolveImageUrl } from "@/lib/utils/imageUrl";

const PREVIEW_COUNT = 8;

/**
 * Read-only preview card — deliberately NOT a link and has no cart/order
 * wiring. Afrochow can't deliver to a city it doesn't operate in, so this
 * is purely "here's a taste of what's on the platform," not a product page.
 */
const PreviewCard = ({ product }) => (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <div className="relative w-full aspect-square bg-gray-100">
            {product.imageUrl && (
                <Image
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                />
            )}
        </div>
        <div className="p-3">
            <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-500 truncate">{product.restaurantName}</p>
            {product.averageRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-gray-600">{product.averageRating.toFixed(1)}</span>
                </div>
            )}
        </div>
    </div>
);

/**
 * Honest empty state for users in a city Afrochow doesn't operate in yet —
 * shown in place of the Featured/Top/Popular rails (rather than letting
 * those rails silently fall back to another city's vendors as if local).
 *
 * Still shows a small read-only preview of Calgary's top products below the
 * waitlist CTA, purely as "here's a taste of the platform" — not orderable
 * from here, since Afrochow genuinely can't deliver to an unserved city.
 */
export default function NotInYourAreaYet({ city }) {
    const [previewProducts, setPreviewProducts] = useState([]);

    useEffect(() => {
        let cancelled = false;
        // Nationwide (no city filter) — this is the one deliberate, clearly-labeled
        // use of platform-wide content, distinct from the rails' own city-scoped
        // fetches which must never silently fall back like this.
        SearchAPI.getFeaturedProducts(null, null, null)
            .then((res) => {
                if (cancelled) return;
                const products = res?.success && Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res) ? res : [];
                setPreviewProducts(products.slice(0, PREVIEW_COUNT));
            })
            .catch(() => { /* preview is optional, fail silently */ });
        return () => { cancelled = true; };
    }, []);

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto max-w-2xl text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-emerald-50 rounded-full">
                    <MapPin className="w-8 h-8 text-emerald-600" />
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-4">
                    We&apos;re not in {city ? city : "your area"} yet
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                    Afrochow is currently live in Calgary, with more cities on the way.
                    Join the waitlist and we&apos;ll let you know the moment we launch near you.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/waitlist"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <span>Join the Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/register/vendor/step-1"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        <span>Bring Afrochow to My City as a Vendor</span>
                    </Link>
                </div>
            </div>

            {previewProducts.length > 0 && (
                <div className="container px-4 mx-auto max-w-5xl mt-16">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide text-center mb-6">
                        Popular on Afrochow in Calgary
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {previewProducts.map((product, i) => (
                            <PreviewCard key={product.publicProductId || `preview-${i}`} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
