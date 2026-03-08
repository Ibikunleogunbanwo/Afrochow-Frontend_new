"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm as useReactForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema } from "@/lib/schemas/restaurantSchema";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { useRouter } from "next/navigation";
import { Store, FileText, UtensilsCrossed, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import StepIndicator from "@/components/register/StepIndicator";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import ReviewBanner from "@/components/register/vendor/vendorComponent/Reviewbanner";
import { useReviewMode } from "@/components/register/vendor/hooks/Usereviewmode";
import { toast } from "@/components/ui/toast";

export default function Step3() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const { fromReview, isFromReview, navigateToReview, navigateToNextStep } = useReviewMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      restaurantName: state.restaurantName,
      description: state.description,
      cuisineType: state.cuisineType,
    },
  });

  const restaurantName = watch("restaurantName");
  const description = watch("description");
  const cuisineType = watch("cuisineType");

  const descriptionLength = description?.length || 0;
  const maxDescriptionLength = 500;

  const saveAndContinue = async (data) => {
    setIsSubmitting(true);
    try {
      dispatch({ type: "UPDATE", payload: data });
      navigateToNextStep("/register/vendor/step-4");
    } catch (error) {
      console.error("Error saving and continuing:", error);
      toast.error("Error Saving Progress", error.message || "Failed to save your progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAndReturn = async (data) => {
    setIsSubmitting(true);
    try {
      dispatch({ type: "UPDATE", payload: data });
      navigateToReview();
    } catch (error) {
      console.error("Error saving and returning:", error);
      toast.error("Error Saving Changes", error.message || "Failed to save your changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    if (isFromReview()) {
      await saveAndReturn(data);
    } else {
      await saveAndContinue(data);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-orange-50/30 to-red-50/20 p-4">
        <Card className="w-full max-w-md shadow-lg border-gray-200">
          <StepIndicator currentStep={3} totalSteps={6} />

          <div className="p-6 pb-4">
            <ReviewBanner show={fromReview} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Restaurant Information
            </h1>
            <p className="text-gray-600 text-sm">
              Share details about your restaurant to attract customers
            </p>
          </div>

          <form className="px-6 pb-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

            {/* Tips Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">
                    Pro Tips
                  </h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Highlight signature dishes or specialties</li>
                    <li>• Mention awards, certifications, or unique ingredients</li>
                    <li>• Keep it authentic and inviting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <FormActions
                fromReview={fromReview}
                onBack={() => router.back()}
                onContinue={handleSubmit(saveAndContinue)}
                onSaveAndReturn={handleSubmit(saveAndReturn)}
                continueText="Continue to Business Details"
                showBackButton={true}
                isSubmitting={isSubmitting}
            />

            {/* Progress Info */}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">
                You are halfway through! Keep going 🎯
              </p>
            </div>
          </form>
        </Card>
      </div>
  );
}