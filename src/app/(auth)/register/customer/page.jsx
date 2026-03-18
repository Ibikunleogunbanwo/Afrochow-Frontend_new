"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegistrationAPI } from "@/lib/api/registration.api";
import { toast } from "@/components/ui/toast";
import { ImageUploadAPI } from "@/lib/api/imageUpload";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Lock, Phone, MapPin, Building2,
  Hash, Globe, FileText, Camera, CheckCircle2,
  RefreshCw, ChevronRight, Loader2,
} from "lucide-react";
import { z } from "zod";
import Logo from "@/components/Logo";

// ─── Constants ────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN_SECONDS = 60;

const INITIAL_FORM_DATA = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  profileImageUrl: null,
  defaultDeliveryInstructions: "",
  acceptTerms: false,
  address: {
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    defaultAddress: true,
  },
};

// ─── Validation Schema ────────────────────────────────────────────────────────

const registrationSchema = z
    .object({
      email: z.string().min(1, "Email is required").email("Enter a valid email"),
      password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/(?=.*[a-z])/, "Must contain a lowercase letter")
          .regex(/(?=.*[A-Z])/, "Must contain an uppercase letter")
          .regex(/(?=.*\d)/, "Must contain a number"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      phone: z
          .string()
          .min(10, "Enter a valid phone number")
          .regex(/^\+?[\d\s\-().]{10,}$/, "Enter a valid phone number"),
      acceptTerms: z.literal(true, {
        errorMap: () => ({ message: "You must accept the terms and conditions" }),
      }),
      address: z.object({
        addressLine: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        province: z.string().min(1, "Province is required"),
        postalCode: z
            .string()
            .min(1, "Postal code is required")
            .regex(
                /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
                "Enter a valid Canadian postal code (e.g. T2N 1N4)"
            ),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

// ─── InputField ───────────────────────────────────────────────────────────────
// Self-contained: handles icon overlay + red border — no custom props hit the DOM

function InputField({ icon: Icon, hasError, className = "", ...inputProps }) {
  return (
      <div className="relative">
        {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Icon className="h-4 w-4" />
            </div>
        )}
        <Input
            {...inputProps}
            className={[
              Icon ? "pl-9" : "",
              hasError ? "border-red-400 focus-visible:ring-red-400" : "",
              className,
            ]
                .filter(Boolean)
                .join(" ")}
        />
      </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children, required }) {
  return (
      <div className="flex flex-col gap-1.5">
        <Label required={required}>{label}</Label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
  );
}

// ─── SectionHeading ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, title }) {
  return (
      <div className="flex items-center gap-2 pt-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50 text-orange-500">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
  );
}

// ─── AvatarUpload ─────────────────────────────────────────────────────────────

function AvatarUpload({ value, onChange }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
      <div className="flex items-center gap-5">
        <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full cursor-pointer group border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors overflow-hidden flex-shrink-0 flex items-center justify-center bg-orange-50"
        >
          {value ? (
              <img src={value} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera className="w-8 h-8 text-orange-300 group-hover:text-orange-500 transition-colors" />
                <span className="text-[10px] text-orange-300 group-hover:text-orange-500 transition-colors font-medium">
              Upload
            </span>
              </div>
          )}
          {value && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
          )}
        </div>

        <div>
          <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            {value ? "Change photo" : "Upload profile photo"}
          </button>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · optional</p>
          {value && (
              <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1 block"
              >
                Remove
              </button>
          )}
        </div>

        <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
        />
      </div>
  );
}

// ─── SuccessScreen ────────────────────────────────────────────────────────────

