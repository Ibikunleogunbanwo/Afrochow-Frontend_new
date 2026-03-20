import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import PasswordStrengthIndicator from "@/components/register/vendor/vendorComponent/PasswordStrengthIndicator";
import TermsCheckbox from "@/components/register/vendor/vendorComponent/TermsCheckbox";

/**
 * Step 1 Form Fields - Account Credentials
 * Username is auto-generated from email on the backend.
 */
export default function Step1Fields({ register, control, watch, errors, password }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = watch("email");
  const confirmPassword = watch("confirmPassword");

  return (
    <>
      {/* Email Field */}
      <FormField
        label="Email Address"
        id="email"
        icon={Mail}
        error={errors.email?.message}
        value={email}
        helpText="This will be your login email"
        inputProps={{
          type: "email",
          placeholder: "you@company.com",
          ...register("email"),
        }}
      />

      {/* Password Field with Strength Indicator */}
      <div className="space-y-2">
        <FormField
          label="Password"
          id="password"
          icon={Lock}
          error={errors.password?.message}
          value={password}
          showSuccess={false}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          inputProps={{
            type: showPassword ? "text" : "password",
            placeholder: "Create a strong password",
            ...register("password"),
          }}
        />
        <PasswordStrengthIndicator
          password={password}
          visible={!!password}
        />
      </div>

      {/* Confirm Password Field */}
      <FormField
        label="Confirm Password"
        id="confirmPassword"
        icon={Lock}
        error={errors.confirmPassword?.message}
        value={confirmPassword}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
        inputProps={{
          type: showConfirmPassword ? "text" : "password",
          placeholder: "Re-enter your password",
          ...register("confirmPassword"),
        }}
      />

      {/* Terms and Conditions Checkbox */}
      <TermsCheckbox control={control} error={errors.acceptTerms} />
    </>
  );
}
