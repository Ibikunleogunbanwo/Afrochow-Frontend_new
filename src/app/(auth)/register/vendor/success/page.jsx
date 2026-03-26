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
  RefreshCw,
} from "lucide-react";
import { useForm } from "../context/Provider";
import { resendVerificationEmail } from "@/lib/api/vendor_register_api";
import { toast } from '@/components/ui/toast';

const RESEND_COOLDOWN = 60;

export default function RegistrationSuccess() {
  const router = useRouter();
  const { state } = useForm();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail(state.email);
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(err.message || "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">

        {/* Success Card */}
        <Card className="shadow-xl border-orange-100 overflow-hidden !bg-white">

          {/* Orange Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <CheckCircle2 className="h-11 w-11 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome Aboard!</h1>
            <p className="text-orange-100 text-base">
              Your store registration is complete
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Email verification prompt */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    One step before you can log in
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We&apos;ve sent a <span className="font-medium text-gray-900">6-digit verification code</span> to{" "}
                    {state.email && (
                      <span className="font-medium text-gray-900">{state.email}</span>
                    )}
                    . Enter the code to activate your account and unlock your dashboard login. The code is valid for 24 hours.
                  </p>
                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      disabled={resending || cooldown > 0}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${resending ? "animate-spin" : ""}`}
                      />
                      {resending
                        ? "Sending…"
                        : cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : "Resend Code"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">What Happens Next?</h3>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Mail className="h-3.5 w-3.5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Enter the Code → Login Unlocked</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Enter the 6-digit code from your inbox (valid 24 hours). This verifies your email and immediately enables your login — you can sign in to your dashboard right away.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Store className="h-3.5 w-3.5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Log In & Set Up While You Wait</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Once your email is verified you can sign in, explore your dashboard, and set up your menu. Your profile is under review — you won&apos;t receive orders yet, but everything else is fully accessible.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Shield className="h-3.5 w-3.5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Admin Approval → Orders Open</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Our team verifies your business documents — typically 24–48 hours. Once approved you&apos;ll receive a confirmation email and your store will be live and able to accept orders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <h3 className="text-base font-semibold text-gray-900">What You&apos;ll Get</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: Users,
                    color: "text-orange-600",
                    bg: "bg-white",
                    title: "Access to Customers",
                    desc: "Reach thousands of hungry customers in your area",
                  },
                  {
                    icon: TrendingUp,
                    color: "text-orange-600",
                    bg: "bg-white",
                    title: "Business Analytics",
                    desc: "Track orders, revenue, and customer insights",
                  },
                  {
                    icon: Store,
                    color: "text-orange-600",
                    bg: "bg-white",
                    title: "Store Dashboard",
                    desc: "Manage menu, orders, and settings in one place",
                  },
                  {
                    icon: Shield,
                    color: "text-orange-600",
                    bg: "bg-white",
                    title: "Marketing Support",
                    desc: "Featured listings and promotional opportunities",
                  },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${bg} border border-orange-100 flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-0.5">{title}</h4>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/verify-email?email=${encodeURIComponent(state.email || "")}`
                  )
                }
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm"
              >
                Enter Verification Code
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Support */}
        <Card className="shadow-sm border-gray-200">
          <div className="p-5 text-center">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Need Help?</h3>
            <p className="text-xs text-gray-500 mb-3">
              Our support team is here to assist you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-1.5 justify-center text-sm">
              <a
                href="mailto:support@afrochow.com"
                className="text-orange-600 hover:text-orange-700 font-medium text-xs"
              >
                support@afrochow.com
              </a>
              <span className="hidden sm:inline text-gray-300">•</span>
              <a
                href="tel:+1234567890"
                className="text-orange-600 hover:text-orange-700 font-medium text-xs"
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
