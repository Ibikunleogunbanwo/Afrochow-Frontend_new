'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthAPI } from '@/lib/api/auth';
import { toast } from '@/components/ui/toast';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const token = searchParams.get('token');

  // No useEffect needed - inline warning handles missing token

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 33, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: 66, text: 'Medium', color: 'bg-amber-500' };
    return { level: 100, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid Token', 'Reset token is missing or invalid');
      return;
    }

    if (!formData.password) {
      toast.error('Password Required', 'Please enter a new password');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password Too Short', 'Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords Don\'t Match', 'Please make sure both passwords are identical');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthAPI.resetPassword(token, formData.password);
      console.log('Password reset successful:', response);

      setSuccess(true);
      toast.success('Password Reset!', 'Your password has been successfully updated');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
      toast.error('Reset Failed', err.message || 'The link may have expired. Request a new one.');
    } finally {
      setLoading(false);
    }
  };


  // Success Screen
  if (success) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">

            {/* Success Icon */}
            <div className="w-24 h-24 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Password Reset! 🎉
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            {/* Login Button */}
            <button
                onClick={() => router.push('/login')}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Continue to Login
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
    );
  }

  // Reset Form
  return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-9 h-9 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-600 text-sm">
              Create a new password for your account
            </p>
          </div>

          {/* Token Error Warning */}
          {!token && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Invalid Reset Link</p>
                    <p className="text-xs text-red-600 mt-1">
                      The reset token is missing or invalid.{' '}
                      <Link href="/forgot-password" className="underline font-semibold">
                        Request a new link
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full pl-10 pr-12 py-2.5 h-11 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                    disabled={loading || !token}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                  ) : (
                      <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (passwordFocused || formData.password.length > 0) && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Password strength:</span>
                      <span className={`text-xs font-medium ${
                          passwordStrength.text === 'Weak' ? 'text-red-600' :
                              passwordStrength.text === 'Medium' ? 'text-amber-600' :
                                  'text-green-600'
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

              <p className="text-xs text-slate-500">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className={`w-full pl-10 pr-12 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        formData.confirmPassword && formData.password === formData.confirmPassword
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-100'
                            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-100'
                    }`}
                    disabled={loading || !token}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                >
                  {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                  ) : (
                      <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="text-sm">Passwords match</p>
                  </div>
              )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !token || !formData.password || !formData.confirmPassword}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
              ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Reset Password
                  </>
              )}
            </button>

            {/* Back to Login */}
            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
            >
              Back to Login
            </Link>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-600" />
              Password Requirements
            </h3>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Minimum 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Special characters recommended</li>
            </ul>
          </div>
        </div>
      </div>
  );
}