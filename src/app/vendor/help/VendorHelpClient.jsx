"use client";

import React, { useState } from "react";
import Link from "next/link";
import ContentUnavailable from "@/components/content/ContentUnavailable";
import {
    HelpCircle, ChevronDown, ChevronRight, MessageCircle,
    Store, UtensilsCrossed, ShoppingBag, DollarSign,
    Star, Gift, BarChart3, UserCircle, Clock, Package,
    Settings, CreditCard, Bell, Truck, AlertCircle,
    Camera, Zap, Tag, Leaf,
} from "lucide-react";

// ─── FAQ accordion ────────────────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
            >
                <span className="font-semibold text-gray-800 text-sm pr-4">{question}</span>
                {open
                    ? <ChevronDown className="w-4 h-4 text-gray-700 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-5 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
};

// ─── Topic card ───────────────────────────────────────────────────────────────
const TopicCard = ({ icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left group w-full"
    >
        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
            <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <div>
            <p className="font-bold text-gray-900 text-sm">{title}</p>
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        </div>
    </button>
);

// Icons for the backend FAQ categories (content/faqs/vendor.json); unknown ids fall back to a generic icon.
const CATEGORY_ICONS = {
    gettingStarted: Store,
    menu:           UtensilsCrossed,
    orders:         ShoppingBag,
    earnings:       DollarSign,
    promotions:     Gift,
    reviews:        Star,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorHelpClient({ faqDoc }) {
    const categories = faqDoc?.categories ?? [];
    const [activeSection, setActiveSection] = useState(categories[0]?.id);
    const activeFaqs = categories.find((c) => c.id === activeSection)?.faqs ?? [];

    return (
        <div className="space-y-8">

            {/* Page header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Help & Support</h1>
                <p className="text-gray-500 mt-1">Everything you need to run your store on Afrochow.</p>
            </div>

            {/* Quick-action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <TopicCard
                    icon={Store}
                    title="Set up your store"
                    description="Complete your profile, operating hours, and go live."
                    onClick={() => setActiveSection("gettingStarted")}
                />
                <TopicCard
                    icon={UtensilsCrossed}
                    title="Manage your menu"
                    description="Add products, set prices, and use dietary tags."
                    onClick={() => setActiveSection("menu")}
                />
                <TopicCard
                    icon={ShoppingBag}
                    title="Handle orders"
                    description="Accept, track, and fulfil customer orders."
                    onClick={() => setActiveSection("orders")}
                />
                <TopicCard
                    icon={DollarSign}
                    title="Earnings & payouts"
                    description="Understand your revenue, fees, and payout schedule."
                    onClick={() => setActiveSection("earnings")}
                />
                <TopicCard
                    icon={Gift}
                    title="Promotions"
                    description="Create discounts and track promotion performance."
                    onClick={() => setActiveSection("promotions")}
                />
                <TopicCard
                    icon={Star}
                    title="Reviews"
                    description="Monitor customer feedback and your store rating."
                    onClick={() => setActiveSection("reviews")}
                />
            </div>

            {/* FAQ section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>

                {categories.length === 0 ? (
                    <div className="p-6">
                        <ContentUnavailable what="Vendor FAQs" />
                    </div>
                ) : (
                    <>
                        {/* Tab nav */}
                        <div className="px-6 pt-5 flex flex-wrap gap-2">
                            {categories.map(({ id, label }) => {
                                const Icon = CATEGORY_ICONS[id] ?? MessageCircle;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveSection(id)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                            activeSection === id
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* FAQ list */}
                        <div className="p-6 space-y-2">
                            {activeFaqs.map((faq) => (
                                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Order workflow guide */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status Workflow</h2>
                {/* Mobile: vertical stack — Desktop: horizontal row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:gap-0">
                    {[
                        { step: 1, label: "New Order",        color: "bg-gray-100 text-gray-700",  desc: "Customer placed order" },
                        { step: 2, label: "Confirmed",        color: "bg-gray-200 text-gray-800",  desc: "You accepted" },
                        { step: 3, label: "Preparing",        color: "bg-gray-300 text-gray-800",  desc: "Kitchen is cooking" },
                        { step: 4, label: "Ready",            color: "bg-gray-500 text-white",     desc: "Awaiting pickup" },
                        { step: 5, label: "Out for Delivery", color: "bg-gray-700 text-white",     desc: "On the way" },
                        { step: 6, label: "Delivered",        color: "bg-gray-900 text-white",     desc: "Order complete" },
                    ].map(({ step, label, color, desc }, i, arr) => (
                        <React.Fragment key={label}>
                            {/* Step */}
                            <div className="flex flex-row sm:flex-col items-start sm:items-center sm:w-28 gap-3 sm:gap-0">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 sm:mb-2 ${color}`}>
                                    {step}
                                </span>
                                <div className="flex flex-col sm:items-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-tight sm:text-center ${color}`}>
                                        {label}
                                    </span>
                                    <span className="text-[11px] text-gray-400 mt-1 leading-tight sm:text-center">
                                        {desc}
                                    </span>
                                </div>
                            </div>
                            {/* Connector — down arrow on mobile, right arrow on desktop */}
                            {i < arr.length - 1 && (
                                <div className="flex sm:hidden items-center ml-3.5 my-1">
                                    <div className="w-px h-4 bg-gray-300" />
                                </div>
                            )}
                            {i < arr.length - 1 && (
                                <div className="hidden sm:flex items-center mt-3.5 shrink-0">
                                    <div className="w-6 h-px bg-gray-300" />
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 -ml-1" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                    <AlertCircle className="w-5 h-5 text-gray-700 shrink-0" />
                    <h3 className="font-bold text-gray-900">Tips for great store performance</h3>
                </div>
                <ul className="space-y-1">
                    {[
                        { Icon: Camera, title: "Add product photos",     body: "Listings with photos get up to 3x more views. Use clear, well-lit images of every dish." },
                        { Icon: Clock,  title: "Keep hours accurate",    body: "Update your operating hours whenever they change so customers always know when to order." },
                        { Icon: Zap,    title: "Respond to orders fast", body: "Quick confirmations build trust. Aim to accept or reject new orders within a few minutes." },
                        { Icon: Tag,    title: "Use dietary tags",       body: "Tag items as Vegan, Spicy, Gluten-Free, etc. to reach customers with specific preferences." },
                        { Icon: Gift,   title: "Run promotions",         body: "Occasional discounts boost your visibility in search results and encourage repeat orders." },
                    ].map(({ Icon, title, body }) => (
                        <li key={title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
                <MessageCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <h2 className="text-xl font-black text-gray-900 mb-2">Still need help?</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                    Our vendor support team is here to help. Reach out and we&apos;ll get back to you within one business day.
                </p>
                <a
                    href="mailto:support@afrochow.ca"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-colors text-sm"
                >
                    <MessageCircle className="w-4 h-4" />
                    Email Vendor Support
                </a>
            </div>

        </div>
    );
}
