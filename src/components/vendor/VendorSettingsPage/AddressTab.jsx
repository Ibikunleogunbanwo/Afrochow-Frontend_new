"use client";
import React from 'react';
import { Save, RefreshCw, MapPin, Building2, Globe } from 'lucide-react';
import { CANADIAN_PROVINCES } from '@/components/vendor/VendorSettingsPage/utils/constants';

const AddressTab = ({ addressForm, setAddressForm, profile, saving, onSave }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* ---------- Header ---------- */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-linear-to-br from-orange-500 to-amber-500 p-2 rounded-xl shrink-0">
                        <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Restaurant Address
                    </h2>
                </div>
                <p className="text-gray-600 ml-0 sm:ml-14 mt-1 sm:mt-0">
                    Manage your restaurant&#39;s physical location details
                </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
                {/* Street Address */}
                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Building2 className="h-4 w-4 text-orange-500" />
                        Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={addressForm.addressLine}
                        onChange={(e) =>
                            setAddressForm({ ...addressForm, addressLine: e.target.value })
                        }
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all group-hover:border-gray-300"
                        style={{ color: 'black', backgroundColor: 'white' }}
                        placeholder="123 Main Street, Suite 100"
                    />
                </div>

                {/* Location Details Card */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        Location Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* City */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={addressForm.city}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, city: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
                                style={{ color: 'black' }}
                                placeholder="Toronto"
                            />
                        </div>

                        {/* Province */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Province <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={addressForm.province}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, province: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white appearance-none"
                                style={{ color: 'black' }}
                            >
                                <option value="">Select province</option>
                                {CANADIAN_PROVINCES.map((province) => (
                                    <option key={province.code} value={province.code}>
                                        {province.name} ({province.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Postal Code */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Postal Code
                            </label>
                            <input
                                type="text"
                                value={addressForm.postalCode}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, postalCode: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
                                style={{ color: 'black' }}
                                placeholder="M5H 2N2"
                            />
                        </div>

                        {/* Country */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Globe className="h-4 w-4 text-orange-500" />
                                Country <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={addressForm.country}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, country: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
                                style={{ color: 'black' }}
                                placeholder="Canada"
                            />
                        </div>
                    </div>
                </div>

                {/* Privacy Callout */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">Location Privacy</p>
                            <p className="text-sm text-blue-700">
                                Your full address will only be shared with customers after they
                                place an order. The general area will be shown to help them find
                                nearby restaurants.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-[1.02] disabled:hover:scale-100"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Saving Address...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save Address</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AddressTab;