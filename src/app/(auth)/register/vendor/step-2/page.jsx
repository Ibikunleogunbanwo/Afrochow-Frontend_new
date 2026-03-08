"use client";

import { Card } from "@/components/ui/card";
import { useForm as useReactForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas/profileSchema";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StepIndicator from "@/components/register/StepIndicator";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import ReviewBanner from "@/components/register/vendor/vendorComponent/Reviewbanner";
import { useReviewMode } from "@/components/register/vendor/hooks/Usereviewmode";
import Step2Fields from "@/components/register/vendor/steps/Step2Fields";
import { toast } from "@/components/ui/toast";

export default function Step2() {
  const { state, dispatch } = useForm();
  const router = useRouter();
  const { fromReview, isFromReview, navigateToReview, navigateToNextStep } = useReviewMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: state.firstName,
      lastName: state.lastName,
      phone: state.phone,
      profileImageFile: null,
    },
  });

  const saveAndContinue = async (data) => {
    setIsSubmitting(true);
    try {
      dispatch({
        type: "UPDATE",
        payload: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          profileImageFile: data.profileImageFile || null,
        }
      });
      navigateToNextStep("/register/vendor/step-3");
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
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          profileImageFile: data.profileImageFile || null,
        }
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
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <StepIndicator currentStep={2} totalSteps={6} />

        <div className="p-6 pb-4">
          <ReviewBanner show={fromReview} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Profile Information
          </h1>
          <p className="text-gray-600 text-sm">
            Tell us about yourself to personalize your experience
          </p>
        </div>

        <form className="px-6 pb-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Step2Fields
            register={register}
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          {/* Action Buttons */}
          <FormActions
            fromReview={fromReview}
            onBack={() => router.back()}
            onContinue={handleSubmit(saveAndContinue)}
            onSaveAndReturn={handleSubmit(saveAndReturn)}
            continueText="Continue"
            showBackButton={true}
            isSubmitting={isSubmitting}
          />

          {/* Security Info */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500">
              Your information is encrypted and secure
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}