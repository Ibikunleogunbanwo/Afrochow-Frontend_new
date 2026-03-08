import { useState } from "react";
import { useForm as useContextForm } from "@/app/(auth)/register/vendor/context/Provider";
import { useRouter } from "next/navigation";
import { useReviewMode } from "@/components/register/vendor/hooks/Usereviewmode";
import { toast } from "@/components/ui/toast";

/**
 * Custom hook for vendor registration step forms
 * Centralizes common logic for all steps
 */
export function useStepForm() {
  const { state, dispatch } = useContextForm();
  const router = useRouter();
  const { fromReview, isFromReview, navigateToReview, navigateToNextStep } = useReviewMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Save data and continue to next step
   */
  const saveAndContinue = async (data, nextStepPath) => {
    setIsSubmitting(true);
    try {
      dispatch({ type: "UPDATE", payload: data });
      navigateToNextStep(nextStepPath);
    } catch (error) {
      console.error("Error saving and continuing:", error);
      toast.error("Error Saving Progress", error.message || "Failed to save your progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Save data and return to review page
   */
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

  /**
   * Handle form submission (auto-detects review mode)
   */
  const handleFormSubmit = (saveAndContinueFn, saveAndReturnFn) => {
    return async (data) => {
      if (isFromReview()) {
        await saveAndReturnFn(data);
      } else {
        await saveAndContinueFn(data);
      }
    };
  };

  /**
   * Navigate back
   */
  const goBack = () => {
    router.back();
  };

  return {
    state,
    dispatch,
    router,
    fromReview,
    isFromReview,
    isSubmitting,
    setIsSubmitting,
    saveAndContinue,
    saveAndReturn,
    handleFormSubmit,
    goBack,
    navigateToReview,
    navigateToNextStep,
  };
}
