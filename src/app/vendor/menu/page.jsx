"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Image as ImageIcon, X, Star, LayoutDashboard, ChevronRight } from 'lucide-react';
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


    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = filterCategory === 'all' ||
                product.categoryName === filterCategory ||
                String(product.categoryId) === String(filterCategory);

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query ||
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.categoryName?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [products, filterCategory, searchQuery]);


    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Products</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product catalogue</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="text-gray-400 w-5 h-5" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.iconUrl} {cat.name}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <ImageIcon className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">
                        {searchQuery || filterCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first product'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-900 text-white text-[11px] uppercase tracking-wider">
                                    <th className="w-14 px-3 py-2.5 text-left">Item</th>
                                    <th className="px-3 py-2.5 text-left">Name &amp; Details</th>
                                    <th className="w-28 px-3 py-2.5 text-left">Category</th>
                                    <th className="w-20 px-3 py-2.5 text-right">Price</th>
                                    <th className="w-36 px-3 py-2.5 text-center">Order Type</th>
                                    <th className="w-20 px-3 py-2.5 text-center">Rating</th>
                                    <th className="w-24 px-3 py-2.5 text-center">Status</th>
                                    <th className="w-16 px-3 py-2.5 text-center">Edit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product, index) => (
                                    <tr
                                        key={product.publicProductId}
                                        className={`hover:bg-amber-50/40 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/60' : 'bg-white'}`}
                                    >
                                        {/* Thumbnail */}
                                        <td className="px-3 py-2.5">
                                            {product.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Name + meta */}
                                        <td className="px-3 py-2.5 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{product.name}</p>
                                            {product.description && (
                                                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                                            )}
                                            {/* Prep / Calories / Orders row */}
                                            <div className="flex flex-wrap gap-x-2.5 mt-1 text-[11px] text-gray-400">
                                                {product.preparationTimeMinutes && (
                                                    <span>⏱ {product.preparationTimeMinutes} min prep</span>
                                                )}
                                                {product.calories && (
                                                    <span>{product.calories} kcal</span>
                                                )}
                                                {product.totalOrders > 0 && (
                                                    <span>{product.totalOrders} orders</span>
                                                )}
                                            </div>
                                            {/* Dietary badges */}
                                            {(product.isVegan || product.isVegetarian || product.isGlutenFree || product.isSpicy) && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {product.isVegan && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-medium">
                                                            🌱 Vegan
                                                        </span>
                                                    )}
                                                    {product.isVegetarian && !product.isVegan && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">
                                                            🥬 Vegetarian
                                                        </span>
                                                    )}
                                                    {product.isGlutenFree && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">
                                                            🌾 Gluten-Free
                                                        </span>
                                                    )}
                                                    {product.isSpicy && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-medium">
                                                            🌶 Spicy
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Category */}
                                        <td className="px-3 py-2.5">
                                            {product.categoryName ? (
                                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">
                                                    {product.categoryName}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-[11px]">—</span>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">
                                                CA${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                                            </span>
                                        </td>

                                        {/* Order Type */}
                                        <td className="px-3 py-2.5 text-center">
                                            {product.scheduleType === 'ADVANCE_ORDER' ? (
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold whitespace-nowrap">
                                                        📅 Advance Order
                                                    </span>
                                                    <span className="text-[10px] text-blue-500">
                                                        {product.advanceNoticeHours}h notice required
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-semibold">
                                                        ⚡ Ready to Order
                                                    </span>
                                                    <span className="text-[10px] text-green-500">no advance notice needed</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Rating */}
                                        <td className="px-3 py-2.5 text-center">
                                            <button
                                                onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                                                className="inline-flex flex-col items-center gap-0.5 hover:bg-yellow-50 px-2 py-1 rounded-lg transition-colors"
                                                title="View reviews"
                                            >
                                                <span className="inline-flex items-center gap-0.5">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-[12px] font-bold text-gray-900">
                                                        {typeof product.averageRating === 'number' && product.averageRating > 0
                                                            ? product.averageRating.toFixed(1) : '0.0'}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] text-gray-400">{product.reviewCount || 0} reviews</span>
                                            </button>
                                        </td>

                                        {/* Status toggle */}
                                        <td className="px-3 py-2.5 text-center">
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
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
                                        <td className="px-3 py-2.5 text-center">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(product)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete product"
                                                >
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-black text-gray-900">
                                {showCreateModal ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Jollof Rice"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your product..."
                                    rows={3}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                                />
                            </div>

                            {/* Price, Category and Prep Time */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, categoryId: Number(e.target.value) }) // 👈 convert to number if needed
                                        }
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.iconUrl} {cat.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Prep Time * (mins)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.preparationTimeMinutes}
                                        onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                                        placeholder="15"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
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

                            {/* Calories */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Calories (optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    placeholder="0"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                />
                            </div>

                            {/* Dietary Options */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Dietary Information
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVegetarian}
                                            onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                                            className="w-5 h-5 text-gray-700 border-gray-300 rounded focus:ring-gray-400"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVegan}
                                            onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                                            className="w-5 h-5 text-gray-700 border-gray-300 rounded focus:ring-gray-400"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vegan</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isGlutenFree}
                                            onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                                            className="w-5 h-5 text-gray-700 border-gray-300 rounded focus:ring-gray-400"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Gluten Free</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isSpicy}
                                            onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                                            className="w-5 h-5 text-gray-700 border-gray-300 rounded focus:ring-gray-400"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Spicy</span>
                                    </label>
                                </div>
                            </div>

                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Available</p>
                                    <p className="text-sm text-gray-600">Make this product available for orders</p>
                                </div>
                                <button
                                    onClick={() => setFormData({ ...formData, available: !formData.available })}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${
                                        formData.available ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                            formData.available ? 'translate-x-7' : ''
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
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
                                className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
