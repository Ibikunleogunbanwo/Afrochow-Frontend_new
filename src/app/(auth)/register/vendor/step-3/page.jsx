"use client";

import { useState } from "react";
import { useForm as useReactForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema } from "@/lib/schemas/businessSchema";
import { addressSchema } from "@/lib/schemas/addressSchema";
import { useStepForm } from "@/components/register/vendor/shared/useStepForm";
import FormContainer from "@/components/register/vendor/shared/FormContainer";
import FormActions from "@/components/register/vendor/vendorComponent/FormActions";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import ImageUploader from "@/components/image-uploader/ImageUploader";
import CropModal from "@/components/image-uploader/CropModal";
import { ImageUploadAPI, deleteImage } from "@/lib/api/imageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from '@/components/ui/toast';
import {
  FileText, Image as ImageIcon, MapPin, Building2,
  Mail, Globe, CheckCircle2, AlertCircle, Info, Home, X, Loader2,
} from "lucide-react";
import { CANADIAN_PROVINCES } from "@/lib/schemas/addressSchema";

const step3Schema = businessSchema.merge(addressSchema);

// ── Banner uploader ───────────────────────────────────────────────────────
function BannerUploader({ onChange, error, initialUrl, uploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError]   = useState(null);
  const [cropFile, setCropFile]     = useState(null); // file pending 16:9 crop

  const validateAndCrop = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Image must be under 5MB");
      return;
    }
    setFileError(null);
    // Open crop modal — actual onChange is called after user confirms crop
    setCropFile(file);
  };

  const handleFileSelect = (e) => validateAndCrop(e.target?.files?.[0]);
  const handleRemove    = () => { setFileError(null); onChange?.(null); };
  const handleDrop      = (e) => { e.preventDefault(); setDragActive(false); validateAndCrop(e.dataTransfer?.files?.[0]); };
  const handleCropConfirm = (croppedFile) => { setCropFile(null); onChange?.(croppedFile); };
  const handleCropCancel  = () => setCropFile(null);

  const displayError = fileError || error;

  return (
      <div className="space-y-2">
        <label className="text-gray-700 font-medium flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4" />
          Store Banner <span className="text-red-500">*</span>
          {initialUrl && !displayError && <span className="text-green-600 text-xs font-semibold ml-1">✓</span>}
        </label>

        {initialUrl ? (
            // ✅ removed `group`, button always visible
            <div className="relative">
              {uploading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                  src={initialUrl}
                  alt="Banner"
                  className={`w-full h-40 object-cover rounded-lg border-2 shadow ${displayError ? "border-red-300" : "border-gray-200"}`}
              />
              {/* ✅ always visible — no opacity-0 / group-hover */}
              <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
        ) : (
            <div
                className={`relative w-full h-40 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer bg-gray-50 transition-all ${
                    uploading    ? "border-orange-400 bg-orange-50/40" :
                        dragActive   ? "border-orange-500 bg-orange-50"   :
                            displayError ? "border-red-300 bg-red-50"         :
                                "border-gray-300 hover:border-orange-400"
                }`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
              {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-sm text-orange-600 font-medium">Uploading banner…</p>
                  </div>
              ) : (
                  <>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 text-center px-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${displayError ? "bg-red-100" : "bg-gray-100"}`}>
                        <ImageIcon className={`h-6 w-6 ${displayError ? "text-red-400" : "text-gray-400"}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Drop banner or click to browse</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP · max 5MB · wide images work best</p>
                    </div>
                  </>
              )}
            </div>
        )}

        {displayError && (
            <div className="flex items-start gap-1.5 text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{displayError}</p>
            </div>
        )}

        {/* 16:9 crop modal */}
        {cropFile && (
            <CropModal
                file={cropFile}
                aspectRatio={16 / 9}
                label="Store Banner"
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
            />
        )}
      </div>
  );
}

