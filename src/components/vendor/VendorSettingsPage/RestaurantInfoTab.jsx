"use client";
import React from 'react';
import { Save, RefreshCw } from 'lucide-react';

/* ---------- Helper: reusable wrapper for inputs ---------- */
const InputBlock = ({ label, children }) => (
    <div className="group bg-linear-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-orange-300 focus-within:border-orange-500 focus-within:shadow-lg focus-within:shadow-orange-500/10 transition-all duration-200">
        <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
            {label}
        </label>
        {children}
    </div>
);


const RestaurantInfoTab = ({ profileForm, setProfileForm, saving, onSave }) => {

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* ---------- Header ---------- */}
            <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-orange-400/5 to-transparent rounded-2xl blur-xl"></div>
                <h2 className="relative text-2xl sm:text-3xl font-black text-gray-900 py-2">
                    Business Information
                </h2>
                <p className="relative text-sm sm:text-base text-gray-600 mt-1">
                    Manage your core details and service settings
                </p>
            </div>

            {/* ---------- Single-column stack ---------- */}
            <div className="space-y-5 sm:space-y-6">
                {/* Restaurant Name */}
                <InputBlock label={<><span className="text-red-500">*</span> Business Name</>}>
                    <input
                        type="text"
                        value={profileForm.restaurantName}
                        onChange={(e) =>
                            setProfileForm({ ...profileForm, restaurantName: e.target.value })
                        }
                        className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="Enter business name"
                    />
                </InputBlock>

                {/* Description */}
                <InputBlock label="Description">
          <textarea
              value={profileForm.description}
              onChange={(e) =>
                  setProfileForm({ ...profileForm, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 focus:outline-none resize-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Tell customers about your restaurant..."
          />
                </InputBlock>

                {/* Cuisine Type */}
                <InputBlock label="Type">
                    <input
                        type="text"
                        value={profileForm.cuisineType}
                        onChange={(e) =>
                            setProfileForm({ ...profileForm, cuisineType: e.target.value })
                        }
                        className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="e.g., Nigerian, Continental, Fast Food"
                    />
                </InputBlock>

                {/* Preparation Time — always visible */}
                <InputBlock label="Preparation Time (mins)">
                    <input
                        type="number"
                        min="1"
                        value={profileForm.preparationTime}
                        onChange={(e) =>
                            setProfileForm({ ...profileForm, preparationTime: e.target.value })
                        }
                        className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="30"
                    />
                </InputBlock>

                {/* Delivery fields — only shown when delivery is enabled */}
                {profileForm.offersDelivery && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            <InputBlock label="Delivery Fee (CAD)">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={profileForm.deliveryFee}
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, deliveryFee: e.target.value })
                                    }
                                    className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    placeholder="5.00"
                                />
                            </InputBlock>

                            <InputBlock label="Minimum Order Amount (CAD)">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={profileForm.minimumOrderAmount}
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, minimumOrderAmount: e.target.value })
                                    }
                                    className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    placeholder="15.00"
                                />
                            </InputBlock>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            <InputBlock label="Estimated Delivery Time (mins)">
                                <input
                                    type="number"
                                    min="1"
                                    value={profileForm.estimatedDeliveryMinutes}
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, estimatedDeliveryMinutes: e.target.value })
                                    }
                                    className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    placeholder="45"
                                />
                            </InputBlock>

                            <InputBlock label="Max Delivery Radius (km)">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={profileForm.maxDeliveryDistanceKm}
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, maxDeliveryDistanceKm: e.target.value })
                                    }
                                    className="w-full px-4 py-3 focus:outline-none rounded-lg bg-white border border-gray-100 text-gray-900 placeholder-gray-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    placeholder="10.0"
                                />
                            </InputBlock>
                        </div>
                    </>
                )}

                {/* Service Options */}
                <div className="bg-linear-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-orange-300 transition-all duration-200">
                    <label className="block text-sm font-bold text-gray-800 mb-4 tracking-wide">
                        Service Options
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:shadow-md transition-all duration-200 group">
                            <input
                                type="checkbox"
                                checked={profileForm.offersDelivery}
                                onChange={(e) =>
                                    setProfileForm({ ...profileForm, offersDelivery: e.target.checked })
                                }
                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 shrink-0"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Offer Delivery</p>
                                <p className="text-xs sm:text-sm text-gray-600">Accept delivery orders from customers</p>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:shadow-md transition-all duration-200 group">
                            <input
                                type="checkbox"
                                checked={profileForm.offersPickup}
                                onChange={(e) =>
                                    setProfileForm({ ...profileForm, offersPickup: e.target.checked })
                                }
                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 shrink-0"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Offer Pickup</p>
                                <p className="text-xs sm:text-sm text-gray-600">Accept pickup orders from customers</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Saving Changes...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default RestaurantInfoTab;