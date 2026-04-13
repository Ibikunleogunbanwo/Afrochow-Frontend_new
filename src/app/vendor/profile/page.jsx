"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { VendorProfileAPI, VendorStripeAPI } from '@/lib/api/vendor/profile.api';
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
    CreditCard, ExternalLink, CheckCircle, Award, Upload,
    FileText, ShieldCheck, Clock,
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
    { id: 'info',          label: 'Store Info',      short: 'Info',    icon: Store      },
    { id: 'hours',         label: 'Hours',           short: 'Hours',   icon: Calendar   },
    { id: 'branding',      label: 'Branding',        short: 'Brand',   icon: ImageIcon  },
    { id: 'payout',        label: 'Payout',          short: 'Payout',  icon: CreditCard },
    { id: 'certification', label: 'Certification',   short: 'Cert',    icon: Award      },
    { id: 'notifications', label: 'Notifications',   short: 'Alerts',  icon: Bell       },
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
function validateInfo(infoForm, addrForm, cuisineTypes) {
    const e = {};

    // --- Basic details ---
    if (!infoForm.restaurantName.trim()) {
        e.restaurantName = 'Store name is required';
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
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            {crumbs.map((c, i) => (
                <React.Fragment key={c.label}>
                    {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />}
                    {c.href ? (
                        <Link href={c.href}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                            {c.icon && <c.icon className="w-3 h-3" />}
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
        <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2 pt-5 border-t border-gray-100 mt-6">
            <button onClick={onSave} disabled={saving || disabled}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button onClick={onCancel} disabled={saving}
                className="px-5 py-3 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 w-full sm:w-auto text-center">
                Cancel
            </button>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function VendorProfilePage() {
    const searchParams = useSearchParams();
    const stripeParam  = searchParams.get('stripe'); // 'return' | 'refresh' | null

    const [profile,      setProfile]      = useState(null);
    const [analytics,    setAnalytics]    = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [activeTab,    setActiveTab]    = useState(stripeParam ? 'payout' : 'info');
    const [cuisineTypes, setCuisineTypes] = useState(CUISINE_TYPES_FALLBACK);

    // Stripe payout state
    const [stripeConnecting,       setStripeConnecting]       = useState(false);
    const [stripeDashboardLoading, setStripeDashboardLoading] = useState(false);

    const handleStripeConnect = async () => {
        setStripeConnecting(true);
        try {
            const res = await VendorStripeAPI.startOnboarding();
            if (res?.success && res?.data?.onboardingUrl) {
                window.location.href = res.data.onboardingUrl;
            } else {
                toast.error('Could not start Stripe onboarding. Please try again.');
            }
        } catch (e) {
            toast.error(e.message || 'Could not start Stripe onboarding.');
        } finally {
            setStripeConnecting(false);
        }
    };

    const handleStripeDashboard = async () => {
        setStripeDashboardLoading(true);
        try {
            const res = await VendorStripeAPI.getDashboardLink();
            if (res?.success && res?.data?.dashboardUrl) {
                window.open(res.data.dashboardUrl, '_blank', 'noopener,noreferrer');
            } else {
                toast.error('Could not open Stripe dashboard. Please try again.');
            }
        } catch (e) {
            toast.error(e.message || 'Could not open Stripe dashboard.');
        } finally {
            setStripeDashboardLoading(false);
        }
    };

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

    // ── Certification ─────────────────────────────────────────────────────────
    const [certFile,       setCertFile]       = useState(null);
    const [certNumber,     setCertNumber]     = useState('');
    const [certIssuingBody, setCertIssuingBody] = useState('');
    const [certExpiry,     setCertExpiry]     = useState('');   // YYYY-MM-DD string
    const [certErrors,     setCertErrors]     = useState({});
    const [uploadingCert,  setUploadingCert]  = useState(false);

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
        const errors = validateInfo(infoForm, addrForm, cuisineTypes);
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
                toast.success('Store info saved');
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

    // ── Cert upload ───────────────────────────────────────────────────────────
    const handleCertUpload = async () => {
        const e = {};
        if (!certFile)             e.certFile       = 'Please select a certificate file';
        if (!certNumber.trim())    e.certNumber     = 'Certificate number is required';
        if (!certIssuingBody.trim()) e.certIssuingBody = 'Issuing body is required';
        if (Object.keys(e).length) { setCertErrors(e); return; }
        setCertErrors({});
        setUploadingCert(true);
        try {
            // Convert YYYY-MM-DD → LocalDateTime string expected by backend
            const expiryIso = certExpiry ? `${certExpiry}T00:00:00` : undefined;
            const res = await VendorProfileAPI.uploadFoodHandlingCert(certFile, {
                certNumber:   certNumber.trim(),
                issuingBody:  certIssuingBody.trim(),
                certExpiry:   expiryIso,
            });
            if (res?.success) {
                setProfile(prev => ({ ...prev, ...res.data }));
                setCertFile(null);
                setCertNumber('');
                setCertIssuingBody('');
                setCertExpiry('');
                toast.success('Certificate uploaded — pending admin review');
            } else {
                throw new Error(res?.message || 'Upload failed');
            }
        } catch (err) {
            toast.error(err.message || 'Certificate upload failed');
        } finally {
            setUploadingCert(false);
        }
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
            <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">

                {/* Breadcrumb */}
                <Breadcrumb crumbs={[
                    { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
                    { label: 'Profile' },
                ]} />

                {/* ── Hero card ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3 sm:mb-6">

                    {/* Banner + logo */}
                    <div className="relative">
                        {/* Banner */}
                        <div className="h-36 sm:h-52 lg:h-60 relative bg-gray-900 overflow-hidden">
                            {bannerUrl ? (
                                <Image
                                    src={bannerUrl}
                                    alt="Store banner"
                                    fill
                                    sizes="100vw"
                                    className="object-cover object-center"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    {[...Array(4)].map((_, i) => (
                                        <Store key={i} className="absolute text-white w-12 h-12 sm:w-16 sm:h-16"
                                            style={{ top: `${(i * 30) % 80}%`, left: `${(i * 25) % 85}%` }} />
                                    ))}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                            {/* Edit branding — icon-only on tiny screens */}
                            <button onClick={() => setActiveTab('branding')}
                                className="absolute top-2 right-2 sm:top-3 sm:right-3 inline-flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-black/30 hover:bg-black/50 active:bg-black/60 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors">
                                <Pencil className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">Edit branding</span>
                            </button>
                        </div>

                        {/* Logo — smaller on mobile */}
                        <div className="absolute bottom-0 left-3 sm:left-6 translate-y-1/2 z-10
                                        w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20
                                        rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-white shadow-lg overflow-hidden">
                            {logoUrl
                                /* eslint-disable-next-line @next/next/no-img-element */
                                ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Store className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                  </div>
                            }
                        </div>
                    </div>

                    {/* Info below banner */}
                    <div className="px-3 sm:px-6 pt-10 xs:pt-11 sm:pt-14 pb-4 sm:pb-5">
                        {/* Name + meta */}
                        <div className="mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-2xl font-black text-gray-900 break-words">
                                    {profile?.restaurantName || 'Your Store'}
                                </h1>
                                {(() => {
                                    const isOpen = computeIsOpenFromHours(hoursForm);
                                    if (isOpen === null) return null;
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            {isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm text-gray-500">
                                {profile?.cuisineType && <span className="font-medium">{profile.cuisineType}</span>}
                                {avgRating > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        {parseFloat(avgRating).toFixed(1)}
                                        {totalReviews > 0 && <span className="text-gray-400">({totalReviews})</span>}
                                    </span>
                                )}
                                {addressLine && (
                                    <span className="flex items-center gap-0.5 min-w-0">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate max-w-[160px] sm:max-w-none">{addressLine}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats row — 2-col on mobile, 4-col on sm+ */}
                        {(() => {
                            // Abbreviates large numbers so they always fit in a narrow cell.
                            // $1,234,567 → $1.2M  |  $45,600 → $45.6K  |  $999 → $999
                            const fmtRevenue = (v) => {
                                const n = parseFloat(v) || 0;
                                if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
                                if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
                                return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                            };
                            const fmtCount = (v) => {
                                const n = parseInt(v) || 0;
                                if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                                if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
                                return n.toString();
                            };
                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    {[
                                        { label: 'Orders',  value: fmtCount(totalOrders) },
                                        { label: 'Revenue', value: fmtRevenue(totalRevenue) },
                                        { label: 'Items',   value: fmtCount(totalProducts) },
                                        { label: 'Rating',  value: avgRating > 0 ? parseFloat(avgRating).toFixed(1) : '—' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-gray-50 rounded-xl p-2 sm:p-3 text-center border border-gray-100">
                                            <p className="text-base sm:text-lg font-black text-gray-900 leading-tight tabular-nums">{s.value}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Tab bar — icon-only on mobile, icon+label on sm+ */}
                    {/* Provisional banner — shown when cert is not yet uploaded */}
                    {profile?.vendorStatus === 'PROVISIONAL' && !profile?.foodHandlingCertUrl && (
                        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border-b border-blue-100">
                            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-blue-800">
                                    Action required — upload your food handling certificate
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    Your store is live with a temporary order cap. Upload your certificate in the{' '}
                                    <button onClick={() => setActiveTab('certification')} className="font-bold underline">
                                        Certification tab
                                    </button>{' '}
                                    to get fully verified and remove the cap.
                                </p>
                            </div>
                            <button onClick={() => setActiveTab('certification')}
                                className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                Upload Now
                            </button>
                        </div>
                    )}

                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                title={label}
                                className={`relative flex items-center justify-center gap-1.5 flex-1 sm:flex-none sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px min-h-[48px]
                                    ${activeTab === id
                                        ? 'border-gray-900 text-gray-900 bg-gray-50'
                                        : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                                <Icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                                <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                                {/* Cert action dot */}
                                {id === 'certification' && profile?.vendorStatus === 'PROVISIONAL' && !profile?.foodHandlingCertUrl && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                {id === 'notifications' && notifUnread > 0 && (
                                    <span className="absolute top-1.5 right-1.5 sm:static sm:min-w-[18px] sm:h-[18px] sm:px-1 w-2 h-2 sm:w-auto sm:h-auto text-[10px] font-black bg-orange-500 text-white rounded-full flex items-center justify-center leading-none">
                                        <span className="hidden sm:inline">{notifUnread > 9 ? '9+' : notifUnread}</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab: Restaurant Info ──────────────────────── */}
                    {activeTab === 'info' && (
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

                            {/* Basic details */}
                            <section>
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">
                                    Basic Details
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label required>Store name</Label>
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
                                            placeholder="Tell customers about your store…" />
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
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wide">
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
                                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <Label required>Fee (CAD)</Label>
                                                    <input type="number" min={0} step="0.01"
                                                        {...fi('deliveryFee')} placeholder="5.00"
                                                        className={`${fi('deliveryFee').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.deliveryFee} />
                                                </div>
                                                <div>
                                                    <Label required>Min. order (CAD)</Label>
                                                    <input type="number" min={0} step="0.01"
                                                        {...fi('minimumOrderAmount')} placeholder="15.00"
                                                        className={`${fi('minimumOrderAmount').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.minimumOrderAmount} />
                                                </div>
                                                <div>
                                                    <Label required>Est. time (min)</Label>
                                                    <input type="number" min={10}
                                                        {...fi('estimatedDeliveryMinutes')} placeholder="45"
                                                        className={`${fi('estimatedDeliveryMinutes').className} ${NO_SPIN}`} />
                                                    <FieldError msg={infoErrors.estimatedDeliveryMinutes} />
                                                </div>
                                                <div>
                                                    <Label required>Max radius (km)</Label>
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
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 uppercase tracking-wide">
                                    Address
                                </h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Leave blank to keep existing address.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <div className="p-4 sm:p-6 lg:p-8">
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
                                        <div key={key} className={`rounded-xl border-2 p-3 transition-all ${day.isOpen ? 'border-gray-400 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                                            {/* Toggle row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Toggle checked={day.isOpen}
                                                        onChange={v => updateHoursField(key, 'isOpen', v)} />
                                                    <span className={`text-sm font-semibold ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {label}
                                                    </span>
                                                </div>
                                                {!day.isOpen && (
                                                    <span className="text-xs text-gray-400 italic">Closed</span>
                                                )}
                                            </div>

                                            {/* Time inputs — stacked on mobile */}
                                            {day.isOpen && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <input type="time" value={day.openTime}
                                                        onChange={e => updateHoursField(key, 'openTime', e.target.value)}
                                                        className="flex-1 min-w-0 px-2.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 bg-white" />
                                                    <span className="text-xs text-gray-400 shrink-0">–</span>
                                                    <input type="time" value={day.closeTime}
                                                        onChange={e => updateHoursField(key, 'closeTime', e.target.value)}
                                                        className={`flex-1 min-w-0 px-2.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white
                                                            ${closeErr ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`} />
                                                    {closeErr && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" title={closeErr} />}
                                                </div>
                                            )}
                                            {closeErr && (
                                                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />{closeErr}
                                                </p>
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

                    {/* ── Tab: Payout ───────────────────────────────── */}
                    {activeTab === 'payout' && (
                        <div className="p-4 sm:p-6 lg:p-8 space-y-4">

                            {/* Return / refresh banners */}
                            {stripeParam === 'return' && (
                                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">Onboarding submitted</p>
                                        <p className="text-xs text-green-700 mt-0.5">
                                            Stripe is reviewing your details. Your payout account will be marked connected once verified.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {stripeParam === 'refresh' && (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Onboarding incomplete</p>
                                        <p className="text-xs text-amber-700 mt-0.5">
                                            Your Stripe session expired. Click below to resume onboarding.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payout card */}
                            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                    Payout Account
                                </h3>

                                {profile?.stripeOnboardingComplete ? (
                                    <div className="bg-white p-4 rounded-xl flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2.5 rounded-lg shrink-0">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">Stripe payout account connected</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    You&apos;re set up to receive payouts. Manage banking details and payout history in your Stripe dashboard.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleStripeDashboard}
                                            disabled={stripeDashboardLoading}
                                            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                                        >
                                            {stripeDashboardLoading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                                                : <><ExternalLink className="w-4 h-4" /> Stripe Dashboard</>
                                            }
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white p-4 rounded-xl flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2.5 rounded-lg shrink-0">
                                                <CreditCard className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">No payout account connected</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Connect a Stripe payout account to receive earnings from your orders. Takes only a few minutes.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleStripeConnect}
                                            disabled={stripeConnecting}
                                            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-60"
                                        >
                                            {stripeConnecting
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                                                : <><ExternalLink className="w-4 h-4" /> Connect Payout Account</>
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Tab: Notifications ────────────────────────── */}
                    {activeTab === 'notifications' && (
                        <div className="p-4 space-y-4">

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
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-1">{n.text}</p>
                                                        )}
                                                    </div>

                                                    {/* Actions — always visible on mobile, hover-only on desktop */}
                                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                                        {isUnread && (
                                                            <button
                                                                onClick={() => notifMarkRead(n.id)}
                                                                title="Mark as read"
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                                            >
                                                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => notifDelete(n.id)}
                                                            title="Delete"
                                                            className="p-1.5 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
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
                    {activeTab === 'certification' && (
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                            {/* ── Status card ── */}
                            {(() => {
                                const status  = profile?.vendorStatus;
                                const certUrl = profile?.foodHandlingCertUrl;
                                const verified = profile?.certVerifiedAt;
                                const expired  = profile?.certExpired;

                                if (status === 'VERIFIED' && certUrl && verified) {
                                    return (
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 border border-green-200 rounded-xl">
                                            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-green-800">Certificate verified — fully approved</p>
                                                <p className="text-xs text-green-600 mt-0.5">
                                                    Verified on {new Date(verified).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (certUrl && !verified) {
                                    return (
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                                            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800">Certificate uploaded — pending admin review</p>
                                                <p className="text-xs text-amber-600 mt-0.5">
                                                    You can replace the file below if there was an error with your submission.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (status === 'PROVISIONAL') {
                                    return (
                                        <div className="flex items-start gap-3 px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                                            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-800">Certificate required for full verification</p>
                                                <p className="text-xs text-blue-600 mt-0.5">
                                                    Your store is currently live with a daily order cap. Upload your Canadian food handling certificate below to get fully verified and lift the cap.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex items-start gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                                        <Info className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-500">
                                            Once your store is provisionally approved, you can upload your food handling certificate here to get fully verified.
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* ── Existing cert summary ── */}
                            {profile?.foodHandlingCertUrl && (
                                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="text-sm font-medium text-gray-700 truncate">Current certificate</span>
                                        </div>
                                        <a href={profile.foodHandlingCertUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline shrink-0">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View
                                        </a>
                                    </div>
                                    {profile.foodHandlingCertNumber && (
                                        <div className="px-4 py-2 flex justify-between text-xs">
                                            <span className="text-gray-500">Cert number</span>
                                            <span className="font-mono text-gray-800">{profile.foodHandlingCertNumber}</span>
                                        </div>
                                    )}
                                    {profile.foodHandlingCertIssuingBody && (
                                        <div className="px-4 py-2 flex justify-between text-xs">
                                            <span className="text-gray-500">Issued by</span>
                                            <span className="font-medium text-gray-800">{profile.foodHandlingCertIssuingBody}</span>
                                        </div>
                                    )}
                                    {profile.foodHandlingCertExpiry && (
                                        <div className="px-4 py-2 flex justify-between text-xs">
                                            <span className="text-gray-500">Expiry</span>
                                            <span className={`font-medium ${profile.certExpired ? 'text-red-600' : 'text-gray-800'}`}>
                                                {new Date(profile.foodHandlingCertExpiry).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                {profile.certExpired && <span className="ml-1 text-xs font-bold">(EXPIRED)</span>}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Upload form ── only shown for PROVISIONAL vendors (or to replace an expired cert) ── */}
                            {(profile?.vendorStatus === 'PROVISIONAL' || profile?.certExpired) && (
                                <div className="space-y-4 pt-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {profile?.foodHandlingCertUrl ? 'Replace certificate' : 'Upload certificate'}
                                    </p>

                                    {/* File picker */}
                                    <div>
                                        <Label required>Certificate file</Label>
                                        <label className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                className="sr-only"
                                                onChange={e => {
                                                    setCertFile(e.target.files?.[0] ?? null);
                                                    if (certErrors.certFile) setCertErrors(p => { const n = {...p}; delete n.certFile; return n; });
                                                }}
                                            />
                                            {certFile ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-700 px-4 text-center">
                                                    <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                                    <span className="truncate max-w-[220px]">{certFile.name}</span>
                                                    <button type="button" onClick={e => { e.preventDefault(); setCertFile(null); }}
                                                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-400" />
                                                    <span className="text-xs text-gray-500 text-center px-4">
                                                        Click to select · PDF, JPG, PNG · max 10 MB
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                        {certErrors.certFile && <FieldError msg={certErrors.certFile} />}
                                    </div>

                                    {/* Cert number */}
                                    <div>
                                        <Label required>Certificate number</Label>
                                        <input
                                            type="text"
                                            placeholder="e.g. FS-2024-00123"
                                            value={certNumber}
                                            onChange={e => {
                                                setCertNumber(e.target.value);
                                                if (certErrors.certNumber) setCertErrors(p => { const n = {...p}; delete n.certNumber; return n; });
                                            }}
                                            className={certErrors.certNumber ? INPUT_ERR_CLS : `${INPUT_CLS} border-gray-200`}
                                        />
                                        {certErrors.certNumber && <FieldError msg={certErrors.certNumber} />}
                                    </div>

                                    {/* Issuing body */}
                                    <div>
                                        <Label required>Issuing body</Label>
                                        <input
                                            type="text"
                                            placeholder="e.g. FoodSafe BC, Manitoba Food Handler, CFIA"
                                            value={certIssuingBody}
                                            onChange={e => {
                                                setCertIssuingBody(e.target.value);
                                                if (certErrors.certIssuingBody) setCertErrors(p => { const n = {...p}; delete n.certIssuingBody; return n; });
                                            }}
                                            className={certErrors.certIssuingBody ? INPUT_ERR_CLS : `${INPUT_CLS} border-gray-200`}
                                        />
                                        {certErrors.certIssuingBody && <FieldError msg={certErrors.certIssuingBody} />}
                                    </div>

                                    {/* Expiry date */}
                                    <div>
                                        <Label>Certificate expiry date</Label>
                                        <input
                                            type="date"
                                            value={certExpiry}
                                            onChange={e => setCertExpiry(e.target.value)}
                                            className={`${INPUT_CLS} border-gray-200`}
                                            style={{ colorScheme: 'light' }}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Most Canadian food handler certs expire after 5 years.</p>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <button
                                            onClick={handleCertUpload}
                                            disabled={uploadingCert}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 w-full sm:w-auto"
                                        >
                                            {uploadingCert
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                                                : <><Upload className="w-4 h-4" /> Submit Certificate</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                            {/* Info banner */}
                            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Images save immediately — no separate Save button needed.
                                    Your logo appears in search results; the banner is shown at the top of your store page.
                                </p>
                            </div>

                            {/* Logo */}
                            <section className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">Store Logo</p>
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
                                    cropAspect={1}
                                    cropLabel="Store Logo"
                                />
                            </section>

                            <div className="border-t border-gray-100" />

                            {/* Banner */}
                            <section className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">Store Banner</p>
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
                                    cropAspect={16 / 9}
                                    cropLabel="Store Banner"
                                />
                            </section>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
