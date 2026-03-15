"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Lock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { AuthAPI } from "@/lib/api/auth.api"
import { getPasswordStrength } from "@/components/register/PasswordStrength"

export function ResetPasswordModal({ isOpen, token, onSignInClick, onForgotPasswordClick })  {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })

    const passwordStrength = getPasswordStrength(formData.password)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSignIn = () => {
        if (onSignInClick) {
            onSignInClick()
        } else {
            router.push("/")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!token) {
            toast.error("Invalid Token", { description: "Reset token is missing or invalid" })
            return
        }

        if (!formData.password) {
            toast.error("Password Required", { description: "Please enter a new password" })
            return
        }

        if (formData.password.length < 8) {
            toast.error("Password Too Short", { description: "Password must be at least 8 characters" })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords Don't Match", { description: "Please make sure both passwords are identical" })
            return
        }

        setLoading(true)

        try {
            await AuthAPI.resetPassword(token, formData.password)
            setSuccess(true)
            toast.success("Password Reset!", { description: "Your password has been successfully updated" })
        } catch (err) {
            console.error("Password reset failed:", err)
            toast.error("Reset Failed", { description: err.message || "The link may have expired. Request a new one." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => router.push("/")}>
            <DialogContent className="sm:max-w-[425px]">

                {/* Success View */}
                {success ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Password Reset! 🎉
                        </h2>
                        <p className="text-sm text-slate-600 mb-6">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>

                        <button
                            onClick={handleSignIn}
                            className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Continue to Sign In
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    // Reset Form View
                    <>
                        <DialogHeader>
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <DialogTitle className="text-center">Reset Password</DialogTitle>
                            <DialogDescription className="text-center">
                                Create a new password for your account
                            </DialogDescription>
                        </DialogHeader>

                        {/* Token Error */}
                        {!token && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-red-700 font-medium">Invalid Reset Link</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            The reset token is missing or invalid.{' '}
                                            <button
                                                type="button"
                                                onClick={onForgotPasswordClick}
                                                className="underline font-semibold"
                                            >
                                                Request a new link
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
                                        disabled={loading || !token}
                                        className="w-full pl-10 pr-12 py-2.5 h-11 border border-slate-300 rounded-xl text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword
                                            ? <EyeOff className="h-4 w-4" />
                                            : <Eye className="h-4 w-4" />
                                        }
                                    </button>
                                </div>

                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-600">Password strength:</span>
                                            <span className={`text-xs font-medium ${
                                                passwordStrength.text === "Weak" ? "text-red-600"
                                                    : passwordStrength.text === "Medium" ? "text-amber-600"
                                                        : "text-green-600"
                                            }`}>
                                                {passwordStrength.text}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${passwordStrength.level}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        disabled={loading || !token}
                                        className={`w-full pl-10 pr-12 py-2.5 h-11 border rounded-xl text-black bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                                            formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? "border-green-500 focus:border-green-500 focus:ring-green-100"
                                                : "border-slate-300 focus:border-orange-500 focus:ring-orange-100"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff className="h-4 w-4" />
                                            : <Eye className="h-4 w-4" />
                                        }
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <p className="text-xs">Passwords match</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token || !formData.password || !formData.confirmPassword}
                                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Resetting Password...</>
                                ) : (
                                    <><Lock className="h-4 w-4" /> Reset Password</>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSignIn}
                                className="flex items-center justify-center w-full text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
                            >
                                Back to Sign In
                            </button>
                        </form>

                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                            <h3 className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-orange-600" />
                                Password Requirements
                            </h3>
                            <ul className="text-xs text-slate-700 space-y-0.5">
                                <li>• Minimum 8 characters</li>
                                <li>• Include uppercase and lowercase letters</li>
                                <li>• Include at least one number</li>
                                <li>• Special characters recommended</li>
                            </ul>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}