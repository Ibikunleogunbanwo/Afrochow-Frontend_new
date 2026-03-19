"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    Mail,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    Clock,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { AuthAPI } from "@/lib/api/auth.api"

export function ForgotPasswordModal({ isOpen, onClose, onSignInClick }) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [sentEmail, setSentEmail] = useState("")
    const [resendLoading, setResendLoading] = useState(false)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const [resendSent, setResendSent] = useState(false)

    const startResendCountdown = () => {
        setResendDisabled(true)
        setResendCountdown(60)
        const timer = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setResendDisabled(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleClose = () => {
        // reset state when modal closes
        setEmail("")
        setSuccess(false)
        setSentEmail("")
        setResendDisabled(false)
        setResendCountdown(0)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error("Invalid Email", { description: "Please enter your email address" })
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Invalid Email", { description: "Please enter a valid email address" })
            return
        }

        setLoading(true)

        try {
            await AuthAPI.forgotPassword(email)
            setSentEmail(email)
            setSuccess(true)
            startResendCountdown()
        } catch (err) {
            console.error("Forgot password failed:", err)
            toast.error("Failed to Send", { description: err.message || "Please try again" })
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        try {
            await AuthAPI.forgotPassword(sentEmail)
            setResendSent(true)
            setTimeout(() => setResendSent(false), 2000)
            startResendCountdown()
        } catch (err) {
            toast.error("Failed to Resend", { description: err.message || "Please try again" })
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">

                {/* Success View */}
                {success ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Check Your Email! 📧
                        </h2>
                        <p className="text-sm text-slate-600 mb-4">
                            We&#39;ve sent password reset instructions to
                        </p>

                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                            <p className="text-orange-600 font-semibold text-sm break-all">{sentEmail}</p>
                        </div>

                        <div className="text-left bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-orange-600" />
                                Next Steps:
                            </h3>
                            <ol className="space-y-1.5 text-xs text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-orange-600">1.</span>
                                    <span>Check your inbox (and spam folder)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-orange-600">2.</span>
                                    <span>Click the reset link in the email</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-orange-600">3.</span>
                                    <span>Create your new password</span>
                                </li>
                            </ol>
                        </div>

                        {/* Resend */}
                        <p className="text-xs text-slate-500 mb-2">Didn&#39;t receive the email?</p>
                        <button
                            onClick={handleResend}
                            disabled={resendDisabled || resendLoading || resendSent}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium mb-4 ${
                                resendSent
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : resendDisabled || resendLoading
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                            }`}
                        >
                            {resendLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                            ) : resendSent ? (
                                <><CheckCircle2 className="h-4 w-4" /> Email Sent!</>
                            ) : resendDisabled ? (
                                <><Clock className="h-4 w-4" /> Resend in {resendCountdown}s</>
                            ) : (
                                <><Mail className="h-4 w-4" /> Resend Email</>
                            )}
                        </button>

                        <button
                            onClick={onSignInClick || handleClose}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-semibold transition-colors text-sm"
                        >
                            Back to Sign In
                        </button>

                        <p className="text-xs text-slate-500 mt-4">
                            The reset link will expire in 1 hour
                        </p>
                    </div>
                ) : (
                    // Request Form View
                    <>
                        <DialogHeader>
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <DialogTitle className="text-center">Forgot Password?</DialogTitle>
                            <DialogDescription className="text-center">
                                Enter your email and we&#39;ll send you reset instructions.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <label htmlFor="reset-email" className="block text-sm font-bold text-slate-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        id="reset-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 h-11 border border-slate-300 rounded-xl text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all text-sm"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Enter the email address associated with your account
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="h-4 w-4" /> Send Reset Link</>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onSignInClick || handleClose}
                                className="flex items-center justify-center gap-2 w-full text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </button>
                        </form>

                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                Need Help?
                            </h3>
                            <ul className="text-xs text-slate-700 space-y-1">
                                <li>• Make sure you enter the correct email</li>
                                <li>• Check your spam/junk folder</li>
                                <li>• Link expires in 1 hour</li>
                            </ul>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}