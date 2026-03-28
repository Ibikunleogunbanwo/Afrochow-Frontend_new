"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import { AuthAPI } from '@/lib/api/auth.api';
import { ImageUploadAPI } from '@/lib/api/imageUpload';
import ImageUploader from '@/components/image-uploader/ImageUploader';
import { CANADIAN_PROVINCES } from '@/lib/schemas/addressSchema';
import { toast } from '@/components/ui/toast';
import {
    Store, Star, ShoppingBag, DollarSign, Package,
    MapPin, Pencil, Loader2, CheckCircle2, ChevronRight,
    Calendar, Truck, X, ImageIcon,
    LayoutDashboard, Home, Phone, Navigation, Timer, Info,
    AlertCircle, Bell, CheckCheck, Trash2, RefreshCw,
} from 'lucide-react';
import { useVendorNotifications } from '@/hooks/useVendorNotifications';
import { SearchAPI } from '@/lib/api/search.api';

// ── Constants ────────────────────────────────────────────────────────────────

/** Fallback used while backend request is in-flight or if it fails. */
const CUISINE_TYPES_FALLBACK = [
    "African Home Kitchen",
    "African Restaurant",
    "African Soups & Stews",
    "African Grocery Store",
    "Bakery & Pastries",
    "Farm Produce",
    "Catering Services",
    "Caribbean Cuisine",
    "Frozen Meals & Meal Prep",
    "Halal Food",
    "Other",
];

const TABS = [
    { id: 'info',          label: 'Restaurant Info', icon: Store    },
    { id: 'hours',         label: 'Operating Hours', icon: Calendar },
    { id: 'branding',      label: 'Branding',        icon: ImageIcon },
    { id: 'notifications', label: 'Notifications',   icon: Bell     },
];

const DAYS = [
    { key: 'monday',    label: 'Monday' },
    { key: 'tuesday',   label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday',  label: 'Thursday' },
    { key: 'friday',    label: 'Friday' },
    { key: 'saturday',  label: 'Saturday' },
    { key: 'sunday',    label: 'Sunday' },
];

const INPUT_CLS =
    'w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-gray-900 bg-white transition placeholder:text-gray-400';
const INPUT_ERR_CLS =
    'w-full px-4 py-2.5 text-sm border border-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-900 bg-white transition placeholder:text-gray-400';
const NO_SPIN =
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildDefaultHours = () =>
    Object.fromEntries(
        DAYS.map(d => [d.key, { isOpen: false, openTime: '09:00', closeTime: '22:00' }])
    );

const normaliseHours = (raw) => {
    const base = buildDefaultHours();
    // Guard against null/non-object values and arrays (some backends return an array)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    DAYS.forEach(({ key }) => {
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        const src = raw[key] ?? raw[cap] ?? raw[key.toUpperCase()];
        if (!src || typeof src !== 'object') return;
        base[key] = {
            isOpen:    src.isOpen    ?? src.open       ?? false,
            openTime:  src.openTime  ?? src.open_time  ?? src.startTime ?? '09:00',
            closeTime: src.closeTime ?? src.close_time ?? src.endTime   ?? '22:00',
        };
    });
    return base;
};

const capitaliseKeys = (hours = {}) =>
    Object.fromEntries(
        Object.entries(hours).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v])
    );

const timeToMins = (t) => {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return h * 60 + m;
};

// Compute open/closed from hoursForm using the browser's local clock.
// Avoids timezone bugs where the backend isOpenNow uses UTC but hours are in local time.
const computeIsOpenFromHours = (hoursForm) => {
    if (!hoursForm) return null;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[new Date().getDay()];
    const day = hoursForm[today];
    if (!day?.isOpen) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins    = timeToMins(day.openTime);
    const closeMins   = timeToMins(day.closeTime);
    return closeMins > openMins
        ? currentMins >= openMins && currentMins < closeMins
        : currentMins >= openMins || currentMins < closeMins;
};

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Returns { field: errorMessage } for the Restaurant Info + Address tab.
 * Empty object = valid.
 */
