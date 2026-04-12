"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/toast";
import Logo from "@/components/Logo";
import {
    User, Mail, Phone, MapPin, Building2, Hash,
    Globe, ChevronRight, Loader2, CheckCircle2, AlertCircle, // Hash kept for postal code field
} from "lucide-react";

// Canadian provinces
const PROVINCES = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
];

function ProgressSteps({ current }) {
    const steps = ["Your details", "Delivery address", "Done!"];
    return (
        <div className="flex items-center gap-2 mb-8">
            {steps.map((label, i) => {
                const done    = i < current;
                const active  = i === current;
                return (
                    <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                ${done   ? "bg-orange-500 text-white"
                                : active ? "bg-orange-100 text-orange-600 border-2 border-orange-500"
                                :          "bg-gray-100 text-gray-400"}`}>
                                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold whitespace-nowrap
                                ${active ? "text-orange-600" : done ? "text-gray-700" : "text-gray-400"}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 ${done ? "bg-orange-400" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <AlertCircle className="w-3 h-3 shrink-0" /> {message}
        </p>
    );
}

export default function OnboardingPage() {
    const router  = useRouter();
    const { user, completeOnboarding } = useAuth();

    const [step,    setStep]    = useState(0); // 0 = details, 1 = address
    const [saving,  setSaving]  = useState(false);
    const [errors,  setErrors]  = useState({});

    // Step 0 fields — pre-fill name from Google but allow override
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName,  setLastName]  = useState(user?.lastName  ?? "");
    const [phone,    setPhone]    = useState("");

    // Step 1 fields
    const [addressLine,   setAddressLine]   = useState("");
    const [city,          setCity]          = useState("");
    const [province,      setProvince]      = useState("");
    const [postalCode,    setPostalCode]    = useState("");
    const [instructions,  setInstructions]  = useState("");
    const [skipAddress,   setSkipAddress]   = useState(false);

    const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-900 placeholder-gray-400";
    const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

    // ── Step 0 validation ─────────────────────────────────────────────────────
    const validateStep0 = () => {
        const errs = {};
        if (!firstName.trim()) errs.firstName = "First name is required.";
        if (!lastName.trim())  errs.lastName  = "Last name is required.";
        const cleaned = phone.replace(/\s|-/g, "");
        if (!cleaned) {
            errs.phone = "Phone number is required.";
        } else if (!/^\+?1?\d{10}$/.test(cleaned)) {
            errs.phone = "Enter a valid Canadian phone number, e.g. +1 416-555-0100";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Step 1 validation (only if not skipped) ───────────────────────────────
    const validateStep1 = () => {
        if (skipAddress) return true;
        const errs = {};
        if (!addressLine.trim()) errs.addressLine = "Street address is required.";
        if (!city.trim())        errs.city        = "City is required.";
        if (!province)           errs.province    = "Please select a province.";
        if (!postalCode.trim())  errs.postalCode  = "Postal code is required.";
        else if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(postalCode.trim()))
            errs.postalCode = "Enter a valid Canadian postal code, e.g. M5V 2T6";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep0()) setStep(1);
    };

    const handleSubmit = async () => {
        if (!validateStep1()) return;

        setSaving(true);
        try {
            const payload = {
                firstName: firstName.trim(),
                lastName:  lastName.trim(),
                phone: phone.replace(/\s|-/g, "").startsWith("+")
                    ? phone.replace(/\s|-/g, "")
                    : `+1${phone.replace(/\D/g, "").slice(-10)}`,
                ...(instructions.trim() && { defaultDeliveryInstructions: instructions.trim() }),
                ...(!skipAddress && addressLine.trim() && {
                    address: {
                        addressLine:    addressLine.trim(),
                        city:           city.trim(),
                        province:       province,
                        postalCode:     postalCode.trim().toUpperCase().replace(/\s/g, ""),
                        country:        "Canada",
                        defaultAddress: true,
                    },
                }),
            };

            await completeOnboarding(payload);
            setStep(2); // show done screen briefly then redirect
            toast.success("Profile complete!", { description: "Welcome to Afrochow 🎉" });
            setTimeout(() => router.replace("/"), 1500);

        } catch (err) {
            const msg = err?.message?.toLowerCase() ?? "";
            if (msg.includes("phone") || msg.includes("already registered")) {
                setErrors({ phone: "This phone number is already registered to another account." });
                setStep(0);
            } else {
                toast.error("Could not save profile", { description: err?.message || "Please try again." });
            }
        } finally {
            setSaving(false);
        }
    };

    // ── Done screen ───────────────────────────────────────────────────────────
    if (step === 2) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">You're all set!</h1>
                    <p className="text-gray-500 text-sm">Taking you to Afrochow…</p>
                    <Loader2 className="w-5 h-5 animate-spin text-orange-400 mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-3">
                            Almost done!
                        </span>
                        <h1 className="text-2xl font-black text-gray-900">
                            {step === 0 ? "Complete your profile" : "Add a delivery address"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 0
                                ? "Just a couple of details to get you started."
                                : "Save an address for faster checkout. You can always skip this."
                            }
                        </p>
                    </div>

                    {/* Progress */}
                    <ProgressSteps current={step} />

                    {/* ── Step 0: Details ──────────────────────────────────── */}
                    {step === 0 && (
                        <div className="space-y-4">

                            {/* Google profile avatar */}
                            {(() => {
                                const photoUrl = user?.profileImageUrl ?? user?.picture ?? user?.photoUrl ?? null;
                                const initials = `${(user?.firstName ?? "")[0] ?? ""}${(user?.lastName ?? "")[0] ?? ""}`.toUpperCase() || "?";
                                return (
                                    <div className="flex justify-center">
                                        {photoUrl ? (
                                            <img
                                                src={photoUrl}
                                                alt="Profile"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-orange-600 text-xl font-black shadow-sm">
                                                {initials}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Editable first + last name (pre-filled from Google) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>
                                        First name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: undefined })); }}
                                            placeholder="First name"
                                            className={`${inputCls} pl-9 ${errors.firstName ? "border-red-300 focus:ring-red-400" : ""}`}
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <FieldError message={errors.firstName} />
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Last name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: undefined })); }}
                                            placeholder="Last name"
                                            className={`${inputCls} pl-9 ${errors.lastName ? "border-red-300 focus:ring-red-400" : ""}`}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                    <FieldError message={errors.lastName} />
                                </div>
                            </div>

                            {/* Read-only email from Google */}
                            <div>
                                <label className={labelCls}>Email</label>
                                <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-500">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{user?.email ?? "—"}</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={labelCls}>
                                    Phone number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
                                        placeholder="+1 416-555-0100"
                                        className={`${inputCls} pl-9 ${errors.phone ? "border-red-300 focus:ring-red-400" : ""}`}
                                        autoComplete="tel"
                                    />
                                </div>
                                <FieldError message={errors.phone} />
                            </div>

                            <button
                                onClick={handleNextStep}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold shadow-md hover:from-orange-600 hover:to-red-700 transition-all"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── Step 1: Address ──────────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-4">

                            {/* Skip toggle */}
                            <label className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={skipAddress}
                                    onChange={e => { setSkipAddress(e.target.checked); setErrors({}); }}
                                    className="w-4 h-4 accent-orange-500"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Skip for now</p>
                                    <p className="text-xs text-gray-400">You can add an address at checkout</p>
                                </div>
                            </label>

                            {!skipAddress && (
                                <>
                                    <div>
                                        <label className={labelCls}>Street address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={addressLine}
                                                onChange={e => { setAddressLine(e.target.value); setErrors(p => ({ ...p, addressLine: undefined })); }}
                                                placeholder="123 Main St"
                                                className={`${inputCls} pl-9 ${errors.addressLine ? "border-red-300 focus:ring-red-400" : ""}`}
                                                autoComplete="street-address"
                                            />
                                        </div>
                                        <FieldError message={errors.addressLine} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>City</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={city}
                                                    onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: undefined })); }}
                                                    placeholder="Toronto"
                                                    className={`${inputCls} pl-9 ${errors.city ? "border-red-300 focus:ring-red-400" : ""}`}
                                                    autoComplete="address-level2"
                                                />
                                            </div>
                                            <FieldError message={errors.city} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Postal code</label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={e => { setPostalCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, postalCode: undefined })); }}
                                                    placeholder="M5V 2T6"
                                                    className={`${inputCls} pl-9 ${errors.postalCode ? "border-red-300 focus:ring-red-400" : ""}`}
                                                    autoComplete="postal-code"
                                                />
                                            </div>
                                            <FieldError message={errors.postalCode} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Province</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            <select
                                                value={province}
                                                onChange={e => { setProvince(e.target.value); setErrors(p => ({ ...p, province: undefined })); }}
                                                className={`${inputCls} pl-9 appearance-none ${errors.province ? "border-red-300 focus:ring-red-400" : ""}`}
                                            >
                                                <option value="">Select province…</option>
                                                {PROVINCES.map(p => (
                                                    <option key={p.code} value={p.code}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <FieldError message={errors.province} />
                                    </div>

                                    <div>
                                        <label className={labelCls}>
                                            Delivery instructions <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={instructions}
                                            onChange={e => setInstructions(e.target.value)}
                                            placeholder="e.g. Leave at door, buzz #201"
                                            className={inputCls}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep(0); setErrors({}); }}
                                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold shadow-md hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-70"
                                >
                                    {saving
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                        : skipAddress
                                            ? "Finish & go to Afrochow"
                                            : "Save & go to Afrochow"
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    You can update all of this later in your profile settings.
                </p>
            </div>
        </div>
    );
}
