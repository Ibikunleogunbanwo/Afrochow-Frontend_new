'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, UserPlus, User, Mail, Phone,
    Lock, Eye, EyeOff, Building2, Shield, AlertCircle, CheckCircle,
    RefreshCw, Image as ImageIcon, X,
} from 'lucide-react';
import { RegistrationAPI } from '@/lib/api/registration.api';
import { ImageUploadAPI } from '@/lib/api/imageUpload';

/* ─── constants ─────────────────────────────────────────────────────────── */
const DEPARTMENTS = [
    { value: 'OPERATIONS',       label: 'Operations' },
    { value: 'FINANCE',          label: 'Finance' },
    { value: 'SUPPORT',          label: 'Customer Support' },
    { value: 'MARKETING',        label: 'Marketing' },
    { value: 'TECHNOLOGY',       label: 'Technology' },
    { value: 'COMPLIANCE',       label: 'Compliance' },
    { value: 'LEGAL',            label: 'Legal' },
];

const ACCESS_LEVELS = [
    { value: 'MODERATOR',   label: 'Moderator',   desc: 'Review content only' },
    { value: 'MANAGER',     label: 'Manager',     desc: 'Manage vendors and users' },
    { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full system access' },
];

const PERMISSIONS = [
    { key: 'canVerifyVendors',    label: 'Verify Vendors',    desc: 'Approve and verify vendor registrations' },
    { key: 'canManageUsers',      label: 'Manage Users',      desc: 'Activate, suspend, and manage user accounts' },
    { key: 'canViewReports',      label: 'View Reports',      desc: 'Access platform analytics and reports' },
    { key: 'canManagePayments',   label: 'Manage Payments',   desc: 'View and process payment records' },
    { key: 'canManageCategories', label: 'Manage Categories', desc: 'Create and update food categories' },
    { key: 'canResolveDisputes',  label: 'Resolve Disputes',  desc: 'Handle customer and vendor disputes' },
];

const PERMISSION_PRESETS = {
    MODERATOR:   { canVerifyVendors: false, canManageUsers: false, canViewReports: true,  canManagePayments: false, canManageCategories: false, canResolveDisputes: true  },
    MANAGER:     { canVerifyVendors: true,  canManageUsers: true,  canViewReports: true,  canManagePayments: false, canManageCategories: true,  canResolveDisputes: true  },
    SUPER_ADMIN: { canVerifyVendors: true,  canManageUsers: true,  canViewReports: true,  canManagePayments: true,  canManageCategories: true,  canResolveDisputes: true  },
};

const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    department: '', accessLevel: '',
    canVerifyVendors: false, canManageUsers: false, canViewReports: false,
    canManagePayments: false, canManageCategories: false, canResolveDisputes: false,
};

/* ─── small components ───────────────────────────────────────────────────── */
const Field = ({ label, error, children, required }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {error && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />{error}
            </p>
        )}
    </div>
);

