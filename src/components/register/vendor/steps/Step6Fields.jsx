import { MapPin, Building2, Map, Mail, Globe, CheckCircle2, AlertCircle, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Step 6 Form Fields - Business Address
 * Modular component for address fields
 */
export default function Step6Fields({ register, watch, setValue, errors }) {
  const addressLine = watch("addressLine");
  const city = watch("city");
  const province = watch("province");
  const postalCode = watch("postalCode");
  const country = watch("country");
  const defaultAddress = watch("defaultAddress");

  return (
    <>
      {/* Address Line */}
      <div className="space-y-2">
        <Label htmlFor="addressLine" className="text-gray-700 font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Address Line
          {addressLine && !errors.addressLine && (
            <span className="text-green-600 text-xs font-semibold">✓</span>
          )}
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="addressLine"
            placeholder="123 Main Street"
            className={`pl-10 h-11 ${
              addressLine && !errors.addressLine ? 'pr-12' : ''
            } ${
              errors.addressLine
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-gray-300 focus-visible:ring-blue-600"
            }`}
            {...register("addressLine")}
          />
          {!errors.addressLine && addressLine && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
          )}
        </div>
        {errors.addressLine && (
          <div className="flex items-start gap-1.5 text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{errors.addressLine.message}</p>
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
          {city && !errors.city && (
            <span className="text-green-600 text-xs font-semibold">✓</span>
          )}
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="city"
            placeholder="Toronto"
            className={`pl-10 h-11 ${
              city && !errors.city ? 'pr-12' : ''
            } ${
              errors.city
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-gray-300 focus-visible:ring-blue-600"
            }`}
            {...register("city")}
          />
          {!errors.city && city && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
          )}
        </div>
        {errors.city && (
          <div className="flex items-start gap-1.5 text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{errors.city.message}</p>
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
            {province && !errors.province && (
              <span className="text-green-600 text-xs font-semibold">✓</span>
            )}
          </Label>
          <div className="relative">
            <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="province"
              placeholder="AB"
              maxLength={2}
              className={`pl-10 h-11 uppercase ${
                province && !errors.province ? 'pr-12' : ''
              } ${
                errors.province
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-600"
              }`}
              {...register("province", {
                onChange: (e) => setValue("province", e.target.value.toUpperCase())
              })}
            />
            {!errors.province && province && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>
          {errors.province && (
            <div className="flex items-start gap-1.5 text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{errors.province.message}</p>
            </div>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-gray-700 font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Postal Code
            {postalCode && !errors.postalCode && (
              <span className="text-green-600 text-xs font-semibold">✓</span>
            )}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="postalCode"
              placeholder="A1B 2C3"
              maxLength={7}
              className={`pl-10 h-11 uppercase ${
                postalCode && !errors.postalCode ? 'pr-12' : ''
              } ${
                errors.postalCode
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-600"
              }`}
              {...register("postalCode", {
                onChange: (e) => setValue("postalCode", e.target.value.toUpperCase())
              })}
            />
            {!errors.postalCode && postalCode && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>
          {errors.postalCode && (
            <div className="flex items-start gap-1.5 text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{errors.postalCode.message}</p>
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
          {country && !errors.country && (
            <span className="text-green-600 text-xs font-semibold">✓</span>
          )}
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="country"
            className={`pl-10 h-11 ${
              country && !errors.country ? 'pr-12' : ''
            } ${
              errors.country
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-gray-300 focus-visible:ring-blue-600"
            }`}
            {...register("country")}
          />
          {!errors.country && country && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
          )}
        </div>
        {errors.country && (
          <div className="flex items-start gap-1.5 text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{errors.country.message}</p>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Currently serving restaurants in Canada
        </p>
      </div>

      {/* Default Address Checkbox */}
      <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        defaultAddress
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            defaultAddress ? "bg-blue-100" : "bg-gray-200"
          }`}>
            <Home className={`h-5 w-5 ${
              defaultAddress ? "text-blue-600" : "text-gray-400"
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
          checked={defaultAddress}
          onCheckedChange={(checked) => setValue("defaultAddress", !!checked)}
        />
      </div>
    </>
  );
}