// ── Business License uploader ─────────────────────────────────────────────
function LicenseUploader({ onChange, error, initialUrl, uploading }) {
  const [fileError, setFileError] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload a PDF, JPG, PNG, or WEBP file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File must be under 10MB");
      return;
    }
    setFileError(null);
    onChange?.(file);
  };

  const handleFileSelect = (e) => processFile(e.target?.files?.[0]);
  const handleRemove    = () => { setFileError(null); onChange?.(null); };

  const isPDF        = initialUrl?.toLowerCase().endsWith(".pdf");
  const displayError = fileError || error;

  return (
      <div className="space-y-2">
        <label className="text-gray-700 font-medium flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Business License
          <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          {initialUrl && !displayError && <span className="text-green-600 text-xs font-semibold ml-1">✓</span>}
        </label>

        {initialUrl ? (
            <div className="relative p-3 bg-gray-50 rounded-lg border border-gray-200">
              {uploading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  </div>
              )}
              <div className="flex items-center gap-3">
                {isPDF ? (
                    <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-7 w-7 text-red-600" />
                    </div>
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={initialUrl} alt="License" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                  <p className="text-xs text-gray-500">Helps with faster verification</p>
                </div>
                <button
                    type="button"
                    onClick={handleRemove}
                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
        ) : (
            <div className={`relative border-2 border-dashed rounded-lg bg-gray-50 transition-all ${
                uploading    ? "border-orange-400 bg-orange-50/40" :
                    displayError ? "border-red-300 bg-red-50"         :
                        "border-gray-300 hover:border-orange-400"
            }`}>
              {uploading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <p className="text-sm text-orange-600 font-medium">Uploading license…</p>
                  </div>
              ) : (
                  <>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${displayError ? "bg-red-100" : "bg-gray-100"}`}>
                        <FileText className={`h-6 w-6 ${displayError ? "text-red-400" : "text-gray-400"}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Drop document or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG, WEBP · max 10MB</p>
                    </div>
                  </>
              )}
            </div>
        )}

        {displayError && (
            <div className="flex items-start gap-1.5 text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{displayError}</p>
            </div>
        )}
      </div>
  );
}

// ── Address field helper ──────────────────────────────────────────────────
function AddressField({ id, label, icon: Icon, value, onChange, error, placeholder, maxLength, transform }) {
  return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-gray-700 font-medium flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          {label}
          {value && !error && <span className="text-green-600 text-xs font-semibold">✓</span>}
        </Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
              id={id}
              placeholder={placeholder}
              value={value}
              maxLength={maxLength}
              onChange={(e) => onChange(transform ? transform(e.target.value) : e.target.value)}
              className={`pl-9 h-11 ${value && !error ? "pr-10" : ""} ${
                  error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-orange-500"
              }`}
          />
          {!error && value && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
        </div>
        {error && (
            <div className="flex items-start gap-1.5 text-red-600">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
        )}
      </div>
  );
}

