"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { addressSchema } from "@/lib/schemas/addressSchema";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  Map,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Home,
} from "lucide-react";
import StepIndicator from "@/components/register/StepIndicator";

export default function Step6() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});

  // Initialize address with defaults
  const address = {
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    defaultAddress: true,
    ...state.address,
  };

  const updateAddress = (field, value) => {
    dispatch({
      type: "UPDATE",
      payload: {
        address: { ...address, [field]: value },
      },
    });
  };

  const handleNext = () => {
    const result = addressSchema.safeParse(address);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    router.push("/register/vendor/review");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-orange-50/30 to-red-50/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        {/* Step Indicator */}
        <StepIndicator currentStep={6} totalSteps={6} />

        {/* Header */}
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Address
          </h1>
          <p className="text-gray-600 text-sm">
            Where customers can find your restaurant
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-900 mb-1">
                  Address Verification
                </h3>
                <p className="text-xs text-orange-800">
                  Ensure your address is accurate for deliveries and customer navigation. This will be shown publicly.
                </p>
              </div>
            </div>
          </div>

          {/* Address Line */}
          <div className="space-y-2">
            <Label htmlFor="addressLine" className="text-gray-700 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Line
              {address.addressLine && !errors.addressLine && (
                <span className="text-green-600 text-xs font-semibold">✓</span>
              )}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="addressLine"
                placeholder="123 Main Street"
                value={address.addressLine}
                onChange={(e) => updateAddress("addressLine", e.target.value)}
                className={`pl-10 h-11 ${
                  address.addressLine && !errors.addressLine ? 'pr-12' : ''
                } ${
                  errors.addressLine
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-orange-600"
                }`}
              />
              {!errors.addressLine && address.addressLine && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            {errors.addressLine && (
              <div className="flex items-start gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{errors.addressLine[0]}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Street address, apartment, suite, or building number
            </p>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              City
              {address.city && !errors.city && (
                <span className="text-green-600 text-xs font-semibold">✓</span>
              )}
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="city"
                placeholder="Toronto"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                className={`pl-10 h-11 ${
                  address.city && !errors.city ? 'pr-12' : ''
                } ${
                  errors.city
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-orange-600"
                }`}
              />
              {!errors.city && address.city && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            {errors.city && (
              <div className="flex items-start gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{errors.city[0]}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              City or municipality where your restaurant is located
            </p>
          </div>

          {/* Province & Postal Code Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Province */}
            <div className="space-y-2">
              <Label htmlFor="province" className="text-gray-700 font-medium flex items-center gap-2">
                <Map className="h-4 w-4" />
                Province
                {address.province && !errors.province && (
                  <span className="text-green-600 text-xs font-semibold">✓</span>
                )}
              </Label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="province"
                  placeholder="AB"
                  maxLength={2}
                  value={address.province}
                  onChange={(e) => updateAddress("province", e.target.value.toUpperCase())}
                  className={`pl-10 h-11 uppercase ${
                    address.province && !errors.province ? 'pr-12' : ''
                  } ${
                    errors.province
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-orange-600"
                  }`}
                />
                {!errors.province && address.province && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              {errors.province && (
                <div className="flex items-start gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{errors.province[0]}</p>
                </div>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Postal Code
                {address.postalCode && !errors.postalCode && (
                  <span className="text-green-600 text-xs font-semibold">✓</span>
                )}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="postalCode"
                  placeholder="A1B 2C3"
                  maxLength={7}
                  value={address.postalCode}
                  onChange={(e) => updateAddress("postalCode", e.target.value.toUpperCase())}
                  className={`pl-10 h-11 uppercase ${
                    address.postalCode && !errors.postalCode ? 'pr-12' : ''
                  } ${
                    errors.postalCode
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-orange-600"
                  }`}
                />
                {!errors.postalCode && address.postalCode && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              {errors.postalCode && (
                <div className="flex items-start gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{errors.postalCode[0]}</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 -mt-3">
            Province code (e.g., AB, ON, BC) and postal code format: A1A 1A1
          </p>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700 font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Country
              {address.country && !errors.country && (
                <span className="text-green-600 text-xs font-semibold">✓</span>
              )}
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="country"
                value={address.country}
                onChange={(e) => updateAddress("country", e.target.value)}
                className={`pl-10 h-11 ${
                  address.country && !errors.country ? 'pr-12' : ''
                } ${
                  errors.country
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-orange-600"
                }`}
              />
              {!errors.country && address.country && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            {errors.country && (
              <div className="flex items-start gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{errors.country[0]}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Currently serving restaurants in Canada
            </p>
          </div>

          {/* Default Address Checkbox */}
          <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            address.defaultAddress
              ? "bg-orange-50 border-orange-200"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                address.defaultAddress ? "bg-orange-100" : "bg-gray-200"
              }`}>
                <Home className={`h-5 w-5 ${
                  address.defaultAddress ? "text-orange-600" : "text-gray-400"
                }`} />
              </div>
              <div>
                <Label
                  htmlFor="defaultAddress"
                  className="text-gray-900 font-medium cursor-pointer"
                >
                  Set as Default Address
                </Label>
                <p className="text-xs text-gray-500">
                  Use for deliveries and invoices
                </p>
              </div>
            </div>
            <Checkbox
              id="defaultAddress"
              checked={address.defaultAddress}
              onCheckedChange={(checked) => updateAddress("defaultAddress", !!checked)}
            />
          </div>

          {/* Pro Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Pro Tips
                </h3>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Double-check your address for accurate deliveries</li>
                  <li>• Include suite/unit numbers if applicable</li>
                  <li>• This address will be visible to customers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors shadow-sm"
            >
              Review & Submit
            </Button>
          </div>

          {/* Progress Info */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500">
              Final step complete! Let's review your information 🎉
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}