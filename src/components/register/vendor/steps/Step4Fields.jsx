import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import ImageUploader from "@/components/image-uploader/ImageUploader";
import { Controller } from "react-hook-form";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";

/**
 * Banner Uploader Component
 * Rectangular shape for wide banner images
 */
function BannerUploader({ onChange, error }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, GIF, or WEBP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (onChange) onChange(file);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (onChange) onChange(null);
  };

  const handleDrag = (e, entering) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(entering);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      <label className="text-gray-700 font-medium flex items-center gap-2 text-sm">
        <ImageIcon className="h-4 w-4" />
        Restaurant Banner
        <span className="text-red-500">*</span>
        {preview && <span className="text-green-600 text-xs font-semibold">✓</span>}
      </label>

      {preview ? (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Banner Preview"
            className="w-full h-48 object-cover rounded-lg border-4 border-white shadow-lg ring-2 ring-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
      ) : (
        <div
          className={`relative w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer bg-gray-50 transition-all ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-orange-400'
          }`}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input style={{ color: 'black', backgroundColor: 'white' }}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop your banner image or click to browse
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF, or WEBP (max. 5MB)</p>
            <p className="text-xs text-gray-500">Wide images work best (recommended: 1200x400px)</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/**
 * Document Uploader Component
 * For PDF/Image files (business license)
 * Note: Uses base64 for preview only, not for localStorage persistence
 */
function DocumentUploader({ label, helpText, onChange, error, required = false }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, JPG, PNG, or WEBP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      if (onChange) onChange(file, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (onChange) onChange(null, null);
  };

  const handleDrag = (e, entering) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(entering);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  const isPDF = preview && (preview === 'pdf' || preview.startsWith('data:application/pdf'));

  return (
    <div className="space-y-2">
      <label className="text-gray-700 font-medium flex items-center gap-2 text-sm">
        {label}
        {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-400 font-normal text-xs">(Optional)</span>}
        {preview && <span className="text-green-600 text-xs font-semibold">✓</span>}
      </label>

      {preview ? (
        <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            {isPDF ? (
              <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="h-10 w-10 text-red-600" />
              </div>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Document uploaded</p>
              <p className="text-xs text-gray-500 mt-1">File uploaded successfully</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-orange-400'
          }`}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input style={{ color: 'black', backgroundColor: 'white' }}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop your document or click to browse
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP, or PDF (max. 10MB)</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

/**
 * Step 4 Form Fields - Business Information & Media
 * Modular component for business documents and branding
 */
export default function Step4Fields({ register, control, watch, setValue, errors }) {
  const { dispatch } = useForm();

  const taxId = watch("taxId");

  const handleLicenseChange = (file, base64) => {
    setValue("businessLicense", file);
    if (file) {
      dispatch({ type: "UPDATE", payload: { businessLicense: file } });
    } else {
      dispatch({ type: "UPDATE", payload: { businessLicense: null } });
    }
  };

  const handleLogoChange = (fileOrUrl) => {
    if (fileOrUrl instanceof File) {
      setValue("logoFile", fileOrUrl);
      dispatch({ type: "UPDATE", payload: { logoFile: fileOrUrl } });
    } else if (fileOrUrl === null) {
      setValue("logoFile", null);
      dispatch({ type: "UPDATE", payload: { logoFile: null } });
    }
  };

  const handleBannerChange = (fileOrUrl) => {
    if (fileOrUrl instanceof File) {
      setValue("bannerFile", fileOrUrl);
      dispatch({ type: "UPDATE", payload: { bannerFile: fileOrUrl } });
    } else if (fileOrUrl === null) {
      setValue("bannerFile", null);
      dispatch({ type: "UPDATE", payload: { bannerFile: null } });
    }
  };

  return (
    <>
      {/* Tax ID */}
      <FormField
        label="Tax ID / Business Number"
        id="taxId"
        icon={FileText}
        error={errors.taxId?.message}
        value={taxId}
        helpText="Required before receiving payouts. You can add this later."
        labelExtra={<span className="text-gray-400 font-normal text-xs">(Optional)</span>}
        inputProps={{
          type: "text",
          placeholder: "123-456-789",
          ...register("taxId"),
        }}
      />

      {/* Business License */}
      <DocumentUploader
        label="Business License"
        onChange={handleLicenseChange}
        error={errors.businessLicense?.message}
        helpText="Helps with faster verification and builds customer trust"
      />

      {/* Logo */}
      <Controller
        name="logoFile"
        control={control}
        render={({ field }) => (
          <ImageUploader
            id="logoFile"
            label="Restaurant Logo"
            icon={ImageIcon}
            onChange={handleLogoChange}
            error={errors.logoFile?.message}
            size="lg"
            showSuccess={false}
            required
            helpText="Square images work best (recommended: 512x512px)"
          />
        )}
      />

      {/* Banner - Custom rectangular uploader */}
      <BannerUploader
        onChange={handleBannerChange}
        error={errors.bannerFile?.message}
      />
    </>
  );
}
