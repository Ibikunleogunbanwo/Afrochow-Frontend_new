"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { registerVendor } from "@/lib/api/vendor_register_api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";

import {
  User, Mail, Phone, Store, UtensilsCrossed, FileText, Clock, Truck,
  ShoppingBag, Timer, MapPin, Globe, CheckCircle2, AlertCircle,
  Loader2, Edit, Image as ImageIcon, Shield, Hash, DollarSign, Package,
  Navigation, Calendar, X, Upload,
} from "lucide-react";
import {toast} from "@/components/ui/toast";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export default function Review() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);

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


  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };


  const handleSubmit = async (data) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      setUploadProgress("Uploading images and creating account...");

      // Validate required files
      if (!data.logoFile) {
        toast.error("Logo is required");
        return;
      }
      if (!data.bannerFile) {
        toast.error("Banner is required");
        return;
      }

      const payload = { ...data };

      const response = await registerVendor(payload);

      if (!response?.data?.publicUserId || !response?.data?.message) {
        toast.error(response?.data?.message || "Incomplete response from server");
      } else {
        setUploadProgress("Registration complete!");
        toast.success("Welcome Onboard", "Registration successful");
      }

      dispatch?.({ type: "RESET" });
      localStorage.removeItem("vendorRegistrationData");
      localStorage.removeItem("vendorRegistrationStep");

      router.replace("/register/vendor/success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(msg);
      setError(msg);
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };


  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-orange-50/30 to-red-50/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Review Your Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Please review all details before submitting
                </CardDescription>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">6 of 6 Complete</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500" style={{ width: "100%" }} />
            </div>
          </CardHeader>
        </Card>

        {/* Upload Progress */}
        {uploadProgress && (
          <Card className="bg-orange-50 border-orange-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-orange-600 animate-pulse" />
                <p className="flex-1 text-sm font-medium text-orange-900">{uploadProgress}</p>
                <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Account Information</CardTitle>
                <CardDescription className="text-sm text-gray-500">Login credentials</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(1)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Username</span>
                </div>
                <p className="text-gray-900 font-medium">{state.username}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                </div>
                <p className="text-gray-900 font-medium">{state.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
                <CardDescription className="text-sm text-gray-500">Your profile details</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(2)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {state.profileImageFile && (
              <div className="md:col-span-2 flex items-start gap-4 mb-4">
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(state.profileImageFile)}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="object-cover rounded-full w-20 h-20 border-2 border-gray-200"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                  <p className="text-xs text-gray-500 mt-1">{state.profileImageFile.name}</p>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">First Name</span>
                </div>
                <p className="text-gray-900 font-medium">{state.firstName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Last Name</span>
                </div>
                <p className="text-gray-900 font-medium">{state.lastName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>
                </div>
                <p className="text-gray-900 font-medium">{state.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Information */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Restaurant Information</CardTitle>
                <CardDescription className="text-sm text-gray-500">Your business details</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(3)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Restaurant Name</span>
                </div>
                <p className="text-gray-900 font-medium text-lg">{state.restaurantName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{state.description}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Cuisine Type</span>
                </div>
                <p className="text-gray-900 font-medium">{state.cuisineType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Verification */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Business Verification</CardTitle>
                <CardDescription className="text-sm text-gray-500">Documents and branding</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(4)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Tax ID */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Business/Tax ID</span>
                </div>
                {state.taxId ? (
                  <p className="text-gray-900 font-medium font-mono">{state.taxId}</p>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded border border-amber-200">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-amber-800">Not provided - Required before first payout</span>
                  </div>
                )}
              </div>

              {/* Business License */}
              {state.businessLicense ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Business License</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{state.businessLicense.name}</p>
                      <p className="text-xs text-gray-500">{(state.businessLicense.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Business License</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded border border-amber-200">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-amber-800">Not provided - Recommended for verification</span>
                  </div>
                </div>
              )}

              {/* Logo and Banner */}
              <div className="grid md:grid-cols-2 gap-4">
                {state.logoFile && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase">Logo</span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={URL.createObjectURL(state.logoFile)}
                        alt="Logo"
                        width={200}
                        height={200}
                        className="object-cover w-full h-48"
                      />
                      <div className="absolute bottom-2 right-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                {state.bannerFile && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase">Banner</span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={URL.createObjectURL(state.bannerFile)}
                        alt="Banner"
                        width={400}
                        height={225}
                        className="object-cover w-full h-48"
                      />
                      <div className="absolute bottom-2 right-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Operations */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Business Operations</CardTitle>
                <CardDescription className="text-sm text-gray-500">Weekly schedule and service options</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(5)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Weekly Schedule */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Weekly Schedule</span>
                </div>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = state.operatingHours?.[day.key];
                    return (
                      <div
                        key={day.key}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          dayHours?.isOpen ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-900 w-24">{day.label}</span>
                        {dayHours?.isOpen ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Options */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Service Options</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                      state.offersDelivery ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className={`h-5 w-5 ${state.offersDelivery ? "text-orange-600" : "text-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-900">Delivery</span>
                    </div>
                    {state.offersDelivery && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                      state.offersPickup ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className={`h-5 w-5 ${state.offersPickup ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-900">Pickup</span>
                    </div>
                    {state.offersPickup && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </div>
                </div>
              </div>

              {/* Preparation Time */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Preparation Time</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                  <Timer className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">{state.preparationTime} minutes</span>
                </div>
              </div>

              {/* Delivery Settings */}
              {state.offersDelivery && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Delivery Settings</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Delivery Fee</span>
                      </div>
                      <p className="text-gray-900 font-semibold">${state.deliveryFee?.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Minimum Order</span>
                      </div>
                      <p className="text-gray-900 font-semibold">${state.minimumOrderAmount?.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Delivery Time</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{state.estimatedDeliveryMinutes} min</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Navigation className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Delivery Radius</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{state.maxDeliveryDistanceKm} km</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Business Address</CardTitle>
                <CardDescription className="text-sm text-gray-500">Where customers can find you</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(6)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{state.address?.addressLine}</p>
                    <p className="text-gray-600 text-sm">
                      {state.address?.city}, {state.address?.province} {state.address?.postalCode}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-gray-400" /> {state.address?.country}
                    </p>
                  </div>
                </div>
                {state.address?.defaultAddress && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-600">Set as default address</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-red-900">Registration Error</CardTitle>
                  <CardDescription className="text-sm text-red-800">{error}</CardDescription>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Card */}
        <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-white to-orange-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">Ready to Submit?</CardTitle>
              <CardDescription className="text-sm text-gray-600 max-w-md">
                By clicking &quot;Create Account&quot;, you agree that the information provided is accurate and you
                accept our Terms of Service and Privacy Policy.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Address
              </Button>
              <Button
                onClick={() => handleSubmit(state)}
                disabled={loading}
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}