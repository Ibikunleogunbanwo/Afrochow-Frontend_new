"use client";
import React, { useState, useEffect } from 'react';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import {
    Clock,
    Package,
    CheckCircle,
    XCircle,
    Truck,
    Search,
    Filter,
    ChevronDown,
    Eye,
    DollarSign,
    User,
    MapPin,
    Phone,
    Calendar,
    AlertCircle
} from 'lucide-react';

const ORDER_STATUSES = {
    PENDING: { label: 'Pending', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    PREPARING: { label: 'Preparing', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    READY: { label: 'Ready', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
    DELIVERED: { label: 'Delivered', color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' },
    REJECTED: { label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
};

const VendorOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, selectedStatus, searchQuery]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await VendorOrdersAPI.getVendorOrders();
            if (response?.success) {
                setOrders(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(order => order.orderStatus === selectedStatus);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(order =>
                order.publicOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const handleOrderAction = async (orderId, action) => {
        try {
            setActionLoading(true);
            let response;

            switch (action) {
                case 'accept':
                    response = await VendorOrdersAPI.acceptOrder(orderId);
                    break;
                case 'reject':
                    response = await VendorOrdersAPI.rejectOrder(orderId);
                    break;
                case 'preparing':
                    response = await VendorOrdersAPI.startPreparingOrder(orderId);
                    break;
                case 'ready':
                    response = await VendorOrdersAPI.markOrderReady(orderId);
                    break;
                case 'out-for-delivery':
                    response = await VendorOrdersAPI.markOrderOutForDelivery(orderId);
                    break;
                case 'delivered':
                    response = await VendorOrdersAPI.markOrderDelivered(orderId);
                    break;
                default:
                    return;
            }

            if (response?.success) {
                await fetchOrders();
                if (selectedOrder?.publicOrderId === orderId) {
                    const updatedOrderResponse = await VendorOrdersAPI.getVendorOrderById(orderId);
                    if (updatedOrderResponse?.success) {
                        setSelectedOrder(updatedOrderResponse.data);
                    }
                }
            }
        } catch (error) {
            console.error(`Error performing ${action} action:`, error);
            alert(error.message || `Failed to ${action} order`);
        } finally {
            setActionLoading(false);
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await VendorOrdersAPI.getVendorOrderById(orderId);
            if (response?.success) {
                setSelectedOrder(response.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Failed to load order details');
        }
    };

    const getAvailableActions = (status) => {
        switch (status) {
            case 'PENDING':
                return [
                    { action: 'accept', label: 'Accept Order', color: 'bg-green-600 hover:bg-green-700' },
                    { action: 'reject', label: 'Reject Order', color: 'bg-red-600 hover:bg-red-700' }
                ];
            case 'ACCEPTED':
                return [
                    { action: 'preparing', label: 'Start Preparing', color: 'bg-purple-600 hover:bg-purple-700' }
                ];
            case 'PREPARING':
                return [
                    { action: 'ready', label: 'Mark Ready', color: 'bg-green-600 hover:bg-green-700' }
                ];
            case 'READY':
                return [
                    { action: 'out-for-delivery', label: 'Out for Delivery', color: 'bg-indigo-600 hover:bg-indigo-700' }
                ];
            case 'OUT_FOR_DELIVERY':
                return [
                    { action: 'delivered', label: 'Mark Delivered', color: 'bg-gray-600 hover:bg-gray-700' }
                ];
            default:
                return [];
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
                    <p className="text-gray-600">Manage and track all your restaurant orders</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID or customer name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Orders</option>
                                <option value="PENDING">Pending</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="READY">Ready</option>
                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {searchQuery || selectedStatus !== 'ALL'
                                ? 'Try adjusting your filters'
                                : 'You have no orders yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const statusConfig = ORDER_STATUSES[order.orderStatus] || ORDER_STATUSES.PENDING;
                            const actions = getAvailableActions(order.orderStatus);

                            return (
                                <div key={order.publicOrderId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Order Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Order #{order.publicOrderId?.slice(-8)}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} text-white`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>{order.customerName || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span>{order.itemCount || 0} items</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order.publicOrderId)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View Details</span>
                                                </button>
                                                {actions.map((btn) => (
                                                    <button
                                                        key={btn.action}
                                                        onClick={() => handleOrderAction(order.publicOrderId, btn.action)}
                                                        disabled={actionLoading}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${btn.color}`}
                                                    >
                                                        {actionLoading ? (
                                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                        ) : null}
                                                        <span>{btn.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Status & ID */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Order ID</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.publicOrderId}</p>
                                </div>
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${ORDER_STATUSES[selectedOrder.orderStatus]?.color} text-white`}>
                                    {ORDER_STATUSES[selectedOrder.orderStatus]?.label}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Name:</span> {selectedOrder.customerName || 'N/A'}</p>
                                    {selectedOrder.customerPhone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {selectedOrder.customerPhone}
                                        </p>
                                    )}
                                    {selectedOrder.deliveryAddress && (
                                        <p className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                            <span>{selectedOrder.deliveryAddress}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Items
                                </h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                                    </div>
                                    {selectedOrder.deliveryFee && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Fee</span>
                                            <span className="font-medium">{formatCurrency(selectedOrder.deliveryFee)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                                        <span>Total</span>
                                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                                </div>
                                {selectedOrder.updatedAt && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {getAvailableActions(selectedOrder.orderStatus).length > 0 && (
                                <div className="flex gap-3 pt-4">
                                    {getAvailableActions(selectedOrder.orderStatus).map((btn) => (
                                        <button
                                            key={btn.action}
                                            onClick={() => handleOrderAction(selectedOrder.publicOrderId, btn.action)}
                                            disabled={actionLoading}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${btn.color}`}
                                        >
                                            {actionLoading ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            ) : null}
                                            <span>{btn.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrdersPage;
