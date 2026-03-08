import { useRouter } from "next/navigation";
import { MailCheck, CheckCircle2, Loader2, Clock } from "lucide-react";

export default function RegistrationSuccessScreen({
                                                      userEmail,
                                                      resendLoading,
                                                      resendDisabled,
                                                      resendCountdown,
                                                      handleResend,
                                                  }) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MailCheck className="w-14 h-14 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Check Your Email! 📧
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-base">
                    We&apos;ve sent a verification email to
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                    <p className="text-orange-600 font-semibold text-lg break-all">
                        {userEmail}
                    </p>
                </div>

                <div className="text-left bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-orange-600" />
                        Next Steps:
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-orange-600 mt-0.5">1.</span>
                            <span>Check your inbox (and spam folder)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-orange-600 mt-0.5">2.</span>
                            <span>Click the verification link in your email</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-orange-600 mt-0.5">3.</span>
                            <span>Once verified, you can log in to your account</span>
                        </li>
                    </ol>
                </div>

                <div className="text-sm text-gray-500 mb-6">
                    <p>Didn&apos;t receive the email?</p>
                    <button
                        onClick={() => handleResend(userEmail)}
                        disabled={resendDisabled || resendLoading}
                        className={`
              mt-4 w-full max-w-xs mx-auto
              flex items-center justify-center gap-2
              px-4 py-2 rounded-xl border transition-all text-sm font-medium
              ${
                            resendDisabled || resendLoading
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                        }
            `}
                    >
                        {resendLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending…
                            </>
                        ) : resendDisabled ? (
                            <>
                                <Clock className="h-4 w-4" />
                                Resend in {resendCountdown}s
                            </>
                        ) : (
                            <>
                                <MailCheck className="h-4 w-4" />
                                Resend verification email
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/verify-email?email=" + encodeURIComponent(userEmail))}
                        className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        Enter Verification Code
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    The verification link will expire in 24 hours
                </p>
            </div>
        </div>
    );
}