"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { registerVendor } from "@/lib/api/vendor_register_api";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, Store, UtensilsCrossed, FileText, Clock, Truck,
  ShoppingBag, Timer, MapPin, Globe, CheckCircle2, AlertCircle,
  Loader2, Edit, Image as ImageIcon, Shield, Hash, DollarSign,
  Package, Navigation, Calendar, X, Upload,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

const DAYS_OF_WEEK = [
  { key: "monday",    label: "Mon", full: "Monday"    },
  { key: "tuesday",   label: "Tue", full: "Tuesday"   },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday",  label: "Thu", full: "Thursday"  },
  { key: "friday",    label: "Fri", full: "Friday"    },
  { key: "saturday",  label: "Sat", full: "Saturday"  },
  { key: "sunday",    label: "Sun", full: "Sunday"    },
];

const fmt = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const dh = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${dh}:${m}${ampm}`;
};

// ── primitives ────────────────────────────────────────────────────────────────

const Card = ({ children, className = "" }) => (
    <div className={`w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
);

const CardHead = ({ icon: Icon, title, desc, step, onEdit, disabled }) => (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-orange-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate">{desc}</p>
        </div>
      </div>
      <button
          type="button"
          onClick={() => onEdit(step)}
          disabled={disabled}
          className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg shrink-0 disabled:opacity-50 transition-colors"
      >
        <Edit className="h-3 w-3" /> Edit
      </button>
    </div>
);

const Label = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{text}</span>
    </div>
);

const Value = ({ children, mono = false }) => (
    <p className={`text-sm text-gray-900 font-medium break-words ${mono ? "font-mono" : ""}`}>
      {children}
    </p>
);

const Missing = ({ text }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
    <AlertCircle className="h-3 w-3 shrink-0" /> {text}
  </span>
);

// ── validation ────────────────────────────────────────────────────────────────

const getValidationErrors = (state) => {
  const errors = [];

  // Step 1 — Account
  if (!state.email?.trim())    errors.push({ step: 1, field: "Email address",  message: "Required to create your account." });
  if (!state.password?.trim()) errors.push({ step: 1, field: "Password",       message: "Required to create your account." });

  // Step 2 — Personal + Store
  if (!state.firstName?.trim())     errors.push({ step: 2, field: "First name",     message: "Personal details are required." });
  if (!state.lastName?.trim())      errors.push({ step: 2, field: "Last name",      message: "Personal details are required." });
  if (!state.phone?.trim())         errors.push({ step: 2, field: "Phone number",   message: "Required for order notifications." });
  if (!state.restaurantName?.trim()) errors.push({ step: 2, field: "Store name",    message: "Customers search for your store by name." });
  if (!state.description?.trim())   errors.push({ step: 2, field: "Store description", message: "Tell customers what you sell." });
  if (!state.cuisineType?.trim())   errors.push({ step: 2, field: "Product type",   message: "Select a category for your store." });

  // Step 3 — Branding + Address
  if (!state.logoUrl)   errors.push({ step: 3, field: "Store logo",   message: "A logo is required before submitting." });
  if (!state.bannerUrl) errors.push({ step: 3, field: "Store banner", message: "A banner is required before submitting." });
  const addr = state.address || {};
  if (!addr.addressLine?.trim()) errors.push({ step: 3, field: "Street address", message: "Business address is required." });
  if (!addr.city?.trim())        errors.push({ step: 3, field: "City",            message: "Business address is required." });
  if (!addr.province?.trim())    errors.push({ step: 3, field: "Province",        message: "Business address is required." });
  if (!addr.postalCode?.trim())  errors.push({ step: 3, field: "Postal code",     message: "Business address is required." });

  // Step 4 — Operations
  if (!state.offersDelivery && !state.offersPickup) {
    errors.push({ step: 4, field: "Fulfillment method", message: "Enable at least Delivery or Pickup." });
  }

  return errors;
};

// ── main component ────────────────────────────────────────────────────────────