// ── Main Step 3 ───────────────────────────────────────────────────────────
export default function Step3() {
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

  const [uploadingLogo,    setUploadingLogo]    = useState(false);
  const [uploadingBanner,  setUploadingBanner]  = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const addr = state.address || {};

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useReactForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      taxId:              state.taxId              || "",
      businessLicenseUrl: state.businessLicenseUrl || "",
      logoUrl:            state.logoUrl            || "",
      bannerUrl:          state.bannerUrl          || "",
      addressLine:        addr.addressLine         || "",
      city:               addr.city                || "",
      province:           addr.province            || "",
      postalCode:         addr.postalCode          || "",
      country:            addr.country             || "Canada",
      defaultAddress:     addr.defaultAddress      ?? true,
    },
  });

  const defaultAddress = watch("defaultAddress");

  const updateAddress = (field, value) => {
    setValue(field, value, { shouldValidate: true });
    dispatch({
      type: "UPDATE",
      payload: { address: { ...addr, ...watch(), [field]: value } },
    });
  };

  // ── Upload handlers ───────────────────────────────────────────────────

  const handleLogoUpload = async (fileOrUrl) => {
    const file = fileOrUrl instanceof File ? fileOrUrl : null;
    if (!file) {
      const oldUrl = state.logoUrl || null;
      if (oldUrl) {
        await deleteImage(oldUrl);
      }
      setValue("logoUrl", "");
      dispatch({ type: "UPDATE", payload: { logoUrl: "" } });
      return;
    }
    const oldUrl = state.logoUrl || null;
    try {
      setUploadingLogo(true);
      const res = await ImageUploadAPI.uploadRegistrationImage(file, "VendorLogo");
      const imageUrl = res?.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from logo upload");
      if (oldUrl && oldUrl !== imageUrl) {
        await deleteImage(oldUrl);
      }
      setValue("logoUrl", imageUrl);
      dispatch({ type: "UPDATE", payload: { logoUrl: imageUrl } });
    } catch (error) {
      toast.error(error.message || "Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file) => {
    if (!file) {
      const oldUrl = state.bannerUrl || null;
      if (oldUrl) {
        await deleteImage(oldUrl);
      }
      setValue("bannerUrl", "");
      dispatch({ type: "UPDATE", payload: { bannerUrl: "" } });
      return;
    }
    const oldUrl = state.bannerUrl || null;
    try {
      setUploadingBanner(true);
      const res = await ImageUploadAPI.uploadRegistrationImage(file, "VendorBanner");
      const imageUrl = res?.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from banner upload");
      if (oldUrl && oldUrl !== imageUrl) {
        await deleteImage(oldUrl);
      }
      setValue("bannerUrl", imageUrl);
      dispatch({ type: "UPDATE", payload: { bannerUrl: imageUrl } });
    } catch (error) {
      toast.error(error.message || "Banner upload failed. Please try again.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLicenseUpload = async (file) => {
    if (!file) {
      const oldUrl = state.businessLicenseUrl || null;
      if (oldUrl) {
        await deleteImage(oldUrl);
      }
      setValue("businessLicenseUrl", "");
      dispatch({ type: "UPDATE", payload: { businessLicenseUrl: "" } });
      return;
    }
    const oldUrl = state.businessLicenseUrl || null;
    try {
      setUploadingLicense(true);
      const res = await ImageUploadAPI.uploadRegistrationImage(file, "VendorBusinessLicense");
      const imageUrl = res?.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from license upload");
      if (oldUrl && oldUrl !== imageUrl) {
        await deleteImage(oldUrl);
      }
      setValue("businessLicenseUrl", imageUrl);

      dispatch({ type: "UPDATE", payload: { businessLicenseUrl: imageUrl } });
    } catch (error) {
      toast.error(error.message || "License upload failed. Please try again.");
    } finally {
      setUploadingLicense(false);
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────

  const buildPayload = (data) => ({
    taxId:              data.taxId              || "",
    businessLicenseUrl: data.businessLicenseUrl || "",
    logoUrl:            data.logoUrl            || "",
    bannerUrl:          data.bannerUrl          || "",
    address: {
      addressLine:    data.addressLine,
      city:           data.city,
      province:       data.province,
      postalCode:     data.postalCode,
      country:        data.country,
      defaultAddress: data.defaultAddress,
    },
  });


  const onSubmit = handleFormSubmit(
      async (data) => saveAndContinue(buildPayload(data), "/register/vendor/step-4"),
      async (data) => saveAndReturn(buildPayload(data))

  );

  return (
      <FormContainer
          currentStep={3}
          totalSteps={4}
          maxWidth="lg"
          title="Branding & Location"
          description="Upload your store's visual identity and business address"
          fromReview={fromReview}
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

          {/* ── BRANDING ── */}
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Branding</p>

          {/* Logo */}
          <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                  <div className="relative">
                    {uploadingLogo && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        </div>
                    )}
                    <ImageUploader
                        id="logoFile"
                        label="Store Logo"
                        icon={ImageIcon}
                        onChange={handleLogoUpload}
                        error={errors.logoUrl?.message}
                        size="lg"
                        showSuccess={false}
                        required
                        helpText="Square images work best (recommended: 512×512px)"
                        value={field.value}
                        cropAspect={1}
                        cropLabel="Store Logo"
                    />
                  </div>
              )}
          />

          {/* Banner */}
          <BannerUploader
              onChange={handleBannerUpload}
              error={errors.bannerUrl?.message}
              initialUrl={watch("bannerUrl")}
              uploading={uploadingBanner}
          />

          {/* Business License */}
          <LicenseUploader
              onChange={handleLicenseUpload}
              error={errors.businessLicenseUrl?.message}
              initialUrl={watch("businessLicenseUrl")}
              uploading={uploadingLicense}
          />

          {/* Tax ID */}
          <FormField
              label="Tax ID / Business Number"
              id="taxId"
              icon={FileText}
              error={errors.taxId?.message}
              value={watch("taxId")}
              helpText="Required before receiving payouts. You can add this later."
              labelExtra={<span className="text-gray-400 font-normal text-xs">(Optional)</span>}
              inputProps={{ type: "text", placeholder: "123-456-789", ...register("taxId") }}
          />

          {/* ── ADDRESS ── */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-900">Business Address</p>
                <p className="text-xs text-orange-800 mt-0.5">Ensure your address is accurate — it will be shown publicly to customers.</p>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-4">Your Location</p>

            <div className="space-y-4">
              <AddressField
                  id="addressLine" label="Street Address" icon={MapPin}
                  value={watch("addressLine")} error={errors.addressLine?.message}
                  placeholder="123 Main Street"
                  onChange={(v) => updateAddress("addressLine", v)}
              />
              <AddressField
                  id="city" label="City" icon={Building2}
                  value={watch("city")} error={errors.city?.message}
                  placeholder="Calgary"
                  onChange={(v) => updateAddress("city", v)}
              />
              <div className="grid grid-cols-2 gap-3">
                {/* Province */}
                <div className="space-y-1.5">
                  <label htmlFor="province" className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    Province
                    {watch("province") && !errors.province && <span className="text-green-600 text-xs font-semibold">✓</span>}
                  </label>
                  <select
                      id="province"
                      value={watch("province") || ""}
                      onChange={(e) => updateAddress("province", e.target.value)}
                      className={`w-full h-11 px-3 text-sm rounded-md border bg-background appearance-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50 transition-all
                    ${errors.province
                          ? "border-red-500 focus-visible:ring-red-500 bg-red-50/30"
                          : "border-gray-300 focus-visible:ring-orange-500"
                      }`}
                  >
                    <option value="" disabled>Select province</option>
                    {CANADIAN_PROVINCES.map((code) => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  {errors.province && (
                      <div className="flex items-start gap-1.5 text-red-600">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <p className="text-xs">{errors.province.message}</p>
                      </div>
                  )}
                </div>

                <AddressField
                    id="postalCode" label="Postal Code" icon={Mail}
                    value={watch("postalCode")} error={errors.postalCode?.message}
                    placeholder="T3P 2L8" maxLength={7}
                    transform={(v) => v.toUpperCase()}
                    onChange={(v) => updateAddress("postalCode", v)}
                />
              </div>
              <p className="text-xs text-gray-500 -mt-2">Postal code format: A1A 1A1</p>

              <AddressField
                  id="country" label="Country" icon={Globe}
                  value={watch("country")} error={errors.country?.message}
                  placeholder="Canada"
                  onChange={(v) => updateAddress("country", v)}
              />

              {/* Default Address Toggle */}
              <div className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  defaultAddress ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      defaultAddress ? "bg-orange-100" : "bg-gray-200"
                  }`}>
                    <Home className={`h-4 w-4 ${defaultAddress ? "text-orange-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <Label htmlFor="defaultAddress" className="text-gray-900 font-medium cursor-pointer text-sm">
                      Set as Default Address
                    </Label>
                    <p className="text-xs text-gray-500">Use for deliveries and invoices</p>
                  </div>
                </div>
                <Controller
                    name="defaultAddress"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="defaultAddress"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(!!checked);
                              updateAddress("defaultAddress", !!checked);
                            }}
                        />
                    )}
                />
              </div>
            </div>
          </div>

          <FormActions
              fromReview={fromReview}
              onBack={goBack}
              onContinue={handleSubmit(async (data) => saveAndContinue(buildPayload(data), "/register/vendor/step-4"))}
              onSaveAndReturn={handleSubmit(async (data) => saveAndReturn(buildPayload(data)))}
              continueText="Continue"
              showBackButton={true}
              isSubmitting={isSubmitting}
          />
        </form>
      </FormContainer>
  );
}