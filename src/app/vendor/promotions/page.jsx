"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    Users,
    TrendingUp,
    AlertCircle,
    ChevronDown,
    DollarSign,
    LayoutDashboard,
    ChevronRight,
} from 'lucide-react';
import { PromotionsAPI } from '@/lib/api/promotions.api';
import { toast } from '@/components/ui/toast';

const DISCOUNT_TYPES = {
    PERCENTAGE: 'Percentage Off',
    FIXED_AMOUNT: 'Fixed Amount Off',
    FREE_DELIVERY: 'Free Delivery',
};

/** Map backend PromotionResponseDto → frontend shape */
const normalisePromotion = (p) => ({
    id:               p.publicPromotionId,
    code:             p.code             ?? '',
    name:             p.title            ?? '',
    description:      p.description      ?? '',
    discountType:     p.type             ?? 'PERCENTAGE',
    discountValue:    p.value            ?? 0,
    minOrderAmount:   p.minimumOrderAmount ?? 0,
    maxDiscountAmount:p.maxDiscountAmount ?? 0,
    startDate:        p.startDate        ?? '',
    endDate:          p.endDate          ?? '',
    usageLimit:       p.usageLimit       ?? null,
    usedCount:        p.totalUsageCount  ?? 0,
    usagePerCustomer: p.perUserLimit     ?? null,
    isActive:         p.isActive         ?? p.isCurrentlyActive ?? false,
    vendorPublicId:   p.vendorPublicId   ?? '',
    createdAt:        p.createdAt        ?? '',
});

/** Map frontend form → backend PromotionRequestDto.
 *  vendorPublicId is intentionally omitted — the backend resolves it from the JWT. */
const NO_VALUE_TYPES = ['FREE_DELIVERY'];

const buildRequestBody = (formData) => ({
    code:               formData.code,
    title:              formData.name,
    description:        formData.description,
    type:               formData.discountType,
    value: NO_VALUE_TYPES.includes(formData.discountType)
        ? null
        : parseFloat(formData.discountValue) || 0,
    minimumOrderAmount: parseFloat(formData.minOrderAmount) || 0,
    maxDiscountAmount:  formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
    usageLimit:         formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
    perUserLimit:       formData.usagePerCustomer ? parseInt(formData.usagePerCustomer, 10) : null,
    startDate:          formData.startDate,
    endDate:            formData.endDate,
    isActive:           formData.isActive,
});

const EMPTY_FORM = {
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
    isActive: true,
};

