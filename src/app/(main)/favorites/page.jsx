"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { FavoritesAPI } from "@/lib/api/favorites.api";
import { toast } from "@/components/ui/toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { resolveImageUrl } from "@/lib/utils/imageUrl";
import CustomerWaitlistNotice from "@/components/mvp/CustomerWaitlistNotice";
import { isCustomerWaitlistMode } from "@/lib/mvp";
import {
    Heart, Store, UtensilsCrossed, Star, Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

const TABS = [
    { key: "all",     label: "All"         },
    { key: "VENDOR",  label: "Restaurants" },
    { key: "PRODUCT", label: "Dishes"      },
];

// ── Cards ─────────────────────────────────────────────────────────────────────

function RemoveButton({ onRemove, removing }) {
    return (
        <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
            disabled={removing}
            aria-label="Remove from favorites"
            className="absolute z-10 top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all disabled:opacity-50"
        >
            {removing
                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                : <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            }
        </button>
    );
}

function VendorFavoriteCard({ favorite, onRemove, removing }) {
    const v = favorite.vendor;
    if (!v) return null;
    const logo = resolveImageUrl(v.logoUrl);

    return (
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
            <RemoveButton onRemove={onRemove} removing={removing} />
            <Link href={`/restaurant/${v.publicVendorId}`} className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {logo ? (
                        <Image src={logo} alt={v.restaurantName || "Restaurant"} fill sizes="64px" className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-6 h-6 text-gray-300" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <p className="font-bold text-gray-900 truncate">{v.restaurantName || "Restaurant"}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{v.storeCategory || "Restaurant"}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-700">
                            {v.rating != null ? v.rating.toFixed(1) : "0.0"}
                        </span>
                        {v.isActive === false && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-400 font-semibold">
                                Unavailable
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

function ProductFavoriteCard({ favorite, onRemove, removing }) {
    const p = favorite.product;
    if (!p) return null;
    const image = resolveImageUrl(p.imageUrl);

    return (
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
            <RemoveButton onRemove={onRemove} removing={removing} />
            <Link href={`/restaurant/${p.vendorPublicId}`} className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {image ? (
                        <Image src={image} alt={p.productName || "Dish"} fill sizes="64px" className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-gray-300" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <p className="font-bold text-gray-900 truncate">{p.productName || "Dish"}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{p.vendorName || "Vendor unavailable"}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-emerald-600">
                            CA${Number(p.price ?? 0).toFixed(2)}
                        </span>
                        {p.isAvailable === false && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-400 font-semibold">
                                Unavailable
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const router = useRouter();
    const isCustomer = isAuthenticated && role?.toUpperCase() === "CUSTOMER";
    const { removeFromLocalState } = useFavoritesContext();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [tab, setTab]             = useState("all");
    const [removingId, setRemovingId] = useState(null);
    const [page, setPage]           = useState(1);

    const PAGE_SIZE = 10;

    const loadFavorites = () => {
        setLoading(true);
        setError(null);
        // Backend returns a paginated wrapper ({ content, pageNumber, ... }),
        // not a raw array — the actual list is at data.content. This page does
        // its own client-side filtering/pagination over the full list, so we
        // request the backend's max page size (100) in one shot rather than
        // its default of 20, which would otherwise silently hide anything
        // past the first 20 favorites.
        return FavoritesAPI.getAllFavorites()
            .then(res => setFavorites(res?.data?.content ?? []))
            .catch(err => setError(err.message || "Could not load favorites."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (authLoading) return;
        if (isCustomerWaitlistMode) {
            setLoading(false);
            return;
        }
        // Guests and non-customer roles (vendor/admin) have no favorites of their
        // own — bounce home rather than showing an empty/broken page.
        if (!isAuthenticated || !isCustomer) { router.push("/"); return; }

        loadFavorites();
    }, [isAuthenticated, authLoading, isCustomer, router]);

    if (isCustomerWaitlistMode) {
        return (
            <CustomerWaitlistNotice
                title="Favorites open at customer launch"
                message="You can browse the showroom now. Saving restaurants and dishes will turn on when customer accounts go live."
            />
        );
    }

    const handleRemove = async (favorite) => {
        const targetId = favorite.favoriteType === "VENDOR"
            ? favorite.vendor?.publicVendorId
            : favorite.product?.publicProductId;
        if (!targetId) return;

        setRemovingId(favorite.publicFavoriteId);
        const previous = favorites;
        setFavorites(prev => prev.filter(f => f.publicFavoriteId !== favorite.publicFavoriteId));

        const noun = favorite.favoriteType === "VENDOR" ? "Restaurant" : "Dish";
        const name = favorite.favoriteType === "VENDOR"
            ? favorite.vendor?.restaurantName
            : favorite.product?.productName;

        try {
            await FavoritesAPI.removeFavorite(favorite.favoriteType, targetId);
            // Keep the shared FavoritesContext in sync so any heart icon for
            // this vendor/product elsewhere on the site (e.g. if the user
            // navigates back to a card that's still mounted) reflects the
            // removal immediately instead of waiting for a full re-fetch.
            removeFromLocalState(favorite.favoriteType, targetId);
            toast.success("Removed from favorites", {
                description: name ? `${name} removed from your favorites.` : `${noun} removed from your favorites.`,
            });
        } catch (err) {
            setFavorites(previous); // rollback — the item wasn't actually removed
            toast.error("Could not remove favorite", { description: err.message });
        } finally {
            setRemovingId(null);
        }
    };

    const filtered      = favorites.filter(f => tab === "all" || f.favoriteType === tab);
    const vendorCount    = favorites.filter(f => f.favoriteType === "VENDOR").length;
    const productCount   = favorites.filter(f => f.favoriteType === "PRODUCT").length;

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-3 max-w-sm">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-sm text-gray-600">{error}</p>
                    <button
                        onClick={loadFavorites}
                        className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-6">

                <Breadcrumb items={[
                    { label: "Profile",   href: "/profile" },
                    { label: "Favorites" },
                ]} />

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Favorites</h1>
                    <p className="text-gray-500 text-sm mt-1">Restaurants and dishes you&apos;ve saved</p>
                </div>

                {/* Tabs */}
                {favorites.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {TABS.map(t => {
                            const count = t.key === "all" ? favorites.length : t.key === "VENDOR" ? vendorCount : productCount;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => { setTab(t.key); setPage(1); }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        tab === t.key
                                            ? "bg-gradient-to-r from-emerald-500 to-amber-600 text-white shadow-md"
                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    {t.label}
                                    {count > 0 && (
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                                            tab === t.key ? "bg-white/20" : "bg-gray-100"
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* List / empty state */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-semibold text-gray-700">
                            {favorites.length === 0
                                ? "No favorites yet"
                                : `No saved ${tab === "VENDOR" ? "restaurants" : "dishes"}`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Tap the heart on any restaurant or dish to save it here.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-amber-700 transition-all"
                        >
                            Browse stores
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginated.map(favorite => (
                                favorite.favoriteType === "VENDOR" ? (
                                    <VendorFavoriteCard
                                        key={favorite.publicFavoriteId}
                                        favorite={favorite}
                                        onRemove={() => handleRemove(favorite)}
                                        removing={removingId === favorite.publicFavoriteId}
                                    />
                                ) : (
                                    <ProductFavoriteCard
                                        key={favorite.publicFavoriteId}
                                        favorite={favorite}
                                        onRemove={() => handleRemove(favorite)}
                                        removing={removingId === favorite.publicFavoriteId}
                                    />
                                )
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