function SuccessScreen({ email, resendLoading, resendDisabled, resendCountdown, onResend }) {
  const router = useRouter();

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600">Account Created!</h2>
              <p className="text-sm text-gray-500 mt-2">
                We sent a verification link to{" "}
                <span className="font-semibold text-gray-700">{email}</span>.
                <br />
                Check your inbox to activate your account.
              </p>
            </div>
            <div className="w-full bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
              Didn&#39;t get the email? Check your spam folder or resend below.
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pb-6">
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={resendDisabled || resendLoading}
                onClick={() => onResend(email)}
            >
              {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                  <RefreshCw className="w-4 h-4" />
              )}
              {resendDisabled ? `Resend in ${resendCountdown}s` : "Resend Verification Email"}
            </Button>

            <p className="text-sm text-center text-gray-500">
              Already verified?{" "}
              <button
                  type="button"
                  onClick={() => router.push("/?signin=true")}
                  className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Go to Sign In
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CustomerRegistration() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Input handler ──────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: fieldValue },
      }));
      setErrors((prev) => { const n = { ...prev }; delete n[`address.${addressField}`]; return n; });
    } else {
      setFormData((prev) => ({ ...prev, [name]: fieldValue }));
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateForm = () => {
    const result = registrationSchema.safeParse(formData);
    if (result.success) { setErrors({}); return true; }

    const formatted = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path.join(".");
      if (!formatted[key]) formatted[key] = issue.message;
    });
    setErrors(formatted);

    const firstMsg = Object.values(formatted)[0];
    if (firstMsg) toast.error("Validation Error", firstMsg);

    setTimeout(() => {
      const el = document.querySelector(".border-red-400");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    return false;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let profileImageUrl = null;

      if (formData.profileImageUrl) {
        const imageResponse = await ImageUploadAPI.uploadRegistrationImage(
            formData.profileImageUrl,
            "CustomerProfileImage"
        );
        profileImageUrl = imageResponse.imageUrl;
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        ...(profileImageUrl && { profileImageUrl }),
        acceptTerms: formData.acceptTerms,
        defaultDeliveryInstructions: formData.defaultDeliveryInstructions,
        address: {
          addressLine: formData.address.addressLine,
          city: formData.address.city,
          province: formData.address.province,
          postalCode: formData.address.postalCode,
          country: "Canada",
          defaultAddress: formData.address.defaultAddress,
        },
      };

      await RegistrationAPI.registerCustomer(payload);
      setUserEmail(formData.email);
      setShowSuccess(true);
      toast.success("Registration Successful!", "Check your email to verify your account");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────

  const handleResend = async (email) => {
    if (!email) return;
    setResendLoading(true);
    try {
      await RegistrationAPI.resendVerificationEmail(email);
      toast.success("Email Resent!", "Check your inbox again");
      setResendDisabled(true);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setResendDisabled(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Resend Failed", err?.message || "Please try again later");
      setResendDisabled(false);
      setResendCountdown(0);
    } finally {
      setResendLoading(false);
    }
  };

  if (showSuccess) {
    return (
        <SuccessScreen
            email={userEmail}
            resendLoading={resendLoading}
            resendDisabled={resendDisabled}
            resendCountdown={resendCountdown}
            onResend={handleResend}
        />
    );
  }

  const err = (key) => errors[key];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-14">
        <div className="w-full max-w-2xl">

          {/* Brand header */}
          <div className="text-center mb-8 flex flex-col items-center gap-3">
            <Logo showTagline />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">
                Discover authentic African cuisine delivered to your door
              </p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 flex flex-col gap-6">

                {/* Profile photo */}
                <AvatarUpload
                    value={formData.profileImageUrl}
                    onChange={(val) => setFormData((prev) => ({ ...prev, profileImageUrl: val }))}
                />

                {/* ── Account ── */}
                <SectionHeading icon={Lock} title="Account" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Email" error={err("email")} required>
                      <InputField
                          icon={Mail}
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          hasError={!!err("email")}
                          disabled={loading}
                      />
                    </Field>
                  </div>

                  <Field label="Password" error={err("password")} required>
                    <InputField
                        icon={Lock}
                        name="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        hasError={!!err("password")}
                        disabled={loading}
                    />
                  </Field>

                  <Field label="Confirm Password" error={err("confirmPassword")} required>
                    <InputField
                        icon={Lock}
                        name="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        hasError={!!err("confirmPassword")}
                        disabled={loading}
                    />
                  </Field>
                </div>

                {/* ── Personal ── */}
                <SectionHeading icon={User} title="Personal Info" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" error={err("firstName")} required>
                    <InputField
                        icon={User}
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        hasError={!!err("firstName")}
                        disabled={loading}
                    />
                  </Field>

                  <Field label="Last Name" error={err("lastName")} required>
                    <InputField
                        icon={User}
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        hasError={!!err("lastName")}
                        disabled={loading}
                    />
                  </Field>

                  <Field label="Phone Number" error={err("phone")} required>
                    <InputField
                        icon={Phone}
                        name="phone"
                        type="tel"
                        placeholder="+1 (403) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        hasError={!!err("phone")}
                        disabled={loading}
                    />
                  </Field>
                </div>

                {/* ── Delivery ── */}
                <SectionHeading icon={MapPin} title="Delivery Address" />
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Street Address" error={err("address.addressLine")} required>
                    <InputField
                        icon={MapPin}
                        name="address.addressLine"
                        type="text"
                        placeholder="123 Main Street"
                        value={formData.address.addressLine}
                        onChange={handleInputChange}
                        hasError={!!err("address.addressLine")}
                        disabled={loading}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="City" error={err("address.city")} required>
                      <InputField
                          icon={Building2}
                          name="address.city"
                          type="text"
                          placeholder="Calgary"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          hasError={!!err("address.city")}
                          disabled={loading}
                      />
                    </Field>

                    <Field label="Province" error={err("address.province")} required>
                      <InputField
                          icon={Globe}
                          name="address.province"
                          type="text"
                          placeholder="AB"
                          value={formData.address.province}
                          onChange={handleInputChange}
                          hasError={!!err("address.province")}
                          disabled={loading}
                      />
                    </Field>

                    <Field label="Postal Code" error={err("address.postalCode")} required>
                      <InputField
                          icon={Hash}
                          name="address.postalCode"
                          type="text"
                          placeholder="T2N 1N4"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          hasError={!!err("address.postalCode")}
                          disabled={loading}
                      />
                    </Field>
                  </div>

                  {/* Delivery Instructions — textarea, no InputField needed */}
                  <Field label="Delivery Instructions" error={err("defaultDeliveryInstructions")}>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      <textarea
                          name="defaultDeliveryInstructions"
                          placeholder="e.g. Leave at front door, ring buzzer #302…"
                          value={formData.defaultDeliveryInstructions}
                          onChange={handleInputChange}
                          disabled={loading}
                          rows={3}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                      />
                    </div>
                  </Field>
                </div>

                {/* ── Terms & Conditions ── */}
                <div
                    className={`rounded-lg border p-4 transition-colors ${
                        err("acceptTerms") ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                          type="checkbox"
                          id="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={(e) =>
                              setFormData((prev) => ({ ...prev, acceptTerms: e.target.checked }))
                          }
                          disabled={loading}
                          className="sr-only"
                      />
                      {/* Custom visible checkbox */}
                      <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              formData.acceptTerms
                                  ? "bg-orange-500 border-orange-500"
                                  : "bg-white border-gray-300"
                          }`}
                      >
                        {formData.acceptTerms && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path
                                  d="M2 6l3 3 5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                              />
                            </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 leading-snug">
                    I agree to the{" "}
                      <span className="font-semibold text-orange-600">Terms and Conditions</span>
                      {" "}and{" "}
                      <span className="font-semibold text-orange-600">Privacy Policy</span>
                  </span>
                  </label>
                  {err("acceptTerms") && (
                      <p className="text-xs text-red-500 mt-2 ml-8">{err("acceptTerms")}</p>
                  )}
                </div>

              </CardContent>

              <CardFooter className="flex-col gap-4 pt-2 pb-6 px-6">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all h-11 flex items-center justify-center gap-2"
                >
                  {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account…
                      </>
                  ) : (
                      <>
                        Create Account
                        <ChevronRight className="h-4 w-4" />
                      </>
                  )}
                </Button>

                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <button
                      type="button"
                      onClick={() => router.push("/?signin=true")}
                      className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Afrochow. All rights reserved.
          </p>
        </div>
      </div>
  );
}