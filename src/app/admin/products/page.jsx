'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, RefreshCw,
    Package, Loader2, Store, Search, X,
} from 'lucide-react';
import { AdminProductsAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 20;

// ── Toggle switch ─────────────────────────────────────────────────────────────
function FeatureToggle({ featured, onToggle, loading }) {
    return (
        <div className="flex items-center gap-2">
            <button
                role="switch"
                aria-checked={featured}
                onClick={onToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${featured ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
                {loading ? (
                    <Loader2 className={`absolute w-3.5 h-3.5 animate-spin text-white transition-all ${featured ? 'left-4' : 'left-0.5'}`} />
                ) : (
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md
                        transition-transform duration-200 ${featured ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                )}
            </button>
            <span className={`text-xs font-semibold hidden sm:block ${featured ? 'text-amber-600' : 'text-gray-400'}`}>
                {featured ? 'Featured' : 'Not featured'}
            </span>
        </div>
    );
}

// ── Product row card (mobile + desktop) ───────────────────────────────────────
function ProductRow({ product, onToggle, toggling }) {
    const id       = product.publicProductId;
    const featured = !!product.isFeatured;

    return (
        <div className={`bg-white border rounded-2xl md:rounded-none md:border-0 md:border-b border-gray-100
            transition-colors hover:bg-gray-50 ${featured ? 'border-amber-200 md:border-gray-100' : ''}`}>

            {/* Mobile card */}
            <div className="flex items-start gap-3 p-4 md:hidden">
                {/* Image */}
                <div className="shrink-0">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{id?.slice(-8).toUpperCase()}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        {product.vendorName && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Store className="w-3 h-3" /> {product.vendorName}
                            </span>
                        )}
                        {product.price != null && (
                            <span className="text-xs font-semibold text-gray-700">
                                CA${Number(product.price).toFixed(2)}
                            </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
                            ${product.available
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                            {product.available ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>

                {/* Toggle */}
                <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                    <FeatureToggle featured={featured} onToggle={() => onToggle(product)} loading={toggling} />
                    <span className={`text-[10px] font-semibold ${featured ? 'text-amber-500' : 'text-gray-400'}`}>
                        {featured ? 'Featured' : 'Feature'}
                    </span>
                </div>
            </div>

            {/* Desktop row */}
            <div className="hidden md:grid md:items-center md:px-6 md:py-3.5 gap-4"
                style={{ gridTemplateColumns: '2fr 1.5fr 80px 1fr 90px 120px' }}>

                {/* Product */}
                <div className="flex items-center gap-3 min-w-0">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{id?.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Vendor */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{product.vendorName ?? '—'}</span>
                </div>

                {/* Price */}
                <span className="text-sm font-semibold text-gray-900">
                    {product.price != null ? `CA$${Number(product.price).toFixed(2)}` : '—'}
                </span>

                {/* Category */}
                <span className="text-sm text-gray-500 truncate">{product.categoryName ?? '—'}</span>

                {/* Available */}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit
                    ${product.available
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    {product.available ? 'Available' : 'Unavailable'}
                </span>

                {/* Toggle */}
                <FeatureToggle featured={featured} onToggle={() => onToggle(product)} loading={toggling} />
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
    const [products,  setProducts]  = useState([]);
    const [meta,      setMeta]      = useState({ totalElements: 0, totalPages: 0, pageNumber: 0 });
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const [toggling,  setToggling]  = useState({}); // { [id]: bool }
    const [page,      setPage]      = useState(1);
    const [search,    setSearch]    = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const debounceRef = useRef(null);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQ(value);
            setPage(1);
        }, 400);
    };

    const fetchProducts = useCallback(async (p = 1, q = '') => {
        setLoading(true);
        setError(null);
        try {
            const res  = await AdminProductsAPI.getAll(p - 1, PAGE_SIZE, q);
            const data = res?.data ?? res ?? {};
            setProducts(Array.isArray(data.content) ? data.content : []);
            setMeta({
                totalElements: data.totalElements ?? 0,
                totalPages:    data.totalPages    ?? 0,
                pageNumber:    data.pageNumber    ?? 0,
            });
        } catch (e) {
            setError(e.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(page, debouncedQ); }, [fetchProducts, page, debouncedQ]);

    const handleToggle = async (product) => {
        const id = product.publicProductId;
        setToggling(prev => ({ ...prev, [id]: true }));
        try {
            const res       = await AdminProductsAPI.toggleFeature(id);
            const updated   = res?.data ?? {};
            const nowFeatured = !!updated.isFeatured;

            toast.success(nowFeatured
                ? 'Product added to featured section'
                : 'Product removed from featured section'
            );

            // Re-fetch to ensure UI matches server state — prevents refresh from
            // "clearing" the toggle by keeping local state in sync with the DB.
            await fetchProducts(page, debouncedQ);
        } catch (e) {
            toast.error('Toggle failed', { description: e.message || 'Could not update featured status' });
        } finally {
            setToggling(prev => ({ ...prev, [id]: false }));
        }
    };

    const featuredCount = products.filter(p => p.isFeatured).length;

    if (!loading && error) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <AdminPageError message={error} onRetry={() => fetchProducts(page, debouncedQ)} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Toggle products on or off the featured section</p>
                </div>
                <button
                    onClick={() => fetchProducts(page, debouncedQ)}
                    disabled={loading}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-xl sm:text-2xl font-black text-gray-900">{meta.totalElements}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Total</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-xl sm:text-2xl font-black text-amber-600">{featuredCount}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Featured</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-xl sm:text-2xl font-black text-gray-900">{meta.totalElements - featuredCount}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Not featured</p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="Search by name, vendor or category…"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
                {search && (
                    <button
                        onClick={() => { setSearch(''); setDebouncedQ(''); setPage(1); }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">
                        {debouncedQ ? `No products match "${debouncedQ}"` : 'No products found'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop header */}
                    <div className="hidden md:grid items-center px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-xl gap-4 sticky top-0 z-10"
                        style={{ gridTemplateColumns: '2fr 1.5fr 80px 1fr 90px 120px' }}>
                        {['Product', 'Vendor', 'Price', 'Category', 'Status', 'Featured'].map(col => (
                            <span key={col} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="space-y-2 md:space-y-0 md:border md:border-gray-100 md:rounded-2xl md:overflow-hidden">
                        {products.map(product => (
                            <ProductRow
                                key={product.publicProductId}
                                product={product}
                                onToggle={handleToggle}
                                toggling={!!toggling[product.publicProductId]}
                            />
                        ))}
                    </div>

                    {meta.totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={meta.totalPages}
                            totalItems={meta.totalElements}
                            pageSize={PAGE_SIZE}
                            onPageChange={p => setPage(p)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

function Breadcrumb() {
    return (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="font-semibold text-gray-900">Products</span>
        </nav>
    );
}
