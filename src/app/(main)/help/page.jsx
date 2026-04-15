"use client";

import React, { useState } from "react";
import Link from "next/link";
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
                    ? <ChevronDown className="w-4 h-4 text-orange-500 shrink-0" />
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
        className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
    >
        <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
            <Icon className="w-5 h-5 text-orange-600" />
        </div>
        <div>
            <p className="font-bold text-slate-900 text-sm">{title}</p>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        </div>
    </Link>
);

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = {
    ordering: [
        {
            question: "How do I place an order?",
            answer: "Browse restaurants or search for a dish on the homepage. Select a restaurant, add items to your cart, and proceed to checkout. You'll confirm your delivery address and payment method before placing the order.",
        },
        {
            question: "Can I order from multiple restaurants at once?",
            answer: "Each order is tied to a single restaurant. If you'd like food from multiple places, you'll need to place separate orders.",
        },
        {
            question: "How do I schedule an order for later?",
            answer: "At checkout, you can choose a future delivery time if the restaurant supports scheduled orders. Look for the 'Schedule for later' option on the checkout page.",
        },
        {
            question: "Can I add special instructions for my order?",
            answer: "Yes — you can add notes for individual items (e.g. 'no onions') or a general note for the restaurant when you review your cart before checkout.",
        },
    ],
    delivery: [
        {
            question: "How long does delivery take?",
            answer: "Estimated delivery times are shown on each restaurant's page and depend on their current workload and your distance. Most deliveries arrive in 30–60 minutes.",
        },
        {
            question: "What is the delivery fee?",
            answer: "Delivery fees vary by restaurant and your distance from them. The exact fee is shown in your cart before you confirm the order.",
        },
        {
            question: "Can I pick up my order instead of having it delivered?",
            answer: "Many restaurants on Afrochow offer store pickup. If available, you'll see a 'Store pickup available' badge on the restaurant card. Choose 'Pickup' at checkout to collect your order in person.",
        },
        {
            question: "My order is taking longer than expected — what should I do?",
            answer: "Check your order status on the Orders page. If the delay is significant, use the contact option on the order detail page to reach the restaurant directly.",
        },
    ],
    payment: [
        {
            question: "What payment methods are accepted?",
            answer: "Afrochow accepts major credit and debit cards (Visa, Mastercard, Amex). Payment is processed securely at checkout.",
        },
        {
            question: "When am I charged for my order?",
            answer: "Your card is charged when you confirm and place the order. You won't be charged until the order is submitted.",
        },
        {
            question: "Can I get a refund?",
            answer: "If there's an issue with your order — wrong items, missing items, or a quality problem — contact us through the Help & Support link on the order detail page. Refunds are reviewed case by case and typically processed within 3–5 business days.",
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes. Afrochow does not store your full card details. All payments are handled through industry-standard encrypted payment providers.",
        },
    ],
    account: [
        {
            question: "How do I create an account?",
            answer: "Click 'Sign Up' in the top navigation. Enter your name, email address, and a password. You'll receive a verification email — click the link to activate your account.",
        },
        {
            question: "I forgot my password. How do I reset it?",
            answer: "On the sign-in page, click 'Forgot password?'. Enter your email address and we'll send you a reset link valid for 30 minutes.",
        },
        {
            question: "How do I update my profile or delivery address?",
            answer: "Go to your Account Settings (click your avatar in the top-right corner, then 'Settings'). You can update your name, email, phone number, and saved addresses there.",
        },
        {
            question: "Can I delete my account?",
            answer: "To request account deletion, email us at support@afrochow.ca with the subject 'Account Deletion Request'. We'll process your request within 7 business days.",
        },
    ],
    vendors: [
        {
            question: "How do I join Afrochow as a vendor?",
            answer: "Click 'Join Afrochow' in the navigation bar and complete the vendor registration form. Once reviewed and approved, you'll get access to your vendor dashboard to set up your menu and start receiving orders.",
        },
        {
            question: "How do I manage my menu?",
            answer: "From your vendor dashboard, go to the Menu section. You can add, edit, or remove products, set prices, upload photos, and mark items with dietary tags (Vegan, Vegetarian, Gluten-Free, Spicy).",
        },
        {
            question: "How do I update my operating hours?",
            answer: "In your vendor dashboard, go to Profile and scroll to the 'Operating Hours' section. Set your open/close times for each day of the week, or mark days as closed.",
        },
        {
            question: "How and when do I get paid?",
            answer: "Earnings are tracked in your vendor dashboard under the Earnings section. Payouts are processed on a regular schedule — contact support@afrochow.ca for details about your specific payout arrangement.",
        },
        {
            question: "How do I respond to reviews?",
            answer: "Customer reviews are visible in the Reviews section of your vendor dashboard. You can view ratings and written feedback to help improve your service.",
        },
    ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HelpPage() {
    const [activeSection, setActiveSection] = useState("ordering");

    const sections = [
        { key: "ordering", label: "Placing Orders",     icon: ShoppingBag },
        { key: "delivery", label: "Delivery & Pickup",  icon: Truck },
        { key: "payment",  label: "Payments & Refunds", icon: CreditCard },
        { key: "account",  label: "Your Account",       icon: User },
        { key: "vendors",  label: "Vendor Info",        icon: Store },
    ];

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3">Help & Support</h1>
                    <p className="text-orange-100 text-base leading-relaxed max-w-xl mx-auto">
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

                    {/* Tab nav */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {sections.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                    activeSection === key
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* FAQ list */}
                    <div className="space-y-2">
                        {FAQS[activeSection].map((faq, i) => (
                            <FAQItem key={i} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section>
                    <h2 className="text-xl font-black text-slate-900 mb-5">How Afrochow Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: "1", icon: Search,      title: "Find your craving",      desc: "Search by dish, store category, or city. Filter by dietary preferences like Vegan, Gluten-Free, or Spicy." },
                            { step: "2", icon: ShoppingBag, title: "Add to cart & checkout", desc: "Select your items, choose delivery or pickup, confirm your address, and pay securely." },
                            { step: "3", icon: Utensils,    title: "Enjoy authentic flavour", desc: "Track your order in real time and enjoy restaurant-quality African food at home." },
                        ].map(({ step, icon: Icon, title, desc }) => (
                            <div key={step} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-lg mx-auto mb-4">{step}</div>
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Icon className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                    <MessageCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                    <h2 className="text-xl font-black text-slate-900 mb-2">Still need help?</h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                        Can't find what you're looking for? Our support team is happy to help — usually within one business day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:support@afrochow.ca"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors text-sm"
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
