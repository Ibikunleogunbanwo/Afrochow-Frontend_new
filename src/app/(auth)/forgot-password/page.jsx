'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthAPI } from '@/lib/api/auth';
import { toast } from '@/components/ui/toast';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Invalid Email', 'Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthAPI.forgotPassword(email);
      console.log('Reset email sent:', response);

      setSentEmail(email);
      setSuccess(true);

      toast.success('Email Sent!', 'Check your inbox for reset instructions');

      // Start resend countdown
      setResendDisabled(true);
      setResendCountdown(60);

      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Forgot password failed:', err);
      toast.error('Failed to Send', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      await AuthAPI.forgotPassword(sentEmail);

      toast.success('Email Resent!', 'Check your inbox again');

      // Restart countdown
      setResendDisabled(true);
      setResendCountdown(60);

      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      toast.error('Failed to Resend', err.message || 'Please try again');
    } finally {
      setResendLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">

            {/* Success Icon */}
            <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Check Your Email! 📧
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We&apos;ve sent password reset instructions to
            </p>

            {/* Email Display */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-orange-600 font-semibold text-lg break-all">{sentEmail}</p>
            </div>

            {/* Instructions */}
            <div className="text-left bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                Next Steps:
              </h3>
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-orange-600 mt-0.5">1.</span>
                  <span>Check your inbox (and spam folder)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-orange-600 mt-0.5">2.</span>
                  <span>Click the reset link in the email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-orange-600 mt-0.5">3.</span>
                  <span>Create your new password</span>
                </li>
              </ol>
            </div>

            {/* Resend Section */}
            <div className="text-sm text-slate-500 mb-6">
              <p>Didn&apos;t receive the email?</p>
              <button
                  onClick={handleResend}
                  disabled={resendDisabled || resendLoading}
                  className={`
                mt-3 w-full max-w-xs mx-auto
                flex items-center justify-center gap-2
                px-4 py-2 rounded-xl border transition-all text-sm font-medium
                ${
                      resendDisabled || resendLoading
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                  }
              `}
              >
                {resendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                ) : resendDisabled ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Resend in {resendCountdown}s
                    </>
                ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Resend Email
                    </>
                )}
              </button>
            </div>

            {/* Back to Login */}
            <button
                onClick={() => router.push('/login')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              Back to Login
            </button>

            {/* Help Text */}
            <p className="text-xs text-slate-500 mt-6">
              The reset link will expire in 1 hour
            </p>
          </div>
        </div>
    );
  }

  // Request Form
  return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-600 text-sm">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full pl-10 pr-4 py-2.5 h-11 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                    disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500">
                Enter the email address associated with your account
              </p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
              ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Reset Link
                  </>
              )}
            </button>

            {/* Back to Login */}
            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Need Help?
            </h3>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Make sure you enter the correct email</li>
              <li>• Check your spam/junk folder</li>
              <li>• Link expires in 1 hour</li>
            </ul>
          </div>
        </div>
      </div>
  );
}