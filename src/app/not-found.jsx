"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Search, UtensilsCrossed } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

// Floating orb data — matches the not-found-page-2 spec, recoloured for Afrochow
const orbs = [
    { size: 300, x: "10%",  y: "15%",  color: "bg-orange-300", delay: 0,   duration: 8  },
    { size: 250, x: "70%",  y: "10%",  color: "bg-red-300",    delay: 1,   duration: 10 },
    { size: 200, x: "80%",  y: "60%",  color: "bg-yellow-200", delay: 2,   duration: 9  },
    { size: 280, x: "5%",   y: "65%",  color: "bg-orange-200", delay: 0.5, duration: 11 },
    { size: 150, x: "45%",  y: "80%",  color: "bg-red-200",    delay: 1.5, duration: 7  },
];

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6 relative overflow-hidden">

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
                        y:      [0, -30, 0],
                        x:      [0,  15, 0],
                        scale:  [1, 1.08, 1],
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
                <Empty className="gap-6">

                    {/* Icon + 404 badge */}
                    <EmptyMedia>
                        <div className="relative">
                            <motion.div
                                className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center"
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <UtensilsCrossed className="w-16 h-16 text-orange-600" />
                            </motion.div>

                            <motion.div
                                className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg"
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
                            >
                                !
                            </motion.div>
                        </div>
                    </EmptyMedia>

                    {/* Error code */}
                    <motion.h1
                        className="text-8xl md:text-9xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent leading-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        404
                    </motion.h1>

                    <EmptyHeader>
                        <EmptyTitle className="text-3xl md:text-4xl font-black">
                            Page Not Found
                        </EmptyTitle>
                        <EmptyDescription className="text-lg">
                            Oops! The page you&apos;re looking for seems to have wandered off.
                            Maybe it went looking for some delicious African cuisine?
                        </EmptyDescription>
                    </EmptyHeader>

                    {/* Action buttons */}
                    <EmptyContent>
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-500 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Link>

                            <Link
                                href="/restaurants"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-orange-300 text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]"
                            >
                                <Search className="w-5 h-5" />
                                Browse Restaurants
                            </Link>
                        </div>
                    </EmptyContent>

                    {/* Helpful links */}
                    <div className="pt-4 border-t border-gray-200 w-full">
                        <p className="text-sm text-gray-500 mb-3 font-medium text-center">
                            You might be looking for:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {[
                                { href: "/register/signup",      label: "Sign Up" },
                                { href: "/login",                label: "Login" },
                                { href: "/restaurants",          label: "Restaurants" },
                                { href: "/register/vendor/step-1", label: "Become a Vendor" },
                            ].map(({ href, label }, i) => (
                                <span key={href} className="flex items-center gap-3">
                                    {i > 0 && <span className="text-gray-300 select-none">•</span>}
                                    <Link
                                        href={href}
                                        className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline transition-colors"
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
