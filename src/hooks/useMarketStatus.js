"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { SearchAPI } from "@/lib/api/search.api";

// Module-level cache so repeated mounts (e.g. navigating back to the
// homepage) don't refire the check every time within the TTL window.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = {}; // { [cacheKey]: { served, cachedAt } }

const buildKey = (city, lat, lng) => `${city ?? ''}:${lat ?? ''}:${lng ?? ''}`;

/**
 * Is Afrochow active in the user's current city/location?
 *
 * Distinct from each homepage rail's own "no local results, show nationwide
 * fallback" behavior — this answers "does Afrochow operate here at all,"
 * so the page can show an honest "not in your area yet" state instead of
 * silently serving another city's vendors as if they were local.
 *
 * Returns `served: true` while the check is loading (or before location is
 * known) so the page doesn't flash an empty state before it has an answer —
 * callers should gate on `checking` if they need to distinguish "still
 * loading" from "confirmed served."
 */
export const useMarketStatus = () => {
    const { city, coordinates, isDetecting } = useLocation();
    const lat = coordinates?.lat ?? null;
    const lng = coordinates?.lng ?? null;
    const key = buildKey(city, lat, lng);

    const cached = cache[key];
    const isCacheValid = cached && Date.now() - cached.cachedAt < CACHE_TTL_MS;

    const [served, setServed] = useState(isCacheValid ? cached.served : true);
    const [checking, setChecking] = useState(!isCacheValid);

    useEffect(() => {
        if (isDetecting) return;

        const entry = cache[key];
        if (entry && Date.now() - entry.cachedAt < CACHE_TTL_MS) {
            setServed(entry.served);
            setChecking(false);
            return;
        }

        // No location signal yet (neither city nor coordinates) — nothing
        // meaningful to check, assume served rather than guessing.
        if (!city && (lat == null || lng == null)) {
            setServed(true);
            setChecking(false);
            return;
        }

        let cancelled = false;
        setChecking(true);

        SearchAPI.getMarketStatus(city || null, lat, lng)
            .then((res) => {
                if (cancelled) return;
                const isServed = res?.success ? !!res.data : true; // default open on API shape surprises
                cache[key] = { served: isServed, cachedAt: Date.now() };
                setServed(isServed);
            })
            .catch(() => {
                if (cancelled) return;
                // Network/API failure — don't block the homepage on this check.
                setServed(true);
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, isDetecting]);

    return { served, checking, city };
};
