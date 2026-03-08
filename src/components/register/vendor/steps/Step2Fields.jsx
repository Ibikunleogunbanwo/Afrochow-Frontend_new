"use client";

import { User, Phone, Camera } from "lucide-react";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import ImageUploader from "@/components/image-uploader/ImageUploader";
import { Controller } from "react-hook-form";
import { useForm } from "@/app/(auth)/register/vendor/context/Provider";

/**
 * Step 2 Form Fields - Profile Information
 * Modular component for personal profile fields
 */
export default function Step2Fields({ register, control, watch, setValue, errors }) {
    const { dispatch } = useForm();

    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const phone = watch("phone");

    return (
        <>
            {/* Profile Image Upload */}
            <Controller
                name="profileImageFile"
                control={control}
                render={({ field }) => {
                    const handleProfileImageChange = (fileOrUrl) => {
                        field.onChange(fileOrUrl);

                        dispatch({
                            type: "UPDATE",
                            payload: { profileImageFile: fileOrUrl instanceof File ? fileOrUrl : null },
                        });

                        setValue("profileImageFile", fileOrUrl instanceof File ? fileOrUrl : null);
                    };

                    return (
                        <ImageUploader
                            id="profileImage"
                            label="Profile Photo"
                            icon={Camera}
                            onChange={handleProfileImageChange}
                            error={errors.profileImageFile?.message}
                            size="xl"
                            showSuccess={false}
                            helpText="Upload a clear photo for your profile (optional)"
                            labelExtra={<span className="text-gray-400 font-normal">(optional)</span>}
                            value={field.value} // ensures controlled
                        />
                    );
                }}
            />

            {/* First Name */}
            <FormField
                label="First Name"
                id="firstName"
                icon={User}
                error={errors.firstName?.message}
                value={firstName}
                inputProps={{
                    type: "text",
                    placeholder: "John",
                    ...register("firstName"),
                }}
            />

            {/* Last Name */}
            <FormField
                label="Last Name"
                id="lastName"
                icon={User}
                error={errors.lastName?.message}
                value={lastName}
                inputProps={{
                    type: "text",
                    placeholder: "Doe",
                    ...register("lastName"),
                }}
            />

            {/* Phone Number */}
            <FormField
                label="Phone Number"
                id="phone"
                icon={Phone}
                error={errors.phone?.message}
                value={phone}
                helpText="We'll use this for account verification and important updates"
                inputProps={{
                    type: "tel",
                    placeholder: "+1 (555) 000-0000",
                    ...register("phone"),
                }}
            />
        </>
    );
}