const inputCls = (error) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
        error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 hover:border-gray-300'
    }`;

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function AdminRegisterPage() {
    const [form, setForm]         = useState(EMPTY_FORM);
    const [errors, setErrors]     = useState({});
    const [saving, setSaving]     = useState(false);
    const [success, setSuccess]   = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);

    /* ── handlers ── */
    const set = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        setErrors(p => { const n = { ...p }; delete n[key]; return n; });
    };

    const handleAccessLevel = (level) => {
        const preset = PERMISSION_PRESETS[level] ?? {};
        setForm(p => ({ ...p, accessLevel: level, ...preset }));
        setErrors(p => { const n = { ...p }; delete n.accessLevel; return n; });
    };

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors(p => { const n = { ...p }; delete n.profileImage; return n; });
    };

    const clearImage = () => { setImageFile(null); setImagePreview(null); };

    /* ── validation ── */
    const validate = () => {
        const e = {};
        if (!form.firstName.trim())      e.firstName    = 'First name is required';
        if (!form.lastName.trim())       e.lastName     = 'Last name is required';
        if (!form.phone.trim())          e.phone        = 'Phone number is required';
        if (!form.email.trim())          e.email        = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
        if (!form.password)              e.password     = 'Password is required';
        else if (form.password.length < 8) e.password  = 'Password must be at least 8 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (!form.department)            e.department   = 'Department is required';
        if (!form.accessLevel)           e.accessLevel  = 'Access level is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            let profileImageUrl = null;
            if (imageFile) {
                const imgRes = await ImageUploadAPI.uploadRegistrationImage(imageFile, 'AdminProfileImage');
                profileImageUrl = imgRes.imageUrl;
            }

            const payload = {
                firstName: form.firstName,
                lastName:  form.lastName,
                email:     form.email,
                phone:     form.phone,
                password:  form.password,
                confirmPassword: form.confirmPassword,
                department:  form.department,
                accessLevel: form.accessLevel,
                profileImageUrl,
                canVerifyVendors:    form.canVerifyVendors,
                canManageUsers:      form.canManageUsers,
                canViewReports:      form.canViewReports,
                canManagePayments:   form.canManagePayments,
                canManageCategories: form.canManageCategories,
                canResolveDisputes:  form.canResolveDisputes,
                acceptTerms: true,
            };

            const res = await RegistrationAPI.registerAdmin(payload);
            if (res?.success === false) throw new Error(res.message || 'Registration failed');

            setSuccess(`${form.firstName} ${form.lastName} has been registered as ${ACCESS_LEVELS.find(l => l.value === form.accessLevel)?.label}.`);
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            setErrors({ submit: err.message || 'Failed to register admin. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Register Admin</span>
            </nav>

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Register Admin</h1>
                    <p className="text-gray-500 mt-0.5">Create a new administrator account</p>
                </div>
            </div>

            {/* Success banner */}
            {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">Admin registered successfully</p>
                        <p className="text-xs text-green-700 mt-0.5">{success}</p>
                    </div>
                    <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* ── Personal Info ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="First Name" error={errors.firstName} required>
                            <input
                                type="text" value={form.firstName}
                                onChange={e => set('firstName', e.target.value)}
                                placeholder="John"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={inputCls(errors.firstName)}
                            />
                        </Field>
                        <Field label="Last Name" error={errors.lastName} required>
                            <input
                                type="text" value={form.lastName}
                                onChange={e => set('lastName', e.target.value)}
                                placeholder="Doe"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={inputCls(errors.lastName)}
                            />
                        </Field>
                        <Field label="Email Address" error={errors.email} required>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email" value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    placeholder="john@afrochow.ca"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className={`${inputCls(errors.email)} pl-9`}
                                />
                            </div>
                        </Field>
                        <Field label="Phone Number" error={errors.phone} required>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel" value={form.phone}
                                    onChange={e => set('phone', e.target.value)}
                                    placeholder="+16471234567"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className={`${inputCls(errors.phone)} pl-9`}
                                />
                            </div>
                        </Field>
                    </div>
                </div>

                {/* ── Password ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">Account Security</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Password" error={errors.password} required>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'} value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className={`${inputCls(errors.password)} pl-9 pr-9`}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                        <Field label="Confirm Password" error={errors.confirmPassword} required>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showConf ? 'text' : 'password'} value={form.confirmPassword}
                                    onChange={e => set('confirmPassword', e.target.value)}
                                    placeholder="Repeat password"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className={`${inputCls(errors.confirmPassword)} pl-9 pr-9`}
                                />
                                <button type="button" onClick={() => setShowConf(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                    </div>
                </div>

                {/* ── Profile Image (optional) ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Profile Photo</h2>
                            <p className="text-xs text-gray-500">Optional</p>
                        </div>
                    </div>
                    <div className="p-5 flex items-center gap-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                <button type="button" onClick={clearImage}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <User className="w-7 h-7 text-gray-300" />
                            </div>
                        )}
                        <div>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                                <ImageIcon className="w-4 h-4" />
                                {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                            </label>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>

                {/* ── Admin Config ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">Role &amp; Department</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Department" error={errors.department} required>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select
                                    value={form.department}
                                    onChange={e => set('department', e.target.value)}
                                    style={{ color: form.department ? 'black' : '#9ca3af', backgroundColor: 'white' }}
                                    className={`${inputCls(errors.department)} pl-9 appearance-none`}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.value} value={d.value} style={{ color: 'black' }}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </Field>

                        <Field label="Access Level" error={errors.accessLevel} required>
                            <div className="space-y-2">
                                {ACCESS_LEVELS.map(l => (
                                    <label key={l.value} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                                        form.accessLevel === l.value
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio" name="accessLevel" value={l.value}
                                            checked={form.accessLevel === l.value}
                                            onChange={() => handleAccessLevel(l.value)}
                                            className="accent-gray-900"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">{l.label}</p>
                                            <p className="text-xs text-gray-500">{l.desc}</p>
                                        </div>
                                    </label>
                                ))}
                                {errors.accessLevel && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors.accessLevel}
                                    </p>
                                )}
                            </div>
                        </Field>
                    </div>
                </div>

                {/* ── Permissions ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Permissions</h2>
                                {form.accessLevel && (
                                    <p className="text-xs text-gray-500">Pre-filled for {ACCESS_LEVELS.find(l => l.value === form.accessLevel)?.label} — customize if needed</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PERMISSIONS.map(p => (
                            <label key={p.key} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                                form[p.key] ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="checkbox" checked={!!form[p.key]}
                                    onChange={e => set(p.key, e.target.checked)}
                                    className="mt-0.5 accent-gray-900"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                                    <p className="text-xs text-gray-500">{p.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit error */}
                {errors.submit && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{errors.submit}</p>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                    <Link
                        href="/admin/dashboard"
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" />Creating Account…</>
                        ) : (
                            <><UserPlus className="w-4 h-4" />Create Admin Account</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
