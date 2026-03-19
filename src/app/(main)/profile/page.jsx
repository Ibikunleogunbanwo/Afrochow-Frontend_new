"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSavedState } from "@/hooks/useSavedState";
import { CustomerAPI } from "@/lib/api/customer.api";
import { ImageUploadAPI } from "@/lib/api/imageUpload";
import { toast } from "@/components/ui/toast";
import Image from "next/image";
import {
    Pencil, CheckCircle2, XCircle, Plus, Trash2, Star,
    Upload, Loader2, MapPin, Phone, Mail, Truck,
    CalendarDays, ShoppingBag, Coins, Home,
} from "lucide-react";

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

const INPUT_CLS =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 bg-white transition";

const emptyAddress = () => ({
    addressLine: "", city: "", province: "ON",
    postalCode: "", country: "Canada", defaultAddress: false,
});

// ─── Inline edit action buttons ────────────────────────────────────────────

function EditActions({ onSave, onCancel, isSaving = false, isSaved = false }) {
    return (
        <div className="flex gap-2 pt-1">
            <button
                onClick={onSave}
                disabled={isSaving || isSaved}
                className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed
                    ${isSaved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600 disabled:opacity-60"}`}
            >
                {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : isSaved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Save</>
                )}
            </button>
            <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
                <XCircle className="w-4 h-4" />
                Cancel
            </button>
        </div>
    );
}

// ─── Clearable text input ───────────────────────────────────────────────────

