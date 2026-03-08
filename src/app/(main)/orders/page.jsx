"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, XCircle, ChevronDown, MapPin, Phone } from "lucide-react";

export default function OrdersPage() {
    const [selectedTab, setSelectedTab] = useState("all");

    const orders = [
        {
            id: "ORD-2024-001",
            date: "2024-01-10",
            restaurant: "Mama's Kitchen",
            items: ["Jollof Rice with Chicken", "Fried Plantain"],
            total: 32.50,
            status: "delivered",
            estimatedTime: "Delivered at 2:30 PM",
            address: "123 Main St, New York, NY"
        },
        {
            id: "ORD-2024-002",
            date: "2024-01-11",
            restaurant: "African Delights",
            items: ["Egusi Soup with Fufu", "Suya Platter"],
            total: 45.00,
            status: "in_progress",
            estimatedTime: "Arriving in 15 mins",
            address: "123 Main St, New York, NY"
        },
        {
            id: "ORD-2024-003",
            date: "2024-01-08",
            restaurant: "Lagos Cuisine",
            items: ["Pounded Yam with Egusi"],
            total: 28.99,
            status: "cancelled",
            estimatedTime: "Cancelled",
            address: "123 Main St, New York, NY"
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
                return "text-green-600 bg-green-100";
            case "in_progress":
                return "text-orange-600 bg-orange-100";
            case "cancelled":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="w-5 h-5" />;
            case "in_progress":
                return <Clock className="w-5 h-5" />;
            case "cancelled":
                return <XCircle className="w-5 h-5" />;
            default:
                return <Package className="w-5 h-5" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return "Delivered";
            case "in_progress":
                return "In Progress";
            case "cancelled":
                return "Cancelled";
            default:
                return "Unknown";
        }
    };

    const filteredOrders = orders.filter(order => {
        if (selectedTab === "all") return true;
        return order.status === selectedTab;
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                        My Orders
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Track and manage your food orders
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {[
                        { key: "all", label: "All Orders" },
                        { key: "in_progress", label: "In Progress" },
                        { key: "delivered", label: "Delivered" },
                        { key: "cancelled", label: "Cancelled" }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                selectedTab === tab.key
                                    ? "bg-linear-to-r from-orange-600 to-orange-500 text-white shadow-lg"
                                    : "bg-white text-gray-600 hover:bg-gray-50 shadow-md"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-32 h-32 bg-linear-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-16 h-16 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">
                            No orders found
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You haven't placed any orders yet. Start exploring delicious African cuisine!
                        </p>
                    </div>
                ) : (
                    // Orders
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 mb-1">
                                                {order.restaurant}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Order ID: {order.id} • {order.date}
                                            </p>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span>{getStatusText(order.status)}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Order Items:</p>
                                        <ul className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Status</p>
                                                <p className="text-sm font-semibold text-gray-900">{order.estimatedTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-linear-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Delivery Address</p>
                                                <p className="text-sm font-semibold text-gray-900">{order.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Total */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className="text-gray-600 font-medium">Total Amount</span>
                                        <span className="text-2xl font-black text-orange-600">
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4">
                                        {order.status === "in_progress" && (
                                            <button className="flex-1 px-4 py-3 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg">
                                                Track Order
                                            </button>
                                        )}
                                        {order.status === "delivered" && (
                                            <>
                                                <button className="flex-1 px-4 py-3 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg">
                                                    Reorder
                                                </button>
                                                <button className="flex-1 px-4 py-3 bg-white border-2 border-orange-300 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-md">
                                                    Leave Review
                                                </button>
                                            </>
                                        )}
                                        {order.status === "cancelled" && (
                                            <button className="flex-1 px-4 py-3 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg">
                                                Reorder
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Stats */}
                {orders.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                            <div className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                {orders.length}
                            </div>
                            <p className="text-gray-600 font-medium mt-2">Total Orders</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                            <div className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                {orders.filter(o => o.status === "delivered").length}
                            </div>
                            <p className="text-gray-600 font-medium mt-2">Completed</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                            <div className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                            </div>
                            <p className="text-gray-600 font-medium mt-2">Total Spent</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
