"use client";

import { useState, useEffect } from "react";
import { useForm as useReactForm, Controller } from "react-hook-form";
import { SearchAPI } from '@/lib/api/search.api';
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
import { toast } from '@/components/ui/toast';
import {
  User, Phone, Camera, Store, UtensilsCrossed, FileText,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

const step2Schema = profileSchema.merge(restaurantSchema);

/** Fallback list used while the backend request is in-flight or if it fails. */
const CUISINE_TYPES_FALLBACK = [
    "African Home Kitchen",
    "African Restaurant",
    "African Soups & Stews",
    "African Grocery Store",
    "Bakery & Pastries",
    "Farm Produce",
    "Catering Services",
    "Caribbean Cuisine",
    "Frozen Meals & Meal Prep",
    "Halal Food",
    "Other",
];

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
  const [cuisineTypes, setCuisineTypes] = useState(CUISINE_TYPES_FALLBACK);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
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

  // Pull live category names from the admin-managed Category table so the
  // vendor dropdown always matches what admins configure (same list as header nav).
  useEffect(() => {
    SearchAPI.getAllCategories()
        .then(res => {
            const list = Array.isArray(res) ? res : res?.data;
            if (Array.isArray(list) && list.length > 0) {
                const names = list.map(c => c.name ?? c);
                setCuisineTypes(names);
                // If a previously saved value (e.g. from localStorage) is no longer
                // a valid admin category, clear it so the placeholder shows and
                // the Zod min(1) validation correctly blocks the user from continuing.
                const current = getValues("cuisineType");
                if (current && !names.includes(current)) {
                    setValue("cuisineType", "");
                }
            }
        })
        .catch(() => { /* keep fallback */ });
  // getValues/setValue are stable RHF references — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        await deleteImage(oldImageUrl);
      }

      setValue("profileImageUrl", imageUrl);
      dispatch({ type: "UPDATE", payload: { profileImageUrl: imageUrl } });

    } catch (error) {
      // Don't expose internal Cloudinary/storage errors — show a safe message
      const isUserFacingError =
          error.message === 'File is required' ||
          error.message === 'Category is required' ||
          error.message === 'No URL returned from upload';
      toast.error(
          isUserFacingError
              ? error.message
              : "Image upload failed. Please check your file and try again."
      );
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
          title="About You & Your Store"
          description="Tell us about yourself and your store"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-4">Your Store</p>

            <div className="space-y-5">
              <FormField
                  label="Store Name"
                  id="restaurantName"
                  icon={Store}
                  error={errors.restaurantName?.message}
                  value={watch("restaurantName")}
                  helpText="This will be displayed to customers on your storefront"
                  inputProps={{ type: "text", placeholder: "AfroChow Kitchen", ...register("restaurantName") }}
              />

              <Controller
                  name="cuisineType"
                  control={control}
                  render={({ field }) => (
                      <FormField
                          label="Product Type"
                          id="cuisineType"
                          type="select"
                          icon={UtensilsCrossed}
                          error={errors.cuisineType?.message}
                          value={field.value}
                          helpText="Helps customers find your store when searching by product type"
                          placeholder="Select product type…"
                          options={cuisineTypes}
                          selectProps={{
                              ...field,
                              onChange: (e) => field.onChange(e.target.value),
                          }}
                      />
                  )}
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
                      placeholder="Tell customers what makes your store special…"
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