export default function Review() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const [loading, setLoading]               = useState(false);
  const [progress, setProgress]             = useState(null);
  const [error, setError]                   = useState(null);

  const validationErrors = getValidationErrors(state);

  useEffect(() => {
    if (!loading) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "Registration in progress. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading]);

  const handleEdit = (step) => router.push(`/register/vendor/step-${step}`);

  const handleSubmit = async () => {
    if (loading) return;
    if (validationErrors.length > 0) {
      toast.error("Please fix the highlighted issues before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress("Creating your account...");

      const response = await registerVendor(state);

      if (!response?.data?.publicUserId) {
        const fallback = response?.data?.message || "Registration failed. Please try again.";
        toast.error(fallback);
        setError(fallback);
        setProgress(null);
        return;
      }

      setProgress("Registration complete!");
      dispatch?.({ type: "RESET" });
      localStorage.removeItem("vendorRegistrationData");
      localStorage.removeItem("vendorRegistrationStep");
      router.replace("/register/vendor/success");
    } catch (err) {
      setProgress(null);

      const status = err?.status;
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";

      if (status === 409) {
        // Email or phone already registered — tell the user exactly which field
        // and which step they need to go back to in order to fix it.
        const lower = message.toLowerCase();
        if (lower.includes("email")) {
          toast.error("Email already registered", {
            description: "An account already exists for this email address. Go back to Step 1 to use a different email or sign in instead.",
          });
          setError("This email address is already registered. Go back to Step 1 to change it.");
        } else if (lower.includes("phone")) {
          toast.error("Phone number already registered", {
            description: "This phone number is linked to an existing account. Go back to Step 2 to use a different number.",
          });
          setError("This phone number is already registered. Go back to Step 2 to change it.");
        } else {
          toast.error("Account already exists", { description: message });
          setError(message);
        }

      } else if (status === 400) {
        // Field-level validation errors from the backend
        const fieldErrors = err?.data?.data;
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          const lines = fieldErrors
              .filter(e => e?.message)
              .slice(0, 5)
              .map(e => `• ${e.message}`)
              .join('\n');
          toast.error("Please fix the highlighted issues", { description: lines });
          setError(`Some information needs to be corrected:\n${lines}`);
        } else {
          toast.error("Validation failed", { description: message });
          setError(message);
        }

      } else {
        toast.error("Registration failed", { description: message });
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4">

          {/* ── Header ── */}
          <div className="px-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Your Information</h1>
            <p className="text-sm text-gray-500 mt-0.5">Please review all details before submitting</p>
          </div>

          {/* ── Progress banner ── */}
          {progress && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <Upload className="h-4 w-4 text-orange-500 shrink-0 animate-pulse" />
                <p className="flex-1 text-sm font-medium text-orange-800 min-w-0">{progress}</p>
                {loading && <Loader2 className="h-4 w-4 text-orange-500 shrink-0 animate-spin" />}
              </div>
          )}

          {/* ── Validation errors ── */}
          {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-800">
                    {validationErrors.length} issue{validationErrors.length > 1 ? "s" : ""} need{validationErrors.length === 1 ? "s" : ""} to be fixed before submitting
                  </p>
                </div>
                <ul className="divide-y divide-red-100">
                  {validationErrors.map((err, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="flex items-start gap-2 min-w-0">
                          <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-red-800">{err.field}</span>
                            <span className="text-xs text-red-500 block">{err.message}</span>
                          </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit(err.step)}
                            disabled={loading}
                            className="flex items-center gap-1 text-xs text-red-600 bg-red-100 hover:bg-red-200 px-2.5 py-1.5 rounded-lg shrink-0 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          <Edit className="h-3 w-3" /> Fix
                        </button>
                      </li>
                  ))}
                </ul>
              </div>
          )}

          {/* ── Account ── */}
          <Card>
            <CardHead icon={Mail} title="Account Information" desc="Login credentials" step={1} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4 space-y-1">
              <Label icon={Mail} text="Email" />
              <Value>{state.email}</Value>
              <p className="text-xs text-gray-400 mt-1">Username auto-generated from your email</p>
            </div>
          </Card>

          {/* ── Personal ── */}
          <Card>
            <CardHead icon={User} title="Personal Information" desc="Your profile details" step={2} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4 space-y-4">
              {state.profileImageUrl && (
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                          src={state.profileImageUrl}
                          alt="Profile"
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                      <p className="text-xs text-gray-400">Uploaded</p>
                    </div>
                  </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label icon={User} text="First Name" />
                  <Value>{state.firstName}</Value>
                </div>
                <div>
                  <Label icon={User} text="Last Name" />
                  <Value>{state.lastName}</Value>
                </div>
              </div>
              <div>
                <Label icon={Phone} text="Phone" />
                <Value>{state.phone}</Value>
              </div>
            </div>
          </Card>

          {/* ── Store ── */}
          <Card>
            <CardHead icon={Store} title="Store Information" desc="Business details" step={2} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4 space-y-4">
              <div>
                <Label icon={Store} text="Store Name" />
                <Value>{state.restaurantName}</Value>
              </div>
              <div>
                <Label icon={FileText} text="Description" />
                <p className="text-sm text-gray-700 leading-relaxed break-words">{state.description}</p>
              </div>
              <div>
                <Label icon={UtensilsCrossed} text="Product Type" />
                <Value>{state.cuisineType}</Value>
              </div>
            </div>
          </Card>

          {/* ── Business Verification ── */}
          <Card>
            <CardHead icon={Shield} title="Business Verification" desc="Documents and branding" step={3} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4 space-y-4">

              {/* Tax ID */}
              <div>
                <Label icon={Hash} text="Business / Tax ID" />
                {state.taxId
                    ? <Value mono>{state.taxId}</Value>
                    : <Missing text="Not provided — required before first payout" />
                }
              </div>

              {/* License */}
              <div>
                <Label icon={Shield} text="Business License" />
                {state.businessLicenseUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">License uploaded</p>
                        <p className="text-xs text-gray-400 truncate">{state.businessLicenseUrl}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    </div>
                ) : (
                    <Missing text="Not provided — recommended for verification" />
                )}
              </div>

              {/* Logo */}
              {state.logoUrl && (
                  <div>
                    <Label icon={ImageIcon} text="Logo" />
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={state.logoUrl} alt="Logo" className="w-full h-36 object-cover" />
                      <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>
              )}

              {/* Banner */}
              {state.bannerUrl && (
                  <div>
                    <Label icon={ImageIcon} text="Banner" />
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={state.bannerUrl} alt="Banner" className="w-full h-36 object-cover" />
                      <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </Card>

          {/* ── Operations ── */}
          <Card>
            <CardHead icon={Clock} title="Business Operations" desc="Schedule and services" step={4} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4 space-y-5">

              {/* Schedule */}
              <div>
                <Label icon={Calendar} text="Weekly Schedule" />
                <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {DAYS_OF_WEEK.map(({ key, label, full }) => {
                    const d = state.operatingHours?.[key];
                    return (
                        <div key={key} className={`flex items-center justify-between px-3 py-2 ${d?.isOpen ? "bg-green-50" : "bg-white"}`}>
                          {/* Short on mobile, full on sm+ */}
                          <span className="text-xs sm:text-sm font-medium text-gray-800 shrink-0 w-8 sm:w-24">
                        <span className="sm:hidden">{label}</span>
                        <span className="hidden sm:inline">{full}</span>
                      </span>
                          {d?.isOpen ? (
                              <span className="text-xs text-gray-600 tabular-nums">
                          {fmt(d.openTime)} – {fmt(d.closeTime)}
                        </span>
                          ) : (
                              <span className="text-xs text-gray-400 italic">Closed</span>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>

              {/* Services */}
              <div>
                <Label icon={UtensilsCrossed} text="Services" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${
                      state.offersDelivery ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                  }`}>
                    <Truck className={`h-4 w-4 shrink-0 ${state.offersDelivery ? "text-orange-600" : "text-gray-400"}`} />
                    <span className="text-xs font-medium text-gray-800">Delivery</span>
                    {state.offersDelivery && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />}
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${
                      state.offersPickup ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}>
                    <ShoppingBag className={`h-4 w-4 shrink-0 ${state.offersPickup ? "text-green-600" : "text-gray-400"}`} />
                    <span className="text-xs font-medium text-gray-800">Pickup</span>
                    {state.offersPickup && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />}
                  </div>
                </div>
              </div>

              {/* Prep time */}
              <div>
                <Label icon={Timer} text="Preparation Time" />
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <Timer className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-800">{state.preparationTime} minutes</span>
                </div>
              </div>

              {/* Delivery settings */}
              {state.offersDelivery && (
                  <div>
                    <Label icon={Truck} text="Delivery Settings" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { icon: DollarSign, label: "Fee",      value: `$${state.deliveryFee?.toFixed(2)}`          },
                        { icon: Package,    label: "Min order", value: `$${state.minimumOrderAmount?.toFixed(2)}`   },
                        { icon: Timer,      label: "ETA",       value: `${state.estimatedDeliveryMinutes} min`      },
                        { icon: Navigation, label: "Radius",    value: `${state.maxDeliveryDistanceKm} km`          },
                      ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                            <div className="flex items-center gap-1 mb-1">
                              <Icon className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-400">{label}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{value}</p>
                          </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </Card>

          {/* ── Address ── */}
          <Card>
            <CardHead icon={MapPin} title="Business Address" desc="Where customers find you" step={3} onEdit={handleEdit} disabled={loading} />
            <div className="px-4 py-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">{state.address?.addressLine}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {state.address?.city}, {state.address?.province} {state.address?.postalCode}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Globe className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">{state.address?.country}</span>
                    </div>
                  </div>
                </div>
                {state.address?.defaultAddress && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-gray-500">Set as default address</span>
                    </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── Error ── */}
          {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800">Registration Error</p>
                  <p className="text-xs text-red-600 break-words mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
          )}

          {/* ── Submit ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3 shadow">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <p className="text-base font-bold text-gray-900">Ready to Submit?</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                By tapping &quot;Create Account&quot; you confirm the information is accurate and agree to our Terms of Service.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || validationErrors.length > 0}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
                    : validationErrors.length > 0
                        ? <><AlertCircle className="h-4 w-4" /> Fix {validationErrors.length} Issue{validationErrors.length > 1 ? "s" : ""} Above</>
                        : <><CheckCircle2 className="h-4 w-4" /> Create Account</>
                }
              </button>
              <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

          {/* bottom safe area */}
          <div className="h-4" />

        </div>
      </div>
  );
}