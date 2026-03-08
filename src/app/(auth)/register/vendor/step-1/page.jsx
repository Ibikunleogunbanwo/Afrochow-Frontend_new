"use client";

import { useForm as useReactForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/lib/schemas/accountSchema";
import { useStepForm } from "@/components/register/vendor/shared/useStepForm";
import FormContainer from "@/components/register/vendor/shared/FormContainer";
import Step1Fields from "@/components/register/vendor/steps/Step1Fields";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import LoginPrompt from "@/components/register/vendor/vendorComponent/LoginPrompt";

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: state.username,
      email: state.email,
      password: state.password,
      confirmPassword: state.confirmPassword,
      acceptTerms: state.acceptTerms,
    },
  });

  const onSubmit = handleFormSubmit(
    async (data) => saveAndContinue(data, "/register/vendor/step-2"),
    saveAndReturn
  );

  return (
    <FormContainer
      currentStep={1}
      title="Create Your Business Account"
      description="Let's get started with your account credentials"
      fromReview={fromReview}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Step1Fields
          register={register}
          control={control}
          watch={watch}
          errors={errors}
        />

        <FormActions
          fromReview={fromReview}
          onBack={goBack}
          onContinue={handleSubmit(async (data) => saveAndContinue(data, "/register/vendor/step-2"))}
          onSaveAndReturn={handleSubmit(saveAndReturn)}
          continueText="Continue to Profile Details"
          showBackButton={false}
          isSubmitting={isSubmitting}
        />

        {!fromReview && <LoginPrompt />}
      </form>
    </FormContainer>
  );
}