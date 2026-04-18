"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/toast';
import Breadcrumb from "@/components/ui/Breadcrumb";
import { CustomerAPI } from "@/lib/api/customer.api";
import { AuthAPI } from "@/lib/api/auth.api";
import {
    Lock, MapPin, Shield, Trash2, Loader2,
    ChevronRight, X, Eye, EyeOff, Check,
    LogOut, Plus, Pencil, Star, AlertTriangle,
    HelpCircle, Bell,
} from "lucide-react";
import Link from "next/link";

// ── helpers ────────────────────────────────────────────────────────────────────

const EMPTY_ADDR = { addressLine: "", city: "", province: "", postalCode: "", country: "Canada", defaultAddress: false };

function PasswordField({ label, name, value, onChange, showPw, onToggle, disabled, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    style={{ color: "black", backgroundColor: "white" }}
                    type={showPw ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-60"
                />
                <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                    {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, gradient, title, subtitle }) {
    return (
        <div className={`p-5 border-b border-gray-100 flex items-center gap-3 ${gradient}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/60 shadow-sm">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-base font-black text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();

    // ── redirect if not authed ─────────────────────────────────────────────────
    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push("/");
    }, [authLoading, isAuthenticated, router]);

    // ── Notification preference ────────────────────────────────────────────────
    const [notifEnabled, setNotifEnabled]         = useState(true);
    const [notifLoading, setNotifLoading]         = useState(false);
    const [notifInitialised, setNotifInitialised] = useState(false);

    const [notifFetchError, setNotifFetchError] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        CustomerAPI.getCustomerProfile()
            .then(res => {
                if (res?.data?.notificationsEnabled != null) {
                    setNotifEnabled(res.data.notificationsEnabled);
                }
                setNotifFetchError(false);
            })
            .catch(err => {
                // Surface instead of swallowing: user needs to know the toggle
                // may not reflect the true server state.
                console.warn("[settings] failed to load notification preference", err);
                setNotifFetchError(true);
            })
            .finally(() => setNotifInitialised(true));
    }, [isAuthenticated]);

    const handleNotifToggle = async () => {
        const next = !notifEnabled;
        setNotifEnabled(next);          // optimistic
        setNotifLoading(true);
        try {
            const res = await CustomerAPI.updateNotificationPreference(next);
            if (res?.data?.notificationsEnabled != null) {
                setNotifEnabled(res.data.notificationsEnabled);
            }
            toast.success(next ? 'Notifications enabled' : 'Notifications disabled');
        } catch (err) {
            console.warn("[settings] notification toggle failed", err);
            setNotifEnabled(!next);     // rollback
            toast.error(err.message || "Could not update notification preference");
        } finally {
            setNotifLoading(false);
        }
    };

    // ── Change Password ────────────────────────────────────────────────────────
    const [showPwModal, setShowPwModal]       = useState(false);
    const [pwForm, setPwForm]                 = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPw, setShowPw]                 = useState({ current: false, new: false, confirm: false });
    const [pwLoading, setPwLoading]           = useState(false);
    const [pwSaved, setPwSaved]               = useState(false);

    const openPwModal = () => {
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwSaved(false);
        setShowPwModal(true);
    };

    const validatePw = () => {
        const { currentPassword, newPassword, confirmPassword } = pwForm;
        if (!currentPassword)                        { toast.error("Current password is required");           return false; }
        if (!newPassword)                            { toast.error("New password is required");               return false; }
        if (newPassword.length < 8)                  { toast.error("Password must be at least 8 characters"); return false; }
        if (!/[A-Z]/.test(newPassword))              { toast.error("Password needs an uppercase letter");     return false; }
        if (!/[a-z]/.test(newPassword))              { toast.error("Password needs a lowercase letter");     return false; }
        if (!/[0-9]/.test(newPassword))              { toast.error("Password needs a number");               return false; }
        if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(newPassword))
                                                     { toast.error("Password needs a special character");    return false; }
        if (newPassword !== confirmPassword)         { toast.error("Passwords do not match");                return false; }
        if (currentPassword === newPassword)         { toast.error("New password must differ from current"); return false; }
        return true;
    };

    const handleChangePw = async (e) => {
        e.preventDefault();
        if (!validatePw()) return;
        setPwLoading(true);
        try {
            const res = await AuthAPI.changePassword(pwForm.currentPassword, pwForm.newPassword);
            if (res?.success) {
                setPwSaved(true);
                toast.success('Password changed', { description: 'Your password has been updated successfully.' });
                // 2500ms lets screen-reader users catch the success toast and
                // the "Changed!" button state before the modal closes.
                setTimeout(() => { setShowPwModal(false); setPwSaved(false); }, 2500);
            } else {
                throw new Error(res?.message || "Failed to change password");
            }
        } catch (err) {
            console.warn("[settings] changePassword failed", err);
            toast.error(err.message || "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    // ── Delete Account ─────────────────────────────────────────────────────────
    const [showDeleteModal, setShowDeleteModal]       = useState(false);
    const [deletePassword, setDeletePassword]         = useState("");
    const [showDeletePw, setShowDeletePw]             = useState(false);
    const [deleteLoading, setDeleteLoading]           = useState(false);
    const [deleteConfirmText, setDeleteConfirmText]   = useState("");

    const DELETE_PHRASE = "delete my account";

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (deleteConfirmText.toLowerCase() !== DELETE_PHRASE) {
            toast.error(`Type "${DELETE_PHRASE}" to confirm`);
            return;
        }
        if (!deletePassword) {
            toast.error("Password is required");
            return;
        }
        setDeleteLoading(true);
        try {
            const res = await AuthAPI.deleteAccount(deletePassword);
            if (res?.success) {
                toast.success("Account deleted. Goodbye!");
                await logout();
            } else {
                throw new Error(res?.message || "Failed to delete account");
            }
        } catch (err) {
            console.warn("[settings] deleteAccount failed", err);
            toast.error(err.message || "Could not delete account. Check your password and try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Logout all devices ─────────────────────────────────────────────────────
    // Revoking every refresh token is destructive, so we gate it behind password
    // re-entry. That way a stolen access token alone can't lock the owner out.
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);
    const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
    const [logoutAllPassword, setLogoutAllPassword] = useState("");
    const [showLogoutAllPw, setShowLogoutAllPw] = useState(false);

    const openLogoutAllConfirm = () => {
        setLogoutAllPassword("");
        setShowLogoutAllPw(false);
        setShowLogoutAllConfirm(true);
    };

    const handleLogoutAll = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!logoutAllPassword) {
            toast.error("Enter your password to continue");
            return;
        }
        setLogoutAllLoading(true);
        try {
            await AuthAPI.logoutAllDevices(logoutAllPassword);
            toast.success("Signed out of all devices");
            await logout();
        } catch (err) {
            console.warn("[settings] logoutAllDevices failed", err);
            toast.error(err.message || "Failed to sign out all devices");
        } finally {
            setLogoutAllLoading(false);
            setShowLogoutAllConfirm(false);
        }
    };

    // ── Saved Addresses ────────────────────────────────────────────────────────
    const [addresses, setAddresses]             = useState([]);
    const [addrLoading, setAddrLoading]         = useState(true);
    const [addrError, setAddrError]             = useState(null);
    const [showAddrModal, setShowAddrModal]     = useState(false);
    const [editingAddr, setEditingAddr]         = useState(null); // null = add mode
    const [addrForm, setAddrForm]               = useState(EMPTY_ADDR);
    const [addrSaving, setAddrSaving]           = useState(false);
    const [deletingId, setDeletingId]           = useState(null);
    const [settingDefaultId, setSettingDefaultId] = useState(null);

    const loadAddresses = useCallback(async () => {
        setAddrLoading(true);
        setAddrError(null);
        try {
            const res = await CustomerAPI.savedAddress();
            setAddresses(res?.data ?? []);
        } catch (err) {
            setAddrError("Could not load addresses");
        } finally {
            setAddrLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) loadAddresses();
    }, [isAuthenticated, loadAddresses]);

    const openAddAddr = () => {
        setEditingAddr(null);
        setAddrForm(EMPTY_ADDR);
        setShowAddrModal(true);
    };

    const openEditAddr = (addr) => {
        setEditingAddr(addr);
        setAddrForm({
            addressLine: addr.addressLine || "",
            city:        addr.city        || "",
            province:    addr.province    || "",
            postalCode:  addr.postalCode  || "",
            country:     addr.country     || "Canada",
        });
        setShowAddrModal(true);
    };

    // Canadian postal code: A1A 1A1 (optional space). Lives client-side to
    // short-circuit obvious typos; the backend re-validates authoritatively.
    const CA_POSTAL_RE = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ][ -]?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i;

    // Locked country list — we only ship Canada today. Switch to a real
    // country picker when cross-border launches.
    const ALLOWED_COUNTRIES = ["Canada"];

    // Duplicate-detection helpers. Normalise so "123 Main St." and " 123 main st "
    // collide; postal code ignores the internal space ("M5V 2T6" == "m5v2t6").
    const normalizeAddr = (a) => ({
        addressLine: (a.addressLine || "").trim().toLowerCase(),
        city:        (a.city        || "").trim().toLowerCase(),
        province:    (a.province    || "").trim().toLowerCase(),
        postalCode:  (a.postalCode  || "").replace(/\s+/g, "").toLowerCase(),
        country:     (a.country     || "").trim().toLowerCase(),
    });
    const isSameAddress = (a, b) => {
        const x = normalizeAddr(a), y = normalizeAddr(b);
        return x.addressLine === y.addressLine
            && x.city        === y.city
            && x.province    === y.province
            && x.postalCode  === y.postalCode
            && x.country     === y.country;
    };

    const handleAddrSave = async (e) => {
        e.preventDefault();
        const { addressLine, city, province, postalCode, country } = addrForm;
        if (!addressLine || !city || !province || !postalCode || !country) {
            toast.error("Please fill in all address fields");
            return;
        }
        if (!CA_POSTAL_RE.test(postalCode.trim())) {
            toast.error("Postal code must look like M5V 2T6");
            return;
        }
        if (!ALLOWED_COUNTRIES.includes(country)) {
            toast.error("We currently only deliver in Canada");
            return;
        }
        // Block duplicate saves — compare against every other address, excluding
        // the one currently being edited so renaming/fixing typos still works.
        const duplicate = addresses.find(a =>
            a.publicAddressId !== editingAddr?.publicAddressId &&
            isSameAddress(a, addrForm)
        );
        if (duplicate) {
            toast.error(
                duplicate.defaultAddress
                    ? "You already have this address saved as your default"
                    : "You already have this address saved"
            );
            return;
        }
        setAddrSaving(true);
        try {
            // Patch local state from the API response so we don't pay for a
            // second round-trip (listAddresses) on every edit/add. If the
            // response shape is unexpected we fall back to a full reload.
            if (editingAddr) {
                const res = await CustomerAPI.updateAddress(editingAddr.publicAddressId, addrForm);
                const updated = res?.data;
                if (updated?.publicAddressId) {
                    setAddresses(prev => prev.map(a => a.publicAddressId === updated.publicAddressId ? updated : a));
                } else {
                    await loadAddresses();
                }
                toast.success("Address updated");
            } else {
                const res = await CustomerAPI.addAddress(addrForm);
                const created = res?.data;
                if (created?.publicAddressId) {
                    setAddresses(prev => created.defaultAddress
                        ? [created, ...prev.map(a => ({ ...a, defaultAddress: false }))]
                        : [...prev, created]);
                } else {
                    await loadAddresses();
                }
                toast.success("Address added");
            }
            setShowAddrModal(false);
        } catch (err) {
            console.warn("[settings] saveAddress failed", err);
            toast.error(err.message || "Could not save address");
        } finally {
            setAddrSaving(false);
        }
    };

    // H6: Two-step confirm before deleting or changing the default, so one
    // accidental tap can't destroy history or re-route deliveries.
    const [confirmDeleteAddr, setConfirmDeleteAddr] = useState(null); // address obj
    const [confirmDefaultAddr, setConfirmDefaultAddr] = useState(null);

    const handleDeleteAddr = async (addr) => {
        const id = addr.publicAddressId;
        setDeletingId(id);
        try {
            await CustomerAPI.deleteAddress(id);
            setAddresses(prev => prev.filter(a => a.publicAddressId !== id));
            toast.success("Address removed");
        } catch (err) {
            console.warn("[settings] deleteAddress failed", err);
            toast.error(err.message || "Could not delete address");
        } finally {
            setDeletingId(null);
            setConfirmDeleteAddr(null);
        }
    };

    const handleSetDefault = async (addr) => {
        const id = addr.publicAddressId;
        setSettingDefaultId(id);
        try {
            await CustomerAPI.setDefaultAddress(id);
            setAddresses(prev => prev.map(a => ({ ...a, defaultAddress: a.publicAddressId === id })));
            toast.success('Default address updated');
        } catch (err) {
            console.warn("[settings] setDefaultAddress failed", err);
            toast.error(err.message || "Could not set default address");
        } finally {
            setSettingDefaultId(null);
            setConfirmDefaultAddr(null);
        }
    };

    // ── render guards ─────────────────────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-6">

                <Breadcrumb items={[
                    { label: "Profile", href: "/profile" },
                    { label: "Settings" },
                ]} />

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account and security</p>
                </div>

                {/* ── Notifications ─────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <SectionHeader
                        icon={Bell}
                        gradient="bg-gradient-to-r from-orange-50 to-amber-50"
                        title="Notifications"
                        subtitle="Control whether you receive order and payment alerts"
                    />
                    {notifFetchError && (
                        <div className="px-5 py-2 text-[11px] text-amber-800 bg-amber-50 border-b border-amber-200">
                            We couldn't load your current setting. The toggle below may not reflect the server state until you refresh.
                        </div>
                    )}
                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                                {notifEnabled ? "Notifications on" : "Notifications off"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {notifEnabled
                                    ? "You'll receive order updates, delivery alerts and payment confirmations."
                                    : "You won't receive any order or payment notifications."
                                }
                            </p>
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={handleNotifToggle}
                            disabled={notifLoading || !notifInitialised}
                            aria-label={notifEnabled ? "Disable notifications" : "Enable notifications"}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                                notifEnabled ? "bg-orange-500" : "bg-gray-300"
                            }`}
                        >
                            {notifLoading ? (
                                <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    notifEnabled ? "translate-x-6" : "translate-x-0"
                                }`} />
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Security ───────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <SectionHeader
                        icon={Shield}
                        gradient="bg-gradient-to-r from-green-50 to-emerald-50"
                        title="Security"
                        subtitle="Manage your password and sessions"
                    />
                    <div className="divide-y divide-gray-100">
                        {/* Change password */}
                        <button
                            onClick={openPwModal}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Change Password</p>
                                <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors shrink-0" />
                        </button>

                        {/* Logout all devices */}
                        <button
                            onClick={openLogoutAllConfirm}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                <LogOut className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Sign out of all devices</p>
                                <p className="text-xs text-gray-400 mt-0.5">Revoke all active sessions everywhere</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
                        </button>
                    </div>
                </div>

                {/* ── Saved Addresses ────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/60 shadow-sm flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-gray-900">Saved Addresses</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Manage your delivery locations</p>
                            </div>
                        </div>
                        <button
                            onClick={openAddAddr}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                        </button>
                    </div>

                    <div className="p-5">
                        {addrLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            </div>
                        ) : addrError ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-red-500 mb-3">{addrError}</p>
                                <button
                                    onClick={loadAddresses}
                                    className="text-xs font-semibold text-purple-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-8">
                                <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-600">No saved addresses</p>
                                <p className="text-xs text-gray-400 mt-1">Add your delivery locations for faster checkout</p>
                                <button
                                    onClick={openAddAddr}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add first address
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.publicAddressId}
                                        className={`rounded-xl border p-4 transition-all ${
                                            addr.defaultAddress
                                                ? "border-purple-300 bg-purple-50/50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${addr.defaultAddress ? "text-purple-600" : "text-gray-400"}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                                                        {addr.addressLine}
                                                    </p>
                                                    {addr.defaultAddress && (
                                                        <span className="px-2 py-0.5 text-[10px] font-black bg-purple-600 text-white rounded-full leading-none">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {addr.city}, {addr.province} {addr.postalCode}
                                                </p>
                                                <p className="text-xs text-gray-400">{addr.country}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!addr.defaultAddress && (
                                                    <button
                                                        onClick={() => setConfirmDefaultAddr(addr)}
                                                        disabled={!!settingDefaultId}
                                                        title="Set as default"
                                                        aria-label="Set as default address"
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-40"
                                                    >
                                                        {settingDefaultId === addr.publicAddressId
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Star className="w-3.5 h-3.5" />
                                                        }
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditAddr(addr)}
                                                    title="Edit"
                                                    aria-label="Edit address"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteAddr(addr)}
                                                    disabled={deletingId === addr.publicAddressId}
                                                    title="Delete"
                                                    aria-label="Delete address"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                >
                                                    {deletingId === addr.publicAddressId
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Trash2 className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Help & Support link ─────────────────────────────────────── */}
                <Link
                    href="/help"
                    className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 hover:shadow-md transition-shadow group"
                >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Help &amp; Support</p>
                        <p className="text-xs text-gray-400 mt-0.5">FAQs, contact us and policies</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>

                {/* ── Danger Zone ─────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900">Danger Zone</h2>
                            <p className="text-xs text-red-600 mt-0.5">Irreversible — proceed with caution</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <button
                            onClick={() => { setDeletePassword(""); setDeleteConfirmText(""); setShowDeletePw(false); setShowDeleteModal(true); }}
                            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Your account can be reactivated within 30 days by signing back in.
                        </p>
                    </div>
                </div>

            </div>

            {/* ── Change Password Modal ──────────────────────────────────────── */}
            {showPwModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-base font-black text-gray-900">Change Password</h2>
                            </div>
                            <button onClick={() => setShowPwModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleChangePw} className="p-5 space-y-4">
                            <PasswordField
                                label="Current Password"
                                name="currentPassword"
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                showPw={showPw.current}
                                onToggle={() => setShowPw(p => ({ ...p, current: !p.current }))}
                                disabled={pwLoading}
                                placeholder="Enter current password"
                            />
                            <PasswordField
                                label="New Password"
                                name="newPassword"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                showPw={showPw.new}
                                onToggle={() => setShowPw(p => ({ ...p, new: !p.new }))}
                                disabled={pwLoading}
                                placeholder="Min 8 chars, uppercase, number, symbol"
                            />
                            <PasswordField
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={pwForm.confirmPassword}
                                onChange={e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                showPw={showPw.confirm}
                                onToggle={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                                disabled={pwLoading}
                                placeholder="Re-enter new password"
                            />

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPwModal(false)}
                                    disabled={pwLoading}
                                    className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={pwLoading || pwSaved}
                                    className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                                        pwSaved
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                                    }`}
                                >
                                    {pwLoading  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                    : pwSaved   ? <><Check className="w-4 h-4" /> Changed!</>
                                    :              "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Logout All Devices Confirm ─────────────────────────────────── */}
            {showLogoutAllConfirm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form
                        onSubmit={handleLogoutAll}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                <LogOut className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-black text-gray-900">Sign out everywhere?</p>
                                <p className="text-xs text-gray-500 mt-0.5">You'll be signed out of all active sessions on all devices.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Enter your password to continue
                            </label>
                            <div className="relative">
                                <input
                                    style={{ color: "black", backgroundColor: "white" }}
                                    type={showLogoutAllPw ? "text" : "password"}
                                    value={logoutAllPassword}
                                    onChange={e => setLogoutAllPassword(e.target.value)}
                                    disabled={logoutAllLoading}
                                    placeholder="Your current password"
                                    autoFocus
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    aria-label={showLogoutAllPw ? "Hide password" : "Show password"}
                                    onClick={() => setShowLogoutAllPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                >
                                    {showLogoutAllPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutAllConfirm(false)}
                                disabled={logoutAllLoading}
                                className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={logoutAllLoading || !logoutAllPassword}
                                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {logoutAllLoading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing out…</>
                                    : "Sign out all"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Delete Account Modal ──────────────────────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Red accent bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />

                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <h2 className="text-base font-black text-gray-900">Delete Account</h2>
                            </div>
                            <button onClick={() => setShowDeleteModal(false)} disabled={deleteLoading} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="p-5 space-y-4">
                            {/* Warning callout */}
                            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 space-y-1">
                                    <p className="font-bold">Your account will be scheduled for deletion.</p>
                                    <p>You have <span className="font-bold">30 days</span> to reactivate by signing back in. After that, your profile, addresses, order history and reviews are permanently removed.</p>
                                </div>
                            </div>

                            {/* Confirmation phrase */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Type <span className="font-black text-red-600">{DELETE_PHRASE}</span> to confirm
                                </label>
                                <input
                                    style={{ color: "black", backgroundColor: "white" }}
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    disabled={deleteLoading}
                                    placeholder={DELETE_PHRASE}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your current password</label>
                                <div className="relative">
                                    <input
                                        style={{ color: "black", backgroundColor: "white" }}
                                        type={showDeletePw ? "text" : "password"}
                                        value={deletePassword}
                                        onChange={e => setDeletePassword(e.target.value)}
                                        disabled={deleteLoading}
                                        placeholder="Enter your password"
                                        className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showDeletePw ? "Hide password" : "Show password"}
                                        onClick={() => setShowDeletePw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                    >
                                        {showDeletePw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteLoading || deleteConfirmText.toLowerCase() !== DELETE_PHRASE || !deletePassword}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                                        : "Delete my account"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Address Modal ───────────────────────────────────── */}
            {showAddrModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-base font-black text-gray-900">
                                    {editingAddr ? "Edit Address" : "Add Address"}
                                </h2>
                            </div>
                            <button onClick={() => setShowAddrModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddrSave} className="p-5 space-y-3">
                            {[
                                { key: "addressLine", label: "Street Address",  placeholder: "123 Main St, Apt 4B" },
                                { key: "city",        label: "City",            placeholder: "Toronto" },
                                { key: "province",    label: "Province / State",placeholder: "Ontario" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                                    <input
                                        style={{ color: "black", backgroundColor: "white" }}
                                        type="text"
                                        value={addrForm[key]}
                                        onChange={e => setAddrForm(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        disabled={addrSaving}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                                    />
                                </div>
                            ))}

                            {/* Postal code — tight client-side format + uppercase nudge */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Postal Code</label>
                                <input
                                    style={{ color: "black", backgroundColor: "white" }}
                                    type="text"
                                    value={addrForm.postalCode}
                                    onChange={e => setAddrForm(p => ({ ...p, postalCode: e.target.value.toUpperCase() }))}
                                    placeholder="M5V 2T6"
                                    inputMode="text"
                                    autoComplete="postal-code"
                                    maxLength={7}
                                    disabled={addrSaving}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Canadian format: A1A 1A1</p>
                            </div>

                            {/* Country — locked until we support other markets */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                                <select
                                    style={{ color: "black", backgroundColor: "white" }}
                                    value={addrForm.country}
                                    onChange={e => setAddrForm(p => ({ ...p, country: e.target.value }))}
                                    disabled={addrSaving}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                                >
                                    {ALLOWED_COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Make this my default — shown on Add only. Edit uses the star icon on the list card. */}
                            {!editingAddr && (
                                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={!!addrForm.defaultAddress}
                                        onChange={e => setAddrForm(p => ({ ...p, defaultAddress: e.target.checked }))}
                                        disabled={addrSaving}
                                        className="w-4 h-4 accent-purple-600 rounded border-gray-300 focus:ring-purple-400 disabled:opacity-60"
                                    />
                                    <span className="text-xs font-semibold text-gray-700">Make this my default address</span>
                                </label>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddrModal(false)}
                                    disabled={addrSaving}
                                    className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addrSaving}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {addrSaving
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                        : editingAddr ? "Save Changes" : "Add Address"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirm: Delete address ─────────────────────────────────────── */}
            {confirmDeleteAddr && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-black text-gray-900">Remove this address?</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {confirmDeleteAddr.addressLine}, {confirmDeleteAddr.city}
                                </p>
                            </div>
                        </div>
                        {confirmDeleteAddr.defaultAddress && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                This is your default delivery address. We'll pick a new default automatically.
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteAddr(null)}
                                disabled={!!deletingId}
                                className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteAddr(confirmDeleteAddr)}
                                disabled={!!deletingId}
                                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {deletingId
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Removing…</>
                                    : "Remove"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm: Change default address ─────────────────────────────── */}
            {confirmDefaultAddr && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                <Star className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-black text-gray-900">Set as default?</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Future orders will ship to {confirmDefaultAddr.addressLine}, {confirmDefaultAddr.city}.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDefaultAddr(null)}
                                disabled={!!settingDefaultId}
                                className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSetDefault(confirmDefaultAddr)}
                                disabled={!!settingDefaultId}
                                className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {settingDefaultId
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                    : "Set as default"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
