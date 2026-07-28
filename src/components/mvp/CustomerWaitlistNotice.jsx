"use client";

import Link from "next/link";
import { ArrowRight, Heart, Store } from "lucide-react";
import { customerWaitlistPath } from "@/lib/mvp";

export default function CustomerWaitlistNotice({
    title = "Ordering opens soon",
    message = "Afrochow is currently onboarding vendors first. You can browse the showroom today, and customers can join the waitlist for launch access.",
    showBrowse = true,
}) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500 mt-3 leading-6">{message}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                        href={customerWaitlistPath}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
                    >
                        Join Waitlist
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    {showBrowse && (
                        <Link
                            href="/"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Store className="w-4 h-4" />
                            Browse
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
