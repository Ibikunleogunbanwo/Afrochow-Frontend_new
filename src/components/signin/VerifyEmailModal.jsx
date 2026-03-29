// components/signin/VerifyEmailModal.jsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import {
    MailCheck,
    AlertCircle,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Clock,
} from "lucide-react"
import { SuccessIcon } from "@/components/ui/animated-state-icons"
import { RegistrationAPI } from "@/lib/api/registration.api"

/**
 * Standalone OTP verification card — no Dialog wrapper.
 * Designed to be rendered full-screen inside /verify-email/page.jsx.
 *
 * Props
 *   email         – pre-filled email address (shown as hint)
 *   onClose       – called when user clicks "Back to Home"
 *   onSignInClick – called after successful verification
 */
export function VerifyEmailModal({ email, onClose, onSignInClick }) {
    const router = useRouter()

    // ── OTP state ──────────────────────────────────────────────────────────
    const [otp, setOtp]                       = useState(["", "", "", "", "", ""])
    const [loading, setLoading]               = useState(false)
    const [success, setSuccess]               = useState(false)

    // ── Resend state ───────────────────────────────────────────────────────
    const [resendLoading, setResendLoading]   = useState(false)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const [resendSent, setResendSent]         = useState(false)

    const inputRefs = useRef([])
    const timerRef  = useRef(null)

    // auto-focus first box on mount
    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 150)
    }, [])

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

    // ── OTP input handlers ─────────────────────────────────────────────────
    const handleChange = (index, value) => {
        if (value.length > 1) return
        if (value && !/^\d$/.test(value)) return

        const next = [...otp]
        next[index] = value
        setOtp(next)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                // clear current box first
                const next = [...otp]
                next[index] = ""
                setOtp(next)
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus()
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted.length) return

        const next = Array(6).fill("")
        for (let i = 0; i < Math.min(pasted.length, 6); i++) {
            next[i] = pasted[i]
        }
        setOtp(next)

        const nextEmpty = next.findIndex(d => d === "")
        setTimeout(() => inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus(), 0)
    }

    const codeString   = otp.join("")
    const isComplete   = otp.every(d => d !== "")

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault()
        if (codeString.length !== 6) {
            toast.error("Incomplete Code", { description: "Please enter all 6 digits" })
            return
        }
        setLoading(true)
        try {
            await RegistrationAPI.verifyEmail(codeString)
            setSuccess(true)
        } catch (err) {
            toast.error("Verification Failed", { description: err.message || "Invalid or expired code" })
            setOtp(["", "", "", "", "", ""])
            setTimeout(() => inputRefs.current[0]?.focus(), 50)
        } finally {
            setLoading(false)
        }
    }

    // auto-submit when all 6 digits filled
    useEffect(() => {
        if (isComplete && !loading && !success) {
            handleSubmit()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete])

    // ── Resend ─────────────────────────────────────────────────────────────
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

    const handleSignIn = () => {
        if (onSignInClick) onSignInClick()
        else router.push("/")
    }

    const handleBack = () => {
        if (onClose) onClose()
        else router.push("/")
    }

    // ── Render ─────────────────────────────────────────────────────────────

    // ── Success screen — full-page background ──────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-3">
                        Email Verified
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        Your email address has been successfully verified.
                        You may now sign in to access your account and begin placing orders.
                    </p>
                    <button
                        onClick={handleSignIn}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3.5 px-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Continue to Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ── Verification form ──────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-1">Verify Your Email</h1>
                            <p className="text-sm text-gray-500">
                                We&apos;ve sent a 6-digit code to
                            </p>
                            {email && (
                                <p className="text-sm font-semibold text-orange-600 mt-0.5 break-all">{email}</p>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* OTP boxes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 text-center uppercase tracking-wider mb-4">
                                    Verification Code
                                </label>
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => { inputRefs.current[i] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete={i === 0 ? "one-time-code" : "off"}
                                            value={digit}
                                            onChange={e => handleChange(i, e.target.value)}
                                            onKeyDown={e => handleKeyDown(i, e)}
                                            onPaste={handlePaste}
                                            disabled={loading}
                                            maxLength={1}
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className={`
                                                w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2
                                                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
                                                disabled:opacity-50
                                                ${digit
                                                    ? "border-orange-500 bg-orange-50 text-gray-900 focus:ring-orange-400"
                                                    : "border-gray-200 bg-white text-gray-900 focus:border-orange-400 focus:ring-orange-300"
                                                }
                                            `}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading || !isComplete}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                                ) : (
                                    <><MailCheck className="h-4 w-4" /> Verify Email</>
                                )}
                            </button>

                            {/* Resend */}
                            <div className="text-center space-y-2">
                                <p className="text-xs text-gray-500">Didn&apos;t receive the code?</p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendDisabled || resendLoading || resendSent}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ${
                                        resendSent
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : resendDisabled || resendLoading
                                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                                    }`}
                                >
                                    {resendLoading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
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

                        {/* Help tip */}
                        <div className="mt-6 p-3.5 bg-orange-50 border border-orange-100 rounded-2xl">
                            <h3 className="text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                                Need help?
                            </h3>
                            <ul className="text-xs text-gray-500 space-y-0.5">
                                <li>• Check your spam/junk folder</li>
                                <li>• The code expires in 24 hours</li>
                                <li>• Make sure you entered the correct email</li>
                            </ul>
                        </div>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mt-5 w-full text-sm text-gray-400 hover:text-orange-600 font-medium transition-colors text-center"
                        >
                            ← Back to Home
                        </button>
                </div>

            </div>
        </div>
    )
}
