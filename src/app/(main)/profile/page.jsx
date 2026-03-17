"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerAPI } from "@/lib/api/customer.api";
import { ImageUploadAPI } from "@/lib/api/imageUpload";
import Image from "next/image";
import {
    Edit2, Save, X, Plus, Trash2, Star,
    Upload, Check, MapPin, MoreHorizontal, ChevronRight
} from "lucide-react";
import { toast } from "@/components/ui/toast";

const provinces = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
];

export default function ProfilePage() {
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        defaultDeliveryInstructions: "",
        profileImageUrl: ""
    });

    const [addressForm, setAddressForm] = useState({
        addressLine: "",
        city: "",
        province: "AB",
        postalCode: "",
        country: "Canada",
        defaultAddress: false
    });

    const resetAddressForm = () => ({
        addressLine: "",
        city: "",
        province: "AB",
        postalCode: "",
        country: "Canada",
        defaultAddress: false
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await CustomerAPI.getCustomerProfile();
            if (response?.success && response?.data) {
                const data = response.data;
                setProfileData(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    phone: data.phone || "",
                    defaultDeliveryInstructions: data.defaultDeliveryInstructions || "",
                    profileImageUrl: data.profileImageUrl || ""
                });
            } else {
                toast.error("Failed to load profile", "No profile data returned");
            }
        } catch (error) {
            toast.error("Failed to load profile", error.message || "Please try again later");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.publicUserId) void fetchProfile();
        else setLoading(false);
    }, [user?.publicUserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSaveSection = async () => {
        try {
            const response = await CustomerAPI.updateCustomerProfile(formData);
            if (response?.success) {
                await fetchProfile();
                setEditingSection(null);
                toast.success("Saved", "Profile updated successfully");
            } else throw new Error("Failed to update profile");
        } catch (error) {
            toast.error("Failed to save", error.message || "Please try again");
        }
    };

    const handleCancelSection = () => {
        setEditingSection(null);
        if (profileData) {
            setFormData({
                firstName: profileData.firstName || "",
                lastName: profileData.lastName || "",
                phone: profileData.phone || "",
                defaultDeliveryInstructions: profileData.defaultDeliveryInstructions || "",
                profileImageUrl: profileData.profileImageUrl || ""
            });
        }
    };

    const handleAddAddress = async () => {
        try {
            const response = await CustomerAPI.addAddress(addressForm);
            if (response?.success && response?.data) {
                await fetchProfile();
                setShowAddressForm(false);
                setAddressForm(resetAddressForm());
                toast.success("Address added", "New address saved");
            } else throw new Error("Failed to add address");
        } catch (error) {
            toast.error("Failed to add address", error.message || "Please try again");
        }
    };

    const handleUpdateAddress = async () => {
        if (!editingAddress) return;
        try {
            const response = await CustomerAPI.updateAddress(editingAddress, addressForm);
            if (response?.success && response?.data) {
                await fetchProfile();
                setEditingAddress(null);
                setAddressForm(resetAddressForm());
                toast.success("Address updated", "Changes saved");
            } else throw new Error("Failed to update address");
        } catch (error) {
            toast.error("Failed to update address", error.message || "Please try again");
        }
    };

    const handleDeleteAddress = async (publicAddressId) => {
        if (!confirm("Delete this address?")) return;
        try {
            const response = await CustomerAPI.deleteAddress(publicAddressId);
            if (response?.success) {
                await fetchProfile();
                toast.success("Address deleted");
            } else throw new Error("Failed to delete");
        } catch (error) {
            toast.error("Failed to delete address", error.message || "Please try again");
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            const response = await CustomerAPI.setDefaultAddress(addressId);
            if (response?.success) {
                await fetchProfile();
                toast.success("Default updated");
            } else throw new Error("Failed to set default");
        } catch (error) {
            toast.error("Failed to set default", error.message || "Please try again");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Invalid file type", "Please upload JPG, PNG or WebP");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large", "Max 5MB");
            return;
        }
        try {
            setUploadingImage(true);
            const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(file, "CustomerProfileImage");
            const imageUrl = uploadResponse?.data?.imageUrl || uploadResponse?.imageUrl || uploadResponse?.data?.url || uploadResponse?.url;
            if (!imageUrl) throw new Error("No URL returned");
            const updateResponse = await CustomerAPI.updateCustomerProfile({ ...formData, profileImageUrl: imageUrl });
            if (updateResponse?.success) {
                await fetchProfile();
                setImageError(false);
                toast.success("Photo updated");
            } else throw new Error("Failed to update profile image");
        } catch (error) {
            toast.error("Upload failed", error.message || "Please try again");
        } finally {
            setUploadingImage(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-CA", {
            year: "numeric", month: "long", day: "numeric"
        });
    };

    const AddressFormBlock = ({ onSave, onCancel, saveLabel }) => (
        <div className="space-y-3 py-4">
            <input
                type="text"
                name="addressLine"
                value={addressForm.addressLine}
                onChange={handleAddressChange}
                placeholder="Street address"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
            />
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                />
                <select
                    name="province"
                    value={addressForm.province}
                    onChange={handleAddressChange}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
                >
                    {provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>
            <input
                type="text"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleAddressChange}
                placeholder="Postal code"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
            />
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    name="defaultAddress"
                    checked={addressForm.defaultAddress}
                    onChange={handleAddressChange}
                    className="w-4 h-4 rounded text-gray-900"
                />
                <span className="text-sm text-gray-700">Set as default</span>
            </label>
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onSave}
                    className="flex-1 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                    {saveLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-sm text-gray-500">Could not load profile. Please refresh.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

                {/* Page title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Account</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your profile and preferences</p>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total Orders", value: profileData.totalOrders ?? 0 },
                        { label: "Loyalty Points", value: profileData.loyaltyPoints ?? 0 },
                        { label: "Saved Addresses", value: profileData.addresses?.length ?? 0 },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Profile details card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Profile details</h2>
                    </div>

                    {/* Profile row */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 w-32 shrink-0">Profile</span>

                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                            <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {profileData.profileImageUrl && !imageError ? (
                                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                                            <Image
                                                src={profileData.profileImageUrl}
                                                alt="Profile"
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-lg font-semibold text-gray-700">
                                                {profileData.firstName?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    )}
                                    <label
                                        htmlFor="profile-image-upload"
                                        className="absolute bottom-0 right-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                                        title="Change photo"
                                    >
                                        <Upload className="w-3 h-3 text-white" />
                                        <input
                                            id="profile-image-upload"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>

                                {/* Name */}
                                {editingSection === "name" ? (
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="First name"
                                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Last name"
                                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {profileData.firstName} {profileData.lastName}
                                        </p>
                                        {profileData.loyaltyPoints > 0 && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                                <span className="text-xs text-gray-400">{profileData.loyaltyPoints} points</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                {editingSection === "name" ? (
                                    <>
                                        <button onClick={handleSaveSection} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCancelSection} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditingSection("name")}
                                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Update profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Email row */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                            <span className="text-sm text-gray-500 w-32 shrink-0 pt-0.5">Email addresses</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-gray-900">{profileData.email}</span>
                                    <span className="px-2 py-0.5 text-xs border border-gray-300 text-gray-500 rounded-full">Primary</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                        </div>
                    </div>

                    {/* Phone row */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                            <span className="text-sm text-gray-500 w-32 shrink-0 pt-0.5">Phone numbers</span>
                            <div className="flex-1 min-w-0">
                                {editingSection === "phone" ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-gray-900">
                                            {profileData.phone || <span className="text-gray-400">Not set</span>}
                                        </span>
                                        {profileData.phone && (
                                            <span className="px-2 py-0.5 text-xs border border-gray-300 text-gray-500 rounded-full">Primary</span>
                                        )}
                                    </div>
                                )}
                                {editingSection !== "phone" && (
                                    <button
                                        onClick={() => setEditingSection("phone")}
                                        className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {profileData.phone ? "Update phone number" : "Add phone number"}
                                    </button>
                                )}
                            </div>
                            <div className="shrink-0 flex gap-1">
                                {editingSection === "phone" ? (
                                    <>
                                        <button onClick={handleSaveSection} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCancelSection} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <MoreHorizontal className="w-4 h-4 text-gray-300 mt-0.5" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery instructions row */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                            <span className="text-sm text-gray-500 w-32 shrink-0 pt-0.5">Delivery</span>
                            <div className="flex-1 min-w-0">
                                {editingSection === "instructions" ? (
                                    <textarea
                                        name="defaultDeliveryInstructions"
                                        value={formData.defaultDeliveryInstructions}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="e.g., Leave at the door, ring the bell..."
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 resize-none"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-900">
                                        {profileData.defaultDeliveryInstructions || <span className="text-gray-400">No default instructions</span>}
                                    </p>
                                )}
                                {editingSection !== "instructions" && (
                                    <button
                                        onClick={() => setEditingSection("instructions")}
                                        className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {profileData.defaultDeliveryInstructions ? "Update instructions" : "Add delivery instructions"}
                                    </button>
                                )}
                            </div>
                            <div className="shrink-0 flex gap-1">
                                {editingSection === "instructions" ? (
                                    <>
                                        <button onClick={handleSaveSection} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCancelSection} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <MoreHorizontal className="w-4 h-4 text-gray-300 mt-0.5" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Member since row */}
                    <div className="px-6 py-5">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 w-32 shrink-0">Member since</span>
                            <span className="text-sm text-gray-900">{formatDate(profileData.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Addresses card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Delivery addresses</h2>
                        <button
                            onClick={() => {
                                setShowAddressForm(true);
                                setEditingAddress(null);
                                setAddressForm(resetAddressForm());
                            }}
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Add address
                        </button>
                    </div>

                    {/* Add form */}
                    {showAddressForm && (
                        <div className="px-6 border-b border-gray-100">
                            <AddressFormBlock
                                onSave={handleAddAddress}
                                onCancel={() => { setShowAddressForm(false); setAddressForm(resetAddressForm()); }}
                                saveLabel="Save address"
                            />
                        </div>
                    )}

                    {/* Address list */}
                    {profileData.addresses && profileData.addresses.length > 0 ? (
                        profileData.addresses.map((address, idx) => (
                            <div
                                key={address.publicAddressId}
                                className={`px-6 ${idx < profileData.addresses.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                                {editingAddress === address.publicAddressId ? (
                                    <AddressFormBlock
                                        onSave={handleUpdateAddress}
                                        onCancel={() => { setEditingAddress(null); setAddressForm(resetAddressForm()); }}
                                        saveLabel="Update address"
                                    />
                                ) : (
                                    <div className="py-4 flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-medium text-gray-900">{address.addressLine}</p>
                                                {address.defaultAddress && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border border-gray-300 text-gray-600 rounded-full">
                                                        <Check className="w-3 h-3" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {address.city}, {address.province} {address.postalCode}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setEditingAddress(address.publicAddressId);
                                                    setShowAddressForm(false);
                                                    setAddressForm({
                                                        addressLine: address.addressLine,
                                                        city: address.city,
                                                        province: address.province,
                                                        postalCode: address.postalCode,
                                                        country: address.country,
                                                        defaultAddress: address.defaultAddress
                                                    });
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address.publicAddressId)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {!address.defaultAddress && (
                                                <button
                                                    onClick={() => handleSetDefaultAddress(address.publicAddressId)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Set as default"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No addresses saved yet</p>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mx-auto mt-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add your first address
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}