'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard, ChevronRight, UserPlus, User, Mail, Phone,
    Lock, Eye, EyeOff, Building2, Shield, AlertCircle, CheckCircle,
    RefreshCw, Image as ImageIcon, X, Info,
} from 'lucide-react';
import { RegistrationAPI } from '@/lib/api/registration.api';
import { ImageUploadAPI } from '@/lib/api/imageUpload';
import { toast } from '@/components/ui/toast';

/* ─── constants ─────────────────────────────────────────────────────────── */
// Must match com.afrochow.common.enums.Department exactly — these values are
// deserialized straight into that Java enum server-side. The previous list
// here (SUPPORT, TECHNOLOGY, COMPLIANCE, LEGAL) didn't exist on the backend
// at all, so those selections failed on submit.
const DEPARTMENTS = [
    { value: 'OPERATIONS',        label: 'Operations' },
    { value: 'CUSTOMER_SUPPORT',  label: 'Customer Support' },
    { value: 'FINANCE',           label: 'Finance' },
    { value: 'MARKETING',         label: 'Marketing' },
    { value: 'HR',                label: 'HR' },
    { value: 'MANAGEMENT',        label: 'Management' },
];

// NOTE: Access level / granular permission checkboxes used to live here, but
// they were never actually enforced by the backend — every admin account has
// identical privileges regardless of what was picked, and picking "Super
// Admin" here did NOT grant real super-admin access (that field only ever
// affected a display label). Removed to stop misleading whoever's creating
// the account. Every account created here is a standard Admin. Granting real
// Super Admin access is a separate, deliberate action — done afterward from
// the Users page (Promote), which actually changes the account's role.
const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    department: '',
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
                profileImageUrl,
                acceptTerms: true,
            };

            const res = await RegistrationAPI.registerAdmin(payload);
            if (res?.success === false) throw new Error(res.message || 'Registration failed');

            const successMsg = `${form.firstName} ${form.lastName} has been registered as an Admin.`;
            setSuccess(successMsg);
            toast.success('Admin Account Created', { description: successMsg });
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            setErrors({ submit: err.message || 'Failed to register admin. Please try again.' });
            toast.error('Registration Failed', { description: err.message || 'Failed to register admin. Please try again.' });
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
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                                <Image src={imagePreview} alt="Preview" fill sizes="64px" unoptimized className="object-cover" />
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
                        <h2 className="text-sm font-bold text-gray-900">Department</h2>
                    </div>
                    <div className="p-5 space-y-4">
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

                        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800">
                                This account is created as a standard Admin. Super Admin access (register other admins,
                                change roles, delete accounts) is granted separately, afterward, from the Users page.
                            </p>
                        </div>
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
