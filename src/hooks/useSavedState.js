"use client";

import { useState, useCallback } from "react";

/**
 * Tracks a save operation lifecycle: idle → saving → saved → idle
 *
 * Usage:
 *   const { isSaving, isSaved, setSaving, setSaved, setError } = useSavedState();
 *
 *   <button disabled={isSaving}>
 *     {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
 *   </button>
 */
export function useSavedState(resetDelay = 2000) {
    const [status, setStatus] = useState("idle"); // "idle" | "saving" | "saved"

    const setSaving = useCallback(() => setStatus("saving"), []);

    const setSaved = useCallback(() => {
        setStatus("saved");
        const t = setTimeout(() => setStatus("idle"), resetDelay);
        return () => clearTimeout(t);
    }, [resetDelay]);

    const setError = useCallback(() => setStatus("idle"), []);

    const reset = useCallback(() => setStatus("idle"), []);

    return {
        isSaving: status === "saving",
        isSaved:  status === "saved",
        setSaving,
        setSaved,
        setError,
        reset,
    };
}
