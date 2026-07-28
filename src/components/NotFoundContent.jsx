"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

// Floating orbs — emerald + amber only, matching the rebranded brand palette
// (previously included leftover red/yellow orbs from the pre-rebrand orange
// palette, which clashed with the site's current emerald/gold identity).
const orbs = [
    { size: 300, x: "10%", y: "15%", color: "bg-emerald-300", delay: 0,   duration: 8  },
    { size: 250, x: "70%", y: "10%", color: "bg-amber-200",  delay: 1,   duration: 10 },
    { size: 200, x: "80%", y: "60%", color: "bg-amber-100",  delay: 2,   duration: 9  },
    { size: 280, x: "5%",  y: "65%", color: "bg-emerald-200", delay: 0.5, duration: 11 },
    { size: 150, x: "45%", y: "80%", color: "bg-emerald-100", delay: 1.5, duration: 7  },
];

// Afrochow's bowl-with-steam mark (matches Logo.jsx) so the error page still
// feels like this product rather than a generic UI-kit empty state.
const BowlIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M3 11C3 11 4 8 6 7C8 6 10 6 12 6C14 6 16 6 18 7C20 8 21 11 21 11M4 11H20C20 11 21 13 20 15C19 17 17 19 12 19C7 19 5 17 4 15C3 13 4 11 4 11Z" />
        <path d="M8 4C8 4 8 2 9 2C10 2 10 4 10 4M12 3C12 3 12 1 13 1C14 1 14 3 14 3M16 4C16 4 16 2 17 2C18 2 18 4 18 4" strokeLinecap="round" />
    </svg>
);

export default function NotFoundContent() {
    const router = useRouter();
    const { isAuthenticated, role } = useAuth();
    const [query, setQuery] = useState("");

    // Where "Back to Home" should go — authenticated users stay in their area
    // rather than getting dropped on the public marketing homepage.
    const homeRoute = (() => {
        if (!isAuthenticated) return "/";
        const r = role?.toUpperCase();
        if (r === "ADMIN" || r === "SUPERADMIN") return "/admin/dashboard";
        if (r === "VENDOR") return "/vendor/dashboard";
        return "/";
    })();

    // Links shown at the bottom — hide sign-up/waitlist prompts for users who
    // are already signed in, since those don't apply to them.
    const helpLinks = isAuthenticated
        ? [
            { href: "/restaurants", label: "Restaurants" },
            { href: homeRoute,      label: "Dashboard" },
          ]
        : [
            { href: "/register/customer",      label: "Sign Up" },
            { href: "/restaurants",             label: "Restaurants" },
            { href: "/waitlist",                label: "Join Waitlist" },
            { href: "/register/vendor/step-1",  label: "Become a Vendor" },
          ];

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        router.push(trimmed ? `/restaurants?search=${encodeURIComponent(trimmed)}` : "/restaurants");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6 relative overflow-hidden">

            {/* ── Floating orbs ─────────────────────────────────────── */}
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none ${orb.color}`}
                    style={{
                        width:  orb.size,
                        height: orb.size,
                        left:   orb.x,
                        top:    orb.y,
                    }}
                    animate={{
                        y:     [0, -30, 0],
                        x:     [0,  15, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: orb.duration,
                        delay:    orb.delay,
                        repeat:   Infinity,
                        ease:     "easeInOut",
                    }}
                />
            ))}

            {/* ── Main card ─────────────────────────────────────────── */}
            <motion.div
                className="relative z-10 w-full max-w-lg"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Empty className="gap-5">

                    {/* Icon + badge — sized down on mobile so the icon, "404"
                        numeral, title, and CTAs all fit above the fold on a
                        phone instead of pushing the buttons out of view. */}
                    <EmptyMedia>
                        <div className="relative">
                            <motion.div
                                className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-full flex items-center justify-center"
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <BowlIcon className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-600" />
                            </motion.div>

                            {/* Amber, not red — a 404 is a wrong turn, not an
                                alarm, and red reads as a system error. */}
                            <motion.div
                                className="absolute -top-1.5 -right-1.5 w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg"
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
                            >
                                ?
                            </motion.div>
                        </div>
                    </EmptyMedia>

                    {/* Error code */}
                    <motion.h1
                        className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-500 bg-clip-text text-transparent leading-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        404
                    </motion.h1>

                    <EmptyHeader>
                        <EmptyTitle className="text-2xl sm:text-3xl md:text-4xl font-black">
                            Page Not Found
                        </EmptyTitle>
                        <EmptyDescription className="text-base sm:text-lg">
                            Oops! The page you&apos;re looking for seems to have wandered off.
                            Maybe it went looking for some delicious African cuisine?
                        </EmptyDescription>
                    </EmptyHeader>

                    {/* Search — a real recovery path, not just a link list.
                        Most 404s here are a typo'd or stale restaurant link,
                        so let people pick up their search right from here. */}
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search restaurants, dishes, groceries..."
                                className="w-full pl-11 pr-24 py-3 rounded-2xl border-2 border-emerald-100 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 transition-colors shadow-sm"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Action buttons */}
                    <EmptyContent>
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                            <button
                                onClick={() => router.push(homeRoute)}
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-amber-500 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                            >
                                <Home className="w-5 h-5" />
                                {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-emerald-300 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Go Back
                            </button>
                        </div>
                    </EmptyContent>

                    {/* Helpful links */}
                    <div className="pt-4 border-t border-gray-200 w-full">
                        <p className="text-sm text-gray-500 mb-3 font-medium text-center">
                            You might be looking for:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {helpLinks.map(({ href, label }, i) => (
                                <span key={href} className="flex items-center gap-3">
                                    {i > 0 && <span className="text-gray-300 select-none">•</span>}
                                    <Link
                                        href={href}
                                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm hover:underline transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </span>
                            ))}
                        </div>
                    </div>

                </Empty>
            </motion.div>
        </div>
    );
}