function ClearableInput({ value, onChange, onClear, ...props }) {
    return (
        <div className="relative">
            <input
                value={value}
                onChange={onChange}
                className={INPUT_CLS + " pr-8"}
                {...props}
            />
            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label="Clear"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// ─── Address form block ─────────────────────────────────────────────────────

function AddressFormBlock({ form, onChange, onClear, onSave, onCancel, saveLabel, isSaving, isSaved }) {
    return (
        <div className="space-y-3 py-4">
            <ClearableInput
                value={form.addressLine}
                onChange={e => onChange("addressLine", e.target.value)}
                onClear={() => onClear("addressLine")}
                placeholder="Street address (e.g. 123 Main St)"
            />
            <div className="grid grid-cols-2 gap-3">
                <ClearableInput
                    value={form.city}
                    onChange={e => onChange("city", e.target.value)}
                    onClear={() => onClear("city")}
                    placeholder="City"
                />
                <select
                    value={form.province}
                    onChange={e => onChange("province", e.target.value)}
                    className={INPUT_CLS}
                >
                    {provinces.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
            </div>
            <ClearableInput
                value={form.postalCode}
                onChange={e => onChange("postalCode", e.target.value.toUpperCase())}
                onClear={() => onClear("postalCode")}
                placeholder="Postal code (e.g. M5V 3A8)"
                maxLength={7}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={form.defaultAddress}
                    onChange={e => onChange("defaultAddress", e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-sm text-gray-700 font-medium">Set as default delivery address</span>
            </label>
            <EditActions onSave={onSave} onCancel={onCancel} isSaving={isSaving} isSaved={isSaved} />
        </div>
    );
}

// ─── Section row ────────────────────────────────────────────────────────────

function SectionRow({ icon: Icon, label, children, onEdit, editing }) {
    return (
        <div className="px-6 py-5 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    {children}
                </div>
                {onEdit && !editing && (
                    <button
                        onClick={onEdit}
                        className="shrink-0 p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                        title={`Edit ${label}`}
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [photoSaved, setPhotoSaved] = useState(false);

    const sectionSave   = useSavedState(1200);
    const addressSave   = useSavedState(1200);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", phone: "",
        defaultDeliveryInstructions: "", profileImageUrl: "",
    });

    const [addressForm, setAddressForm] = useState(emptyAddress());

    // ── data ──────────────────────────────────────────────────────────────

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await CustomerAPI.getCustomerProfile();
            if (response?.data || response?.success) {
                const data = response?.data ?? response;
                setProfileData(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    phone: data.phone || "",
                    defaultDeliveryInstructions: data.defaultDeliveryInstructions || "",
                    profileImageUrl: data.profileImageUrl || "",
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.publicUserId]);

    // ── handlers ──────────────────────────────────────────────────────────

    const handleChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleAddressChange = (field, value) =>
        setAddressForm(prev => ({ ...prev, [field]: value }));

    const handleAddressClear = (field) =>
        setAddressForm(prev => ({ ...prev, [field]: "" }));

    const handleSaveSection = async () => {
        try {
            sectionSave.setSaving();
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                defaultDeliveryInstructions: formData.defaultDeliveryInstructions,
            };
            const response = await CustomerAPI.updateCustomerProfile(payload);
            if (response?.success !== false) {
                await fetchProfile();
                sectionSave.setSaved();
                setTimeout(() => setEditingSection(null), 1200);
            } else {
                throw new Error(response?.message || "Failed to update profile");
            }
        } catch (error) {
            sectionSave.setError();
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
                profileImageUrl: profileData.profileImageUrl || "",
            });
        }
    };

    const handleAddAddress = async () => {
        try {
            addressSave.setSaving();
            const response = await CustomerAPI.addAddress(addressForm);
            if (response?.success !== false) {
                await fetchProfile();
                addressSave.setSaved();
                setTimeout(() => { setShowAddressForm(false); setAddressForm(emptyAddress()); }, 1200);
            } else throw new Error("Failed to add address");
        } catch (error) {
            addressSave.setError();
            toast.error("Failed to add address", error.message || "Please try again");
        }
    };

    const handleUpdateAddress = async () => {
        if (!editingAddressId) return;
        try {
            addressSave.setSaving();
            const response = await CustomerAPI.updateAddress(editingAddressId, addressForm);
            if (response?.success !== false) {
                await fetchProfile();
                addressSave.setSaved();
                setTimeout(() => { setEditingAddressId(null); setAddressForm(emptyAddress()); }, 1200);
            } else throw new Error("Failed to update address");
        } catch (error) {
            addressSave.setError();
            toast.error("Failed to update address", error.message || "Please try again");
        }
    };

    const handleDeleteAddress = async (publicAddressId) => {
        if (!confirm("Delete this address?")) return;
        try {
            const response = await CustomerAPI.deleteAddress(publicAddressId);
            if (response?.success !== false) {
                await fetchProfile();
            } else throw new Error("Failed to delete");
        } catch (error) {
            toast.error("Failed to delete address", error.message || "Please try again");
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            const response = await CustomerAPI.setDefaultAddress(addressId);
            if (response?.success !== false) {
                await fetchProfile();
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
            const imageUrl =
                uploadResponse?.data?.imageUrl ||
                uploadResponse?.imageUrl ||
                uploadResponse?.data?.url ||
                uploadResponse?.url;
            if (!imageUrl) throw new Error("No URL returned");
            const updateResponse = await CustomerAPI.updateCustomerProfile({
                ...formData, profileImageUrl: imageUrl,
            });
            if (updateResponse?.success !== false) {
                await fetchProfile();
                setImageError(false);
                setPhotoSaved(true);
                setTimeout(() => setPhotoSaved(false), 2000);
            } else throw new Error("Failed to update profile image");
        } catch (error) {
            toast.error("Upload failed", error.message || "Please try again");
        } finally {
            setUploadingImage(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-CA", {
            year: "numeric", month: "long", day: "numeric",
        });
    };

    // ── loading / empty states ───────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">Could not load profile. Please refresh.</p>
            </div>
        );
    }

    const initials = (profileData.firstName?.charAt(0) || "U").toUpperCase();

    // ── render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your profile, addresses and preferences</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: ShoppingBag, label: "Orders", value: profileData.totalOrders ?? 0, color: "text-orange-500 bg-orange-50" },
                        { icon: Coins,       label: "Points",  value: profileData.loyaltyPoints ?? 0, color: "text-amber-500 bg-amber-50" },
                        { icon: Home,        label: "Addresses", value: profileData.addresses?.length ?? 0, color: "text-blue-500 bg-blue-50" },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{s.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Profile card ─────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {/* Avatar + name header */}
                    <div className="px-6 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-5">

                            {/* Avatar */}
                            <div className="relative shrink-0">
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {photoSaved && (
                                    <div className="absolute inset-0 bg-green-500/80 rounded-full flex items-center justify-center z-10">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                {profileData.profileImageUrl && !imageError ? (
                                    <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-orange-100">
                                        <Image
                                            src={profileData.profileImageUrl}
                                            alt="Profile"
                                            width={80} height={80}
                                            className="w-full h-full object-cover"
                                            onError={() => setImageError(true)}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center ring-2 ring-orange-100">
                                        <span className="text-2xl font-bold text-white">{initials}</span>
                                    </div>
                                )}
                                <label
                                    htmlFor="profile-image-upload"
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow"
                                    title="Change photo"
                                >
                                    <Upload className="w-3.5 h-3.5 text-white" />
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
                            <div className="flex-1 min-w-0">
                                {editingSection === "name" ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={formData.firstName}
                                                onChange={e => handleChange("firstName", e.target.value)}
                                                placeholder="First name"
                                                className={INPUT_CLS}
                                            />
                                            <input
                                                value={formData.lastName}
                                                onChange={e => handleChange("lastName", e.target.value)}
                                                placeholder="Last name"
                                                className={INPUT_CLS}
                                            />
                                        </div>
                                        <EditActions
                                            onSave={handleSaveSection}
                                            onCancel={handleCancelSection}
                                            isSaving={sectionSave.isSaving}
                                            isSaved={sectionSave.isSaved}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">
                                            {profileData.firstName} {profileData.lastName}
                                        </p>
                                        {profileData.loyaltyPoints > 0 && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-xs text-amber-600 font-medium">
                                                    {profileData.loyaltyPoints} loyalty points
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setEditingSection("name")}
                                            className="flex items-center gap-1.5 mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit name
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <SectionRow icon={Mail} label="Email address">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-900">{profileData.email}</span>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full font-medium">Primary</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Email address cannot be changed</p>
                    </SectionRow>

                    {/* Phone */}
                    <SectionRow
                        icon={Phone}
                        label="Phone number"
                        onEdit={() => setEditingSection("phone")}
                        editing={editingSection === "phone"}
                    >
                        {editingSection === "phone" ? (
                            <div className="space-y-2">
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => handleChange("phone", e.target.value)}
                                    placeholder="+1 (416) 555-0123"
                                    maxLength={20}
                                    className={INPUT_CLS}
                                />
                                <EditActions
                                    onSave={handleSaveSection}
                                    onCancel={handleCancelSection}
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-900">
                                    {profileData.phone || (
                                        <span className="text-gray-400 italic">No phone number added</span>
                                    )}
                                </p>
                            </div>
                        )}
                    </SectionRow>

                    {/* Delivery instructions */}
                    <SectionRow
                        icon={Truck}
                        label="Default delivery instructions"
                        onEdit={() => setEditingSection("instructions")}
                        editing={editingSection === "instructions"}
                    >
                        {editingSection === "instructions" ? (
                            <div className="space-y-2">
                                <textarea
                                    value={formData.defaultDeliveryInstructions}
                                    onChange={e => handleChange("defaultDeliveryInstructions", e.target.value)}
                                    rows={3}
                                    placeholder="e.g. Leave at the door, ring the bell…"
                                    className={INPUT_CLS + " resize-none"}
                                />
                                <EditActions
                                    onSave={handleSaveSection}
                                    onCancel={handleCancelSection}
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-900">
                                {profileData.defaultDeliveryInstructions || (
                                    <span className="text-gray-400 italic">No default instructions set</span>
                                )}
                            </p>
                        )}
                    </SectionRow>

                    {/* Member since */}
                    <SectionRow icon={CalendarDays} label="Member since">
                        <p className="text-sm text-gray-900">{formatDate(profileData.createdAt)}</p>
                    </SectionRow>

                </div>

                {/* ── Addresses card ───────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Delivery addresses</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Manage your saved delivery locations</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddressForm(true);
                                setEditingAddressId(null);
                                setAddressForm(emptyAddress());
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-orange-500 hover:text-white hover:bg-orange-500 border border-orange-200 hover:border-orange-500 rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add address
                        </button>
                    </div>

                    {showAddressForm && (
                        <div className="px-6 bg-orange-50/40 border-b border-gray-100">
                            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide pt-4 mb-1">New address</p>
                            <AddressFormBlock
                                form={addressForm}
                                onChange={handleAddressChange}
                                onClear={handleAddressClear}
                                onSave={handleAddAddress}
                                onCancel={() => { setShowAddressForm(false); setAddressForm(emptyAddress()); }}
                                saveLabel="Save address"
                                isSaving={addressSave.isSaving}
                                isSaved={addressSave.isSaved}
                            />
                        </div>
                    )}

                    {profileData.addresses && profileData.addresses.length > 0 ? (
                        profileData.addresses.map((address, idx) => (
                            <div
                                key={address.publicAddressId}
                                className={idx < profileData.addresses.length - 1 ? "border-b border-gray-100" : ""}
                            >
                                {editingAddressId === address.publicAddressId ? (
                                    <div className="px-6 bg-orange-50/40">
                                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide pt-4 mb-1">Edit address</p>
                                        <AddressFormBlock
                                            form={addressForm}
                                            onChange={handleAddressChange}
                                            onClear={handleAddressClear}
                                            onSave={handleUpdateAddress}
                                            onCancel={() => { setEditingAddressId(null); setAddressForm(emptyAddress()); }}
                                            saveLabel="Update address"
                                            isSaving={addressSave.isSaving}
                                            isSaved={addressSave.isSaved}
                                        />
                                    </div>
                                ) : (
                                    <div className="px-6 py-4 flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${address.defaultAddress ? "bg-orange-100" : "bg-gray-100"}`}>
                                            <MapPin className={`w-4 h-4 ${address.defaultAddress ? "text-orange-500" : "text-gray-500"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-gray-900">{address.addressLine}</p>
                                                {address.defaultAddress && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full font-medium">
                                                        <Check className="w-3 h-3" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {address.city}, {address.province} {address.postalCode} — {address.country}
                                            </p>
                                            {!address.defaultAddress && (
                                                <button
                                                    onClick={() => handleSetDefaultAddress(address.publicAddressId)}
                                                    className="text-xs text-orange-500 hover:text-orange-600 font-medium mt-1 transition-colors"
                                                >
                                                    Set as default
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setEditingAddressId(address.publicAddressId);
                                                    setShowAddressForm(false);
                                                    setAddressForm({
                                                        addressLine: address.addressLine || "",
                                                        city: address.city || "",
                                                        province: address.province || "ON",
                                                        postalCode: address.postalCode || "",
                                                        country: address.country || "Canada",
                                                        defaultAddress: address.defaultAddress || false,
                                                    });
                                                }}
                                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                                                title="Edit address"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address.publicAddressId)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Delete address"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        !showAddressForm && (
                            <div className="px-6 py-14 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-7 h-7 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 mb-1">No addresses yet</p>
                                <p className="text-xs text-gray-400 mb-4">Add a delivery address to speed up checkout</p>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add your first address
                                </button>
                            </div>
                        )
                    )}
                </div>

            </div>
        </div>
    );
}