function validateInfo(infoForm, addrForm) {
    const e = {};

    // --- Basic details ---
    if (!infoForm.restaurantName.trim()) {
        e.restaurantName = 'Restaurant name is required';
    } else if (infoForm.restaurantName.length > 100) {
        e.restaurantName = 'Must be under 100 characters';
    }

    if (infoForm.cuisineType && !cuisineTypes.includes(infoForm.cuisineType)) {
        e.cuisineType = 'Please select a valid product type';
    }

    if (infoForm.description) {
        if (infoForm.description.length < 10)
            e.description = 'Description must be at least 10 characters';
        else if (infoForm.description.length > 1000)
            e.description = 'Must be under 1000 characters';
    }

    if (infoForm.preparationTime !== '' && Number(infoForm.preparationTime) < 5) {
        e.preparationTime = 'Minimum 5 minutes';
    }

    // --- Services ---
    if (!infoForm.offersDelivery && !infoForm.offersPickup) {
        e.services = 'At least one service (delivery or pickup) must be enabled';
    }

    if (infoForm.offersDelivery) {
        if (infoForm.deliveryFee === '' || infoForm.deliveryFee === null || infoForm.deliveryFee === undefined)
            e.deliveryFee = 'Delivery fee is required';
        else if (Number(infoForm.deliveryFee) < 0)
            e.deliveryFee = 'Cannot be negative';

        if (!infoForm.minimumOrderAmount && infoForm.minimumOrderAmount !== 0)
            e.minimumOrderAmount = 'Minimum order amount is required';
        else if (Number(infoForm.minimumOrderAmount) < 0)
            e.minimumOrderAmount = 'Cannot be negative';

        if (!infoForm.estimatedDeliveryMinutes)
            e.estimatedDeliveryMinutes = 'Estimated delivery time is required';
        else if (Number(infoForm.estimatedDeliveryMinutes) < 10)
            e.estimatedDeliveryMinutes = 'Minimum 10 minutes';

        if (!infoForm.maxDeliveryDistanceKm)
            e.maxDeliveryDistanceKm = 'Max delivery radius is required';
        else if (Number(infoForm.maxDeliveryDistanceKm) < 1)
            e.maxDeliveryDistanceKm = 'Minimum 1 km';
    }

    // --- Address (only validated when at least one field is touched) ---
    const anyAddr = addrForm.addressLine || addrForm.city || addrForm.province || addrForm.postalCode;
    if (anyAddr) {
        if (!addrForm.addressLine || addrForm.addressLine.trim().length < 3)
            e.addressLine = 'Street address is required (min 3 characters)';

        if (!addrForm.city || addrForm.city.trim().length < 2)
            e.city = 'City is required';

        const prov = (addrForm.province || '').trim().toUpperCase();
        if (!CANADIAN_PROVINCES.includes(prov))
            e.province = 'Select a valid Canadian province';

        const postalOk = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(addrForm.postalCode || '');
        if (!postalOk)
            e.postalCode = 'Invalid postal code — use format A1A 1A1';
    }

    return e;
}

/**
 * Returns { day_field: errorMessage } for operating hours.
 */
