import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ShoppingBag,
  Timer,
  DollarSign,
  Navigation,
  Package,
  Copy,
  Calendar,
  AlertCircle,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

/**
 * Copy Button Component
 * Allows copying hours to all days, weekdays, or weekends
 */
function CopyButton({ day, onApplyToAll, onApplyToWeekdays, onApplyToWeekends }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 xs:h-9 xs:w-9 md:h-10 md:w-10 p-0"
        title="Copy hours"
      >
        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 xs:mt-2 w-36 xs:w-40 sm:w-44 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-1 xs:p-1.5 sm:p-2">
            <div className="space-y-0.5 xs:space-y-1">
              <button
                type="button"
                onClick={() => {
                  onApplyToAll();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 text-[11px] xs:text-xs sm:text-sm md:text-base hover:bg-gray-50 rounded transition-colors"
              >
                Apply to all days
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyToWeekdays();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 text-[11px] xs:text-xs sm:text-sm md:text-base hover:bg-gray-50 rounded transition-colors"
              >
                Apply to weekdays
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyToWeekends();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 text-[11px] xs:text-xs sm:text-sm md:text-base hover:bg-gray-50 rounded transition-colors"
              >
                Apply to weekends
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Operating Hours Section Component
 * Handles weekly schedule with day-by-day hours
 */
export function OperatingHoursSection({ operatingHours, setValue, errors }) {
  const updateDayHours = (dayKey, field, value) => {
    const currentHours = operatingHours;
    setValue(
      "operatingHours",
      {
        ...currentHours,
        [dayKey]: {
          ...currentHours[dayKey],
          [field]: value,
        },
      },
      { shouldValidate: true }
    );
  };

  const applyToAllDays = (sourceDay) => {
    const sourceHours = operatingHours[sourceDay];
    const newHours = {};
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day.key] = { ...sourceHours };
    });
    setValue("operatingHours", newHours, { shouldValidate: true });
  };

  const applyToWeekdays = (sourceDay) => {
    const sourceHours = operatingHours[sourceDay];
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const newHours = { ...operatingHours };
    weekdays.forEach((day) => {
      newHours[day] = { ...sourceHours };
    });
    setValue("operatingHours", newHours, { shouldValidate: true });
  };

  const applyToWeekends = (sourceDay) => {
    const sourceHours = operatingHours[sourceDay];
    const weekends = ["saturday", "sunday"];
    const newHours = { ...operatingHours };
    weekends.forEach((day) => {
      newHours[day] = { ...sourceHours };
    });
    setValue("operatingHours", newHours, { shouldValidate: true });
  };

  return (
    <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
          <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Operating Hours
          </h3>
        </div>
        {errors && (
          <div className="flex items-center gap-1.5 text-red-600 text-[10px] xs:text-xs sm:text-sm bg-red-50 px-2 sm:px-3 py-1 rounded-full border border-red-200 w-fit">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span className="font-medium">{errors}</span>
          </div>
        )}
      </div>

      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day.key}
          className={`p-2.5 xs:p-3 sm:p-4 rounded-lg border-2 transition-all ${
            operatingHours?.[day.key]?.isOpen
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
            {/* Day Toggle */}
            <div className="flex items-center justify-between md:justify-start gap-3 md:w-40 lg:w-44">
              <Label
                htmlFor={`${day.key}-toggle`}
                className="text-xs xs:text-sm md:text-base font-medium text-gray-900 cursor-pointer"
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.short}</span>
              </Label>
              <Switch
                id={`${day.key}-toggle`}
                checked={operatingHours?.[day.key]?.isOpen || false}
                onCheckedChange={(checked) =>
                  updateDayHours(day.key, "isOpen", checked)
                }
              />
            </div>

            {/* Hours Inputs */}
            {operatingHours?.[day.key]?.isOpen ? (
              <div className="flex items-center gap-1.5 xs:gap-2 flex-1">
                <div className="flex items-center gap-1.5 xs:gap-2 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <Input
                      type="time"
                      value={operatingHours[day.key]?.openTime || "09:00"}
                      onChange={(e) =>
                        updateDayHours(day.key, "openTime", e.target.value)
                      }
                      className="h-8 xs:h-9 sm:h-10 md:h-11 text-[11px] xs:text-xs sm:text-sm md:text-base px-2 sm:px-3"
                    />
                  </div>
                  <span className="text-gray-400 text-[10px] xs:text-xs sm:text-sm flex-shrink-0">
                    to
                  </span>
                  <div className="flex-1 min-w-0">
                    <Input
                      type="time"
                      value={operatingHours[day.key]?.closeTime || "22:00"}
                      onChange={(e) =>
                        updateDayHours(day.key, "closeTime", e.target.value)
                      }
                      className="h-8 xs:h-9 sm:h-10 md:h-11 text-[11px] xs:text-xs sm:text-sm md:text-base px-2 sm:px-3"
                    />
                  </div>
                </div>

                {/* Copy Button */}
                <CopyButton
                  day={day}
                  onApplyToAll={() => applyToAllDays(day.key)}
                  onApplyToWeekdays={() => applyToWeekdays(day.key)}
                  onApplyToWeekends={() => applyToWeekends(day.key)}
                />
              </div>
            ) : (
              <div className="flex-1">
                <span className="text-xs xs:text-sm md:text-base text-gray-500 italic">
                  Closed
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Service Options Section Component
 * Toggles for delivery and pickup options
 */
export function ServiceOptionsSection({ offersDelivery, offersPickup, setValue, errors }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex items-center gap-1.5 xs:gap-2">
        <Truck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-400 flex-shrink-0" />
        Service Options
      </h3>

      <div className="grid md:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
        {/* Delivery Toggle */}
        <div
          className={`flex items-center justify-between p-2.5 xs:p-3 sm:p-4 rounded-lg border-2 transition-all ${
            offersDelivery
              ? "bg-blue-50 border-blue-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
            <div
              className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                offersDelivery ? "bg-blue-100" : "bg-gray-200"
              }`}
            >
              <Truck
                className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                  offersDelivery ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <Label
                htmlFor="offersDelivery"
                className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-900 font-medium cursor-pointer block"
              >
                Offer Delivery
              </Label>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500 hidden xs:block">
                Deliver to customers
              </p>
            </div>
          </div>
          <Switch
            id="offersDelivery"
            checked={offersDelivery}
            onCheckedChange={(val) =>
              setValue("offersDelivery", val, { shouldValidate: true })
            }
          />
        </div>

        {/* Pickup Toggle */}
        <div
          className={`flex items-center justify-between p-2.5 xs:p-3 sm:p-4 rounded-lg border-2 transition-all ${
            offersPickup
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
            <div
              className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                offersPickup ? "bg-green-100" : "bg-gray-200"
              }`}
            >
              <ShoppingBag
                className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                  offersPickup ? "text-green-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <Label
                htmlFor="offersPickup"
                className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-900 font-medium cursor-pointer block"
              >
                Offer Pickup
              </Label>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500 hidden xs:block">
                Customers pick up
              </p>
            </div>
          </div>
          <Switch
            id="offersPickup"
            checked={offersPickup}
            onCheckedChange={(val) =>
              setValue("offersPickup", val, { shouldValidate: true })
            }
          />
        </div>
      </div>

      {/* Service Error */}
      {errors && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2.5 xs:p-3 sm:p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] xs:text-xs sm:text-sm md:text-base font-medium">
            {errors}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Preparation Time Section Component
 */
export function PreparationTimeSection({ register, errors }) {
  return (
    <div className="space-y-1.5 xs:space-y-2">
      <Label
        htmlFor="preparationTime"
        className="text-gray-700 text-[11px] xs:text-xs sm:text-sm md:text-base font-medium flex items-center gap-1.5 xs:gap-2 flex-wrap"
      >
        <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
        <span>Avg. Preparation Time (min)</span>
        <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Timer className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <Input
          id="preparationTime"
          type="number"
          min={5}
          step={1}
          placeholder="e.g., 30"
          className={`pl-8 xs:pl-9 sm:pl-10 md:pl-11 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm md:text-base ${
            errors ? "border-red-500" : ""
          }`}
          {...register("preparationTime", {
            valueAsNumber: true,
          })}
        />
      </div>
      {errors && (
        <div className="flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <p className="text-[10px] xs:text-xs sm:text-sm font-medium">
            {errors}
          </p>
        </div>
      )}
      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500">
        Typical time to prepare an order (minimum 5 minutes)
      </p>
    </div>
  );
}

/**
 * Delivery Settings Section Component
 * Shows delivery-specific fields when delivery is enabled
 */
export function DeliverySettingsSection({ register, errors }) {
  return (
    <div className="space-y-2.5 xs:space-y-3 sm:space-y-4 pt-2 border-t border-gray-200">
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-400 flex-shrink-0" />
        <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-gray-900">
          Delivery Settings
        </h3>
        <span className="text-[10px] xs:text-xs sm:text-sm text-gray-500">
          (Required when delivery is enabled)
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
        {/* Delivery Fee */}
        <div className="space-y-1.5 xs:space-y-2">
          <Label
            htmlFor="deliveryFee"
            className="text-gray-700 text-[11px] xs:text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Delivery Fee ($)
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
            <Input
              id="deliveryFee"
              type="number"
              min={0}
              step="0.01"
              placeholder="5.00"
              className={`pl-7 xs:pl-8 sm:pl-9 md:pl-10 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm md:text-base ${
                errors?.deliveryFee ? "border-red-500" : ""
              }`}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.value = "";
              }}
              {...register("deliveryFee", { valueAsNumber: true })}
            />
          </div>
          {errors?.deliveryFee && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium">
                {errors.deliveryFee}
              </p>
            </div>
          )}
        </div>

        {/* Minimum Order */}
        <div className="space-y-1.5 xs:space-y-2">
          <Label
            htmlFor="minimumOrderAmount"
            className="text-gray-700 text-[11px] xs:text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Minimum Order ($)
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Package className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
            <Input
              id="minimumOrderAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="15.00"
              className={`pl-7 xs:pl-8 sm:pl-9 md:pl-10 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm md:text-base ${
                errors?.minimumOrderAmount ? "border-red-500" : ""
              }`}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.value = "";
              }}
              {...register("minimumOrderAmount", {
                valueAsNumber: true,
              })}
            />
          </div>
          {errors?.minimumOrderAmount && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium">
                {errors.minimumOrderAmount}
              </p>
            </div>
          )}
        </div>

        {/* Delivery Time */}
        <div className="space-y-1.5 xs:space-y-2">
          <Label
            htmlFor="estimatedDeliveryMinutes"
            className="text-gray-700 text-[11px] xs:text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Delivery Time (minutes)
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Timer className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
            <Input
              id="estimatedDeliveryMinutes"
              type="number"
              min={10}
              step={1}
              placeholder="45"
              className={`pl-7 xs:pl-8 sm:pl-9 md:pl-10 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm md:text-base ${
                errors?.estimatedDeliveryMinutes ? "border-red-500" : ""
              }`}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.value = "";
              }}
              {...register("estimatedDeliveryMinutes", {
                valueAsNumber: true,
              })}
            />
          </div>
          {errors?.estimatedDeliveryMinutes && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium">
                {errors.estimatedDeliveryMinutes}
              </p>
            </div>
          )}
        </div>

        {/* Delivery Radius */}
        <div className="space-y-1.5 xs:space-y-2">
          <Label
            htmlFor="maxDeliveryDistanceKm"
            className="text-gray-700 text-[11px] xs:text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Delivery Radius (km)
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Navigation className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
            <Input
              id="maxDeliveryDistanceKm"
              type="number"
              min={1}
              step="0.1"
              placeholder="10"
              className={`pl-7 xs:pl-8 sm:pl-9 md:pl-10 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm md:text-base ${
                errors?.maxDeliveryDistanceKm ? "border-red-500" : ""
              }`}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.value = "";
              }}
              {...register("maxDeliveryDistanceKm", {
                valueAsNumber: true,
              })}
            />
          </div>
          {errors?.maxDeliveryDistanceKm && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <p className="text-[10px] xs:text-xs sm:text-sm font-medium">
                {errors.maxDeliveryDistanceKm}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
