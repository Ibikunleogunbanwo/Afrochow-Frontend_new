'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, RefreshCw, Pin, PinOff,
    Package, Loader2, Star, Store, Search, X,
} from 'lucide-react';
import { AdminProductsAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 15;

function PinButton({ product, onToggle, loading }) {
    return (
        <button
            onClick={() => onToggle(product)}
            disabled={loading}
            title="Unpin from featured"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
        >
            {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <><PinOff className="w-3.5 h-3.5" /> Unpin</>
            }
        </button>
    );
}

export default function AdminProductsPage() {
    const [featured,   setFeatured]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [pinLoading, setPinLoading] = useState({});
    const [page,       setPage]       = useState(1);
    const [search,     setSearch]     = useState('');

    const fetchFeatured = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await AdminProductsAPI.getFeatured();
            const data = Array.isArray(res?.data) ? res.data : [];
            setFeatured(data);
        } catch (e) {
            setError(e.message || 'Failed to load featured products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

    const handleUnpin = async (product) => {
        const id = product.publicProductId;
        setPinLoading(prev => ({ ...prev, [id]: true }));
        try {
            const res  = await AdminProductsAPI.toggleFeature(id);
            const data = res?.data ?? {};

            if (data.isFeatured) {
                // Toggled back to pinned — refresh to sync
                await fetchFeatured();
                toast.success('Product pinned to featured section');
            } else {
                // Unpinned — remove from list immediately
                setFeatured(prev => prev.filter(p => p.publicProductId !== id));
                toast.success('Product removed from featured section');
            }
        } catch (e) {
            toast.error('Toggle Failed', { description: e.message || 'Failed to update featured status' });
        } finally {
            setPinLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const filtered = featured.filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.vendorName?.toLowerCase().includes(q) ||
            p.restaurantName?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (!loading && error) {
        return (
            <div className="space-y-6">
                <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-900">Featured Products</span>
                </nav>
                <AdminPageError message={error} onRetry={fetchFeatured} />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Featured Products</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Featured Products</h1>
                    <p className="text-gray-500 mt-1">Products currently pinned to the featured section customers see</p>
                </div>
                <button
                    onClick={fetchFeatured}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{featured.length}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Currently featured</p>
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                        <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            To pin a new product, use the <strong>toggle-feature</strong> endpoint via the vendor product panel or API. Unpin here to remove from the featured section.
                        </p>
                    </div>
                </div>
            )}

            {/* Search */}
            {!loading && featured.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search featured products…"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(''); setPage(1); }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">
                        {search ? `No results for "${search}"` : 'No products are currently featured'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {!search && 'Use the toggle-feature endpoint to pin a product.'}
                    </p>
                </div>
            ) : (
                <>
                    <AdminTableRoot>
                        <AdminTableHeader columns={['Product', 'Vendor', 'Price', 'Pinned on', 'Action']} />
                        {paginated.map(product => {
                            const id = product.publicProductId;
                            return (
                                <AdminTableRow key={id}>
                                    {/* Product */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    {/* Vendor */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{product.vendorName ?? product.restaurantName ?? '—'}</span>
                                    </div>

                                    {/* Price */}
                                    <span className="text-sm font-semibold text-gray-900">
                                        {product.price != null ? `CA$${Number(product.price).toFixed(2)}` : '—'}
                                    </span>

                                    {/* Pinned on */}
                                    <span className="text-xs text-gray-400 font-mono">
                                        {product.featuredAt
                                            ? new Date(product.featuredAt).toLocaleDateString('en-CA', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                              })
                                            : '—'
                                        }
                                    </span>

                                    {/* Unpin */}
                                    <PinButton
                                        product={product}
                                        onToggle={handleUnpin}
                                        loading={!!pinLoading[id]}
                                    />
                                </AdminTableRow>
                            );
                        })}
                    </AdminTableRoot>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
