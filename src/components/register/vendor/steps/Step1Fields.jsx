import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import FormField from "@/components/register/vendor/vendorComponent/Formfield";
import PasswordStrengthIndicator from "@/components/register/vendor/vendorComponent/PasswordStrengthIndicator";
import TermsCheckbox from "@/components/register/vendor/vendorComponent/TermsCheckbox";

/**
 * Step 1 Form Fields - Account Credentials
 * Modular component for account creation fields
 */
export default function Step1Fields({ register, control, watch, errors }) {
  const [passwordFocused, setPasswordFocused] = useState(false);

  const username = watch("username");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <>
      {/* Username Field */}
      <FormField
        label="Username"
        id="username"
        icon={User}
        error={errors.username?.message}
        value={username}
        helpText="This will be your unique identifier on the platform"
        inputProps={{
          type: "text",
          placeholder: "johndoe",
          ...register("username"),
        }}
      />

      {/* Email Field */}
      <FormField
        label="Email Address"
        id="email"
        icon={Mail}
        error={errors.email?.message}
        value={email}
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
          inputProps={{
            type: "password",
            placeholder: "Create a strong password",
            ...register("password", {
              onBlur: () => setPasswordFocused(false),
            }),
            onFocus: () => setPasswordFocused(true),
          }}
        />
        <PasswordStrengthIndicator
          password={password}
          visible={passwordFocused || (password?.length > 0)}
        />
      </div>

      {/* Confirm Password Field */}
      <FormField
        label="Confirm Password"
        id="confirmPassword"
        icon={Lock}
        error={errors.confirmPassword?.message}
        value={confirmPassword}
        inputProps={{
          type: "password",
          placeholder: "Re-enter your password",
          ...register("confirmPassword"),
        }}
      />

      {/* Terms and Conditions Checkbox */}
      <TermsCheckbox control={control} error={errors.acceptTerms} />
    </>
  );
}
