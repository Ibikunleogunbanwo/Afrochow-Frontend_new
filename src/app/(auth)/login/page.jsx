'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/toast';
import router from 'next/router';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {useRouter} from "next/navigation";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const router = useRouter();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier.trim()) {
      toast.error('Missing Credentials', 'Please enter your username or email');
      return;
    }

    if (!formData.password) {
      toast.error('Missing Password', 'Please enter your password');
      return;
    }

    try {
      await login(formData.identifier, formData.password);
      toast.success('Welcome Back!', 'Login successful');

    } catch (err) {
      console.error('Login failed:', err);

      const errorMessage = err.message?.toLowerCase() || '';

      if (errorMessage.includes('verify') || errorMessage.includes('not verified')) {
        toast.error('Email Not Verified', 'Please verify your email to continue');
        router.push(`/verify-email?email=${encodeURIComponent(formData.identifier)}`);
      } else if (errorMessage.includes('credentials') || errorMessage.includes('invalid')) {
        toast.error('Invalid Credentials', 'Check your username/email and password');
      } else {
        toast.error('Login Failed', err.message || 'Please try again');
      }
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">

          {/* Main Login Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 lg:p-10">

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                Welcome Back!
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Sign in to your Afrochow account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

              {/* Username or Email */}
              <div className="space-y-2">
                <label htmlFor="identifier" className="block text-sm sm:text-base font-medium text-slate-700">
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                      id="identifier"
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      placeholder="Enter username or email"
                      autoComplete="username"
                      style={{ color: 'black', backgroundColor: 'white' }}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 h-12 sm:h-14 text-sm sm:text-base border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                      disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm sm:text-base font-medium text-slate-700">
                    Password
                  </label>
                  <Link
                      href="/forgot-password"
                      className="text-sm sm:text-base text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ color: 'black', backgroundColor: 'white' }}
                      className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-3.5 h-12 sm:h-14 text-sm sm:text-base border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-slate-300 text-orange-600 focus:ring-4 focus:ring-orange-100 cursor-pointer"
                      disabled={isLoading}
                  />
                  <span className="text-sm sm:text-base text-slate-700">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 sm:py-3.5 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl h-12 sm:h-14 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm sm:text-base">
                <span className="px-4 bg-white text-slate-500">New to Afrochow?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="space-y-3 sm:space-y-4">
              <Link
                  href="/register/customer"
                  className="w-full border-2 border-slate-300 hover:border-orange-600 hover:bg-orange-50 text-slate-700 hover:text-orange-700 py-3 sm:py-3.5 px-4 rounded-xl font-semibold transition-all h-12 sm:h-14 text-sm sm:text-base flex items-center justify-center"
              >
                Create Customer Account
              </Link>
              <Link
                  href="/register/vendor/step-1"
                  className="w-full border-2 border-slate-300 hover:border-purple-600 hover:bg-purple-50 text-slate-700 hover:text-purple-700 py-3 sm:py-3.5 px-4 rounded-xl font-semibold transition-all h-12 sm:h-14 text-sm sm:text-base flex items-center justify-center"
              >
                Register as Vendor
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-slate-500">
              © 2026 Afrochow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
  );
}