const VendorPromotionsPage = () => {
    const [promotions,       setPromotions]       = useState([]);
    const [loading,          setLoading]           = useState(false);
    const [searchQuery,      setSearchQuery]       = useState('');
    const [filterStatus,     setFilterStatus]      = useState('all');
    const [showCreateModal,  setShowCreateModal]   = useState(false);
    const [showEditModal,    setShowEditModal]      = useState(false);
    const [showDeleteModal,  setShowDeleteModal]   = useState(false);
    const [selectedPromotion,setSelectedPromotion] = useState(null);
    const [saving,           setSaving]            = useState(false);
    const [formData,         setFormData]          = useState(EMPTY_FORM);

    useEffect(() => { fetchPromotions(); }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const response = await PromotionsAPI.getMyPromotions();
            if (response?.success) {
                setPromotions((response.data || []).map(normalisePromotion));
            } else {
                setPromotions([]);
            }
        } catch (err) {
            console.error('Error fetching promotions:', err);
            toast.error('Error', err.message || 'Failed to load promotions');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePromotion = async () => {
        try {
            setSaving(true);
            const body = buildRequestBody(formData);
            const response = await PromotionsAPI.createPromotion(body);
            if (response?.success) {
                toast.success('Success', 'Promotion created successfully');
                await fetchPromotions();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (err) {
            console.error('Error creating promotion:', err);
            toast.error('Error', err.message || 'Failed to create promotion');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePromotion = async () => {
        if (!selectedPromotion?.id) return;
        try {
            setSaving(true);
            const body = buildRequestBody(formData);
            const response = await PromotionsAPI.updatePromotion(selectedPromotion.id, body);
            if (response?.success) {
                toast.success('Success', 'Promotion updated successfully');
                await fetchPromotions();
                setShowEditModal(false);
                resetForm();
            }
        } catch (err) {
            console.error('Error updating promotion:', err);
            toast.error('Error', err.message || 'Failed to update promotion');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePromotion = async () => {
        if (!selectedPromotion?.id) return;
        try {
            setSaving(true);
            await PromotionsAPI.deactivatePromotion(selectedPromotion.id);
            toast.success('Success', 'Promotion deactivated successfully');
            await fetchPromotions();
            setShowDeleteModal(false);
            setSelectedPromotion(null);
        } catch (err) {
            console.error('Error deactivating promotion:', err);
            toast.error('Error', err.message || 'Failed to deactivate promotion');
        } finally {
            setSaving(false);
        }
    };

    const togglePromotionStatus = async (promotion) => {
        try {
            const body = buildRequestBody(
                { ...formDataFromPromotion(promotion), isActive: !promotion.isActive }
            );
            const response = await PromotionsAPI.updatePromotion(promotion.id, body);
            if (response?.success) {
                toast.success('Updated', `Promotion ${!promotion.isActive ? 'activated' : 'deactivated'}`);
                await fetchPromotions();
            }
        } catch (err) {
            console.error('Error toggling promotion status:', err);
            toast.error('Error', err.message || 'Failed to update promotion status');
        }
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setSelectedPromotion(null);
    };

    const formDataFromPromotion = (promotion) => ({
        code:             promotion.code             || '',
        name:             promotion.name             || '',
        description:      promotion.description      || '',
        discountType:     promotion.discountType     || 'PERCENTAGE',
        discountValue:    promotion.discountValue    ?? '',
        minOrderAmount:   promotion.minOrderAmount   ?? '',
        maxDiscountAmount:promotion.maxDiscountAmount ?? '',
        startDate:        promotion.startDate        || '',
        endDate:          promotion.endDate          || '',
        usageLimit:       promotion.usageLimit       ?? '',
        usagePerCustomer: promotion.usagePerCustomer ?? '',
        isActive:         promotion.isActive !== false,
    });

    const openEditModal = (promotion) => {
        setSelectedPromotion(promotion);
        setFormData(formDataFromPromotion(promotion));
        setShowEditModal(true);
    };

    const openDeleteModal = (promotion) => {
        setSelectedPromotion(promotion);
        setShowDeleteModal(true);
    };

    const filteredPromotions = promotions.filter((promo) => {
        const matchesSearch =
            promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promo.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active'   && promo.isActive) ||
            (filterStatus === 'inactive' && !promo.isActive);
        return matchesSearch && matchesStatus;
    });

    const getPromotionStatus = (promotion) => {
        if (!promotion.isActive) return { label: 'Inactive', color: 'bg-gray-500' };
        const now   = new Date();
        const start = new Date(promotion.startDate);
        const end   = new Date(promotion.endDate);
        if (now < start) return { label: 'Scheduled', color: 'bg-blue-500' };
        if (now > end)   return { label: 'Expired',   color: 'bg-red-500'  };
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit)
            return { label: 'Limit Reached', color: 'bg-gray-500' };
        return { label: 'Active', color: 'bg-green-500' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-CA', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const formatCurrency = (amount) =>
        `CA$${parseFloat(amount || 0).toLocaleString('en-CA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const getDiscountDisplay = (promotion) => {
        switch (promotion.discountType) {
            case 'PERCENTAGE':    return `${promotion.discountValue}% Off`;
            case 'FIXED_AMOUNT':  return `${formatCurrency(promotion.discountValue)} Off`;
            case 'FREE_DELIVERY': return 'Free Delivery';
            default:              return 'N/A';
        }
    };

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Promotions</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Promotions &amp; Discounts</h1>
                <p className="text-gray-600 mt-1">View promotional offers for your restaurant</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Tag className="w-5 h-5 text-gray-700" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-0.5">Total Promotions</p>
                    <p className="text-3xl font-black text-gray-900 mb-2">{promotions.length}</p>
                    <p className="text-xs text-gray-500">{promotions.filter(p => p.isActive).length} active</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-700" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-0.5">Total Usage</p>
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        {promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">Times redeemed</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gray-700" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-0.5">Scheduled</p>
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        {promotions.filter(p => {
                            if (!p.startDate) return false;
                            return new Date(p.startDate) > new Date();
                        }).length}
                    </p>
                    <p className="text-xs text-gray-500">Upcoming promotions</p>
                </div>
            </div>

            {/* Actions Bar + List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search promotions…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                                style={{ color: 'black', backgroundColor: 'white' }}
                            />
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none cursor-pointer"
                                style={{ color: 'black', backgroundColor: 'white' }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create Promotion
                    </button>
                </div>

                {/* List */}
                <div className="p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent mb-4" />
                            <p className="text-sm text-gray-500">Loading promotions…</p>
                        </div>
                    ) : filteredPromotions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Tag className="h-14 w-14 text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No promotions found</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                {searchQuery || filterStatus !== 'all'
                                    ? 'Try adjusting your filters.'
                                    : 'No promotions have been set up for your restaurant yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPromotions.map((promotion) => {
                                const status       = getPromotionStatus(promotion);
                                const usagePercent = promotion.usageLimit
                                    ? Math.round((promotion.usedCount / promotion.usageLimit) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={promotion.id || promotion.code}
                                        className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Left — info */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <div className="bg-gray-100 rounded-lg p-1.5">
                                                        <Tag className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-gray-900">{promotion.name}</h3>
                                                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                                                        {promotion.code}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color} text-white`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {promotion.description && (
                                                    <p className="text-sm text-gray-500 mb-3">{promotion.description}</p>
                                                )}

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Percent className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{getDiscountDisplay(promotion)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{formatDate(promotion.startDate)} – {formatDate(promotion.endDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{promotion.usedCount} / {promotion.usageLimit ?? '∞'} uses</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                                                        <span>Min: {formatCurrency(promotion.minOrderAmount)}</span>
                                                    </div>
                                                </div>

                                                {promotion.usageLimit > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                            <span>Usage</span>
                                                            <span>{usagePercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                            <div
                                                                className="bg-gray-700 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                <button
                                                    onClick={() => togglePromotionStatus(promotion)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                        promotion.isActive
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {promotion.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(promotion)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(promotion)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                        {/* Header */}
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900">
                                {showCreateModal ? 'Create Promotion' : 'Edit Promotion'}
                            </h2>
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Promotion Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER25"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all uppercase"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Promotion Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Summer Sale"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the promotion…"
                                    rows={3}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                                />
                            </div>

                            {/* Discount Type + Value */}
                            <div className={`grid gap-4 ${NO_VALUE_TYPES.includes(formData.discountType) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value, discountValue: '' })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    >
                                        {Object.entries(DISCOUNT_TYPES).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value field — only shown for PERCENTAGE and FIXED_AMOUNT */}
                                {!NO_VALUE_TYPES.includes(formData.discountType) && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(CA$)'}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01" min="0"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 25' : 'e.g. 10.00'}
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Info banners for no-value types */}
                            {formData.discountType === 'FREE_DELIVERY' && (
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                                    <span className="text-lg shrink-0">🚚</span>
                                    <p>
                                        <span className="font-semibold">Free Delivery</span> — the discount applied at checkout will equal your store's delivery fee. No value needed.
                                    </p>
                                </div>
                            )}

                            {/* Min Order + Max Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Order (CA$)</label>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        placeholder="0.00"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Discount (CA$)</label>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        placeholder="Optional"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Start + End Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Usage Limits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Usage Limit</label>
                                    <input
                                        type="number" min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="Unlimited"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usage Per Customer</label>
                                    <input
                                        type="number" min="1"
                                        value={formData.usagePerCustomer}
                                        onChange={(e) => setFormData({ ...formData, usagePerCustomer: e.target.value })}
                                        placeholder="1"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Active</p>
                                    <p className="text-xs text-gray-500">Make this promotion active immediately</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${formData.isActive ? 'bg-gray-900' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showCreateModal ? handleCreatePromotion : handleUpdatePromotion}
                                disabled={
                                    saving ||
                                    !formData.code ||
                                    !formData.name ||
                                    (!NO_VALUE_TYPES.includes(formData.discountType) && !formData.discountValue) ||
                                    !formData.startDate ||
                                    !formData.endDate
                                }
                                className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving…' : showCreateModal ? 'Create Promotion' : 'Update Promotion'}
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
                            <div className="bg-red-100 rounded-full p-3 shrink-0">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Deactivate Promotion</h3>
                                <p className="text-sm text-gray-500">This will disable the promotion immediately</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6 text-sm">
                            Are you sure you want to deactivate <span className="font-semibold">{selectedPromotion.name}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setSelectedPromotion(null); }}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePromotion}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50"
                            >
                                {saving ? 'Deactivating…' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPromotionsPage;
