"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChefHat } from "lucide-react";

const cardGradients = [
    "from-orange-500 to-red-600",
    "from-pink-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-yellow-500 to-orange-600",
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-indigo-700",
];

// Guards against emojis, plain text, or any non-URL value stored in iconUrl
const isValidUrl = (str) => {
    try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const CategoryStackCard = ({ item }) => {
    const gradient = cardGradients[item.colorIndex % cardGradients.length];
    const hasValidIcon = item.iconUrl && isValidUrl(item.iconUrl);

    return (
        <Link href={item.path} className="block h-full w-full">
            <div className={`relative h-full w-full bg-linear-to-br ${gradient} overflow-hidden`}>

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                    }}
                />

                {/* Glow orbs */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center z-10">

                    {/* Icon — valid image URL from API or fallback Lucide icon */}
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
                        {hasValidIcon ? (
                            <Image
                                src={item.iconUrl}
                                alt={item.title}
                                width={48}
                                height={48}
                                className="object-contain"
                                unoptimized
                            />
                        ) : (
                            <ChefHat className="w-10 h-10 text-white" strokeWidth={2} />
                        )}
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-xs mx-auto">
                                {item.description}
                            </p>
                        )}
                        {item.activeProductCount > 0 && (
                            <p className="text-xs text-white/60 mt-1 font-medium">
                                {item.activeProductCount} dishes available
                            </p>
                        )}
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/30 transition-colors">
                        <span>Explore {item.title}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/20 to-transparent" />
            </div>
        </Link>
    );
};

export default CategoryStackCard;