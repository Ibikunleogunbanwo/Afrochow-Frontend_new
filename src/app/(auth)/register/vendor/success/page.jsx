"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  Home,
  Store,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";

export default function RegistrationSuccess() {
  const router = useRouter();

 
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Card */}
        <Card className="shadow-2xl border-green-200 overflow-hidden !bg-white">
          {/* Header with Animation */}
          <div className="bg-linear-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg animate-bounce">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome Aboard! 
            </h1>
            <p className="text-green-50 text-lg">
              Your restaurant registration is complete
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Success Message */}
            <div className="text-center pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Registration Successful!
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Thank you for joining our platform! Your application has been submitted 
                and is now being reviewed by our team.
              </p>
            </div>

            {/* What Happens Next */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  What Happens Next?
                </h3>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Check Your Email</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      We&apos;ve sent a verification email to your inbox. Please verify your 
                      email address to activate your account.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Application Review</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Our team will review your application and verify your business 
                      documents. This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Start Selling</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Once approved, you&apos;ll receive an email confirmation and can start 
                      adding your menu items and accepting orders!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Preview */}
            <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  What You&apos;ll Get
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      Access to Customers
                    </h4>
                    <p className="text-xs text-gray-600">
                      Reach thousands of hungry customers in your area
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      Business Analytics
                    </h4>
                    <p className="text-xs text-gray-600">
                      Track orders, revenue, and customer insights
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Store className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      Restaurant Dashboard
                    </h4>
                    <p className="text-xs text-gray-600">
                      Manage menu, orders, and settings in one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      Marketing Support
                    </h4>
                    <p className="text-xs text-gray-600">
                      Featured listings and promotional opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => router.push("/verify-email")}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
              >
                Verify Email
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Support Card */}
        <Card className="shadow-lg border-gray-200">
          <div className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions or need assistance, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a
                href="mailto:support@afrocho.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support@afrocho.com
              </a>
              <span className="hidden sm:inline text-gray-300">•</span>
              <a
                href="tel:+1234567890"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                +1 (234) 567-8900
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}