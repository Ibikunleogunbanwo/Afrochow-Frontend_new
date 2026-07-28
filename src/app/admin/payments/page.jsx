'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    CreditCard, LayoutDashboard, ChevronRight, Search, RefreshCw,
    Clock, CheckCircle, XCircle, Receipt, Ban, AlertCircle, Loader2, X, Eye,
} from 'lucide-react';
import { AdminPaymentsAPI } from '@/lib/api/admin.api';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';

/* ─── status config ─────────────────────────────────────────────────────── */
// Values must match the backend PaymentStatus enum exactly (6 values):
// PENDING | AUTHORIZED | COMPLETED | FAILED | REFUNDED | CANCELLED
const STATUS_META = {
    PENDING:    { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock },
    AUTHORIZED: { label: 'Authorized', cls: 'bg-blue-100   text-blue-700   border-blue-200',   Icon: CheckCircle },
    COMPLETED:  { label: 'Completed',  cls: 'bg-green-100  text-green-700  border-green-200',  Icon: CheckCircle },
    FAILED:     { label: 'Failed',     cls: 'bg-red-100    text-red-700    border-red-200',    Icon: XCircle },
    REFUNDED:   { label: 'Refunded',   cls: 'bg-purple-100 text-purple-700 border-purple-200', Icon: Receipt },
    CANCELLED:  { label: 'Cancelled',  cls: 'bg-gray-100   text-gray-600   border-gray-200',   Icon: Ban },
};

const TAB_META = {
    ALL:        { label: 'All',        Icon: null,        activeBg: '#111827', activeText: '#fff', inactiveText: '#6b7280' },
    PENDING:    { label: 'Pending',    Icon: Clock,       activeBg: '#d97706', activeText: '#fff', inactiveText: '#b45309' },
    AUTHORIZED: { label: 'Authorized', Icon: CheckCircle, activeBg: '#2563eb', activeText: '#fff', inactiveText: '#1d4ed8' },
    COMPLETED:  { label: 'Completed',  Icon: CheckCircle, activeBg: '#15803d', activeText: '#fff', inactiveText: '#166534' },
    FAILED:     { label: 'Failed',     Icon: XCircle,     activeBg: '#dc2626', activeText: '#fff', inactiveText: '#b91c1c' },
    REFUNDED:   { label: 'Refunded',   Icon: Receipt,     activeBg: '#7c3aed', activeText: '#fff', inactiveText: '#6d28d9' },
    CANCELLED:  { label: 'Cancelled',  Icon: Ban,         activeBg: '#4b5563', activeText: '#fff', inactiveText: '#374151' },
};

