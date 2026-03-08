"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ImageUploadAPI } from "@/lib/api/imageUpload";
import Image from "next/image";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    Save,
    X,
    Plus,
    Trash2,
    Star,
    Upload,
    Check
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function ProfilePage() {
    const {
        user,
        getCustomerProfile,
        updateCustomerProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
    } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        defaultDeliveryInstructions: "",
        profileImageUrl: ""
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [addressForm, setAddressForm] = useState({
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
            console.log("Fetching customer profile...");
            const response = await getCustomerProfile();
            console.log("Profile response:", response);

            if (response?.success && response?.data) {
                const profileData = response.data;
                console.log("Profile data received:", profileData);
                setProfileData(profileData);
                setFormData({
                    firstName: profileData.firstName || "",
                    lastName: profileData.lastName || "",
                    phone: profileData.phone || "",
                    defaultDeliveryInstructions: profileData.defaultDeliveryInstructions || "",
                    profileImageUrl: profileData.profileImageUrl || ""
                });
            } else {
                console.warn("Profile response missing success or data:", response);
                toast.error("Failed to load profile", "No profile data returned");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile", error.message || "Please try again later");
        } finally {
            console.log("Setting loading to false");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.publicUserId) {
            console.log("User authenticated, fetching profile for:", user.publicUserId);
            fetchProfile();
        } else {
            console.log("No user publicUserId, skipping profile fetch");
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.publicUserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            const response = await updateCustomerProfile(formData);

            if (response?.success) {
                // Re-fetch profile to ensure UI is in sync with backend
                await fetchProfile();
                setIsEditing(false);
                toast.success("Profile Updated", "Your profile has been successfully updated");
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save", error.message || "Please try again");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profileData) {
            setFormData({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                defaultDeliveryInstructions: profileData.defaultDeliveryInstructions,
                profileImageUrl: profileData.profileImageUrl
            });
        }
    };

    const handleAddAddress = async () => {
        try {
            const response = await addAddress(addressForm);

            console.log(response);

            if (response?.success && response?.data) {
                // Re-fetch profile to get updated addresses
                await fetchProfile();

                setShowAddressForm(false);
                setAddressForm({
                    addressLine: "",
                    city: "",
                    province: "AB",
                    postalCode: "",
                    country: "Canada",
                    defaultAddress: false
                });

                toast.success("Address Added", "New address has been saved");
            } else {
                throw new Error("Failed to add address");
            }
        } catch (error) {
            console.error("Error adding address:", error);
            toast.error("Failed to add address", error.message || "Please try again");
        }
    };

    const handleEditAddress = (address) => {
        setShowAddressForm(false);
        setEditingAddress(address.publicAddressId);
        setAddressForm({
            addressLine: address.addressLine,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            country: address.country,
            defaultAddress: address.defaultAddress
        });
    };

    const handleUpdateAddress = async () => {
        if (!editingAddress) return;

        try {
            const response = await updateAddress(editingAddress, addressForm);

            if (response?.success && response?.data) {
                // Re-fetch profile to get updated addresses
                await fetchProfile();

                setEditingAddress(null);
                setAddressForm({
                    addressLine: "",
                    city: "",
                    province: "AB",
                    postalCode: "",
                    country: "Canada",
                    defaultAddress: false
                });

                toast.success("Address Updated", "Address has been successfully updated");
            } else {
                throw new Error("Failed to update address");
            }
        } catch (error) {
            console.error("Error updating address:", error);
            toast.error("Failed to update address", error.message || "Please try again");
        }
    };

    const handleCancelEdit = () => {
        setEditingAddress(null);
        setAddressForm({
            addressLine: "",
            city: "",
            province: "AB",
            postalCode: "",
            country: "Canada",
            defaultAddress: false
        });
    };

    const handleDeleteAddress = async (publicAddressId) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const response = await deleteAddress(publicAddressId);
            if (response?.success) {
                // Re-fetch profile to get updated addresses
                await fetchProfile();
                toast.success("Address Deleted", "Address has been removed");
            } else {
                throw new Error("Failed to delete address");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            toast.error("Failed to delete address", error.message || "Please try again");
        }
    };


    const handleSetDefaultAddress = async (addressId) => {
        try {
            const response = await setDefaultAddress(addressId);

            if (response?.success) {
                // Re-fetch profile to get updated addresses
                await fetchProfile();

                toast.success("Default Address Set", "Your default address has been updated");
            } else {
                throw new Error("Failed to set default address");
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            toast.error("Failed to set default address", error.message || "Please try again");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // -------------------------
        // 1. Validate file
        // -------------------------
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type", "Please upload a JPG, PNG, or WebP image");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("File too large", "Image must be less than 5MB");
            return;
        }

        try {
            setUploadingImage(true);

            // -------------------------
            // 2. Upload to server
            // -------------------------
            const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(file, 'CustomerProfileImage');
            console.log("Upload response:", uploadResponse);

            let imageUrl = null;
            if (uploadResponse?.success) {
                imageUrl = uploadResponse?.data?.imageUrl ||
                    uploadResponse?.imageUrl ||
                    uploadResponse?.data?.url ||
                    uploadResponse?.url;

                console.log("Extracted image URL:", imageUrl);
            }

            if (!imageUrl) {
                console.error("Image URL not found in response:", uploadResponse);
                throw new Error("Failed to upload image - no URL returned");
            }

            // -------------------------
            // 3. Update backend profile
            // -------------------------
            const payload = {
                ...formData,             // spread existing form data
                profileImageUrl: imageUrl // override with new image URL
            };

            console.log("Sending update payload:", payload);

            const updateResponse = await updateCustomerProfile(payload);

            if (updateResponse?.success) {
                // -------------------------
                // 4. Re-fetch profile to ensure UI is in sync
                // -------------------------
                await fetchProfile();
                setImageError(false);

                toast.success("Image Uploaded", "Your profile picture has been updated");
            } else {
                console.error("Backend failed to update profile:", updateResponse);
                throw new Error("Failed to update profile with new image");
            }

        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Upload Failed", error.message || "Failed to upload image. Please try again");
        } finally {
            setUploadingImage(false);
        }
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                        My Profile
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Profile Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-linear-to-r from-orange-500 to-red-500 px-8 py-12 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        {/* Avatar */}
                                        <div className="relative group/avatar">
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-white/90 rounded-full flex items-center justify-center z-20">
                                                    <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                            {profileData.profileImageUrl && !imageError ? (
                                                <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-white">
                                                    <Image
                                                        src={profileData.profileImageUrl}
                                                        alt="Profile Picture"
                                                        width={400}
                                                        height={400}
                                                        className="w-full h-full object-cover"
                                                        onError={() => setImageError(true)}
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                                                    <span className="text-4xl font-black text-orange-600">
                                                        {profileData.firstName?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <label
                                                htmlFor="profile-image-upload"
                                                className="absolute bottom-0 right-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-700 transition-all cursor-pointer group-hover/avatar:scale-110"
                                            >
                                                <Upload className="w-5 h-5 text-white" />
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
                                        <div className="text-center sm:text-left">
                                            <h2 className="text-3xl font-black">
                                                {profileData.firstName} {profileData.lastName}
                                            </h2>
                                            <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                                                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                                <span className="font-semibold">{profileData.loyaltyPoints} Loyalty Points</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit Button */}
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center space-x-2 px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg hover:scale-105"
                                            >
                                                <Save className="w-5 h-5" />
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center space-x-2 px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-8 space-y-6">
                                {/* First Name */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                                First Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-semibold"
                                                />
                                            ) : (
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {profileData.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                                Last Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-semibold"
                                                />
                                            ) : (
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {profileData.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Email (Read-only) */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                            Email Address
                                            <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {profileData.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-semibold"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">
                                                {profileData.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Instructions */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                            Default Delivery Instructions
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="defaultDeliveryInstructions"
                                                value={formData.defaultDeliveryInstructions}
                                                onChange={handleChange}
                                                rows={3}
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-semibold resize-none"
                                                placeholder="e.g., Leave at the door, Ring the bell, etc."
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">
                                                {profileData.defaultDeliveryInstructions || "No instructions set"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">
                                            Member Since
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDate(profileData.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Addresses Section */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Delivery Addresses</h2>
                                    <p className="text-sm text-gray-600 mt-1">Manage your saved delivery locations</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddressForm(true);
                                        setEditingAddress(null);
                                    }}
                                    disabled={editingAddress !== null}
                                    className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-xl transition-all shadow-md hover:shadow-lg ${
                                        editingAddress !== null
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-orange-600 text-white hover:bg-orange-700"
                                    }`}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Address</span>
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Add Address Form */}
                                {showAddressForm && !editingAddress && (
                                    <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Address</h3>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="addressLine"
                                                value={addressForm.addressLine}
                                                onChange={handleAddressChange}
                                                placeholder="Street Address"
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={addressForm.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="City"
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                />
                                                <select
                                                    name="province"
                                                    value={addressForm.province}
                                                    onChange={handleAddressChange}
                                                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                >
                                                    <option value="AB">Alberta</option>
                                                    <option value="BC">British Columbia</option>
                                                    <option value="MB">Manitoba</option>
                                                    <option value="NB">New Brunswick</option>
                                                    <option value="NL">Newfoundland and Labrador</option>
                                                    <option value="NS">Nova Scotia</option>
                                                    <option value="ON">Ontario</option>
                                                    <option value="PE">Prince Edward Island</option>
                                                    <option value="QC">Quebec</option>
                                                    <option value="SK">Saskatchewan</option>
                                                </select>
                                            </div>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={addressForm.postalCode}
                                                onChange={handleAddressChange}
                                                placeholder="Postal Code"
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            />
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="defaultAddress"
                                                    checked={addressForm.defaultAddress}
                                                    onChange={handleAddressChange}
                                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-300"
                                                />
                                                <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddAddress}
                                                    className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
                                                >
                                                    Save Address
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        setAddressForm({
                                                            addressLine: "",
                                                            city: "",
                                                            province: "AB",
                                                            postalCode: "",
                                                            country: "Canada",
                                                            defaultAddress: false
                                                        });
                                                    }}
                                                    className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Address List */}
                                {profileData.addresses && profileData.addresses.length > 0 ? (
                                    <div className="space-y-4">
                                        {profileData.addresses.map((address) => (
                                            <div
                                                key={address.publicAddressId}
                                                className={`p-6 rounded-xl border-2 transition-all ${
                                                    editingAddress === address.publicAddressId
                                                        ? "border-blue-500 bg-blue-50"
                                                        : address.defaultAddress
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                                }`}
                                            >
                                                {editingAddress === address.publicAddressId ? (
                                                    // Edit Mode
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Edit Address</h3>
                                                        <input
                                                            type="text"
                                                            name="addressLine"
                                                            value={addressForm.addressLine}
                                                            onChange={handleAddressChange}
                                                            placeholder="Street Address"
                                                            style={{ color: 'black', backgroundColor: 'white' }}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <input
                                                                type="text"
                                                                name="city"
                                                                value={addressForm.city}
                                                                onChange={handleAddressChange}
                                                                placeholder="City"
                                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                            />
                                                            <select
                                                                name="province"
                                                                value={addressForm.province}
                                                                onChange={handleAddressChange}
                                                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                            >
                                                                <option value="AB">Alberta</option>
                                                                <option value="BC">British Columbia</option>
                                                                <option value="MB">Manitoba</option>
                                                                <option value="NB">New Brunswick</option>
                                                                <option value="NL">Newfoundland and Labrador</option>
                                                                <option value="NS">Nova Scotia</option>
                                                                <option value="ON">Ontario</option>
                                                                <option value="PE">Prince Edward Island</option>
                                                                <option value="QC">Quebec</option>
                                                                <option value="SK">Saskatchewan</option>
                                                            </select>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="postalCode"
                                                            value={addressForm.postalCode}
                                                            onChange={handleAddressChange}
                                                            placeholder="Postal Code"
                                                            style={{ color: 'black', backgroundColor: 'white' }}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                        />
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                name="defaultAddress"
                                                                checked={addressForm.defaultAddress}
                                                                onChange={handleAddressChange}
                                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-300"
                                                            />
                                                            <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdateAddress}
                                                                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                                                            >
                                                                Update Address
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // View Mode
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            {address.defaultAddress && (
                                                                <div className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full mb-2">
                                                                    <Check className="w-3 h-3" />
                                                                    <span>Default</span>
                                                                </div>
                                                            )}
                                                            <p className="font-bold text-gray-900 text-lg">
                                                                {address.addressLine}
                                                            </p>
                                                            <p className="text-gray-600 mt-1">
                                                                {address.city}, {address.province} {address.postalCode}
                                                            </p>
                                                            <p className="text-gray-500 text-sm mt-1">
                                                                {address.country}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditAddress(address)}
                                                                className="px-4 py-2 text-sm bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                            {!address.defaultAddress && (
                                                                <button
                                                                    onClick={() => handleSetDefaultAddress(address.publicAddressId)}
                                                                    className="px-4 py-2 text-sm bg-orange-100 text-orange-600 font-semibold rounded-lg hover:bg-orange-200 transition-colors"
                                                                >
                                                                    Set Default
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteAddress(address.publicAddressId)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 font-semibold">No addresses saved yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Add your first delivery address</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Stats Cards */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Statistics</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-linear-to-br from-orange-50 to-red-50 rounded-xl">
                                    <div className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                        {profileData.totalOrders}
                                    </div>
                                    <p className="text-gray-600 font-medium mt-1">Total Orders</p>
                                </div>
                                <div className="p-4 bg-linear-to-br from-yellow-50 to-amber-50 rounded-xl">
                                    <div className="text-3xl font-black bg-linear-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                        {profileData.loyaltyPoints}
                                    </div>
                                    <p className="text-gray-600 font-medium mt-1">Loyalty Points</p>
                                </div>
                                <div className="p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl">
                                    <div className="text-3xl font-black bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        {profileData.addresses?.length || 0}
                                    </div>
                                    <p className="text-gray-600 font-medium mt-1">Saved Addresses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
