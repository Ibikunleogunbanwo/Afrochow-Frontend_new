"use client";

import { useState } from "react";
import { useForm as useReactForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas/profileSchema";
import { restaurantSchema } from "@/lib/schemas/restaurantSchema";
import { useStepForm } from "@/components/register/vendor/shared/useStepForm";
import FormContainer from "@/components/register/vendor/shared/FormContainer";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import ImageUploader from "@/components/image-uploader/ImageUploader";
import { ImageUploadAPI, deleteImage } from "@/lib/api/imageUpload";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User, Phone, Camera, Store, UtensilsCrossed, FileText,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

const step2Schema = profileSchema.merge(restaurantSchema);

export default function Step2() {
  const {
    state,
    dispatch,
    fromReview,
    isSubmitting,
    saveAndContinue,
    saveAndReturn,
    handleFormSubmit,
    goBack,
  } = useStepForm();

  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      firstName: state.firstName,
      lastName: state.lastName,
      phone: state.phone,
      profileImageUrl: state.profileImageUrl || "",
      restaurantName: state.restaurantName,
      description: state.description,
      cuisineType: state.cuisineType,
    },
  });

  const description = watch("description");
  const descriptionLength = description?.length || 0;
  const maxDescriptionLength = 1000;

  // ── Image upload handler ───────────────────────────────────────────────

  const handleImageUpload = async (fileOrUrl) => {
    const file = fileOrUrl instanceof File ? fileOrUrl : null;

    // User cleared the image
    if (!file) {
      const oldImageUrl = state.profileImageUrl || null;
      if (oldImageUrl) {
        deleteImage(oldImageUrl).catch((err) =>
            console.warn("Old image cleanup failed:", err)
        );
      }
      setValue("profileImageUrl", "");
      dispatch({ type: "UPDATE", payload: { profileImageUrl: "" } });
      return;
    }

    const oldImageUrl = state.profileImageUrl || null;

    try {
      setUploadingImage(true);

      const uploadResponse = await ImageUploadAPI.uploadRegistrationImage(
          file,
          "VendorProfileImage"
      );

      // Response shape: { success: true, imageUrl: '...', message: '...' }
      const imageUrl = uploadResponse?.imageUrl;

      if (!imageUrl) throw new Error("No URL returned from upload");

      if (oldImageUrl && oldImageUrl !== imageUrl) {
        console.log("🗑️ Attempting to delete old image:", oldImageUrl);
        await deleteImage(oldImageUrl);
        console.log("✅ Old image deleted successfully:", oldImageUrl);

      }

      setValue("profileImageUrl", imageUrl);
      dispatch({ type: "UPDATE", payload: { profileImageUrl: imageUrl } });

    } catch (error) {
      toast.error(error.message || "Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────

  const onSubmit = handleFormSubmit(
      async (data) => saveAndContinue(data, "/register/vendor/step-3"),
      saveAndReturn
  );

  return (
      <FormContainer
          currentStep={2}
          totalSteps={4}
          title="About You & Your Restaurant"
          description="Tell us about yourself and your restaurant"
          fromReview={fromReview}
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Your Profile</p>

          <Controller
              name="profileImageUrl"
              control={control}
              render={({ field }) => (
                  <div className="relative">
                    {uploadingImage && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        </div>
                    )}
                    <ImageUploader
                        id="profileImage"
                        label="Profile Photo"
                        icon={Camera}
                        onChange={handleImageUpload}
                        error={errors.profileImageUrl?.message}
                        size="xl"
                        showSuccess={false}
                        helpText="Upload a clear photo for your profile (optional)"
                        labelExtra={<span className="text-gray-400 font-normal">(optional)</span>}
                        value={field.value}
                    />
                  </div>
              )}
          />

          <FormField
              label="First Name"
              id="firstName"
              icon={User}
              error={errors.firstName?.message}
              value={watch("firstName")}
              inputProps={{ type: "text", placeholder: "John", ...register("firstName") }}
          />

          <FormField
              label="Last Name"
              id="lastName"
              icon={User}
              error={errors.lastName?.message}
              value={watch("lastName")}
              inputProps={{ type: "text", placeholder: "Doe", ...register("lastName") }}
          />

          <FormField
              label="Phone Number"
              id="phone"
              icon={Phone}
              error={errors.phone?.message}
              value={watch("phone")}
              helpText="Used for account verification and important updates"
              inputProps={{ type: "tel", placeholder: "+1 (555) 000-0000", ...register("phone") }}
          />

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-4">Your Restaurant</p>

            <div className="space-y-5">
              <FormField
                  label="Restaurant Name"
                  id="restaurantName"
                  icon={Store}
                  error={errors.restaurantName?.message}
                  value={watch("restaurantName")}
                  helpText="This will be displayed to customers on your storefront"
                  inputProps={{ type: "text", placeholder: "AfroChow Kitchen", ...register("restaurantName") }}
              />

              <FormField
                  label="Cuisine Type"
                  id="cuisineType"
                  icon={UtensilsCrossed}
                  error={errors.cuisineType?.message}
                  value={watch("cuisineType")}
                  helpText="Helps customers find your restaurant when searching by cuisine"
                  inputProps={{ type: "text", placeholder: "African, Caribbean, Fusion…", ...register("cuisineType") }}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                    {description && description.length >= 20 && !errors.description && (
                        <span className="text-green-600 text-xs font-semibold">✓</span>
                    )}
                  </Label>
                  <span className={`text-xs ${descriptionLength > maxDescriptionLength ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {descriptionLength}/{maxDescriptionLength}
                </span>
                </div>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Textarea
                      id="description"
                      placeholder="Tell customers what makes your restaurant special…"
                      className={`pl-10 min-h-28 resize-y ${
                          !errors.description && description && description.length >= 20 ? "pr-10" : ""
                      } ${
                          errors.description
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "border-gray-300 focus-visible:ring-orange-500"
                      }`}
                      {...register("description")}
                  />
                  {!errors.description && description && description.length >= 20 && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.description && (
                    <div className="flex items-start gap-1.5 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">{errors.description.message}</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          <FormActions
              fromReview={fromReview}
              onBack={goBack}
              onContinue={handleSubmit(async (data) => saveAndContinue(data, "/register/vendor/step-3"))}
              onSaveAndReturn={handleSubmit(saveAndReturn)}
              continueText="Continue"
              showBackButton={true}
              isSubmitting={isSubmitting}
          />

          <div className="pt-1 text-center">
            <p className="text-xs text-gray-500">Your information is encrypted and secure</p>
          </div>
        </form>
      </FormContainer>
  );
}