// Includes every PaymentStatus value — a tab/stat-card omission here previously
// caused Total to silently outnumber the sum of the visible buckets (CANCELLED
// payments counted toward Total but had no card or filter of their own).
const STATUS_TABS = ['ALL', 'PENDING', 'AUTHORIZED', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'];
const REFUNDABLE_STATUSES = new Set(['AUTHORIZED', 'COMPLETED']);
const PAGE_SIZE = 15;

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Clock };
    const { Icon } = meta;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.cls}`}>
            <Icon className="w-3 h-3" />
            {meta.label}
        </span>
    );
};

const fmt$ = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

/* ─── Detail modal ──────────────────────────────────────────────────────── */
const PaymentDetailModal = ({ payment, onClose, onRefund, refunding }) => {
    if (!payment) return null;
    const canRefund = REFUNDABLE_STATUSES.has(payment.status);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-gray-900">Payment Details</h2>
                        <StatusBadge status={payment.status} />
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <Link href={`/admin/orders`} className="font-mono font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                            {payment.publicOrderId}
                        </Link>
                        {payment.paymentTime && <span>{formatDateTime(payment.paymentTime)}</span>}
                    </div>

                    <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount breakdown</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total charged</span>
                            <span className="font-bold text-gray-900">{fmt$(payment.amount)}</span>
                        </div>
                        {payment.platformFeeAmount != null && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Platform fee</span>
                                <span className="text-gray-700">{fmt$(payment.platformFeeAmount)}</span>
                            </div>
                        )}
                        {payment.vendorPayout != null && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Vendor payout</span>
                                <span className="text-gray-700">{fmt$(payment.vendorPayout)}</span>
                            </div>
                        )}
                    </section>

                    <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Card &amp; transaction</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-gray-400">Method</p>
                                <p className="font-semibold text-gray-700 mt-0.5">
                                    {payment.cardBrand ? `${payment.cardBrand.toUpperCase()} •••• ${payment.maskedCardNumber ?? ''}` : (payment.paymentMethod ?? '—')}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400">Transaction ID</p>
                                <p className="font-mono font-medium text-gray-700 mt-0.5 break-all">{payment.transactionId ?? '—'}</p>
                            </div>
                        </div>
                        {payment.notes && (
                            <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mt-2">{payment.notes}</p>
                        )}
                    </section>

                    <section className="bg-gray-50 rounded-xl px-4 py-1">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-3 mb-1">Timeline</h3>
                        {[
                            ['Completed', payment.completedAt],
                            ['Failed', payment.failedAt],
                            ['Refunded', payment.refundedAt],
                        ].filter(([, ts]) => ts).map(([label, ts]) => (
                            <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                                <span className="text-gray-500">{label}</span>
                                <span className="font-medium text-gray-700">{formatDateTime(ts)}</span>
                            </div>
                        ))}
                    </section>

                    {canRefund && (
                        <button
                            onClick={onRefund}
                            disabled={refunding}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {refunding
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Refunding…</>
                                : <><Receipt className="w-4 h-4" /> Refund payment</>
                            }
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── main page ─────────────────────────────────────────────────────────── */
const EMPTY_STATS = { total: 0, pending: 0, authorized: 0, completed: 0, failed: 0, refunded: 0, cancelled: 0 };

export default function AdminPaymentsPage() {
    const [payments, setPayments]         = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch]             = useState('');
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const router       = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page') ?? 1)));
    const goToPage = (p) => {
        setPage(p);
        const params = new URLSearchParams(window.location.search);
        params.set('page', String(p));
        router.replace('?' + params.toString(), { scroll: false });
    };

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [refunding, setRefunding]             = useState(false);

    // Stat cards and tab badge counts come from a dedicated backend endpoint
    // that aggregates over EVERY payment, independent of whatever status
    // filter is currently selected. Previously these counts were computed
    // from the `payments` list itself — but that list only ever holds the
    // currently-filtered subset (getAll/getFailed/getByStatus below), so
    // e.g. selecting "Pending" made every other card/badge silently read 0.
    const [stats, setStats] = useState(EMPTY_STATS);

    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminPaymentsAPI.getStats();
            const data = res?.data ?? res ?? null;
            if (data) setStats(data);
        } catch {
            // Non-fatal — cards just keep their last known values.
        }
    }, []);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (statusFilter === 'ALL')          res = await AdminPaymentsAPI.getAll();
            else if (statusFilter === 'FAILED')  res = await AdminPaymentsAPI.getFailed();
            else                                 res = await AdminPaymentsAPI.getByStatus(statusFilter);
            const data = res?.data ?? res ?? [];
            setPayments(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const refreshAll = () => { fetchPayments(); fetchStats(); };

    const handleRefund = async () => {
        if (!selectedPayment) return;
        if (!confirm(`Refund payment for order ${selectedPayment.publicOrderId}? This cannot be undone.`)) return;
        setRefunding(true);
        try {
            const res = await AdminPaymentsAPI.refund(selectedPayment.publicOrderId);
            const updated = res?.data ?? res;
            setSelectedPayment(updated);
            await Promise.all([fetchPayments(), fetchStats()]);
            toast.success('Payment Refunded', { description: `Order ${selectedPayment.publicOrderId} has been refunded.` });
        } catch (e) {
            toast.error('Refund Failed', { description: e.message || 'Failed to refund payment' });
        } finally {
            setRefunding(false);
        }
    };

    const filtered = payments.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.publicOrderId?.toLowerCase().includes(q) ||
            p.transactionId?.toLowerCase().includes(q)
        );
    });

    const statCounts = {
        total:     stats.total,
        pending:   stats.pending,
        failed:    stats.failed,
        completed: stats.completed + stats.authorized,
        refunded:  stats.refunded,
        cancelled: stats.cancelled,
    };

    return (
        <div className="space-y-6">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Payments</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Payment Management</h1>
                    <p className="text-gray-500 mt-1">View, track, and refund platform payments</p>
                </div>
                <button
                    onClick={refreshAll}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                {[
                    { label: 'Total',     value: statCounts.total,     filter: 'ALL' },
                    { label: 'Pending',   value: statCounts.pending,   filter: 'PENDING' },
                    { label: 'Completed', value: statCounts.completed, filter: 'COMPLETED' },
                    { label: 'Failed',    value: statCounts.failed,    filter: 'FAILED' },
                    { label: 'Refunded',  value: statCounts.refunded,  filter: 'REFUNDED' },
                    { label: 'Cancelled', value: statCounts.cancelled, filter: 'CANCELLED' },
                ].map(s => (
                    <button
                        key={s.label}
                        onClick={() => { setStatusFilter(s.filter); goToPage(1); }}
                        className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all hover:shadow-md ${
                            statusFilter === s.filter && s.filter !== 'ALL' ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                        }`}
                    >
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID or transaction ID…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); goToPage(1); }}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-nowrap overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {STATUS_TABS.map(s => {
                            const meta     = TAB_META[s] ?? TAB_META.ALL;
                            const Icon     = meta.Icon;
                            const isActive = statusFilter === s;
                            // Same stats-endpoint source as the cards above — not derived
                            // from `payments`, which only holds the active filter's subset.
                            const count    = {
                                ALL:        stats.total,
                                PENDING:    stats.pending,
                                AUTHORIZED: stats.authorized,
                                COMPLETED:  stats.completed,
                                FAILED:     stats.failed,
                                REFUNDED:   stats.refunded,
                                CANCELLED:  stats.cancelled,
                            }[s] ?? 0;

                            return (
                                <motion.button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); goToPage(1); }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    animate={{
                                        backgroundColor: isActive ? meta.activeBg : 'transparent',
                                        color:           isActive ? meta.activeText : meta.inactiveText,
                                        boxShadow:       isActive ? '0 4px 14px 0 rgba(0,0,0,0.18)' : '0 0 0 0 transparent',
                                    }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap focus:outline-none"
                                    style={{ color: isActive ? meta.activeText : meta.inactiveText }}
                                >
                                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                                    {meta.label}
                                    {count > 0 && (
                                        <motion.span
                                            animate={{
                                                backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
                                                color:           isActive ? '#fff' : '#6b7280',
                                            }}
                                            transition={{ duration: 0.18 }}
                                            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                                        >
                                            {count}
                                        </motion.span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading payments…</span>
                    </div>
                ) : error ? (
                    <AdminPageError error={error} onRetry={fetchPayments} />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <CreditCard className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No payments found</p>
                    </div>
                ) : (
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Order',       className: 'flex-1 min-w-[200px]' },
                            { label: 'Amount',      className: 'w-28 shrink-0' },
                            { label: 'Method',      className: 'w-32 shrink-0' },
                            { label: 'Status',      className: 'w-32 shrink-0' },
                            { label: '',            className: 'w-20 shrink-0' },
                        ]} />
                        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(p => (
                            <AdminTableRow
                                key={p.publicOrderId + (p.transactionId ?? '')}
                                onClick={() => setSelectedPayment(p)}
                                className="group"
                            >
                                <div className="flex-1 md:min-w-[200px] overflow-hidden">
                                    <p className="font-bold text-gray-900 font-mono text-xs">{p.publicOrderId}</p>
                                    {p.paymentTime && (
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(p.paymentTime)}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:contents">
                                    <div className="md:w-28 md:shrink-0 font-bold text-gray-900 text-sm">
                                        {fmt$(p.amount)}
                                    </div>
                                    <div className="hidden md:block md:w-32 md:shrink-0 text-xs text-gray-600">
                                        {p.cardBrand ? `${p.cardBrand.toUpperCase()} •••• ${p.maskedCardNumber ?? ''}` : (p.paymentMethod ?? '—')}
                                    </div>
                                    <div className="md:w-32 md:shrink-0">
                                        <StatusBadge status={p.status} />
                                    </div>
                                </div>

                                <div className="md:w-20 md:shrink-0 flex md:justify-end">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                                        <Eye className="w-3.5 h-3.5" />
                                        View
                                    </span>
                                </div>
                            </AdminTableRow>
                        ))}
                    </AdminTableRoot>
                )}
                <Pagination
                    page={page}
                    totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                    totalItems={filtered.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={goToPage}
                />
            </div>

            {selectedPayment && (
                <PaymentDetailModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onRefund={handleRefund}
                    refunding={refunding}
                />
            )}
        </div>
    );
}
