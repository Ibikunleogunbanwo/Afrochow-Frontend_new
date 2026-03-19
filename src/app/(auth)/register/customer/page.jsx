"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/api/httpClient";
import { RegistrationAPI } from "@/lib/api/registration.api";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Image from "next/image";
import {
  User, Mail, Lock, Phone, MapPin, Building2,
  Hash, Globe, FileText, Camera, CheckCircle2,
  RefreshCw, ChevronRight, Loader2, Eye, EyeOff,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN_SECONDS = 60;

// Canadian provinces matching the backend Province enum exactly
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

const INITIAL_FORM_DATA = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  profileImageUrl: "",   // stores base64 preview only — never sent to backend
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
      email: z.string().min(1, "Email is required").email("Enter a valid email address"),
      password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/(?=.*[a-z])/, "Password must contain a lowercase letter")
          .regex(/(?=.*[A-Z])/, "Password must contain an uppercase letter")
          .regex(/(?=.*\d)/, "Password must contain a number"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      phone: z
          .string()
          .min(10, "Phone number must be at least 10 digits")
          .regex(/^\+?[\d\s\-().]{10,}$/, "Enter a valid phone number"),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
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
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

// ─── Image Upload Helper ──────────────────────────────────────────────────────
// Converts base64 to a proper multipart FormData so the backend
// receives a "file" part — not a raw base64 string.

async function uploadProfileImage(base64String) {
  const fetchRes = await fetch(base64String);
  const blob = await fetchRes.blob();
  const ext = blob.type.split("/")[1] || "jpg";
  const file = new File([blob], `profile.${ext}`, { type: blob.type });

  const formData = new FormData();
  formData.append("file", file); // backend expects @RequestPart("file")

  const response = await fetch(`${API_BASE_URL}/images/upload/registration`, {
    method: "POST",
    body: formData,
    // ⚠️ Do NOT set Content-Type — browser sets it with the correct boundary
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Image upload failed");
  }

  const data = await response.json();
  return data.imageUrl; // e.g. "/images/profile-xyz.jpg"
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a raw "Try again in X seconds" backend message into a
 * human-readable string like "36 minutes" or "2 hours 30 minutes".
 */
function formatRetryMessage(message) {
  const match = message.match(/(\d+)\s*seconds?/i);
  if (!match) return message;

  const totalSeconds = parseInt(match[1], 10);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.ceil((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `Too many attempts. Try again in ${hours}h ${minutes}m.`;
  if (hours > 0) return `Too many attempts. Try again in ${hours} hour${hours > 1 ? "s" : ""}.`;
  return `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
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

// ─── ErrorMessage ─────────────────────────────────────────────────────────────

function ErrorMessage({ message }) {
  if (!message) return null;
  return (
      <div className="flex items-center gap-1.5 mt-1">
        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-xs text-red-500 leading-tight">{message}</p>
      </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children, required, htmlFor }) {
  return (
      <div className="flex flex-col gap-1">
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
        {children}
        <ErrorMessage message={error} />
      </div>
  );
}

// ─── InputField ──────────────────────────────────────────────────────────────
// Wraps <Input> with a left icon overlay and red border — no custom props
// are passed to the DOM element.

function InputField({ icon: Icon, hasError, id, className = "", ...inputProps }) {
  return (
      <div className="relative">
        {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Icon className="h-4 w-4" />
            </div>
        )}
        <Input
            id={id}
            {...inputProps}
            className={[
              Icon ? "pl-9" : "",
              hasError
                  ? "border-red-400 focus-visible:ring-red-300 bg-red-50/30"
                  : "",
              className,
            ]
                .filter(Boolean)
                .join(" ")}
        />
      </div>
  );
}

// ─── PasswordField ────────────────────────────────────────────────────────────
// InputField variant with a show/hide toggle on the right side.

function PasswordField({ icon: Icon, hasError, id, className = "", ...inputProps }) {
  const [show, setShow] = useState(false);

  return (
      <div className="relative">
        {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-10">
              <Icon className="h-4 w-4" />
            </div>
        )}
        <Input
            id={id}
            type={show ? "text" : "password"}
            {...inputProps}
            className={[
              "pr-10",
              Icon ? "pl-9" : "",
              hasError
                  ? "border-red-400 focus-visible:ring-red-300 bg-red-50/30"
                  : "",
              className,
            ]
                .filter(Boolean)
                .join(" ")}
        />
        <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
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
    reader.onload = () => onChange(reader.result); // store base64 for preview
    reader.readAsDataURL(file);
  };

  return (
      <div className="flex items-center gap-5">
        {/* Circle preview */}
        <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full cursor-pointer group border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors overflow-hidden shrink-0 flex items-center justify-center bg-orange-50"
        >
          {value ? (
              <Image
                  src={value}
                  alt="Profile preview"
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
              />
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

        {/* Text controls */}
        <div className="flex flex-col gap-1">
          <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors text-left"
          >
            {value ? "Change photo" : "Upload profile photo"}
          </button>
          <p className="text-xs text-gray-400">JPG, PNG or WebP · optional</p>
          {value && (
              <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
              >
                Remove photo
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
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600">Account Created!</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-semibold text-gray-700">{email}</span>.
                <br />
                Check your inbox to activate your account.
              </p>
            </div>
            <div className="w-full bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
              Didn&#39;t get the email? Check your spam folder or use the button below.
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pb-6 px-6">
            {/* Primary CTA — go to the verify email page */}
            <Button
                type="button"
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-md flex items-center justify-center gap-2"
                onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
            >
              <Mail className="w-4 h-4" />
              Verify My Email
            </Button>

            {/* Secondary — resend */}
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={resendDisabled || resendLoading}
                onClick={() => onResend(email)}
            >
              {resendLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <RefreshCw className="w-4 h-4" />
              }
              {resendDisabled
                  ? `Resend in ${resendCountdown}s`
                  : "Resend Verification Email"}
            </Button>

            <p className="text-sm text-center text-gray-500">
              Already verified?{" "}
              <button
                  type="button"
                  onClick={() => router.push("/?sign-in=true")}
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // ── All hooks declared first (Rules of Hooks) ──────────────────────────────

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef(null);

  // Redirect already-authenticated users away from registration
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Cleanup resend timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Auth guard early return ────────────────────────────────────────────────
  // Show a spinner while auth resolves, or while the redirect is in flight.
  // Keeps the registration form from flashing to authenticated users.

  if (authLoading || isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
    );
  }

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
      setErrors((prev) => {
        const n = { ...prev };
        delete n[`address.${addressField}`];
        return n;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: fieldValue }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        // clear confirmPassword error when either password field changes
        if (name === "password" || name === "confirmPassword") {
          delete n.confirmPassword;
        }
        return n;
      });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateForm = () => {
    const result = registrationSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }

    const formatted = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path.join(".");
      if (!formatted[key]) formatted[key] = issue.message;
    });
    setErrors(formatted);

    // scroll to first error field
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

      // Upload image only if the user selected one (base64 → FormData → multipart)
      if (formData.profileImageUrl && formData.profileImageUrl !== "") {
        profileImageUrl = await uploadProfileImage(formData.profileImageUrl);
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
          province: PROVINCES.find((p) => p.code === formData.address.province || p.name === formData.address.province)?.code || formData.address.province,
          postalCode: formData.address.postalCode,
          country: "Canada",
          defaultAddress: formData.address.defaultAddress,
        },
      };

      await RegistrationAPI.registerCustomer(payload);
      setUserEmail(formData.email);
      setShowSuccess(true);
      toast.success("Registration Successful!", { description: "Check your email to verify your account" });
    } catch (error) {
      console.error("Registration error:", error);

      const status = error.status;
      const message = error.message || "";

      if (status === 429) {
        // Rate limited — format the raw seconds into readable time
        toast.error("Too Many Attempts", {
          description: formatRetryMessage(message),
        });

      } else if (status === 409) {
        // Conflict — map the backend message to the specific field so the
        // user sees the error inline rather than just a generic toast.
        const lower = message.toLowerCase();

        if (lower.includes("email")) {
          setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
          toast.error("Email Already Registered", {
            description: "Use a different email or sign in to your existing account.",
          });
        } else if (lower.includes("phone")) {
          setErrors((prev) => ({ ...prev, phone: "This phone number is already registered" }));
          toast.error("Phone Already Registered", {
            description: "Use a different phone number or sign in to your existing account.",
          });
        } else {
          // Generic conflict
          toast.error("Already Registered", { description: message });
        }

        // Scroll to the highlighted field
        setTimeout(() => {
          const el = document.querySelector(".border-red-400");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

      } else {
        // Generic error — just show the message
        toast.error("Registration Failed", {
          description: message || "Something went wrong. Please try again.",
        });
      }
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
      toast.success("Email Resent!", { description: "Check your inbox again" });
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
      toast.error("Resend Failed", { description: err?.message || "Please try again later" });
      setResendDisabled(false);
      setResendCountdown(0);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────

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

  // ── Error shorthand ────────────────────────────────────────────────────────

  const err = (key) => errors[key];

  // ── Render ─────────────────────────────────────────────────────────────────

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
            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="pt-6 flex flex-col gap-6">

                {/* ── Profile photo ── */}
                <AvatarUpload
                    value={formData.profileImageUrl}
                    onChange={(val) =>
                        setFormData((prev) => ({ ...prev, profileImageUrl: val }))
                    }
                />

                {/* ── Account ── */}
                <SectionHeading icon={Lock} title="Account" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field
                        label="Email"
                        error={err("email")}
                        required
                        htmlFor="email"
                    >
                      <InputField
                          id="email"
                          icon={Mail}
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          hasError={!!err("email")}
                          disabled={loading}
                          autoComplete="email"
                      />
                    </Field>
                  </div>

                  <Field
                      label="Password"
                      error={err("password")}
                      required
                      htmlFor="password"
                  >
                    <PasswordField
                        id="password"
                        icon={Lock}
                        name="password"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        hasError={!!err("password")}
                        disabled={loading}
                        autoComplete="new-password"
                    />
                  </Field>

                  <Field
                      label="Confirm Password"
                      error={err("confirmPassword")}
                      required
                      htmlFor="confirmPassword"
                  >
                    <PasswordField
                        id="confirmPassword"
                        icon={Lock}
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        hasError={!!err("confirmPassword")}
                        disabled={loading}
                        autoComplete="new-password"
                    />
                  </Field>
                </div>

                {/* ── Personal Info ── */}
                <SectionHeading icon={User} title="Personal Info" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                      label="First Name"
                      error={err("firstName")}
                      required
                      htmlFor="firstName"
                  >
                    <InputField
                        id="firstName"
                        icon={User}
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        hasError={!!err("firstName")}
                        disabled={loading}
                        autoComplete="given-name"
                    />
                  </Field>

                  <Field
                      label="Last Name"
                      error={err("lastName")}
                      required
                      htmlFor="lastName"
                  >
                    <InputField
                        id="lastName"
                        icon={User}
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        hasError={!!err("lastName")}
                        disabled={loading}
                        autoComplete="family-name"
                    />
                  </Field>

                  <Field
                      label="Phone Number"
                      error={err("phone")}
                      required
                      htmlFor="phone"
                  >
                    <InputField
                        id="phone"
                        icon={Phone}
                        name="phone"
                        type="tel"
                        placeholder="+1 (403) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        hasError={!!err("phone")}
                        disabled={loading}
                        autoComplete="tel"
                    />
                  </Field>
                </div>

                {/* ── Delivery Address ── */}
                <SectionHeading icon={MapPin} title="Delivery Address" />

                <div className="grid grid-cols-1 gap-4">
                  <Field
                      label="Street Address"
                      error={err("address.addressLine")}
                      required
                      htmlFor="addressLine"
                  >
                    <InputField
                        id="addressLine"
                        icon={MapPin}
                        name="address.addressLine"
                        type="text"
                        placeholder="123 Main Street"
                        value={formData.address.addressLine}
                        onChange={handleInputChange}
                        hasError={!!err("address.addressLine")}
                        disabled={loading}
                        autoComplete="street-address"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                        label="City"
                        error={err("address.city")}
                        required
                        htmlFor="city"
                    >
                      <InputField
                          id="city"
                          icon={Building2}
                          name="address.city"
                          type="text"
                          placeholder="Calgary"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          hasError={!!err("address.city")}
                          disabled={loading}
                          autoComplete="address-level2"
                      />
                    </Field>

                    <Field
                        label="Province"
                        error={err("address.province")}
                        required
                        htmlFor="province"
                    >
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <select
                            id="province"
                            name="address.province"
                            value={formData.address.province}
                            onChange={handleInputChange}
                            disabled={loading}
                            className={[
                              "w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background appearance-none",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              "disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                              err("address.province")
                                  ? "border-red-400 focus-visible:ring-red-300 bg-red-50/30"
                                  : "border-input",
                            ].join(" ")}
                        >
                          <option value="" disabled>Select province</option>
                          {PROVINCES.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name} ({p.code})
                              </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field
                        label="Postal Code"
                        error={err("address.postalCode")}
                        required
                        htmlFor="postalCode"
                    >
                      <InputField
                          id="postalCode"
                          icon={Hash}
                          name="address.postalCode"
                          type="text"
                          placeholder="T2N 1N4"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          hasError={!!err("address.postalCode")}
                          disabled={loading}
                          autoComplete="postal-code"
                      />
                    </Field>
                  </div>

                  {/* Delivery instructions — textarea */}
                  <Field
                      label="Delivery Instructions"
                      error={err("defaultDeliveryInstructions")}
                      htmlFor="deliveryInstructions"
                  >
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      <textarea
                          id="deliveryInstructions"
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
                        err("acceptTerms")
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <label
                      htmlFor="acceptTerms"
                      className="flex items-start gap-3 cursor-pointer select-none"
                  >
                    {/* Hidden native checkbox for accessibility */}
                    <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              acceptTerms: e.target.checked,
                            }))
                        }
                        disabled={loading}
                        className="sr-only"
                    />

                    {/* Custom styled checkbox */}
                    <div
                        className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                            formData.acceptTerms
                                ? "bg-orange-500 border-orange-500"
                                : err("acceptTerms")
                                    ? "bg-white border-red-400"
                                    : "bg-white border-gray-300 hover:border-orange-400"
                        }`}
                    >
                      {formData.acceptTerms && (
                          <svg
                              className="w-3 h-3 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                          >
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

                    <span className="text-sm text-gray-600 leading-snug">
                    I agree to the{" "}
                      <span className="font-semibold text-orange-600">
                      Terms and Conditions
                    </span>{" "}
                      and{" "}
                      <span className="font-semibold text-orange-600">
                      Privacy Policy
                    </span>
                  </span>
                  </label>

                  {/* Checkbox error */}
                  {err("acceptTerms") && (
                      <div className="flex items-center gap-1.5 mt-2 ml-8">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <p className="text-xs text-red-500">{err("acceptTerms")}</p>
                      </div>
                  )}
                </div>

              </CardContent>

              {/* ── Submit ── */}
              <CardFooter className="flex-col gap-4 pt-2 pb-6 px-6">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all h-11 flex items-center justify-center gap-2"
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
                      onClick={() => router.push("/?sign-in=true")}
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