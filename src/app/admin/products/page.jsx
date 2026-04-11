'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, RefreshCw,
    Pin, PinOff, Package, Loader2, Star, Store, Search, X,
} from 'lucide-react';
import { AdminProductsAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 20;

function PinToggle({ product, onToggle, loading }) {
    const pinned = !!product.isFeatured;
    return (
        <button
            onClick={() => onToggle(product)}
            disabled={loading}
            title={pinned ? 'Unpin from featured' : 'Pin to featured'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50
                ${pinned
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                }`}
        >
            {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : pinned
                    ? <><PinOff className="w-3.5 h-3.5" /> Unpin</>
                    : <><Pin className="w-3.5 h-3.5" /> Pin</>
            }
        </button>
    );
}

export default function AdminProductsPage() {
    const [products,   setProducts]   = useState([]);
    const [meta,       setMeta]       = useState({ totalElements: 0, totalPages: 0, pageNumber: 0 });
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [pinLoading, setPinLoading] = useState({});
    const [page,       setPage]       = useState(1); // 1-based for UI, 0-based for API
    const [search,     setSearch]     = useState('');

    const fetchProducts = useCallback(async (p = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res  = await AdminProductsAPI.getAll(p - 1, PAGE_SIZE);
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

    useEffect(() => { fetchProducts(page); }, [fetchProducts, page]);

    const handleToggle = async (product) => {
        const id = product.publicProductId;
        setPinLoading(prev => ({ ...prev, [id]: true }));
        try {
            const res      = await AdminProductsAPI.toggleFeature(id);
            const updated  = res?.data ?? {};
            const nowPinned = !!updated.isFeatured;

            // Optimistically update the row in place
            setProducts(prev => prev.map(p =>
                p.publicProductId === id
                    ? { ...p, isFeatured: nowPinned, featuredAt: updated.featuredAt ?? null }
                    : p
            ));

            toast.success(nowPinned
                ? 'Product pinned to featured section'
                : 'Product removed from featured section'
            );
        } catch (e) {
            toast.error('Toggle Failed', { description: e.message || 'Failed to update featured status' });
        } finally {
            setPinLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // Client-side search filter (within the current page)
    const filtered = search.trim()
        ? products.filter(p => {
            const q = search.toLowerCase();
            return (
                p.name?.toLowerCase().includes(q) ||
                p.vendorName?.toLowerCase().includes(q) ||
                p.categoryName?.toLowerCase().includes(q)
            );
          })
        : products;

    const featuredCount = products.filter(p => p.isFeatured).length;

    if (!loading && error) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <AdminPageError message={error} onRetry={() => fetchProducts(page)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Pin or unpin products from the featured section</p>
                </div>
                <button
                    onClick={() => fetchProducts(page)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{meta.totalElements}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total Products</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-amber-600">{featuredCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pinned on this page</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{meta.totalPages}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pages</p>
                    </div>
                </div>
            )}

            {/* Search */}
            {!loading && products.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by name, vendor or category on this page…"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
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
                        {search ? `No products match "${search}"` : 'No products found'}
                    </p>
                </div>
            ) : (
                <>
                    <AdminTableRoot>
                        <AdminTableHeader columns={['Product', 'Vendor', 'Price', 'Category', 'Status', 'Featured']} />
                        {filtered.map(product => {
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
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 min-w-0">
                                        <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{product.vendorName ?? '—'}</span>
                                    </div>

                                    {/* Price */}
                                    <span className="text-sm font-semibold text-gray-900">
                                        {product.price != null ? `CA$${Number(product.price).toFixed(2)}` : '—'}
                                    </span>

                                    {/* Category */}
                                    <span className="text-sm text-gray-500 truncate">{product.categoryName ?? '—'}</span>

                                    {/* Available */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                                        ${product.available
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                                        }`}>
                                        {product.available ? 'Available' : 'Unavailable'}
                                    </span>

                                    {/* Pin toggle */}
                                    <PinToggle
                                        product={product}
                                        onToggle={handleToggle}
                                        loading={!!pinLoading[id]}
                                    />
                                </AdminTableRow>
                            );
                        })}
                    </AdminTableRoot>

                    {/* Server-side pagination */}
                    {meta.totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={meta.totalPages}
                            totalItems={meta.totalElements}
                            pageSize={PAGE_SIZE}
                            onPageChange={(p) => { setPage(p); setSearch(''); }}
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
