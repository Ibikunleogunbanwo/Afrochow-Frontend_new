'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, RefreshCw, Pin, PinOff,
    Package, AlertCircle, Loader2, Star, Store, Search, X,
} from 'lucide-react';
import { AdminProductsAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 15;

function PinButton({ product, onToggle, loading }) {
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
                    ? <><Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Pinned</>
                    : <><PinOff className="w-3.5 h-3.5" /> Pin</>
            }
        </button>
    );
}

export default function AdminProductsPage() {
    const [products,       setProducts]       = useState([]);
    const [featured,       setFeatured]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);
    const [pinLoading,     setPinLoading]     = useState({});
    const [page,           setPage]           = useState(1);
    const [search,         setSearch]         = useState('');

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [prodRes, featRes] = await Promise.all([
                AdminProductsAPI.getAll(),
                AdminProductsAPI.getFeatured(),
            ]);
            const prods = Array.isArray(prodRes?.data) ? prodRes.data : [];
            const feats = Array.isArray(featRes?.data) ? featRes.data : [];
            setProducts(prods);
            setFeatured(feats);
        } catch (e) {
            setError(e.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleToggleFeature = async (product) => {
        const id = product.publicProductId;
        setPinLoading(prev => ({ ...prev, [id]: true }));
        try {
            const res  = await AdminProductsAPI.toggleFeature(id);
            const data = res?.data ?? {};
            const nowFeatured = data.isFeatured;

            // Optimistically update the product list
            setProducts(prev => prev.map(p =>
                p.publicProductId === id
                    ? { ...p, isFeatured: nowFeatured, featuredAt: data.featuredAt }
                    : p
            ));

            // Refresh the featured strip
            const featRes = await AdminProductsAPI.getFeatured();
            setFeatured(Array.isArray(featRes?.data) ? featRes.data : []);

            toast.success(
                nowFeatured ? 'Product pinned to featured section' : 'Product removed from featured section'
            );
        } catch (e) {
            toast.error('Toggle Failed', { description: e.message || 'Failed to update featured status' });
        } finally {
            setPinLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const filtered = products.filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.vendorName?.toLowerCase().includes(q) ||
            p.restaurantName?.toLowerCase().includes(q) ||
            p.categoryName?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const featuredCount = products.filter(p => p.isFeatured).length;

    if (!loading && error) {
        return (
            <div className="space-y-6">
                <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-900">Products</span>
                </nav>
                <AdminPageError message={error} onRetry={fetchAll} />
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
                <span className="font-semibold text-gray-900">Products</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Pin products to the featured section visible to customers</p>
                </div>
                <button
                    onClick={fetchAll}
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
                        <p className="text-2xl font-black text-gray-900">{products.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total Products</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-amber-600">{featuredCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pinned / Featured</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{products.length - featuredCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Not Featured</p>
                    </div>
                </div>
            )}

            {/* Currently Featured Strip */}
            {!loading && featured.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h2 className="text-sm font-bold text-amber-800">Currently Featured</h2>
                        <span className="ml-auto text-xs text-amber-600 font-medium">{featured.length} pinned</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {featured.map(p => (
                            <div
                                key={p.publicProductId}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-xl"
                            >
                                {p.imageUrl && (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.name}
                                        className="w-6 h-6 rounded-md object-cover shrink-0"
                                    />
                                )}
                                <span className="text-xs font-semibold text-gray-800">{p.name}</span>
                                {(p.restaurantName || p.vendorName) && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Store className="w-3 h-3" />
                                        {p.restaurantName ?? p.vendorName}
                                    </span>
                                )}
                                {p.featuredAt && (
                                    <span className="text-[10px] text-amber-500 font-mono">
                                        {new Date(p.featuredAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        ))}
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
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name, vendor or category…"
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
                        {search ? `No products match "${search}"` : 'No products found'}
                    </p>
                </div>
            ) : (
                <>
                    <AdminTableRoot>
                        <AdminTableHeader columns={['Product', 'Vendor', 'Price', 'Category', 'Featured', 'Actions']} />
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
                                            <p className="text-xs text-gray-400 font-mono truncate">{id?.slice(-8).toUpperCase()}</p>
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

                                    {/* Category */}
                                    <span className="text-sm text-gray-500">{product.categoryName ?? '—'}</span>

                                    {/* Featured status */}
                                    <div>
                                        {product.isFeatured ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                                <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </div>

                                    {/* Pin toggle */}
                                    <PinButton
                                        product={product}
                                        onToggle={handleToggleFeature}
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
