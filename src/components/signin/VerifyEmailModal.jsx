// components/signin/VerifyEmailModal.jsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    MailCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight,
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
import { RegistrationAPI } from "@/lib/api/registration.api"

export function VerifyEmailModal({ isOpen, onClose, email, onSignInClick }) {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const [resendSent, setResendSent] = useState(false)
    const hiddenInputRef = useRef(null)
    const timerRef = useRef(null)

    // focus the hidden input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => hiddenInputRef.current?.focus(), 150)
        }
    }, [isOpen])

    // countdown timer
    useEffect(() => {
        if (resendCountdown > 0) {
            timerRef.current = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        setResendDisabled(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [resendCountdown])

    const resetState = () => {
        setCode("")
        setSuccess(false)
        setResendDisabled(false)
        setResendCountdown(0)
    }

    const handleClose = () => {
        resetState()
        router.push("/")
        onClose()
    }

    const handleSignIn = () => {
        resetState()
        if (onSignInClick) {
            onSignInClick()
        } else {
            router.push("/")
        }
    }

    const handleCodeChange = useCallback((e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
        setCode(digits)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (code.length !== 6) {
            toast.error("Incomplete Code", { description: "Please enter all 6 digits" })
            return
        }

        setLoading(true)

        try {
            await RegistrationAPI.verifyEmail(code)
            setSuccess(true)
        } catch (err) {
            toast.error("Verification Failed", { description: err.message || "Invalid or expired code" })
            setCode("")
            setTimeout(() => hiddenInputRef.current?.focus(), 50)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) {
            toast.error("Email Missing", { description: "Email address not found. Please register again." })
            return
        }

        setResendLoading(true)

        try {
            await RegistrationAPI.resendVerificationEmail(email)
            setResendSent(true)
            setTimeout(() => setResendSent(false), 2000)
            setResendDisabled(true)
            setResendCountdown(60)
        } catch (err) {
            toast.error("Resend Failed", { description: err.message || "Please try again" })
        } finally {
            setResendLoading(false)
        }
    }

    // digits array used only for rendering the visual boxes
    const digits = code.split("")

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">

                {/* Success View */}
                {success ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Email Verified! 🎉
                        </h2>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Your email has been successfully verified. You can now sign in and start ordering delicious African cuisine!
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
                    // Verification Form
                    <>
                        <DialogHeader>
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <DialogTitle className="text-center">Verify Your Email</DialogTitle>
                            <DialogDescription className="text-center">
                                Enter the 6-digit code we sent to{" "}
                                {email && (
                                    <span className="text-orange-600 font-semibold break-all block mt-1">
                                        {email}
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

                            {/* Code Input — single hidden input + visual boxes */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 text-center">
                                    Verification Code
                                </label>

                                {/* Hidden real input that captures keystrokes */}
                                <input
                                    ref={hiddenInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={code}
                                    onChange={handleCodeChange}
                                    disabled={loading}
                                    maxLength={6}
                                    className="sr-only"
                                    aria-label="6-digit verification code"
                                />

                                {/* Visual digit boxes — tapping focuses the hidden input */}
                                <div
                                    className="flex gap-2 justify-center cursor-text"
                                    onClick={() => hiddenInputRef.current?.focus()}
                                >
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-10 h-12 flex items-center justify-center text-xl font-bold border-2 rounded-xl transition-all select-none ${
                                                loading
                                                    ? "opacity-50 border-slate-200 bg-slate-50"
                                                    : digits[i]
                                                        ? "border-orange-600 bg-orange-50 text-black"
                                                        : i === digits.length
                                                            ? "border-orange-400 bg-white ring-2 ring-orange-200"
                                                            : "border-slate-300 bg-white"
                                            }`}
                                        >
                                            {digits[i] || ""}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                                ) : (
                                    <><MailCheck className="h-4 w-4" /> Verify Email</>
                                )}
                            </button>

                            {/* Resend */}
                            <div className="text-center">
                                <p className="text-xs text-slate-600 mb-2">
                                    Didn&#39;t receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendDisabled || resendLoading || resendSent}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
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
                                        <><CheckCircle2 className="h-4 w-4" /> Code Sent!</>
                                    ) : resendDisabled ? (
                                        <><Clock className="h-4 w-4" /> Resend in {resendCountdown}s</>
                                    ) : (
                                        <><MailCheck className="h-4 w-4" /> Resend Code</>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                            <h3 className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                Need Help?
                            </h3>
                            <ul className="text-xs text-slate-700 space-y-0.5">
                                <li>• Check your spam/junk folder</li>
                                <li>• Code expires in 24 hours</li>
                                <li>• Make sure you entered the correct email</li>
                            </ul>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors text-center"
                        >
                            ← Back to Home
                        </button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}