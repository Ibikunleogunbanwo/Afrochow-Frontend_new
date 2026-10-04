"use client";

import React, { useState } from "react";
import Link from "next/link";
import ContentUnavailable from "@/components/content/ContentUnavailable";
import {
    ShoppingBag, Search, MapPin, CreditCard, Package,
    Store, MessageCircle, ChevronDown, ChevronRight,
    Clock, Truck, RefreshCcw, User, Star, Utensils,
} from "lucide-react";

// ─── FAQ accordion item ───────────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
            >
                <span className="font-semibold text-slate-800 text-sm pr-4">{question}</span>
                {open
                    ? <ChevronDown className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-4 bg-white text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {answer}
                </div>
            )}
        </div>
    );
};

// ─── Section card ─────────────────────────────────────────────────────────────
const TopicCard = ({ icon: Icon, title, description, href }) => (
    <Link
        href={href}
        className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
    >
        <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <Icon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
            <p className="font-bold text-slate-900 text-sm">{title}</p>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        </div>
    </Link>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
// Icons for the backend FAQ categories (content/faqs/customer.json); unknown ids fall back to a generic icon.
const CATEGORY_ICONS = {
    ordering: ShoppingBag,
    delivery: Truck,
    payment:  CreditCard,
    account:  User,
    vendors:  Store,
};

export default function HelpPageClient({ faqDoc }) {
    const categories = faqDoc?.categories ?? [];
    const [activeSection, setActiveSection] = useState(categories[0]?.id);
    const activeFaqs = categories.find((c) => c.id === activeSection)?.faqs ?? [];

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero */}
            <div className="bg-gradient-to-r from-emerald-500 to-amber-600 text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3">Help & Support</h1>
                    <p className="text-emerald-100 text-base leading-relaxed max-w-xl mx-auto">
                        Everything you need to know about ordering, delivery, payments, and managing your Afrochow account.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">

                {/* Quick-topic grid */}
                <section>
                    <h2 className="text-xl font-black text-slate-900 mb-5">Browse by topic</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TopicCard icon={ShoppingBag} title="How to Order"           description="Step-by-step guide to placing your first order." href="#faq" />
                        <TopicCard icon={Truck}       title="Delivery & Pickup"      description="Track your order, delivery times, and pickup options." href="#faq" />
                        <TopicCard icon={CreditCard}  title="Payments & Refunds"     description="Accepted methods, billing, and how to request a refund." href="#faq" />
                        <TopicCard icon={User}        title="Account & Profile"      description="Sign up, reset your password, and manage your settings." href="#faq" />
                        <TopicCard icon={Store}       title="Selling on Afrochow"    description="Register as a vendor, manage your menu, and get paid." href="#faq" />
                        <TopicCard icon={Star}        title="Reviews & Ratings"      description="How ratings work and how vendors can respond to feedback." href="#faq" />
                    </div>
                </section>

                {/* FAQ section */}
                <section id="faq">
                    <h2 className="text-xl font-black text-slate-900 mb-5">Frequently Asked Questions</h2>

                    {categories.length === 0 ? (
                        <ContentUnavailable what="Our FAQs" />
                    ) : (
                        <>
                            {/* Tab nav */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {categories.map(({ id, label }) => {
                                    const Icon = CATEGORY_ICONS[id] ?? MessageCircle;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setActiveSection(id)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                                activeSection === id
                                                    ? "bg-emerald-500 text-white shadow-sm"
                                                    : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* FAQ list */}
                            <div className="space-y-2">
                                {activeFaqs.map((faq) => (
                                    <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* How it works */}
                <section>
                    <h2 className="text-xl font-black text-slate-900 mb-5">How Afrochow Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: "1", icon: Search,      title: "Find your craving",      desc: "Search by dish, store category, or city. Filter by dietary preferences like Vegan, Gluten Free, or Spicy." },
                            { step: "2", icon: ShoppingBag, title: "Add to cart & checkout", desc: "Select your items, choose delivery or pickup, confirm your address, and pay securely." },
                            { step: "3", icon: Utensils,    title: "Enjoy authentic flavour", desc: "Track your order in real time and enjoy restaurant quality African food at home." },
                        ].map(({ step, icon: Icon, title, desc }) => (
                            <div key={step} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-lg mx-auto mb-4">{step}</div>
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Icon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                    <MessageCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h2 className="text-xl font-black text-slate-900 mb-2">Still need help?</h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                        Can&apos;t find what you&apos;re looking for? Our support team is happy to help, usually within one business day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:support@afrochow.ca"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Email Support
                        </a>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-colors text-sm"
                        >
                            Learn about us
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
