"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useForm as useReactForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema } from "@/lib/schemas/businessSchema";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { useRouter } from "next/navigation";
import { Info, Sparkles } from "lucide-react";
import StepIndicator from "@/components/register/StepIndicator";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import ReviewBanner from "@/components/register/vendor/vendorComponent/Reviewbanner";
import { useReviewMode } from "@/components/register/vendor/hooks/Usereviewmode";
import Step4Fields from "@/components/register/vendor/steps/Step4Fields";
import { toast } from "@/components/ui/toast";

export default function Step4() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const { fromReview, isFromReview, navigateToReview, navigateToNextStep } = useReviewMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      taxId: state.taxId || "",
      businessLicense: state.businessLicense || null,
      logoFile: state.logoFile || null,
      bannerFile: state.bannerFile || null,
    },
  });

  const saveAndContinue = async (data) => {
    setIsSubmitting(true);
    try {
      dispatch({
        type: "UPDATE",
        payload: {
          taxId: data.taxId || "",
          businessLicense: data.businessLicense || null,
          logoFile: data.logoFile || null,
          bannerFile: data.bannerFile || null,
        },
      });
      navigateToNextStep("/register/vendor/step-5");
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
      dispatch({
        type: "UPDATE",
        payload: {
          taxId: data.taxId || "",
          businessLicense: data.businessLicense || null,
          logoFile: data.logoFile || null,
          bannerFile: data.bannerFile || null,
        },
      });
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
        <Card className="w-full max-w-2xl shadow-lg border-gray-200">
          <StepIndicator currentStep={4} totalSteps={6} />

          <div className="p-6 pb-4">
            <ReviewBanner show={fromReview} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Business Information & Media
            </h1>
            <p className="text-gray-600 text-sm">
              Add your business details and visual identity
            </p>
          </div>

          <form className="px-6 pb-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Info Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-orange-900 mb-1">
                    Document Requirements
                  </h3>
                  <p className="text-xs text-orange-800">
                    Tax ID is optional now but required for payouts. Business license is
                    recommended for faster verification.
                  </p>
                </div>
              </div>
            </div>

            {/* All form fields now in Step4Fields component */}
            <Step4Fields
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />

            {/* Tips Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">Pro Tips</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Use high-quality images that represent your brand</li>
                    <li>• Ensure logo is clear and recognizable at small sizes</li>
                    <li>• Banner should showcase your best dishes or atmosphere</li>
                    <li>• All images should be well-lit and professional</li>
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
                continueText="Continue to Delivery Settings"
                showBackButton={true}
                isSubmitting={isSubmitting}
            />

            {/* Progress Info */}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">
                Almost done! Just a couple more steps
              </p>
            </div>
          </form>
        </Card>
      </div>
  );
}