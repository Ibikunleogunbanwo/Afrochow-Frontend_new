"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSavedState } from "@/hooks/useSavedState";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
    Bell,
    Lock,
    CreditCard,
    MapPin,
    Globe,
    Shield,
    Trash2,
    Save,
    Check,
    Loader2,
    ChevronRight,
    X,
    Eye,
    EyeOff
} from "lucide-react";

export default function SettingsPage() {
    const { user, changePassword, getSavedAddresses } = useAuth();
    const router = useRouter();
    const settingsSave  = useSavedState();
    const passwordSave  = useSavedState(1500);

    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: false,
        newsletter: true,
        sms: false
    });
    const [language, setLanguage] = useState("en");

    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Saved addresses modal state
    const [showAddressesModal, setShowAddressesModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveSettings = () => {
        // TODO: Implement save functionality
        settingsSave.setSaved();
    };

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePasswordForm = () => {
        if (!passwordForm.currentPassword) {
            toast.error("Validation Error", "Current password is required");
            return false;
        }
        if (!passwordForm.newPassword) {
            toast.error("Validation Error", "New password is required");
            return false;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("Validation Error", "New password must be at least 8 characters");
            return false;
        }
        if (passwordForm.newPassword.length > 128) {
            toast.error("Validation Error", "New password must be less than 128 characters");
            return false;
        }
        if (!/[A-Z]/.test(passwordForm.newPassword)) {
            toast.error("Validation Error", "New password must contain at least one uppercase letter");
            return false;
        }
        if (!/[a-z]/.test(passwordForm.newPassword)) {
            toast.error("Validation Error", "New password must contain at least one lowercase letter");
            return false;
        }
        if (!/[0-9]/.test(passwordForm.newPassword)) {
            toast.error("Validation Error", "New password must contain at least one number");
            return false;
        }
        if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(passwordForm.newPassword)) {
            toast.error("Validation Error", "New password must contain at least one special character");
            return false;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Validation Error", "New passwords do not match");
            return false;
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            toast.error("Validation Error", "New password must be different from current password");
            return false;
        }
        return true;
    };

    const handleSubmitPasswordChange = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        setIsChangingPassword(true);

        try {
            const response = await changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );

            if (response?.success) {
                passwordSave.setSaved();
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    passwordSave.reset();
                }, 1500);
            } else {
                throw new Error("Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Change Failed", error.message || "Failed to change password. Please try again");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleOpenPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
    };

    const handleOpenAddressesModal = async () => {
        setShowAddressesModal(true);
        setIsLoadingAddresses(true);

        try {
            const response = await getSavedAddresses();
            if (response?.success && response?.data) {
                setSavedAddresses(response.data);
            } else {
                setSavedAddresses([]);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Load Failed", "Failed to load saved addresses");
            setSavedAddresses([]);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleCloseAddressesModal = () => {
        setShowAddressesModal(false);
    };


    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <Breadcrumb items={[
                    { label: "Profile",  href: "/profile" },
                    { label: "Settings" },
                ]} />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your account preferences and settings
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Notifications Section */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Notifications</h2>
                                    <p className="text-sm text-gray-600">Manage how you receive updates</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { key: "orderUpdates", label: "Order Updates", desc: "Get notified about your order status" },
                                { key: "promotions", label: "Promotions & Deals", desc: "Receive special offers and discounts" },
                                { key: "newsletter", label: "Newsletter", desc: "Weekly newsletter with new restaurants" },
                                { key: "sms", label: "SMS Notifications", desc: "Receive text messages for important updates" }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handleNotificationToggle(item.key)}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${
                                            notifications[item.key] ? "bg-orange-500" : "bg-gray-300"
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                                                notifications[item.key] ? "translate-x-7" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Language & Region */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-cyan-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Language & Region</h2>
                                    <p className="text-sm text-gray-600">Set your preferred language</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between py-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Language</p>
                                    <p className="text-sm text-gray-600">Choose your display language</p>
                                </div>
                                <select
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-semibold"
                                >
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Security & Privacy</h2>
                                    <p className="text-sm text-gray-600">Manage your account security</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={handleOpenPasswordModal}
                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Change Password</p>
                                        <p className="text-sm text-gray-600">Update your password</p>
                                    </div>
                                </div>

                                <ChevronRight
                                    className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"
                                />
                            </button>



                            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Payment Methods</p>
                                        <p className="text-sm text-gray-600">Manage saved payment methods</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                            </button>


                            <button
                                onClick={handleOpenAddressesModal}
                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Saved Addresses</p>
                                        <p className="text-sm text-gray-600">Manage delivery addresses</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-red-200">
                        <div className="p-6 border-b border-red-200 bg-red-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">Irreversible actions</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <button className="w-full px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg">
                                Delete Account
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                This action cannot be undone. All your data will be permanently deleted.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="sticky bottom-4">
                        <button
                            onClick={handleSaveSettings}
                            disabled={settingsSave.isSaved}
                            className={`w-full px-6 py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2
                                ${settingsSave.isSaved
                                    ? "bg-green-500"
                                    : "bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"}`}
                        >
                            {settingsSave.isSaved ? (
                                <><Check className="w-5 h-5" /><span>Settings Saved!</span></>
                            ) : (
                                <><Save className="w-5 h-5" /><span>Save All Settings</span></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900">Change Password</h2>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmitPasswordChange} className="p-6 space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordFormChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder="Enter current password"
                                            disabled={isChangingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordFormChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder="Enter new password (min 8 characters)"
                                            disabled={isChangingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordFormChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder="Re-enter new password"
                                            disabled={isChangingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• At least 8 characters long</li>
                                        <li>• Different from your current password</li>
                                    </ul>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                        disabled={isChangingPassword}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                                            ${passwordSave.isSaved ? "bg-green-500" : "bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"}`}
                                        disabled={isChangingPassword || passwordSave.isSaved}
                                    >
                                        {isChangingPassword ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Changing…</>
                                        ) : passwordSave.isSaved ? (
                                            <><Check className="w-4 h-4" /> Password Changed!</>
                                        ) : (
                                            "Change Password"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Saved Addresses Modal */}
                {showAddressesModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-pink-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">Saved Addresses</h2>
                                            <p className="text-sm text-gray-600">Your delivery addresses</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseAddressesModal}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {isLoadingAddresses ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                    </div>
                                ) : savedAddresses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 font-semibold">No saved addresses</p>
                                        <p className="text-sm text-gray-500 mt-2">Add delivery addresses from your profile page</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Info Banner */}
                                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                            <p className="text-sm text-purple-800">
                                                To add, edit, or delete addresses, visit your{" "}
                                                <button
                                                    onClick={() => {
                                                        handleCloseAddressesModal();
                                                        router.push('/profile');
                                                    }}
                                                    className="font-bold underline hover:text-purple-900"
                                                >
                                                    Profile Page
                                                </button>
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                        {savedAddresses.map((address) => (
                                            <div
                                                key={address.publicAddressId}
                                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <MapPin className="w-5 h-5 text-purple-600" />
                                                            {address.defaultAddress && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="font-semibold text-gray-900">{address.addressLine}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {address.city}, {address.province}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {address.postalCode}, {address.country}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={handleCloseAddressesModal}
                                    className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
