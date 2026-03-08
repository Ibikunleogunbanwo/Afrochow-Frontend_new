"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AuthAPI } from "@/lib/api/auth";
import { toast } from "@/components/ui/toast";
import { INITIAL_FORM_DATA } from "@/lib/constants/customerformData";
import {
  registrationSchema,
  formatZodErrors,
} from "@/lib/schemas/customerregistrationSchema";
import { Loader2 } from "lucide-react";
import RegistrationHeader from "@/components/register/customer/Registrationheader";
import AccountInformationSection from "@/components/register/customer/Accountinformationsection";
import PersonalInformationSection from "@/components/register/customer/Personalinformationsection";
import DeliveryAddressSection from "@/components/register/customer/Deliveryaddresssection";
import TermsAndConditionsSection from "@/components/register/customer/Termsandconditionssection";
import RegistrationSuccessScreen from "@/components/register/customer/Registrationsuccessscreen";
import {ImageUploadAPI} from "@/lib/api/imageUpload";

// Constants
const RESEND_COOLDOWN_SECONDS = 60;

export default function CustomerRegistration() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      const updatedFormData = {
        ...formData,
        address: {
          ...formData.address,
          [addressField]: fieldValue,
        },
      };
      setFormData(updatedFormData);
    } else {
      const updatedFormData = {
        ...formData,
        [name]: fieldValue,
      };
      setFormData(updatedFormData);
    }

    if (errors[name]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[name];
      setErrors(updatedErrors);
    }

    if (name === "password" || name === "confirmPassword") {
      const updatedErrors = { ...errors };
      delete updatedErrors.confirmPassword;
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    try {
      registrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = formatZodErrors(error);
      setErrors(formattedErrors);

      // Show toast for first error
      const firstError = Object.values(formattedErrors)[0];
      if (firstError) {
        toast.error('Validation Error', firstError);
      }

      setTimeout(() => {
        const firstError = document.querySelector(".border-red-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);

      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let profileImageUrl = null;

      // Only upload if image exists
      if (formData.profileImageUrl) {
        const imageResponse = await ImageUploadAPI.uploadRegistrationImage(
            formData.profileImageUrl,
            'CustomerProfileImage'
        );
        profileImageUrl = imageResponse.imageUrl;
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        ...(profileImageUrl && { profileImageUrl }),
        acceptTerms: formData.acceptTerms,
        defaultDeliveryInstructions: formData.defaultDeliveryInstructions,
        address: {
          addressLine: formData.address.addressLine,
          city: formData.address.city,
          province: formData.address.province,
          postalCode: formData.address.postalCode,
          country: 'Canada',
          defaultAddress: formData.address.defaultAddress,
        },
      };

      await AuthAPI.registerCustomer(payload);

      setUserEmail(formData.email);
      setShowSuccess(true);
      toast.success('Registration Successful!', 'Check your email to verify your account');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (email) => {
    if (!email) return;
    setResendLoading(true);

    try {
      await AuthAPI.resendVerificationEmail(email);

      toast.success('Email Resent!', 'Check your inbox again');

      setResendDisabled(true);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setResendCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setResendDisabled(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Resend failed:", err);
      toast.error('Resend Failed', err?.message || 'Please try again later');
      setResendDisabled(false);
      setResendCountdown(0);
    } finally {
      setResendLoading(false);
    }
  };

  // Show success screen
  if (showSuccess) {
    return (
        <RegistrationSuccessScreen
            userEmail={userEmail}
            resendLoading={resendLoading}
            resendDisabled={resendDisabled}
            resendCountdown={resendCountdown}
            handleResend={handleResend}
        />
    );
  }

  // Show registration form
  return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 py-12">
        <div className="w-full max-w-4xl">
          <RegistrationHeader />

          <form
              onSubmit={handleSubmit}
              className="bg-white shadow-xl border-x border-gray-200"
          >
            <div className="p-10 space-y-8">
              <AccountInformationSection
                  formData={formData}
                  errors={errors}
                  passwordFocused={passwordFocused}
                  setPasswordFocused={setPasswordFocused}
                  confirmPasswordTouched={confirmPasswordTouched}
                  setConfirmPasswordTouched={setConfirmPasswordTouched}
                  handleInputChange={handleInputChange}
              />

              <PersonalInformationSection
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  setFormData={setFormData}
              />

              <DeliveryAddressSection
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
              />

              <TermsAndConditionsSection
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
              />

              <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl h-11 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-[1.02]"
                >
                  {loading ? (
                      <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating Account...
                  </span>
                  ) : (
                      "Create Account"
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{" "}
                  <Link
                      href="/login"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </form>

          <div className="bg-white rounded-b-2xl shadow-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            © 2026 Afrochow. All rights reserved.
          </div>
        </div>
      </div>
  );
}