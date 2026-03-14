"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Image as ImageIcon, X, Star } from 'lucide-react';
import { getVendorProducts, createProduct, updateProduct, deleteProduct, toggleProductAvailability, uploadProductImage } from '@/lib/api/vendorProducts';
import ImageUploader from '@/components/image-uploader/ImageUploader';
import { SearchAPI } from '@/lib/api/search.api';
import { ImageUploadAPI } from '@/lib/api/imageUpload';
import ProductReviewsModal from '@/components/vendor/ProductReviewsModal';

const VendorMenuPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        available: true,
        preparationTimeMinutes: '',
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

    const handleCreateProduct = async () => {
        try {
            let imageUrl = formData.imageUrl || '';

            // Upload image first if a file is selected
            if (productImage && typeof productImage !== 'string') {
                try {
                    setUploadingImage(true);
                    console.log('Uploading product image with category "products"...');
                    const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(productImage, 'products');
                    console.log('Image upload response:', uploadResponse);

                    // Check multiple possible locations for imageUrl in the response
                    if (uploadResponse?.success) {
                        // Try data.imageUrl first
                        if (uploadResponse?.data?.imageUrl) {
                            imageUrl = uploadResponse.data.imageUrl;
                            console.log('Image URL extracted from data.imageUrl:', imageUrl);
                        }
                        // Try imageUrl directly in response
                        else if (uploadResponse?.imageUrl) {
                            imageUrl = uploadResponse.imageUrl;
                            console.log('Image URL extracted from imageUrl:', imageUrl);
                        }
                        // Try data as a string (might be the URL itself)
                        else if (typeof uploadResponse?.data === 'string' && uploadResponse.data.startsWith('http')) {
                            imageUrl = uploadResponse.data;
                            console.log('Image URL extracted from data string:', imageUrl);
                        }
                        else {
                            console.log('Could not find imageUrl in response. Full response:', uploadResponse);
                        }
                    }
                } catch (imgError) {
                    console.error('Error uploading product image:', imgError);
                } finally {
                    setUploadingImage(false);
                }
            }

            // Create product with image URL
            const productData = {
                ...formData,
                imageUrl
            };

            console.log('Creating product with data:', productData);
            console.log('Image URL being sent:', productData.imageUrl);

            const response = await createProduct(productData);
            if (response?.success) {
                await fetchProducts();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleUpdateProduct = async () => {
        try {
            if (!selectedProduct?.publicProductId) return;

            let imageUrl = formData.imageUrl;

            // Upload new image if a file is selected
            if (productImage && typeof productImage !== 'string') {
                try {
                    setUploadingImage(true);
                    const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(productImage, 'products');
                    if (uploadResponse?.success && uploadResponse?.data?.imageUrl) {
                        imageUrl = uploadResponse.data.imageUrl;
                    }
                } catch (imgError) {
                    console.error('Error uploading product image:', imgError);
                } finally {
                    setUploadingImage(false);
                }
            }

            // Update product with image URL
            const productData = {
                ...formData,
                imageUrl
            };

            const response = await updateProduct(selectedProduct.publicProductId, productData);
            if (response?.success) {
                await fetchProducts();
                setShowEditModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async () => {
        try {
            if (!selectedProduct?.publicProductId) return;

            const response = await deleteProduct(selectedProduct.publicProductId);
            if (response?.success) {
                await fetchProducts();
                setShowDeleteModal(false);
                setSelectedProduct(null);
            }
        } catch (error) {
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
            }
        } catch (error) {
        }
    };

    const handleImageUpload = async (file, publicProductId) => {
        if (!file) return null;

        try {
            setUploadingImage(true);
            const response = await ImageUploadAPI.uploadRegistrationImage(file, 'products');
            if (response?.success && response.data?.imageUrl) {
                // Update the product with the new image URL
                if (publicProductId) {
                    await updateProduct(publicProductId, {
                        ...formData,
                        imageUrl: response.data.imageUrl
                    });
                    await fetchProducts();
                }
                return response.data.imageUrl;
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Product Management</h1>
                    <p className="text-gray-600 mt-1">Manage your products and menu items</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
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
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.publicProductId}
                            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all group"
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-linear-to-br from-gray-100 to-gray-200">
                                {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}

                                {/* Availability Badge */}
                                <div className="absolute top-3 left-3">
                                    <button
                                        onClick={() => handleToggleAvailability(product)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-all ${
                                            product.available
                                                ? 'bg-green-100/90 text-green-700 border-2 border-green-200'
                                                : 'bg-red-100/90 text-red-700 border-2 border-red-200'
                                        }`}
                                    >
                                        {product.available ? 'Available' : 'Unavailable'}
                                    </button>
                                </div>

                                {/* Actions Menu */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md"
                                        >
                                            <Edit className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(product)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                                    <span className="text-xl font-black text-orange-600">
                                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                                    </span>
                                </div>

                                {/* Category and Rating Row */}
                                <div className="flex items-center justify-between mb-2">
                                    {(product.category || product.categoryName) && (
                                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">
                                            {product.categoryName || product.category}
                                        </span>
                                    )}

                                    {/* Rating Display - Always Clickable */}
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowReviewsModal(true);
                                        }}
                                        className="flex items-center gap-1 text-xs hover:bg-yellow-50 px-2 py-1 rounded-lg transition-colors group"
                                    >
                                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold text-gray-900">
                                            {typeof product.averageRating === 'number' && product.averageRating > 0
                                                ? product.averageRating.toFixed(1)
                                                : '0.0'}
                                        </span>
                                        <span className="text-gray-500">
                                            ({product.reviewCount || 0})
                                        </span>
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {product.description || 'No description available'}
                                </p>

                                {/* Dietary Information */}
                                {(product.isVegetarian || product.isVegan || product.isGlutenFree || product.isSpicy) && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {product.isVegan && (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                🌱 Vegan
                                            </span>
                                        )}
                                        {product.isVegetarian && !product.isVegan && (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                🥬 Vegetarian
                                            </span>
                                        )}
                                        {product.isGlutenFree && (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                🌾 Gluten-Free
                                            </span>
                                        )}
                                        {product.isSpicy && (
                                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                🌶️ Spicy
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Additional Details Footer */}
                                <div className="pt-3 border-t border-gray-100 space-y-2">
                                    {/* Prep Time and Calories */}
                                    {(product.preparationTimeMinutes || product.calories) && (
                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                            {product.preparationTimeMinutes && (
                                                <span className="flex items-center gap-1">
                                                    ⏱️ {product.preparationTimeMinutes} min
                                                </span>
                                            )}
                                            {product.calories && (
                                                <span className="flex items-center gap-1">
                                                    🔥 {product.calories} cal
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* ID and Status */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500">
                                            ID: {product.publicProductId?.substring(0, 8) || 'N/A'}
                                        </div>

                                        {/* Status Indicator */}
                                        <div className="flex items-center gap-2">
                                            {product.available ? (
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    In Stock
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
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
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
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
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVegan}
                                            onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vegan</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isGlutenFree}
                                            onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Gluten Free</span>
                                    </label>
                                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isSpicy}
                                            onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
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
                                disabled={!formData.name || !formData.price || !formData.categoryId || !formData.preparationTimeMinutes}
                                className="px-6 py-2.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showCreateModal ? 'Create Product' : 'Update Product'}
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
                                className="flex-1 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Delete
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