function validateHours(hoursForm) {
    const e = {};

    const hasOpen = DAYS.some(({ key }) => hoursForm[key]?.isOpen);
    if (!hasOpen) {
        e._global = 'At least one day must be open';
    }

    DAYS.forEach(({ key }) => {
        const day = hoursForm[key];
        if (!day?.isOpen) return;
        if (timeToMins(day.closeTime) <= timeToMins(day.openTime)) {
            e[`${key}_closeTime`] = 'Closing time must be after opening time';
        }
    });

    return e;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Breadcrumb({ crumbs }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
            {crumbs.map((c, i) => (
                <React.Fragment key={c.label}>
                    {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                    {c.href ? (
                        <Link href={c.href}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                            {c.icon && <c.icon className="w-3.5 h-3.5" />}
                            {c.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-gray-900">{c.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

function Label({ children, required }) {
    return (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            {children}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-xs text-red-500">{msg}</p>
        </div>
    );
}

function Toggle({ checked, onChange, colorOn = 'bg-gray-900' }) {
    return (
        <button type="button" onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? colorOn : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
        </button>
    );
}

function SaveBar({ saving, onSave, onCancel, disabled }) {
    return (
        <div className="flex items-center gap-2 pt-5 border-t border-gray-100 mt-6">
            <button onClick={onSave} disabled={saving || disabled}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button onClick={onCancel} disabled={saving}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                Cancel
            </button>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function VendorProfilePage() {
    const [profile,      setProfile]      = useState(null);
    const [analytics,    setAnalytics]    = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [activeTab,    setActiveTab]    = useState('info');
    const [cuisineTypes, setCuisineTypes] = useState(CUISINE_TYPES_FALLBACK);

    // Pull live category names from the admin-managed Category table so the
    // dropdown matches what admins configure (same list as header nav).
    useEffect(() => {
        SearchAPI.getAllCategories()
            .then(res => {
                const list = Array.isArray(res) ? res : res?.data;
                if (Array.isArray(list) && list.length > 0) {
                    setCuisineTypes(list.map(c => c.name ?? c));
                }
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    // ── Notifications (for the Notifications tab) ─────────────────────────────
    const {
        notifications: notifList,
        unreadCount:   notifUnread,
        loading:       notifLoading,
        markRead:      notifMarkRead,
        markAllRead:   notifMarkAll,
        deleteOne:     notifDelete,
    } = useVendorNotifications();

    // ── Info form ────────────────────────────────────────────────────────────
    const [infoForm, setInfoForm] = useState({
        restaurantName: '', cuisineType: '', description: '', phone: '',
        offersDelivery: false, offersPickup: false,
        preparationTime: '', deliveryFee: '', minimumOrderAmount: '',
        estimatedDeliveryMinutes: '', maxDeliveryDistanceKm: '',
    });
    const [addrForm, setAddrForm] = useState({
        addressLine: '', city: '', province: '', postalCode: '',
        country: 'Canada', defaultAddress: true,
    });
    const [infoErrors,  setInfoErrors]  = useState({});
    const [savingInfo,  setSavingInfo]  = useState(false);

    // ── Hours form ───────────────────────────────────────────────────────────
    const [hoursForm,   setHoursForm]   = useState(buildDefaultHours());
    const [hoursErrors, setHoursErrors] = useState({});
    const [savingHours, setSavingHours] = useState(false);

    // ── Branding ─────────────────────────────────────────────────────────────
    const [logoUrl,   setLogoUrl]   = useState('');
    const [bannerUrl, setBannerUrl] = useState('');

    // ── Load ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [profileRes, analyticsRes, revenueRes, userRes] = await Promise.allSettled([
                    VendorProfileAPI.getVendorProfile(),
                    VendorAnalyticsAPI.getVendorAnalytics(),
                    VendorOrdersAPI.getOrdersRevenue(),
                    AuthAPI.getCurrentUser(),
                ]);
                if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
                    const d = profileRes.value.data;
                    // Phone lives on the User entity — attach it from getCurrentUser()
                    const userData = userRes.status === 'fulfilled' ? userRes.value?.data : null;
                    const phone = userData?.phone ?? '';
                    const enriched = { ...d, _phone: phone };
                    setProfile(enriched);
                    syncForms(enriched);
                }
                if (analyticsRes.status === 'fulfilled')
                    setAnalytics(analyticsRes.value?.data ?? null);
                if (revenueRes.status === 'fulfilled' && revenueRes.value?.data)
                    setAnalytics(prev => prev ? { ...prev, ...revenueRes.value.data } : revenueRes.value.data);
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const syncForms = (d) => {
        // Phone lives on the User entity — loaded separately and stored as _phone
        const phone = d._phone ?? '';

        setInfoForm({
            restaurantName:           d.restaurantName           ?? '',
            cuisineType:              d.cuisineType              ?? '',
            description:              d.description              ?? '',
            phone,
            offersDelivery:           d.offersDelivery           ?? false,
            offersPickup:             d.offersPickup             ?? false,
            preparationTime:          d.preparationTime          ?? '',
            deliveryFee:              d.deliveryFee              ?? '',
            minimumOrderAmount:       d.minimumOrderAmount       ?? '',
            estimatedDeliveryMinutes: d.estimatedDeliveryMinutes ?? '',
            maxDeliveryDistanceKm:    d.maxDeliveryDistanceKm    ?? '',
        });
        const a = d.address ?? {};
        setAddrForm({
            addressLine:    a.addressLine    ?? '',
            city:           a.city           ?? '',
            province:       (a.province      ?? '').toUpperCase(),
            postalCode:     a.postalCode     ?? '',
            country:        a.country        ?? 'Canada',
            defaultAddress: a.defaultAddress ?? true,
        });
        // Operating hours: backend returns this as "weeklySchedule" from the mapper,
        // but the JSON field name depends on the DTO — fall back to "operatingHours" too.
        const rawHours = d.weeklySchedule ?? d.operatingHours ?? null;
        setHoursForm(normaliseHours(rawHours));
        setLogoUrl(d.logoUrl   ?? '');
        setBannerUrl(d.bannerUrl ?? '');
        setInfoErrors({});
        setHoursErrors({});
    };

    // ── Info save ────────────────────────────────────────────────────────────
    const handleSaveInfo = async () => {
        const errors = validateInfo(infoForm, addrForm);
        if (Object.keys(errors).length) {
            setInfoErrors(errors);
            toast.error('Please fix the errors below before saving');
            return;
        }
        setInfoErrors({});
        setSavingInfo(true);
        try {
            const profilePayload = {
                restaurantName:           infoForm.restaurantName           || undefined,
                cuisineType:              infoForm.cuisineType              || undefined,
                description:              infoForm.description              || undefined,
                offersDelivery:           infoForm.offersDelivery,
                offersPickup:             infoForm.offersPickup,
                preparationTime:          infoForm.preparationTime          ? Number(infoForm.preparationTime)          : undefined,
                deliveryFee:              infoForm.offersDelivery && infoForm.deliveryFee              !== '' ? Number(infoForm.deliveryFee)              : undefined,
                minimumOrderAmount:       infoForm.offersDelivery && infoForm.minimumOrderAmount       !== '' ? Number(infoForm.minimumOrderAmount)       : undefined,
                estimatedDeliveryMinutes: infoForm.offersDelivery && infoForm.estimatedDeliveryMinutes !== '' ? Number(infoForm.estimatedDeliveryMinutes) : undefined,
                maxDeliveryDistanceKm:    infoForm.offersDelivery && infoForm.maxDeliveryDistanceKm    !== '' ? Number(infoForm.maxDeliveryDistanceKm)    : undefined,
            };

            // Only send the address update when all required fields are present
            const addrComplete =
                addrForm.addressLine.trim().length >= 3 &&
                addrForm.city.trim().length >= 2 &&
                CANADIAN_PROVINCES.includes((addrForm.province ?? '').trim().toUpperCase()) &&
                /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(addrForm.postalCode ?? '');

            const calls = [VendorProfileAPI.updateVendorProfile(profilePayload)];
            if (addrComplete) calls.push(VendorProfileAPI.updateVendorAddress({
                ...addrForm,
                province: addrForm.province.toUpperCase(),
            }));
            // Phone lives on the User entity — update via user/profile endpoint
            const phoneChanged = infoForm.phone.trim() !== (profile?._phone ?? '').trim();
            if (phoneChanged && infoForm.phone.trim()) {
                calls.push(AuthAPI.updateUserProfile({ phone: infoForm.phone.trim() }));
            }

            const results = await Promise.allSettled(calls);
            const anyOk = results.some(r => r.status === 'fulfilled' && r.value?.success);
            const firstErr = results.find(r => r.status === 'rejected')?.reason?.message;

            if (anyOk) {
                setProfile(prev => ({
                    ...prev,
                    ...profilePayload,
                    // Keep _phone in sync so cancel/syncForms shows the saved value
                    _phone:  infoForm.phone.trim() || prev?._phone,
                    address: addrComplete ? { ...(prev?.address ?? {}), ...addrForm } : prev?.address,
                }));
                toast.success('Restaurant info saved');
            } else {
                throw new Error(firstErr || 'Update failed');
            }
        } catch (e) {
            toast.error(e.message || 'Update failed');
        } finally {
            setSavingInfo(false);
        }
    };

    // ── Hours save ───────────────────────────────────────────────────────────
    const handleSaveHours = async () => {
        const errors = validateHours(hoursForm);
        if (Object.keys(errors).length) {
            setHoursErrors(errors);
            toast.error('Please fix the errors below before saving');
            return;
        }
        setHoursErrors({});
        setSavingHours(true);
        try {
            const res = await VendorProfileAPI.updateVendorProfile({
                operatingHours: capitaliseKeys(hoursForm),
            });
            if (res?.success) {
                // Mirror under both possible JSON keys so cancel/syncForms always finds it
                setProfile(prev => ({ ...prev, weeklySchedule: hoursForm, operatingHours: hoursForm }));
                toast.success('Operating hours saved');
            } else {
                throw new Error('Failed to save operating hours');
            }
        } catch (e) {
            toast.error(e.message || 'Failed to save operating hours');
        } finally {
            setSavingHours(false);
        }
    };

    const updateHoursField = (day, field, value) => {
        setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
        // Clear error for this field on change
        setHoursErrors(prev => {
            const next = { ...prev };
            delete next[`${day}_${field}`];
            if (field === 'isOpen') delete next._global;
            return next;
        });
    };

    // ── Branding — upload directly to Cloudinary, then persist URL ───────────
    // Both handlers return the URL so ImageUploader can update its own preview.
    // Errors are thrown and caught by ImageUploader's built-in error display.
    const handleLogoUpload = async (file) => {
        const { imageUrl: url } = await ImageUploadAPI.uploadRegistrationImage(file, 'VendorLogo');
        await VendorProfileAPI.updateVendorProfile({ logoUrl: url });
        setLogoUrl(url);
        setProfile(prev => ({ ...prev, logoUrl: url }));
        toast.success('Logo updated');
        return url;
    };

    const handleBannerUpload = async (file) => {
        const { imageUrl: url } = await ImageUploadAPI.uploadRegistrationImage(file, 'VendorBanner');
        await VendorProfileAPI.updateVendorProfile({ bannerUrl: url });
        setBannerUrl(url);
        setProfile(prev => ({ ...prev, bannerUrl: url }));
        toast.success('Banner updated');
        return url;
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fi = (field) => ({
        value:    infoForm[field],
        onChange: e => {
            setInfoForm(p => ({ ...p, [field]: e.target.value }));
            if (infoErrors[field]) setInfoErrors(p => { const n = { ...p }; delete n[field]; return n; });
        },
        className: infoErrors[field]
            ? `${INPUT_ERR_CLS} border-red-400`
            : `${INPUT_CLS} border-gray-200`,
    });

    const ai = (field) => ({
        value:    addrForm[field],
        onChange: e => {
            const val = field === 'postalCode' ? e.target.value.toUpperCase()
                      : field === 'province'   ? e.target.value.toUpperCase()
                      : e.target.value;
            setAddrForm(p => ({ ...p, [field]: val }));
            if (infoErrors[field]) setInfoErrors(p => { const n = { ...p }; delete n[field]; return n; });
        },
        className: infoErrors[field]
            ? `${INPUT_ERR_CLS} border-red-400`
            : `${INPUT_CLS} border-gray-200`,
    });

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    // ── Derived ───────────────────────────────────────────────────────────────
    const totalOrders   = analytics?.totalOrders   ?? 0;
    const totalRevenue  = analytics?.totalRevenue  ?? 0;
    const avgRating     = analytics?.averageRating ?? profile?.averageRating ?? 0;
    const totalProducts = analytics?.totalProducts ?? profile?.totalProducts ?? 0;
    const totalReviews  = analytics?.totalReviews  ?? 0;

    const addressLine = (() => {
        const a = profile?.address;
        if (!a) return null;
        return [a.addressLine, a.city, a.province].filter(Boolean).join(', ');
    })();

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Breadcrumb */}
                <Breadcrumb crumbs={[
                    { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
                    { label: 'Profile' },
                ]} />

                {/* ── Hero card ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

                    {/* Banner + logo: logo is absolutely anchored to the banner bottom */}
                    <div className="relative">
                        {/* Banner */}
                        <div className="h-52 sm:h-64 relative bg-gray-900 overflow-hidden">
                            {bannerUrl ? (
                                <Image
                                    src={bannerUrl}
                                    alt="Restaurant banner"
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <Store key={i} className="absolute text-white w-16 h-16"
                                            style={{ top: `${(i * 30) % 80}%`, left: `${(i * 18) % 90}%` }} />
                                    ))}
                                </div>
                            )}
                            {/* Subtle gradient so the edit button stays readable over any image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                            <button onClick={() => setActiveTab('branding')}
                                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors">
                                <Pencil className="w-3 h-3" /> Edit branding
                            </button>
                        </div>

                        {/* Logo — absolute at banner bottom-left, half hangs below */}
                        <div className="absolute bottom-0 left-4 sm:left-8 translate-y-1/2 z-10
                                        w-20 h-20 sm:w-24 sm:h-24
                                        rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                            {logoUrl
                                /* eslint-disable-next-line @next/next/no-img-element */
                                ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Store className="w-10 h-10 text-gray-400" />
                                  </div>
                            }
                        </div>
                    </div>

                    {/* Info below banner — pt clears the half-logo that hangs down */}
                    <div className="px-4 sm:px-8 pt-14 sm:pt-16 pb-5">
                        {/* Name + meta */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 break-words">
                                    {profile?.restaurantName || 'Your Restaurant'}
                                </h1>
                                {(() => {
                                    const isOpen = computeIsOpenFromHours(hoursForm);
                                    if (isOpen === null) return null;
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            {isOpen ? 'Open Now' : 'Closed'}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                                {profile?.cuisineType && <span className="font-medium">{profile.cuisineType}</span>}
                                {avgRating > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        {parseFloat(avgRating).toFixed(1)}
                                        {totalReviews > 0 && <span className="text-gray-400">({totalReviews})</span>}
                                    </span>
                                )}
                                {addressLine && (
                                    <span className="flex items-center gap-1 min-w-0">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{addressLine}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Orders',   value: totalOrders },
                                { label: 'Revenue',  value: `CA$${parseFloat(totalRevenue).toLocaleString('en-CA', { minimumFractionDigits: 2 })}` },
                                { label: 'Products', value: totalProducts },
                                { label: 'Rating',   value: avgRating > 0 ? parseFloat(avgRating).toFixed(1) : '—' },
                            ].map(s => (
                                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <p className="text-lg font-black text-gray-900 leading-none">{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Tab bar */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px
                                    ${activeTab === id
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                <Icon className="w-4 h-4" />
                                {label}
                                {id === 'notifications' && notifUnread > 0 && (
                                    <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-orange-500 text-white rounded-full flex items-center justify-center leading-none">
                                        {notifUnread > 9 ? '9+' : notifUnread}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab: Restaurant Info ──────────────────────── */}
                    {activeTab === 'info' && (
                        <div className="p-5 sm:p-8 space-y-8">

                            {/* Basic details */}
                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    Basic Details
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label required>Restaurant name</Label>
                                        <input {...fi('restaurantName')} placeholder="e.g. Mama's Kitchen" />
                                        <FieldError msg={infoErrors.restaurantName} />
                                    </div>
                                    <div>
                                        <Label>Product type</Label>
                                        <select {...fi('cuisineType')}>
                                            <option value="">Select product type…</option>
                                            {cuisineTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <FieldError msg={infoErrors.cuisineType} />
                                    </div>
                                    <div>
                                        <Label>Phone number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input {...fi('phone')} placeholder="+1 (416) 000-0000"
                                                className={`${fi('phone').className} pl-9`} />
                                        </div>
                                        <FieldError msg={infoErrors.phone} />
                                    </div>
                                    <div>
                                        <Label>Preparation time (min)</Label>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input type="number" min={5} {...fi('preparationTime')}
                                                placeholder="e.g. 30"
                                                className={`${fi('preparationTime').className} ${NO_SPIN} pl-9`} />
                                        </div>
                                        <FieldError msg={infoErrors.preparationTime} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Description</Label>
                                        <textarea {...fi('description')} rows={3}
                                            placeholder="Tell customers about your restaurant…" />
                                        <div className="flex items-start justify-between mt-1">
                                            <FieldError msg={infoErrors.description} />
                                            <span className="text-xs text-gray-400 ml-auto shrink-0">
                                                {(infoForm.description || '').length}/1000
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Services */}
                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    Services
                                </h3>
                                {infoErrors.services && (
                                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-sm text-red-600">{infoErrors.services}</p>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {/* Delivery */}
                                    <div className={`rounded-xl border-2 p-4 transition-colors ${infoForm.offersDelivery ? 'border-gray-400 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Truck className={`w-5 h-5 ${infoForm.offersDelivery ? 'text-gray-700' : 'text-gray-400'}`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Delivery</p>
                                                    <p className="text-xs text-gray-500">Deliver orders to customers</p>
                                                </div>
                                            </div>
                                            <Toggle checked={infoForm.offersDelivery}
                                                onChange={v => {
                                                    setInfoForm(p => ({ ...p, offersDelivery: v }));
                                                    setInfoErrors(p => { const n = { ...p }; delete n.services; return n; });
                                                }} />
                                        </div>

                                        {infoForm.offersDelivery && (
                                            <div className="grid sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <Label required>Delivery fee (CAD)</Label>
                                                    <input type="number" min={0} step="0.01"
                                                        {...fi('deliveryFee')} placeholder="5.00"
                                                        className={`${fi('deliveryFee').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.deliveryFee} />
                                                </div>
                                                <div>
                                                    <Label required>Min. order amount (CAD)</Label>
                                                    <input type="number" min={0} step="0.01"
                                                        {...fi('minimumOrderAmount')} placeholder="15.00"
                                                        className={`${fi('minimumOrderAmount').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.minimumOrderAmount} />
                                                </div>
                                                <div>
                                                    <Label required>Est. delivery time (min)</Label>
                                                    <input type="number" min={10}
                                                        {...fi('estimatedDeliveryMinutes')} placeholder="45"
                                                        className={`${fi('estimatedDeliveryMinutes').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.estimatedDeliveryMinutes} />
                                                </div>
                                                <div>
                                                    <Label required>Max delivery radius (km)</Label>
                                                    <div className="relative">
                                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                        <input type="number" min={1} step="0.1"
                                                            {...fi('maxDeliveryDistanceKm')} placeholder="10"
                                                            className={`${fi('maxDeliveryDistanceKm').className} ${NO_SPIN} pl-9`} />
                                                    </div>
                                                    <FieldError msg={infoErrors.maxDeliveryDistanceKm} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pickup */}
                                    <div className={`rounded-xl border-2 p-4 transition-colors ${infoForm.offersPickup ? 'border-gray-400 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Store className={`w-5 h-5 ${infoForm.offersPickup ? 'text-gray-700' : 'text-gray-400'}`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Pickup</p>
                                                    <p className="text-xs text-gray-500">Customers collect in-person</p>
                                                </div>
                                            </div>
                                            <Toggle checked={infoForm.offersPickup} colorOn="bg-green-500"
                                                onChange={v => {
                                                    setInfoForm(p => ({ ...p, offersPickup: v }));
                                                    setInfoErrors(p => { const n = { ...p }; delete n.services; return n; });
                                                }} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Address */}
                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    Address
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Leave blank to keep the existing address unchanged.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <Label>Street address</Label>
                                        <div className="relative">
                                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input {...ai('addressLine')} placeholder="123 Main Street"
                                                className={`${ai('addressLine').className} pl-9`} />
                                        </div>
                                        <FieldError msg={infoErrors.addressLine} />
                                    </div>
                                    <div>
                                        <Label>City</Label>
                                        <input {...ai('city')} placeholder="Toronto" />
                                        <FieldError msg={infoErrors.city} />
                                    </div>
                                    <div>
                                        <Label>Province</Label>
                                        <select
                                            value={addrForm.province}
                                            onChange={e => {
                                                setAddrForm(p => ({ ...p, province: e.target.value }));
                                                if (infoErrors.province) setInfoErrors(p => { const n = { ...p }; delete n.province; return n; });
                                            }}
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className={`${infoErrors.province ? INPUT_ERR_CLS : `${INPUT_CLS} border-gray-200`}`}>
                                            <option value="">Select province…</option>
                                            {CANADIAN_PROVINCES.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        <FieldError msg={infoErrors.province} />
                                    </div>
                                    <div>
                                        <Label>Postal code</Label>
                                        <input {...ai('postalCode')} placeholder="M5V 3A8" maxLength={7} />
                                        <FieldError msg={infoErrors.postalCode} />
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <input className={`${INPUT_CLS} border-gray-200 bg-gray-50 text-gray-500`}
                                            value="Canada" readOnly />
                                    </div>
                                </div>
                            </section>

                            <SaveBar saving={savingInfo} onSave={handleSaveInfo}
                                onCancel={() => { syncForms(profile); }} />
                        </div>
                    )}

                    {/* ── Tab: Operating Hours ──────────────────────── */}
                    {activeTab === 'hours' && (
                        <div className="p-5 sm:p-8">
                            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                                <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Toggle a day on to mark it as open, then set opening and closing times.
                                    At least one day must be open. Closing time must be after opening time.
                                </p>
                            </div>

                            {hoursErrors._global && (
                                <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-600">{hoursErrors._global}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {DAYS.map(({ key, label }) => {
                                    const day = hoursForm[key] ?? { isOpen: false, openTime: '09:00', closeTime: '22:00' };
                                    const closeErr = hoursErrors[`${key}_closeTime`];
                                    return (
                                        <div key={key} className={`rounded-xl border-2 p-3 sm:p-4 transition-all ${day.isOpen ? 'border-gray-400 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                            {/* Row 1 — toggle + day name (always visible) */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Toggle checked={day.isOpen}
                                                        onChange={v => updateHoursField(key, 'isOpen', v)} />
                                                    <span className={`text-sm font-semibold ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {label}
                                                    </span>
                                                </div>
                                                {/* "Closed" badge inline on mobile */}
                                                {!day.isOpen && (
                                                    <span className="text-xs text-gray-400 italic">Closed</span>
                                                )}
                                            </div>

                                            {/* Row 2 — time inputs, only when open, full-width below day name */}
                                            {day.isOpen && (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <input type="time" value={day.openTime}
                                                            onChange={e => updateHoursField(key, 'openTime', e.target.value)}
                                                            className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 bg-white" />
                                                        <span className="text-xs text-gray-400 shrink-0 font-medium">to</span>
                                                        <input type="time" value={day.closeTime}
                                                            onChange={e => updateHoursField(key, 'closeTime', e.target.value)}
                                                            className={`flex-1 min-w-0 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white
                                                                ${closeErr ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`} />
                                                    </div>
                                                    {closeErr && (
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                                            <p className="text-xs text-red-500">{closeErr}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <SaveBar saving={savingHours} onSave={handleSaveHours}
                                onCancel={() => {
                                    setHoursForm(normaliseHours(profile?.weeklySchedule ?? null));
                                    setHoursErrors({});
                                }} />
                        </div>
                    )}

                    {/* ── Tab: Notifications ────────────────────────── */}
                    {activeTab === 'notifications' && (
                        <div className="p-5 sm:p-6 space-y-4">

                            {/* Header row */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-gray-900">
                                        {notifUnread > 0 ? `${notifUnread} unread` : 'All caught up'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">Your recent alerts and order activity</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifUnread > 0 && (
                                        <button
                                            onClick={notifMarkAll}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {notifLoading ? (
                                    <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Loading…</span>
                                    </div>
                                ) : notifList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                                        <Bell className="w-10 h-10 text-gray-200" />
                                        <p className="text-sm text-gray-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {notifList.slice(0, 10).map(n => {
                                            const isUnread = n.unread;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`group flex items-start gap-3 px-4 py-3.5 ${isUnread ? 'bg-gray-50' : ''}`}
                                                >
                                                    {/* Unread dot */}
                                                    <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-orange-500' : 'bg-transparent'}`} />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{n.time}</p>
                                                        </div>
                                                        {n.text && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.text}</p>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                        {isUnread && (
                                                            <button
                                                                onClick={() => notifMarkRead(n.id)}
                                                                title="Mark as read"
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => notifDelete(n.id)}
                                                            title="Delete"
                                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* View all link */}
                            <Link
                                href="/vendor/notifications"
                                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                View all notifications
                                {notifList.length > 10 && (
                                    <span className="text-gray-500 text-xs">(+{notifList.length - 10} more)</span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}

                    {/* ── Tab: Branding ─────────────────────────────── */}
                    {activeTab === 'branding' && (
                        <div className="p-5 sm:p-8 space-y-6">

                            {/* Info banner */}
                            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Images save immediately — no separate Save button needed.
                                    Your logo appears in search results; the banner is shown at the top of your restaurant page.
                                </p>
                            </div>

                            {/* Logo */}
                            <section className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">Restaurant Logo</p>
                                    <p className="text-xs text-gray-500">Square images work best · JPG, PNG, WEBP · max 5 MB</p>
                                </div>
                                <ImageUploader
                                    id="vendor-logo"
                                    value={logoUrl}
                                    size="xl"
                                    shape="square"
                                    helpText="512×512 px recommended"
                                    onUpload={handleLogoUpload}
                                    onChange={(val) => { if (typeof val === 'string' || val === null) setLogoUrl(val ?? ''); }}
                                />
                            </section>

                            <div className="border-t border-gray-100" />

                            {/* Banner */}
                            <section className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">Restaurant Banner</p>
                                    <p className="text-xs text-gray-500">Wide / landscape images work best · JPG, PNG, WEBP · max 5 MB</p>
                                </div>
                                <ImageUploader
                                    id="vendor-banner"
                                    value={bannerUrl}
                                    size="banner"
                                    shape="square"
                                    helpText="Wide / landscape · JPG, PNG, WEBP · max 5 MB"
                                    onUpload={handleBannerUpload}
                                    onChange={(val) => { if (typeof val === 'string' || val === null) setBannerUrl(val ?? ''); }}
                                />
                            </section>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
