import { Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { getPasswordStrength } from "@/components/register/PasswordStrength";
import InputField from "@/components/register/customer/utils/InputField";
import ErrorMessage from "@/components/register/customer/utils/errorMessage";


export default function AccountInformationSection({
                                                      formData,
                                                      errors,
                                                      passwordFocused,
                                                      setPasswordFocused,
                                                      confirmPasswordTouched,
                                                      setConfirmPasswordTouched,
                                                      handleInputChange,
                                                  }) {
    const passwordStrength = getPasswordStrength(formData.password);

    const passwordsMatch =
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    const passwordsDontMatch =
        confirmPasswordTouched &&
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-100">
                📧 Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <InputField error={errors.username} helpText="This will be your unique identifier">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="johndoe"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 pr-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.username
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                        {!errors.username && formData.username && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                    </div>
                </InputField>

                {/* Email */}
                <InputField error={errors.email}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="you@example.com"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 pr-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.email
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                        {!errors.email && formData.email && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                    </div>
                </InputField>

                {/* Password */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            placeholder="Create a strong password"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.password
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>

                    {errors.password && <ErrorMessage message={errors.password} />}

                    {!errors.password &&
                        formData.password &&
                        (passwordFocused || formData.password.length > 0) && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Password strength:</span>
                                    <span
                                        className={`text-xs font-medium ${
                                            passwordStrength.text === "Weak"
                                                ? "text-red-600"
                                                : passwordStrength.text === "Medium"
                                                    ? "text-amber-600"
                                                    : "text-green-600"
                                        }`}
                                    >
                    {passwordStrength.text}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${passwordStrength.level}%` }}
                                    />
                                </div>
                            </div>
                        )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            onBlur={() => setConfirmPasswordTouched(true)}
                            placeholder="Re-enter your password"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 pr-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                                errors.confirmPassword || passwordsDontMatch
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                    : passwordsMatch
                                        ? "border-green-500 focus:border-green-500 ring-2 ring-green-100"
                                        : "border-gray-300 focus:border-orange-500 focus:ring-orange-100"
                            }`}
                        />
                        {passwordsMatch && !errors.confirmPassword && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {(errors.confirmPassword || passwordsDontMatch) && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                    </div>

                    {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword} />}

                    {!errors.confirmPassword && passwordsDontMatch && (
                        <ErrorMessage message="Passwords do not match" />
                    )}

                    {passwordsMatch && !errors.confirmPassword && (
                        <div className="flex items-start gap-1.5 text-green-600">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                            <p className="text-sm">Passwords match</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}