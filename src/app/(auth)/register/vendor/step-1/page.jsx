"use client";

import { useForm as useReactForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { accountSchema } from "@/lib/schemas/accountSchema";
import { useStepForm } from "@/components/register/vendor/shared/useStepForm";
import FormContainer from "@/components/register/vendor/shared/FormContainer";
import Step1Fields from "@/components/register/vendor/steps/Step1Fields";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import LoginPrompt from "@/components/register/vendor/vendorComponent/LoginPrompt";
import { useAuth } from "@/hooks/useAuth";

export default function Step1() {
  const {
    state,
    fromReview,
    isSubmitting,
    saveAndContinue,
    saveAndReturn,
    handleFormSubmit,
    goBack,
  } = useStepForm();

  // Vendor accounts are separate User rows from customer accounts, so an
  // already-signed-in visitor can't reuse their existing email here — the
  // backend rejects it with "Email already exists" only after this whole
  // form is submitted. Surface that upfront instead of letting them hit a
  // confusing dead end after filling everything out.
  const { isAuthenticated, email: signedInEmail } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: {
      email: state.email,
      password: state.password,
      confirmPassword: state.confirmPassword,
      acceptTerms: state.acceptTerms,
    },
  });

  // react-hook-form's watch() returns an inherently non-memoizable function,
  // so React Compiler skips memoizing this component — acceptable here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch("password");

  const onSubmit = handleFormSubmit(
    async (data) => saveAndContinue(data, "/register/vendor/step-2"),
    saveAndReturn
  );

  return (
    <FormContainer
      currentStep={1}
      totalSteps={4}
      title="Create Your Business Account"
      description="Let's get started with your account credentials"
      fromReview={fromReview}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {isAuthenticated && !fromReview && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              You&apos;re signed in{signedInEmail ? ` as ${signedInEmail}` : ""}. Vendor accounts
              need their own email, separate from your customer account. Use a different email below.
            </span>
          </div>
        )}

        <Step1Fields
          register={register}
          control={control}
          watch={watch}
          errors={errors}
          password={password}
        />

        <FormActions
          fromReview={fromReview}
          onBack={goBack}
          onContinue={handleSubmit(async (data) => saveAndContinue(data, "/register/vendor/step-2"))}
          onSaveAndReturn={handleSubmit(saveAndReturn)}
          continueText="Continue"
          showBackButton={false}
          isSubmitting={isSubmitting}
        />

        {!fromReview && <LoginPrompt />}
      </form>
    </FormContainer>
  );
}
