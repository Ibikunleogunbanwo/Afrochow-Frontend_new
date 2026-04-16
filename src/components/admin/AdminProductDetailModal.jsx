"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    X, Package, Store, Tag, DollarSign, Eye, EyeOff,
    Trash2, Star, Loader2, ExternalLink, CheckCircle2,
    XCircle, AlertCircle, ShieldAlert,
} from "lucide-react";
import { AdminProductsAPI } from "@/lib/api/admin.api";
import { toast } from "@/components/ui/toast";
import { useSelector } from "react-redux";
import { selectUserRole } from "@/redux-store/authSlice";
import { formatDateTime } from "@/lib/utils/dateUtils";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const fmt$ = (n) =>
    n != null ? `CA$${Number(n).toFixed(2)}` : "—";

const Tag_ = ({ children, colour = "gray" }) => {
    const map = {
        green:  "bg-green-50 text-green-700 border-green-200",
        red:    "bg-red-50 text-red-700 border-red-200",
        amber:  "bg-amber-50 text-amber-700 border-amber-200",
        gray:   "bg-gray-100 text-gray-500 border-gray-200",
        blue:   "bg-blue-50 text-blue-700 border-blue-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[colour] ?? map.gray}`}>
            {children}
        </span>
    );
};

const Field = ({ label, children }) => (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-gray-900 font-medium">{children ?? "—"}</div>
    </div>
);

/* ─── main component ────────────────────────────────────────────────────────── */
/**
 * Admin product detail modal.
 *
 * Props:
 *   product     – AdminProductSummary object from the products list
 *   onClose     – called when the modal should close
 *   onMutated   – called after any mutation (hide, delete, feature toggle) so the
 *                 parent can refresh its list
 */
