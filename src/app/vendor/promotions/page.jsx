"use client";
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    X,
    Tag,
    Percent,
    Calendar,
    Clock,
    Package,
    Users,
    TrendingUp,
    AlertCircle,
    ChevronDown,
    DollarSign
} from 'lucide-react';

const DISCOUNT_TYPES = {
    PERCENTAGE: 'Percentage Off',
    FIXED_AMOUNT: 'Fixed Amount Off',
    BUY_ONE_GET_ONE: 'Buy One Get One',
    FREE_DELIVERY: 'Free Delivery'
};

const VendorPromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        usagePerCustomer: '',
        isActive: true
    });

    useEffect(() => {
        // Fetch promotions from API
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await AuthAPI.getVendorPromotions();
            // if (response?.success) {
            //     setPromotions(response.data || []);
            // }

            // Mock data for now
            setPromotions([
                {
                    id: 1,
                    code: 'SUMMER25',
                    name: 'Summer Sale',
                    description: '25% off all orders',
                    discountType: 'PERCENTAGE',
                    discountValue: 25,
                    minOrderAmount: 50,
                    maxDiscountAmount: 100,
                    startDate: '2024-06-01',
                    endDate: '2024-08-31',
                    usageLimit: 100,
                    usedCount: 45,
                    usagePerCustomer: 1,
                    isActive: true,
                    createdAt: '2024-05-15T10:00:00Z'
                },
                {
                    id: 2,
                    code: 'FREESHIP',
                    name: 'Free Delivery',
                    description: 'Free delivery on orders over $30',
                    discountType: 'FREE_DELIVERY',
                    discountValue: 0,
                    minOrderAmount: 30,
                    maxDiscountAmount: 0,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    usageLimit: null,
                    usedCount: 230,
                    usagePerCustomer: 5,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePromotion = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await AuthAPI.createPromotion(formData);
            // if (response?.success) {
            //     await fetchPromotions();
            //     setShowCreateModal(false);
            //     resetForm();
            // }
            console.log('Creating promotion:', formData);
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating promotion:', error);
        }
    };

    const handleUpdatePromotion = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await AuthAPI.updatePromotion(selectedPromotion.id, formData);
            // if (response?.success) {
            //     await fetchPromotions();
            //     setShowEditModal(false);
            //     resetForm();
            // }
            console.log('Updating promotion:', formData);
            setShowEditModal(false);
            resetForm();
        } catch (error) {
            console.error('Error updating promotion:', error);
        }
    };

    const handleDeletePromotion = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await AuthAPI.deletePromotion(selectedPromotion.id);
            // if (response?.success) {
            //     await fetchPromotions();
            //     setShowDeleteModal(false);
            //     setSelectedPromotion(null);
            // }
            console.log('Deleting promotion:', selectedPromotion.id);
            setShowDeleteModal(false);
            setSelectedPromotion(null);
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    };

    const togglePromotionStatus = async (promotionId, currentStatus) => {
        try {
            // TODO: Replace with actual API call
            // const response = await AuthAPI.togglePromotionStatus(promotionId, !currentStatus);
            // if (response?.success) {
            //     await fetchPromotions();
            // }
            console.log('Toggling promotion status:', promotionId);
        } catch (error) {
            console.error('Error toggling promotion status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minOrderAmount: '',
            maxDiscountAmount: '',
            startDate: '',
            endDate: '',
            usageLimit: '',
            usagePerCustomer: '',
            isActive: true
        });
        setSelectedPromotion(null);
    };

    const openEditModal = (promotion) => {
        setSelectedPromotion(promotion);
        setFormData({
            code: promotion.code || '',
            name: promotion.name || '',
            description: promotion.description || '',
            discountType: promotion.discountType || 'PERCENTAGE',
            discountValue: promotion.discountValue || '',
            minOrderAmount: promotion.minOrderAmount || '',
            maxDiscountAmount: promotion.maxDiscountAmount || '',
            startDate: promotion.startDate || '',
            endDate: promotion.endDate || '',
            usageLimit: promotion.usageLimit || '',
            usagePerCustomer: promotion.usagePerCustomer || '',
            isActive: promotion.isActive !== false
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (promotion) => {
        setSelectedPromotion(promotion);
        setShowDeleteModal(true);
    };

    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch = promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            promo.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
                            (filterStatus === 'active' && promo.isActive) ||
                            (filterStatus === 'inactive' && !promo.isActive);
        return matchesSearch && matchesStatus;
    });

    const getPromotionStatus = (promotion) => {
        if (!promotion.isActive) return { label: 'Inactive', color: 'bg-gray-500' };

        const now = new Date();
        const start = new Date(promotion.startDate);
        const end = new Date(promotion.endDate);

        if (now < start) return { label: 'Scheduled', color: 'bg-blue-500' };
        if (now > end) return { label: 'Expired', color: 'bg-red-500' };
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return { label: 'Limit Reached', color: 'bg-orange-500' };
        }
        return { label: 'Active', color: 'bg-green-500' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getDiscountDisplay = (promotion) => {
        switch (promotion.discountType) {
            case 'PERCENTAGE':
                return `${promotion.discountValue}% Off`;
            case 'FIXED_AMOUNT':
                return `${formatCurrency(promotion.discountValue)} Off`;
            case 'BUY_ONE_GET_ONE':
                return 'BOGO';
            case 'FREE_DELIVERY':
                return 'Free Delivery';
            default:
                return 'N/A';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotions & Discounts</h1>
                    <p className="text-gray-600">Create and manage promotional offers for your restaurant</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Tag className="h-8 w-8 text-orange-600" />
                            <span className="text-sm text-gray-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Active promotions</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-8 w-8 text-green-600" />
                            <span className="text-sm text-gray-600">Usage</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Times used</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="h-8 w-8 text-blue-600" />
                            <span className="text-sm text-gray-600">Savings</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">$12,450</p>
                        <p className="text-xs text-gray-500 mt-1">Customer savings</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <span className="text-sm text-gray-600">Performance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">+23%</p>
                        <p className="text-xs text-gray-500 mt-1">Order increase</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search promotions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Promotion</span>
                        </button>
                    </div>
                </div>

                {/* Promotions List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading promotions...</p>
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotions found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first promotion to attract more customers'}
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Create First Promotion</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPromotions.map((promotion) => {
                            const status = getPromotionStatus(promotion);
                            const usagePercent = promotion.usageLimit
                                ? Math.round((promotion.usedCount / promotion.usageLimit) * 100)
                                : 0;

                            return (
                                <div key={promotion.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Promotion Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="bg-orange-100 rounded-lg p-2">
                                                        <Tag className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {promotion.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">Code: {promotion.code}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.color} text-white`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Percent className="h-4 w-4" />
                                                        <span>{getDiscountDisplay(promotion)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            {promotion.usedCount} / {promotion.usageLimit || '∞'} uses
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>Min: {formatCurrency(promotion.minOrderAmount)}</span>
                                                    </div>
                                                </div>
                                                {promotion.usageLimit && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                            <span>Usage</span>
                                                            <span>{usagePercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-orange-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => togglePromotionStatus(promotion.id, promotion.isActive)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                                        promotion.isActive
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    <span>{promotion.isActive ? 'Deactivate' : 'Activate'}</span>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(promotion)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(promotion)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Promotion Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-black text-gray-900">
                                {showCreateModal ? 'Create Promotion' : 'Edit Promotion'}
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
                            {/* Promotion Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Promotion Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., SUMMER25"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all uppercase"
                                />
                            </div>

                            {/* Promotion Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Promotion Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Summer Sale"
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
                                    placeholder="Describe the promotion..."
                                    rows={3}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                                />
                            </div>

                            {/* Discount Type and Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    >
                                        {Object.entries(DISCOUNT_TYPES).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        placeholder={formData.discountType === 'PERCENTAGE' ? '25' : '1000'}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Min Order and Max Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Min Order Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        placeholder="0.00"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Max Discount Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        placeholder="Optional"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Start and End Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Usage Limits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="Unlimited"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Usage Per Customer
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usagePerCustomer}
                                        onChange={(e) => setFormData({ ...formData, usagePerCustomer: e.target.value })}
                                        placeholder="1"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Active</p>
                                    <p className="text-sm text-gray-600">Make this promotion active immediately</p>
                                </div>
                                <button
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                                        formData.isActive ? 'bg-orange-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                            formData.isActive ? 'translate-x-9' : 'translate-x-1'
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
                                onClick={showCreateModal ? handleCreatePromotion : handleUpdatePromotion}
                                disabled={!formData.code || !formData.name || !formData.discountValue || !formData.startDate || !formData.endDate}
                                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showCreateModal ? 'Create Promotion' : 'Update Promotion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedPromotion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Promotion</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete the promotion <span className="font-semibold">{selectedPromotion.name}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPromotion(null);
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePromotion}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPromotionsPage;
