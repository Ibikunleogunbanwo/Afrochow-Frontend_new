"use client";

import { useState, useEffect } from "react";
import {
    X, Store, User, MapPin, Clock, Truck, ShoppingBag,
    CheckCircle2, XCircle, Shield, Phone, Mail,
    Globe, Timer, DollarSign, Package, Navigation,
    Image as ImageIcon, FileText, Loader2, AlertCircle,
    ExternalLink,
} from "lucide-react";
import { AdminVendorsAPI } from "@/lib/api/admin.api";

/* ─── helpers ──────────────────────────────────────────────────────────── */
const val = (v, fallback = "—") => (v != null && v !== "" ? v : fallback);
const fmt$ = (n) => (n != null ? `$${Number(n).toFixed(2)}` : "—");
const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

const DAYS = [
    { key: "monday",    label: "Monday"    },
    { key: "tuesday",   label: "Tuesday"   },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday",  label: "Thursday"  },
    { key: "friday",    label: "Friday"    },
    { key: "saturday",  label: "Saturday"  },
    { key: "sunday",    label: "Sunday"    },
];

const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const dh   = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${dh}:${m} ${ampm}`;
};

/* ─── sub-components ───────────────────────────────────────────────────── */
const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const Field = ({ label, value, mono = false, children }) => (
    <div className="py-2 flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {children ?? (
            <span className={`text-sm text-gray-900 font-medium break-words ${mono ? "font-mono" : ""}`}>
                {val(value)}
            </span>
        )}
    </div>
);

const Grid2 = ({ children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">{children}</div>
);

/* ─── main component ───────────────────────────────────────────────────── */
export default function VendorReviewModal({ vendor, onClose, onApprove, onReject }) {
    const [detail, setDetail]           = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [fetchError, setFetchError]   = useState(null);

    const [approving, setApproving]     = useState(false);
    const [rejecting, setRejecting]     = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject'
    const [actionError, setActionError] = useState(null);

    /* ── fetch full detail on open ── */
    useEffect(() => {
        if (!vendor?.publicVendorId) return;
        setLoadingDetail(true);
        setFetchError(null);
        AdminVendorsAPI.getById(vendor.publicVendorId)
            .then((res) => {
                const d = res?.data ?? res;
                setDetail(d);
            })
            .catch((e) => {
                setFetchError(e.message || "Could not load vendor details");
                // Fall back to summary data so the modal isn't completely empty
                setDetail(vendor);
            })
            .finally(() => setLoadingDetail(false));
    }, [vendor?.publicVendorId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!vendor) return null;

    // Use detailed data when available, otherwise fall back to summary
    const d = detail ?? vendor;

    const busy = approving || rejecting;

    // Operating hours: from detail endpoint it's a flat map on `d.operatingHours`
    const ops = d.operatingHours ?? {};

    /* ── actions ── */
    const handleApprove = async () => {
        setApproving(true);
        setActionError(null);
        try {
            await AdminVendorsAPI.verify(vendor.publicVendorId);
            onApprove?.(vendor);
            onClose();
        } catch (e) {
            setActionError(e.message || "Failed to approve vendor");
        } finally {
            setApproving(false);
            setConfirmAction(null);
        }
    };

    const handleReject = async () => {
        setRejecting(true);
        setActionError(null);
        try {
            await AdminVendorsAPI.deactivate(vendor.publicVendorId);
            onReject?.(vendor);
            onClose();
        } catch (e) {
            setActionError(e.message || "Failed to reject vendor");
        } finally {
            setRejecting(false);
            setConfirmAction(null);
        }
    };

    const doAction = confirmAction === "approve" ? handleApprove : handleReject;

    /* ── render ── */
    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {d.logoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={d.logoUrl}
                                alt={d.restaurantName}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                <Store className="w-5 h-5 text-orange-600" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 truncate">
                                {val(d.restaurantName, "Unnamed Vendor")}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                    <AlertCircle className="w-3 h-3" />
                                    Pending Approval
                                </span>
                                <span className="text-xs text-gray-400">Applied {fmtDate(d.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ml-2 shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-1 px-6 py-5">

                    {/* Loading skeleton */}
                    {loadingDetail && (
                        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            <span className="text-sm font-medium">Loading vendor details…</span>
                        </div>
                    )}

                    {/* Fetch error banner (non-fatal — falls back to summary data) */}
                    {!loadingDetail && fetchError && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-4">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Some details could not be loaded. Showing available information.
                        </div>
                    )}

                    {!loadingDetail && (
                        <>
                            {/* ── Store Info ── */}
                            <Section icon={Store} title="Store Information">
                                <Grid2>
                                    <Field label="Store Name"    value={d.restaurantName} />
                                    <Field label="Product Type"  value={d.cuisineType} />
                                </Grid2>
                                {d.description && (
                                    <Field label="Description">
                                        <p className="text-sm text-gray-700 leading-relaxed">{d.description}</p>
                                    </Field>
                                )}
                            </Section>

                            {/* ── Owner Info ── */}
                            <Section icon={User} title="Owner / Account">
                                <Grid2>
                                    <Field label="First Name" value={d.firstName} />
                                    <Field label="Last Name"  value={d.lastName} />
                                    <Field label="Email">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-sm text-gray-900 font-medium break-all">
                                                {val(d.email)}
                                            </span>
                                        </div>
                                    </Field>
                                    <Field label="Phone">
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-sm text-gray-900 font-medium">{val(d.phone)}</span>
                                        </div>
                                    </Field>
                                </Grid2>
                            </Section>

                            {/* ── Business Verification ── */}
                            <Section icon={Shield} title="Business Verification">
                                <Grid2>
                                    <Field label="Business / Tax ID">
                                        {d.taxId ? (
                                            <span className="text-sm font-mono text-gray-900">{d.taxId}</span>
                                        ) : (
                                            <span className="text-xs text-amber-600 font-semibold">Not provided</span>
                                        )}
                                    </Field>
                                    <Field label="Business License">
                                        {d.businessLicenseUrl ? (
                                            <a
                                                href={d.businessLicenseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-orange-600 font-semibold hover:underline"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                View Document
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-amber-600 font-semibold">Not provided</span>
                                        )}
                                    </Field>
                                </Grid2>
                            </Section>

                            {/* ── Business Address ── */}
                            <Section icon={MapPin} title="Business Address">
                                {(d.addressLine || d.city || d.province) ? (
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{val(d.addressLine)}</p>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    {[d.city, d.province, d.postalCode].filter(Boolean).join(", ")}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                                                    <span className="text-xs text-gray-500">{val(d.country, "Canada")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No address provided</p>
                                )}
                            </Section>

                            {/* ── Operations ── */}
                            <Section icon={Clock} title="Business Operations">

                                {/* Services */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className={`flex items-center gap-2 p-3 rounded-xl border-2 ${
                                        d.offersDelivery ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                                    }`}>
                                        <Truck className={`w-4 h-4 shrink-0 ${d.offersDelivery ? "text-orange-600" : "text-gray-300"}`} />
                                        <span className="text-sm font-semibold text-gray-800">Delivery</span>
                                        {d.offersDelivery
                                            ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                                            : <XCircle className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                        }
                                    </div>
                                    <div className={`flex items-center gap-2 p-3 rounded-xl border-2 ${
                                        d.offersPickup ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                                    }`}>
                                        <ShoppingBag className={`w-4 h-4 shrink-0 ${d.offersPickup ? "text-green-600" : "text-gray-300"}`} />
                                        <span className="text-sm font-semibold text-gray-800">Pickup</span>
                                        {d.offersPickup
                                            ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                                            : <XCircle className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                        }
                                    </div>
                                </div>

                                {/* Prep time + delivery settings */}
                                <Grid2>
                                    {d.preparationTime != null && (
                                        <Field label="Preparation Time">
                                            <div className="flex items-center gap-1.5">
                                                <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-sm font-semibold text-amber-800">{d.preparationTime} minutes</span>
                                            </div>
                                        </Field>
                                    )}
                                    {d.offersDelivery && d.deliveryFee != null && (
                                        <Field label="Delivery Fee">
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900">{fmt$(d.deliveryFee)}</span>
                                            </div>
                                        </Field>
                                    )}
                                    {d.offersDelivery && d.minimumOrderAmount != null && (
                                        <Field label="Minimum Order">
                                            <div className="flex items-center gap-1.5">
                                                <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900">{fmt$(d.minimumOrderAmount)}</span>
                                            </div>
                                        </Field>
                                    )}
                                    {d.offersDelivery && d.estimatedDeliveryMinutes != null && (
                                        <Field label="Estimated Delivery">
                                            <div className="flex items-center gap-1.5">
                                                <Timer className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900">{d.estimatedDeliveryMinutes} min</span>
                                            </div>
                                        </Field>
                                    )}
                                    {d.offersDelivery && d.maxDeliveryDistanceKm != null && (
                                        <Field label="Delivery Radius">
                                            <div className="flex items-center gap-1.5">
                                                <Navigation className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900">{d.maxDeliveryDistanceKm} km</span>
                                            </div>
                                        </Field>
                                    )}
                                </Grid2>

                                {/* Operating Hours */}
                                {Object.keys(ops).length > 0 && (
                                    <Field label="Weekly Schedule">
                                        <div className="mt-1 rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                            {DAYS.map(({ key, label }) => {
                                                const day = ops[key];
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                                                            day?.isOpen ? "bg-green-50" : "bg-white"
                                                        }`}
                                                    >
                                                        <span className="font-medium text-gray-800 w-28">{label}</span>
                                                        {day?.isOpen ? (
                                                            <span className="text-xs text-gray-600 font-medium tabular-nums">
                                                                {fmtTime(day.openTime)} – {fmtTime(day.closeTime)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Closed</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                )}
                            </Section>

                            {/* ── Branding ── */}
                            {(d.logoUrl || d.bannerUrl) && (
                                <Section icon={ImageIcon} title="Branding &amp; Media">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {d.logoUrl && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Logo</p>
                                                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={d.logoUrl} alt="Logo" className="w-full h-36 object-cover" />
                                                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {d.bannerUrl && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Banner</p>
                                                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={d.bannerUrl} alt="Banner" className="w-full h-36 object-cover" />
                                                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            )}
                        </>
                    )}

                    {/* Action error */}
                    {actionError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {actionError}
                        </div>
                    )}

                </div>

                {/* ── Footer actions ── */}
                <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                    {confirmAction ? (
                        /* Confirmation step */
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-900 text-center">
                                {confirmAction === "approve"
                                    ? `Approve ${d.restaurantName || "this vendor"}?`
                                    : `Reject ${d.restaurantName || "this vendor"}?`}
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                                {confirmAction === "approve"
                                    ? "The vendor will be verified and able to receive orders immediately."
                                    : "The vendor's account will be deactivated. This can be reversed later."}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    disabled={busy}
                                    className="flex-1 h-10 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={doAction}
                                    disabled={busy}
                                    className={`flex-1 h-10 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
                                        confirmAction === "approve"
                                            ? "bg-gray-900 hover:bg-gray-800"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {busy ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : confirmAction === "approve" ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Confirm Approve</>
                                    ) : (
                                        <><XCircle className="w-4 h-4" /> Confirm Reject</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Primary action buttons */
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setConfirmAction("reject")}
                                disabled={busy || loadingDetail}
                                className="flex-1 h-11 flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject Vendor
                            </button>
                            <button
                                onClick={() => setConfirmAction("approve")}
                                disabled={busy || loadingDetail}
                                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve Vendor
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
