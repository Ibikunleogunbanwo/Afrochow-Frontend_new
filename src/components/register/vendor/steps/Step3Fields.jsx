import { Store, FileText, UtensilsCrossed, CheckCircle2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";

/**
 * Step 3 Form Fields - Restaurant Information
 * Modular component for restaurant details
 */
export default function Step3Fields({ register, watch, errors }) {
  const restaurantName = watch("restaurantName");
  const description = watch("description");
  const cuisineType = watch("cuisineType");

  const descriptionLength = description?.length || 0;
  const maxDescriptionLength = 500;

  return (
    <>
      {/* Restaurant Name */}
      <FormField
        label="Restaurant Name"
        id="restaurantName"
        icon={Store}
        error={errors.restaurantName?.message}
        value={restaurantName}
        helpText="This will be displayed to customers on your storefront"
        inputProps={{
          type: "text",
          placeholder: "AfroChow Kitchen",
          ...register("restaurantName"),
        }}
      />

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
            {description && description.length >= 20 && !errors.description && (
              <span className="text-green-600 text-xs font-semibold">✓</span>
            )}
          </Label>
          <span className={`text-xs ${
            descriptionLength > maxDescriptionLength
              ? 'text-red-600 font-medium'
              : 'text-gray-500'
          }`}>
            {descriptionLength}/{maxDescriptionLength}
          </span>
        </div>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Textarea
            id="description"
            placeholder="Tell customers what makes your restaurant special. Include your story, signature dishes, or unique atmosphere..."
            className={`pl-10 min-h-30 resize-y ${
              errors.description
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-gray-300 focus-visible:ring-orange-500 focus-visible:border-orange-500"
            }`}
            {...register("description")}
          />
          {!errors.description && description && description.length >= 20 && (
            <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500 shrink-0" />
          )}
        </div>
        {errors.description && (
          <div className="flex items-start gap-1.5 text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{errors.description.message}</p>
          </div>
        )}
        {!errors.description && (
          <p className="text-xs text-gray-500">
            A compelling description helps customers discover your restaurant
          </p>
        )}
      </div>

      {/* Cuisine Type */}
      <FormField
        label="Cuisine Type"
        id="cuisineType"
        icon={UtensilsCrossed}
        error={errors.cuisineType?.message}
        value={cuisineType}
        helpText="Helps customers find your restaurant when searching by cuisine"
        inputProps={{
          type: "text",
          placeholder: "African, Caribbean, Fusion, etc.",
          ...register("cuisineType"),
        }}
      />
    </>
  );
}
