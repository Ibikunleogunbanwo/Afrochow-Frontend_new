"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Image as ImageIcon, X, Star, LayoutDashboard, ChevronRight, ArrowUpDown, Eye, EyeOff, Package } from 'lucide-react';
import { getVendorProducts, createProduct, updateProduct, deleteProduct, toggleProductAvailability, uploadProductImage } from '@/lib/api/vendorProducts';
import ImageUploader from '@/components/image-uploader/ImageUploader';
import { SearchAPI } from '@/lib/api/search.api';
import { ImageUploadAPI } from '@/lib/api/imageUpload';
import ProductReviewsModal from '@/components/vendor/ProductReviewsModal';
import { toast } from '@/components/ui/toast';

const VendorMenuPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'live' | 'hidden'
    const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc'|'name_desc'|'price_asc'|'price_desc'|'rating_desc'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        available: true,
        preparationTimeMinutes: '',
        scheduleType: 'SAME_DAY',
        advanceNoticeHours: '',
        calories: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        categoryId: ''
    });
    const [productImage, setProductImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);


    const fetchCategories = async () => {
        try {
            const json = await SearchAPI.getAllCategories();
            const data = json.data ?? json;

            if (Array.isArray(data) && data.length > 0) {
                setCategories(data);
            } else {
                setCategories([]);
            }

        } catch (error) {
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productResponse = await getVendorProducts();

            if (productResponse?.success) {
                const productsData = productResponse.data || [];

                if (productsData.length > 0) {
                }

                setProducts(productsData);
            } else {
                setProducts([]);
            }
        } catch (error) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Converts empty strings to null for numeric/enum fields so the backend
    // doesn't receive "" where it expects a number or null.
    const sanitizeProductPayload = (data) => {
        const toIntOrNull    = v => (v === '' || v === null || v === undefined) ? null : parseInt(v, 10) || null;
        const toFloatOrNull  = v => (v === '' || v === null || v === undefined) ? null : parseFloat(v) || null;
        const toLongOrNull   = v => (v === '' || v === null || v === undefined) ? null : parseInt(v, 10) || null;
        return {
            ...data,
            price:                  toFloatOrNull(data.price),
            preparationTimeMinutes: toIntOrNull(data.preparationTimeMinutes),
            advanceNoticeHours:     toIntOrNull(data.advanceNoticeHours),
            calories:               toIntOrNull(data.calories),
            categoryId:             toLongOrNull(data.categoryId),
        };
    };

    const handleCreateProduct = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            let imageUrl = formData.imageUrl || '';

            // Upload image first if a file is selected
            if (productImage && typeof productImage !== 'string') {
                try {
                    setUploadingImage(true);
                    // Same endpoint as vendor profile — POST /images/upload/registration
                    const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(productImage, 'products');
                    // uploadRegistrationImage always normalises the URL to response.imageUrl
                    imageUrl = uploadResponse.imageUrl;
                } catch (imgError) {
                    console.error('Error uploading product image:', imgError);
                } finally {
                    setUploadingImage(false);
                }
            }

            const productData = sanitizeProductPayload({ ...formData, imageUrl });

            const response = await createProduct(productData);
            if (response?.success) {
                await fetchProducts();
                setShowCreateModal(false);
                resetForm();
                toast.success('Product created successfully');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product', { description: error?.message });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateProduct = async () => {
        try {
            if (!selectedProduct?.publicProductId) return;

            let imageUrl = typeof productImage === 'string' && productImage
                ? productImage
                : formData.imageUrl;

            if (productImage && typeof productImage !== 'string') {
                try {
                    setUploadingImage(true);
                    const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(productImage, 'products');
                    imageUrl = uploadResponse.imageUrl;
                } catch (imgError) {
                    console.error('Error uploading product image:', imgError);
                } finally {
                    setUploadingImage(false);
                }
            }

            // Sanitize: backend numeric fields must be null, not empty string
            const productData = sanitizeProductPayload({ ...formData, imageUrl });

            const response = await updateProduct(selectedProduct.publicProductId, productData);
            if (response?.success) {
                await fetchProducts();
                setShowEditModal(false);
                resetForm();
                toast.success('Product updated');
            }
        } catch (error) {
            toast.error('Failed to update product', { description: error?.message });
        }
    };

    const handleDeleteProduct = async () => {
        if (isDeleting || !selectedProduct?.publicProductId) return;
        setIsDeleting(true);
        try {
            const response = await deleteProduct(selectedProduct.publicProductId);
            if (response?.success) {
                await fetchProducts();
                setShowDeleteModal(false);
                setSelectedProduct(null);
                toast.success('Product deleted');
            }
        } catch (error) {
            toast.error('Failed to delete product', { description: error?.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleAvailability = async (product) => {
        try {
            const response = await toggleProductAvailability(
                product.publicProductId,
                !product.available
            );
            if (response?.success) {
                await fetchProducts();
                toast.success(product.available ? 'Product marked unavailable' : 'Product marked available');
            }
        } catch (error) {
            toast.error('Failed to update availability', { description: error?.message });
        }
    };

    const handleImageUpload = async (file, publicProductId) => {
        if (!file) return null;

        try {
            setUploadingImage(true);
            const response = await ImageUploadAPI.uploadRegistrationImage(file, 'products');
            if (response?.imageUrl) {
                // Update the product with the new image URL
                if (publicProductId) {
                    await updateProduct(publicProductId, {
                        ...formData,
                        imageUrl: response.imageUrl
                    });
                    await fetchProducts();
                }
                return response.imageUrl;
            }
            return null;
        } catch (error) {
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            available: true,
            preparationTimeMinutes: '',
            scheduleType: 'SAME_DAY',
            advanceNoticeHours: '',
            calories: '',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isSpicy: false,
            categoryId: ''
        });
        setProductImage(null);
        setSelectedProduct(null);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            imageUrl: product.imageUrl || '',
            available: product.available !== false,
            preparationTimeMinutes: product.preparationTimeMinutes || '',
            scheduleType: product.scheduleType || 'SAME_DAY',
            advanceNoticeHours: product.advanceNoticeHours || '',
            calories: product.calories || '',
            isVegetarian: product.isVegetarian || false,
            isVegan: product.isVegan || false,
            isGlutenFree: product.isGlutenFree || false,
            isSpicy: product.isSpicy || false,
            categoryId: product.categoryId || ''
        });
        setProductImage(product.imageUrl || null);
        setShowEditModal(true);
    };

    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };


    // ── derived stats ──────────────────────────────────────────────────────
    const liveCount   = useMemo(() => products.filter(p => p.available !== false).length, [products]);
    const hiddenCount = useMemo(() => products.filter(p => p.available === false).length, [products]);

    const filteredProducts = useMemo(() => {
        let list = products.filter(product => {
            const matchesCategory = filterCategory === 'all' ||
                product.categoryName === filterCategory ||
                String(product.categoryId) === String(filterCategory);

            const matchesAvailability =
                availabilityFilter === 'all' ||
                (availabilityFilter === 'live'   && product.available !== false) ||
                (availabilityFilter === 'hidden' && product.available === false);

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query ||
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.categoryName?.toLowerCase().includes(query);

            return matchesCategory && matchesAvailability && matchesSearch;
        });

        // Sort
        list = [...list].sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':   return (a.name || '').localeCompare(b.name || '');
                case 'name_desc':  return (b.name || '').localeCompare(a.name || '');
                case 'price_asc':  return (a.price || 0) - (b.price || 0);
                case 'price_desc': return (b.price || 0) - (a.price || 0);
                case 'rating_desc': return (b.averageRating || 0) - (a.averageRating || 0);
                default: return 0;
            }
        });

        return list;
    }, [products, filterCategory, availabilityFilter, searchQuery, sortBy]);


    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Products</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your catalogue</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-all shrink-0 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden xs:inline">Add Product</span>
                    <span className="xs:hidden">Add</span>
                </button>
            </div>

            {/* Stats summary — clickable filter cards */}
            <div className="grid grid-cols-3 gap-3">
                {/* All */}
                <button
                    onClick={() => setAvailabilityFilter('all')}
                    className={`text-left rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-all ${
                        availabilityFilter === 'all'
                            ? 'bg-gray-900 border-gray-900'
                            : 'bg-white border-gray-200 hover:border-gray-400'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        availabilityFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                        <Package className={`w-4 h-4 ${availabilityFilter === 'all' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-[11px] leading-none mb-0.5 ${availabilityFilter === 'all' ? 'text-gray-300' : 'text-gray-500'}`}>All</p>
                        <p className={`text-xl font-black leading-none ${availabilityFilter === 'all' ? 'text-white' : 'text-gray-900'}`}>{products.length}</p>
                    </div>
                </button>

                {/* Live */}
                <button
                    onClick={() => setAvailabilityFilter(availabilityFilter === 'live' ? 'all' : 'live')}
                    className={`text-left rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-all ${
                        availabilityFilter === 'live'
                            ? 'bg-green-600 border-green-600'
                            : 'bg-white border-green-200 hover:border-green-400'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        availabilityFilter === 'live' ? 'bg-white/20' : 'bg-green-50'
                    }`}>
                        <Eye className={`w-4 h-4 ${availabilityFilter === 'live' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-[11px] leading-none mb-0.5 ${availabilityFilter === 'live' ? 'text-green-100' : 'text-green-600'}`}>Live</p>
                        <p className={`text-xl font-black leading-none ${availabilityFilter === 'live' ? 'text-white' : 'text-green-700'}`}>{liveCount}</p>
                    </div>
                </button>

                {/* Hidden */}
                <button
                    onClick={() => setAvailabilityFilter(availabilityFilter === 'hidden' ? 'all' : 'hidden')}
                    className={`text-left rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-all ${
                        availabilityFilter === 'hidden'
                            ? 'bg-gray-700 border-gray-700'
                            : 'bg-white border-gray-200 hover:border-gray-400'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        availabilityFilter === 'hidden' ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                        <EyeOff className={`w-4 h-4 ${availabilityFilter === 'hidden' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-[11px] leading-none mb-0.5 ${availabilityFilter === 'hidden' ? 'text-gray-300' : 'text-gray-500'}`}>Hidden</p>
                        <p className={`text-xl font-black leading-none ${availabilityFilter === 'hidden' ? 'text-white' : 'text-gray-500'}`}>{hiddenCount}</p>
                    </div>
                </button>
            </div>

            {/* Search, filters, and sort */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 space-y-3">
                {/* Row 1: search + category + sort */}
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search products…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400 w-4 h-4 shrink-0" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="flex-1 xs:flex-none px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-medium text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.iconUrl} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="text-gray-400 w-4 h-4 shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="flex-1 xs:flex-none px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-medium text-sm"
                        >
                            <option value="name_asc">Name A → Z</option>
                            <option value="name_desc">Name Z → A</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                            <option value="rating_desc">Best Rated</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: availability pills + result count */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        {[
                            { value: 'all',    label: 'All' },
                            { value: 'live',   label: `Live (${liveCount})` },
                            { value: 'hidden', label: `Hidden (${hiddenCount})` },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setAvailabilityFilter(value)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                    availabilityFilter === value
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">
                        {filteredProducts.length === products.length
                            ? `${products.length} product${products.length !== 1 ? 's' : ''}`
                            : `${filteredProducts.length} of ${products.length} products`}
                    </p>
                </div>
            </div>

            {/* Products — Mobile cards + Desktop table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-600" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
                    <p className="text-sm text-gray-500">
                        {searchQuery || filterCategory !== 'all' || availabilityFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first product'}
                    </p>
                    {(searchQuery || filterCategory !== 'all' || availabilityFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchQuery(''); setFilterCategory('all'); setAvailabilityFilter('all'); }}
                            className="mt-4 text-sm font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* ── Mobile card list (hidden on sm+) ── */}
                    <div className="sm:hidden divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <div key={product.publicProductId}
                                className={`flex items-start gap-3 p-4 border-l-4 transition-colors ${
                                    product.available ? 'border-l-green-400 bg-white' : 'border-l-gray-200 bg-gray-50/60'
                                }`}>
                                {/* Thumbnail */}
                                {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.imageUrl} alt={product.name}
                                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                                        <span className="text-sm font-black text-gray-900 shrink-0">
                                            CA${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                                        </span>
                                    </div>

                                    {product.description && (
                                        <p className="text-xs text-gray-400 line-clamp-1 mb-1.5">{product.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {product.categoryName && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{product.categoryName}</span>
                                        )}
                                        {/* Availability toggle pill */}
                                        <button
                                            onClick={() => handleToggleAvailability(product)}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                                                product.available
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {product.available ? 'Live' : 'Hidden'}
                                        </button>
                                        {/* Rating */}
                                        <button
                                            onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                                            className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-yellow-600 transition-colors"
                                        >
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold">
                                                {typeof product.averageRating === 'number' && product.averageRating > 0
                                                    ? product.averageRating.toFixed(1) : '—'}
                                            </span>
                                            {product.reviewCount > 0 && (
                                                <span className="text-gray-400">({product.reviewCount})</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Dietary badges */}
                                    {(product.isVegan || product.isVegetarian || product.isGlutenFree || product.isSpicy) && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {product.isVegan && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-medium">🌱 Vegan</span>}
                                            {product.isVegetarian && !product.isVegan && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">🥬 Veg</span>}
                                            {product.isGlutenFree && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">🌾 GF</span>}
                                            {product.isSpicy && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-medium">🌶 Spicy</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1.5 shrink-0">
                                    <button onClick={() => openEditModal(product)}
                                        className="p-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors"
                                        title="Edit">
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button onClick={() => openDeleteModal(product)}
                                        className="p-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors"
                                        title="Delete">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Desktop table (hidden on mobile) ── */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-900 text-white text-[11px] uppercase tracking-wider">
                                    <th className="w-14 px-3 py-3 text-left">Item</th>
                                    <th className="px-3 py-3 text-left">Name &amp; Details</th>
                                    <th className="w-28 px-3 py-3 text-left">Category</th>
                                    <th className="w-20 px-3 py-3 text-right">Price</th>
                                    <th className="w-36 px-3 py-3 text-center">Order Type</th>
                                    <th className="w-20 px-3 py-3 text-center">Rating</th>
                                    <th className="w-24 px-3 py-3 text-center">Status</th>
                                    <th className="w-20 px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product, index) => (
                                    <tr
                                        key={product.publicProductId}
                                        className={`hover:bg-gray-50 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                    >
                                        {/* Thumbnail */}
                                        <td className="px-3 py-3">
                                            {product.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-11 h-11 object-cover rounded-xl border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Name + meta */}
                                        <td className="px-3 py-3 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-900 leading-tight">{product.name}</p>
                                            {product.description && (
                                                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-x-3 mt-1 text-[11px] text-gray-400">
                                                {product.preparationTimeMinutes && <span>⏱ {product.preparationTimeMinutes} min</span>}
                                                {product.calories && <span>{product.calories} kcal</span>}
                                                {product.totalOrders > 0 && <span>{product.totalOrders} orders</span>}
                                            </div>
                                            {(product.isVegan || product.isVegetarian || product.isGlutenFree || product.isSpicy) && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {product.isVegan && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-medium">🌱 Vegan</span>}
                                                    {product.isVegetarian && !product.isVegan && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">🥬 Vegetarian</span>}
                                                    {product.isGlutenFree && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">🌾 GF</span>}
                                                    {product.isSpicy && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-medium">🌶 Spicy</span>}
                                                </div>
                                            )}
                                        </td>

                                        {/* Category */}
                                        <td className="px-3 py-3">
                                            {product.categoryName ? (
                                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">{product.categoryName}</span>
                                            ) : (
                                                <span className="text-gray-300 text-[11px]">—</span>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="px-3 py-3 text-right">
                                            <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">
                                                CA${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                                            </span>
                                        </td>

                                        {/* Order Type */}
                                        <td className="px-3 py-3 text-center">
                                            {product.scheduleType === 'ADVANCE_ORDER' ? (
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-semibold whitespace-nowrap">📅 Advance</span>
                                                    {product.advanceNoticeHours && (
                                                        <span className="text-[10px] text-blue-500">{product.advanceNoticeHours}h notice</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-semibold">⚡ Same Day</span>
                                            )}
                                        </td>

                                        {/* Rating */}
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                                                className="inline-flex flex-col items-center gap-0.5 hover:bg-gray-100 px-2 py-1.5 rounded-xl transition-colors"
                                                title="View reviews"
                                            >
                                                <span className="inline-flex items-center gap-0.5">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-[12px] font-bold text-gray-900">
                                                        {typeof product.averageRating === 'number' && product.averageRating > 0
                                                            ? product.averageRating.toFixed(1) : '—'}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] text-gray-400">{product.reviewCount || 0} reviews</span>
                                            </button>
                                        </td>

                                        {/* Status toggle */}
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                                    product.available
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                {product.available ? 'Live' : 'Hidden'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit product">
                                                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                                                </button>
                                                <button onClick={() => openDeleteModal(product)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete product">
                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Product Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
                            <h2 className="text-lg sm:text-2xl font-black text-gray-900">
                                {showCreateModal ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <ImageUploader
                                    id="product-image"
                                    label="Product Image"
                                    value={productImage}
                                    onChange={setProductImage}
                                    onUpload={
                                        selectedProduct?.publicProductId
                                            ? (file) => handleImageUpload(file, selectedProduct.publicProductId)
                                            : null
                                    }
                                    size="xl-wide"
                                    shape="square"
                                    helpText="Upload a clear image of your product (max 5MB)"
                                />
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Jollof Rice"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your product…"
                                    rows={3}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all resize-none text-sm"
                                />
                            </div>

                            {/* Price, Category, Prep Time — 2-col on mobile, 3-col on sm */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                        Price * ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, categoryId: Number(e.target.value) })
                                        }
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                                    >
                                        <option value="">Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.iconUrl} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                        Prep time (mins) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.preparationTimeMinutes}
                                        onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                                        placeholder="15"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Fulfilment Schedule */}
                            <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Fulfilment Schedule
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduleType: 'SAME_DAY', advanceNoticeHours: '' })}
                                        className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                                            formData.scheduleType === 'SAME_DAY'
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <div>⚡ Same Day</div>
                                        <div className={`text-xs mt-0.5 font-normal ${formData.scheduleType === 'SAME_DAY' ? 'text-gray-300' : 'text-gray-400'}`}>
                                            Ready within prep time
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduleType: 'ADVANCE_ORDER', advanceNoticeHours: formData.advanceNoticeHours || 24 })}
                                        className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                                            formData.scheduleType === 'ADVANCE_ORDER'
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <div>📅 Advance Order</div>
                                        <div className={`text-xs mt-0.5 font-normal ${formData.scheduleType === 'ADVANCE_ORDER' ? 'text-gray-300' : 'text-gray-400'}`}>
                                            Requires notice ahead
                                        </div>
                                    </button>
                                </div>
                                {formData.scheduleType === 'ADVANCE_ORDER' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                            Minimum Notice Required (hours) *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={formData.advanceNoticeHours}
                                            onChange={(e) => setFormData({ ...formData, advanceNoticeHours: e.target.value })}
                                            placeholder="e.g. 24"
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Customers must order at least this many hours before their requested time.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ── Additional Details ── */}
                            <div className="border-t border-gray-100 pt-4 space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Additional Details</p>

                                {/* Calories */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                        Calories <span className="font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.calories}
                                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                        placeholder="e.g. 450"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                                    />
                                </div>

                                {/* Dietary Options */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                        Dietary Tags
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: 'isVegetarian', label: 'Vegetarian', emoji: '🥬' },
                                            { key: 'isVegan',      label: 'Vegan',       emoji: '🌱' },
                                            { key: 'isGlutenFree', label: 'Gluten-Free', emoji: '🌾' },
                                            { key: 'isSpicy',      label: 'Spicy',       emoji: '🌶' },
                                        ].map(({ key, label, emoji }) => (
                                            <label
                                                key={key}
                                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
                                                    formData[key]
                                                        ? 'border-gray-900 bg-gray-900 text-white'
                                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData[key]}
                                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <span className="text-base leading-none">{emoji}</span>
                                                <span className="text-sm font-semibold">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability Toggle */}
                                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Visible to customers</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formData.available ? 'Currently live — customers can order this' : 'Hidden — not visible in your menu'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, available: !formData.available })}
                                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                                            formData.available ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                        aria-checked={formData.available}
                                        role="switch"
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                                formData.available ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-3 rounded-b-2xl shrink-0">
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="px-5 py-3 xs:py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all text-sm text-center"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showCreateModal ? handleCreateProduct : handleUpdateProduct}
                                disabled={
                                    !formData.name || !formData.price || !formData.categoryId || !formData.preparationTimeMinutes ||
                                    (formData.scheduleType === 'ADVANCE_ORDER' && !formData.advanceNoticeHours) ||
                                    isCreating || uploadingImage
                                }
                                className="px-5 py-3 xs:py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm text-center"
                            >
                                {isCreating ? 'Creating…' : showCreateModal ? 'Create Product' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Delete Product</h2>
                            <p className="text-gray-600">
                                Are you sure you want to delete <span className="font-bold">{selectedProduct?.name}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            <ProductReviewsModal
                isOpen={showReviewsModal}
                onClose={() => {
                    setShowReviewsModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
        </div>
    );
};

export default VendorMenuPage;
