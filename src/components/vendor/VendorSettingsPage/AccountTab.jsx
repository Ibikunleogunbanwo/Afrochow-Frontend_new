"use client";
import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    DollarSign,
    Star,
    ShoppingBag,
    Award,
    CheckCircle,
    XCircle,
    MessageSquare,
} from 'lucide-react';
import PropTypes from 'prop-types';
import VendorReviewsModal from '@/components/vendor/VendorReviewsModal';

const AccountTab = ({ profile }) => {
    const [showReviewsModal, setShowReviewsModal] = useState(false);

    const handleOpenReviews = () => {
        setShowReviewsModal(true);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* ---------- Header ---------- */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-linear-to-br from-orange-500 to-amber-500 p-2 rounded-xl shrink-0">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Account Information
                    </h2>
                </div>
                <p className="text-gray-600 ml-0 sm:ml-14 mt-1 sm:mt-0">
                    View your account details and business statistics
                </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
                {/* Business Profile Card */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                        <Award className="h-5 w-5 text-orange-600" />
                        Business Profile
                    </h3>

                    <div className="grid gap-3 sm:gap-4">
                        {/* Restaurant Name */}
                        <div className="bg-white p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4">
                            <div className="bg-orange-100 p-2.5 sm:p-3 rounded-lg shrink-0">
                                <User className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    Store Name
                                </p>
                                <p className="font-bold text-gray-900 text-base sm:text-lg wrap-break-word">
                                    {profile.restaurantName}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-white p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4">
                            <div className="bg-blue-100 p-2.5 sm:p-3 rounded-lg shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 break-all sm:wrap-break-word">
                                    {profile.user?.email || profile.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="bg-white p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4">
                            <div className="bg-green-100 p-2.5 sm:p-3 rounded-lg shrink-0">
                                <Phone className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    Phone Number
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {profile.user?.phoneNumber ||
                                        profile.phoneNumber ||
                                        profile.user?.phone ||
                                        profile.phone ||
                                        'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <StatusCard
                        icon={
                            profile.isActive ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )
                        }
                        label="Account Status"
                        value={profile.isActive ? '✓ Active' : '✗ Inactive'}
                        color={profile.isActive ? 'green' : 'red'}
                    />

                    <StatusCard
                        icon={<Calendar className="h-5 w-5 text-gray-400" />}
                        label="Member Since"
                        value={
                            profile.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })
                                : 'N/A'
                        }
                        color="gray"
                    />
                </div>

                {/* Business Statistics */}
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
                    <h3 className="font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2 text-base sm:text-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Business Statistics
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <StatCard
                            icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
                            bgIcon="bg-blue-100"
                            label="Total Orders"
                            value={profile.totalOrdersCompleted || 0}
                            unit="Completed orders"
                        />

                        <StatCard
                            icon={<DollarSign className="h-6 w-6 text-green-600" />}
                            bgIcon="bg-green-100"
                            label="Total Revenue"
                            value={`$${parseFloat(profile.totalRevenue || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                            unit="Lifetime earnings"
                        />

                        <StatCard
                            icon={<Star className="h-6 w-6 text-amber-600" />}
                            bgIcon="bg-amber-100"
                            label="Average Rating"
                            value={
                                <>
                  <span className="text-3xl sm:text-4xl">
                    {typeof profile.averageRating === 'number' && profile.averageRating > 0
                        ? profile.averageRating.toFixed(1)
                        : '0.0'}
                  </span>
                                    <span className="text-lg text-gray-500 font-semibold">/ 5.0</span>
                                </>
                            }
                            unit={
                                <div className="flex gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                                star <= (profile.averageRating || 0)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            }
                            clickable
                            onClick={handleOpenReviews}
                        />

                        <StatCard
                            icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
                            bgIcon="bg-purple-100"
                            label="Total Reviews"
                            value={profile.reviewCount || 0}
                            unit={
                                <div className="flex items-center gap-2 mt-1">
                                    <Award className="h-4 w-4 text-purple-500" />
                                    <span>Customer reviews</span>
                                </div>
                            }
                            clickable
                            onClick={handleOpenReviews}
                        />
                    </div>
                </div>
            </div>

            {/* Vendor Reviews Modal */}
            <VendorReviewsModal
                isOpen={showReviewsModal}
                onClose={() => setShowReviewsModal(false)}
                vendorPublicId={profile.publicVendorId || profile.publicUserId}
                restaurantName={profile.restaurantName}
            />
        </div>
    );
};

/* ---------- Reusable small components ---------- */
const StatusCard = ({ icon, label, value, color }) => {
    const colorMap = {
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
        gray: 'bg-gray-100 text-gray-700',
    };
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-gray-100 hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {label}
                </p>
                {icon}
            </div>
            <span
                className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold shadow-sm ${colorMap[color]}`}
            >
        {value}
      </span>
        </div>
    );
};

const StatCard = ({ icon, bgIcon, label, value, unit, clickable, onClick }) => {
    const baseClasses = "bg-white p-4 sm:p-6 rounded-xl shadow-sm transition-all";
    const interactiveClasses = clickable
        ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-2 hover:border-orange-300"
        : "hover:shadow-md";

    return (
        <div
            className={`${baseClasses} ${interactiveClasses}`}
            onClick={clickable ? onClick : undefined}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
        >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`${bgIcon} p-2.5 sm:p-3 rounded-xl shrink-0`}>{icon}</div>
                <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide flex-1">
                    {label}
                </p>
                {clickable && (
                    <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                )}
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2">
                {typeof value === 'string' || React.isValidElement(value) ? (
                    <p className="text-2xl sm:text-4xl font-black text-gray-900">{value}</p>
                ) : (
                    value
                )}
            </div>
            {unit && <div className="text-xs text-gray-500 mt-1">{unit}</div>}
            {clickable && (
                <div className="text-xs text-orange-600 font-semibold mt-2">
                    Click to view reviews
                </div>
            )}
        </div>
    );
};

AccountTab.propTypes = {
    profile: PropTypes.shape({
        publicVendorId: PropTypes.string,
        publicUserId: PropTypes.string,
        restaurantName: PropTypes.string,
        user: PropTypes.shape({
            email: PropTypes.string,
            phoneNumber: PropTypes.string,
            phone: PropTypes.string,
        }),
        email: PropTypes.string,
        phoneNumber: PropTypes.string,
        phone: PropTypes.string,
        isActive: PropTypes.bool,
        createdAt: PropTypes.string,
        totalOrdersCompleted: PropTypes.number,
        totalRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        averageRating: PropTypes.number,
        reviewCount: PropTypes.number,
    }).isRequired,
    totalOrders: PropTypes.number,
};

StatCard.propTypes = {
    icon: PropTypes.element.isRequired,
    bgIcon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.element,
    ]).isRequired,
    unit: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    clickable: PropTypes.bool,
    onClick: PropTypes.func,
};

StatusCard.propTypes = {
    icon: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['green', 'red', 'gray']).isRequired,
};

export default AccountTab;