export default function AdminProductDetailModal({ product, onClose, onMutated }) {
    const currentRole = useSelector(selectUserRole);
    const isSuperAdmin = currentRole === "SUPERADMIN";

    const [busy, setBusy]             = useState({});  // { toggle, hide, delete }
    const [localProduct, setLocal]    = useState(product);
    const [confirmDelete, setConfirm] = useState(false);

    // Sync when parent pushes a new product prop
    useEffect(() => { setLocal(product); setConfirm(false); }, [product]);

    // Close on Escape
    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    if (!product) return null;

    const id = localProduct.publicProductId;

    /* ── actions ── */
    const withBusy = async (key, fn) => {
        setBusy(p => ({ ...p, [key]: true }));
        try { await fn(); }
        finally { setBusy(p => ({ ...p, [key]: false })); }
    };

    const handleToggleFeature = () => withBusy("feature", async () => {
        const res = await AdminProductsAPI.toggleFeature(id);
        const updated = res?.data ?? res;
        setLocal(prev => ({ ...prev, isFeatured: updated?.isFeatured ?? !prev.isFeatured }));
        toast.success(localProduct.isFeatured ? "Removed from featured" : "Added to featured");
        onMutated?.();
    });

    const handleToggleVisibility = () => withBusy("hide", async () => {
        const res = await AdminProductsAPI.toggleVisibility(id);
        const updated = res?.data ?? res;
        const nowVisible = updated?.adminVisible ?? (localProduct.adminVisible === false);
        setLocal(prev => ({ ...prev, adminVisible: nowVisible }));
        toast.success(nowVisible ? "Product reinstated — visible to customers" : "Product suspended — hidden from customers");
        onMutated?.();
    });

    const handleDelete = () => withBusy("delete", async () => {
        await AdminProductsAPI.deleteProduct(id);
        toast.success("Product permanently deleted");
        onMutated?.();
        onClose();
    });

    const anythingBusy = Object.values(busy).some(Boolean);

    /* ── render ── */
    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* ── Header ── */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {localProduct.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={localProduct.imageUrl}
                                alt={localProduct.name}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-black text-gray-900 leading-snug truncate">
                                {localProduct.name}
                            </h2>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {id?.slice(-12).toUpperCase()}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <Tag_ colour={localProduct.adminVisible !== false ? "green" : "red"}>
                                    {localProduct.adminVisible !== false ? "Platform Visible" : "Suspended"}
                                </Tag_>
                                <Tag_ colour={localProduct.available !== false ? "green" : "gray"}>
                                    {localProduct.available !== false ? "Vendor Active" : "Vendor Paused"}
                                </Tag_>
                                {localProduct.isFeatured && (
                                    <Tag_ colour="amber">⭐ Featured</Tag_>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors ml-2 shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

                    {/* Details */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Product Details
                        </p>
                        <div className="bg-gray-50 rounded-xl px-4 divide-y divide-gray-100">
                            <Field label="Price">
                                <span className="text-gray-900 font-bold">{fmt$(localProduct.price)}</span>
                            </Field>
                            <Field label="Category">
                                {localProduct.categoryName ? (
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                                        {localProduct.categoryName}
                                    </span>
                                ) : "—"}
                            </Field>
                            <Field label="Vendor / Store">
                                {localProduct.vendorName ? (
                                    <span className="flex items-center gap-1.5">
                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                        {localProduct.vendorName}
                                    </span>
                                ) : "—"}
                            </Field>
                            {localProduct.featuredAt && (
                                <Field label="Featured Since">
                                    {formatDateTime(localProduct.featuredAt)}
                                </Field>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Admin Actions
                        </p>
                        <div className="space-y-2.5">

                            {/* Toggle featured */}
                            <button
                                onClick={handleToggleFeature}
                                disabled={anythingBusy}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                                    localProduct.isFeatured
                                        ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                                        : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                            >
                                {busy.feature ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
                                ) : (
                                    <Star className={`w-4 h-4 shrink-0 ${localProduct.isFeatured ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {localProduct.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {localProduct.isFeatured
                                            ? "Product will no longer appear in the featured section"
                                            : "Product will be highlighted in the featured section"}
                                    </p>
                                </div>
                            </button>

                            {/* Toggle visibility */}
                            <button
                                onClick={handleToggleVisibility}
                                disabled={anythingBusy}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                                    localProduct.adminVisible !== false
                                        ? "border-gray-200 bg-white hover:bg-red-50 hover:border-red-200"
                                        : "border-green-200 bg-green-50 hover:bg-green-100"
                                }`}
                            >
                                {busy.hide ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
                                ) : localProduct.adminVisible !== false ? (
                                    <EyeOff className="w-4 h-4 text-gray-500 shrink-0" />
                                ) : (
                                    <Eye className="w-4 h-4 text-green-600 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {localProduct.adminVisible !== false ? "Suspend Product" : "Reinstate Product"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {localProduct.adminVisible !== false
                                            ? "Platform suspension — vendor cannot override this"
                                            : "Restore product visibility across the platform"}
                                    </p>
                                </div>
                            </button>

                            {/* View vendor detail page */}
                            {localProduct.publicVendorId && (
                                <Link
                                    href={`/admin/users/${localProduct.publicVendorId}`}
                                    onClick={onClose}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">View Vendor</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Open {localProduct.vendorName ?? "this vendor"}&apos;s profile in admin
                                        </p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Danger zone — SUPERADMIN only */}
                    {isSuperAdmin && (
                        <div>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5" /> Danger Zone
                            </p>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                {confirmDelete ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-800 font-medium">
                                                This will <strong>permanently delete</strong> &ldquo;{localProduct.name}&rdquo;.
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirm(false)}
                                                disabled={busy.delete}
                                                className="flex-1 h-9 text-sm font-semibold border border-gray-200 text-gray-700 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={busy.delete}
                                                className="flex-1 h-9 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {busy.delete
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <><Trash2 className="w-4 h-4" /> Yes, delete permanently</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-red-800">Delete Product</p>
                                            <p className="text-xs text-red-600 mt-0.5">
                                                Permanently removes the product and all its data. Use &ldquo;Hide&rdquo; if you only want to remove it temporarily.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setConfirm(true)}
                                            disabled={anythingBusy}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 border border-red-300 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
