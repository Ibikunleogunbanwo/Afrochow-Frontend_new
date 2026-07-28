"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChefHat, Mail, MapPin, Store, User } from "lucide-react";
import { MVP_FLAGS } from "@/lib/mvp";
import { WaitlistAPI } from "@/lib/api/waitlist.api";

const WAITLIST_STORAGE_KEY = "afrochow_waitlist_submissions";

const initialForm = {
    name: "",
    email: "",
    city: "",
    role: "CUSTOMER",
};

const saveLocalSubmission = (submission) => {
    try {
        const current = JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || "[]");
        localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([submission, ...current].slice(0, 25)));
    } catch {
        // Local persistence is best-effort only.
    }
};

export default function WaitlistPage() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.city.trim()) {
            setError("Please add your name, email, and city.");
            return;
        }

        const submission = {
            ...form,
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            city: form.city.trim(),
            submittedAt: new Date().toISOString(),
        };

        setSubmitting(true);
        try {
            await WaitlistAPI.join(submission);

            if (MVP_FLAGS.waitlistFormUrl) {
                const externalResponse = await fetch(MVP_FLAGS.waitlistFormUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(submission),
                });

                if (!externalResponse.ok) {
                    throw new Error("External waitlist sync failed");
                }
            }

            saveLocalSubmission(submission);
            setSubmitted(true);
            setForm(initialForm);
        } catch (submitError) {
            console.error("Waitlist submission failed:", submitError);
            setError("We could not submit that right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="px-4 py-12 md:py-16">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
                    <div className="space-y-6 pt-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            <Store className="h-3.5 w-3.5" />
                            Vendor-first MVP
                        </div>

                        <div className="space-y-4">
                            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
                                Customer ordering is opening soon.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-gray-600">
                                We are onboarding restaurants first so customers have real choices at launch.
                                Browse the showroom today, join the customer list, or register as a vendor now.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <User className="mb-3 h-5 w-5 text-emerald-600" />
                                <h2 className="font-bold text-gray-950">Customers</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-500">
                                    Join the waitlist for launch updates, early access, and city availability.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <ChefHat className="mb-3 h-5 w-5 text-emerald-600" />
                                    <h2 className="font-bold text-gray-950">Vendors</h2>
                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                        Vendor onboarding is open. Build your profile and get ready for customer launch.
                                    </p>
                                </div>
                            </div>

                        <Link
                            href="/register/vendor/step-1"
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                            Register as a Vendor
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        {submitted ? (
                            <div className="py-10 text-center">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                                <h2 className="mt-4 text-2xl font-black text-gray-950">You are on the list</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Thanks for joining. We will share updates as customer ordering opens city by city.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
                                >
                                    Add Another Person
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-950">Join the customer waitlist</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tell us where to notify you when Afrochow opens for customers.
                                    </p>
                                </div>

                                <label className="block">
                                    <span className="text-xs font-bold uppercase text-gray-500">Name</span>
                                    <input
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Your name"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold uppercase text-gray-500">Email</span>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold uppercase text-gray-500">City</span>
                                    <div className="relative mt-1">
                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={form.city}
                                            onChange={(e) => updateField("city", e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                            placeholder="Calgary"
                                        />
                                    </div>
                                </label>

                                {error && (
                                    <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                                >
                                    {submitting ? "Submitting..." : "Join Waitlist"}
                                    <ArrowRight className="h-4 w-4" />
                                </button>

                                <p className="text-center text-xs text-gray-500">
                                    Are you a vendor?{" "}
                                    <Link href="/register/vendor/step-1" className="font-bold text-emerald-600 hover:text-emerald-700">
                                        Start vendor registration
                                    </Link>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
