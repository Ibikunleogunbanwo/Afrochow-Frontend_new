"use client";

import { MapPin } from "lucide-react";

/**
 * Shown inside a section when the user's city returned no results
 * and we fell back to nationwide content.
 */
export default function LocationFallbackBanner({ city }) {
    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 max-w-xl mx-auto">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
                No results in <span className="font-semibold">{city}</span> yet —
                showing what&apos;s popular across Afrochow.{" "}
                <span className="text-amber-600 font-medium">We&apos;re expanding fast!</span>
            </span>
        </div>
    );
}
