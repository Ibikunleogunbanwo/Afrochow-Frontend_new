'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RegistrationAPI } from '@/lib/api/registration.api';
import { toast } from '@/components/ui/toast';
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef(null);

  const emailFromUrl = searchParams.get('email') || '';

  // Autofocus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      timerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resendCountdown]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Autofocus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current box is empty, move to previous box
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }

    // Arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    const newCode = [...code];
    digits.forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);

    // Focus last filled box
    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      toast.error('Incomplete Code', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await RegistrationAPI.verifyEmail(verificationCode);
      console.log('Verification successful:', response);

      setSuccess(true);
      toast.success('Email Verified!', 'Your account is now active');

      // Redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error('Verification failed:', err);
      toast.error('Verification Failed', err.message || 'Invalid or expired code');

      // Clear code and refocus first input
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailFromUrl) {
      toast.error('Email Missing', 'Email address not found. Please register again.');
      return;
    }

    setResendLoading(true);

    try {
      await RegistrationAPI.resendVerificationEmail(emailFromUrl);

      toast.success('Code Resent!', 'Check your email inbox and spam folder');

      setResendDisabled(true);
      setResendCountdown(60);

    } catch (err) {
      console.error('Resend failed:', err);
      toast.error('Resend Failed', err.message || 'Please try again');
    } finally {
      setResendLoading(false);
    }
  };

  // SUCCESS STATE
  if (success) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-3 sm:p-4 md:p-6">
          <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 md:p-12 text-center">

            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              Email Verified! 🎉
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed px-2">
              Your email has been successfully verified. You can now log in and start ordering delicious African cuisine!
            </p>

            {/* Countdown */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                Redirecting to login in <span className="font-bold text-lg">3</span> seconds...
              </p>
            </div>

            {/* Login Button */}
            <button
                onClick={() => router.push('/login')}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02]"
            >
              Continue to Login
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
    );
  }

  // VERIFICATION FORM
  return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 px-2">
              Enter the 6-digit code we sent to
            </p>
            {emailFromUrl && (
                <p className="text-orange-600 font-semibold mt-1 break-all text-xs sm:text-sm px-2">
                  {emailFromUrl}
                </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

            {/* Code Input */}
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 text-center">
                Verification Code
              </label>

              {/* 6-Digit Input Boxes */}
              <div className="flex gap-1.5 sm:gap-2 justify-center px-2">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        style={{ color: 'black', backgroundColor: 'white' }}
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-md sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                            digit
                                ? 'border-orange-600 bg-orange-50 text-orange-900'
                                : 'border-slate-300 focus:border-orange-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || code.join('').length !== 6}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02]"
            >
              {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Verifying...
                  </>
              ) : (
                  <>
                    <MailCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    Verify Email
                  </>
              )}
            </button>

            {/* Resend Section */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
                Didn&apos;t receive the code?
              </p>
              <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendDisabled || resendLoading}
                  className={`
                w-full sm:max-w-xs mx-auto
                flex items-center justify-center gap-2
                px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm font-medium
                ${
                      resendDisabled || resendLoading
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                  }
              `}
              >
                {resendLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Sending...
                    </>
                ) : resendDisabled ? (
                    <>
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Resend in {resendCountdown}s
                    </>
                ) : (
                    <>
                      <MailCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Resend Code
                    </>
                )}
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
              Need Help?
            </h3>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Code expires in 24 hours</li>
              <li>• Make sure you entered the correct email</li>
            </ul>
          </div>

          {/* Back to Home */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
                onClick={() => router.push('/')}
                className="text-xs sm:text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
  );
}