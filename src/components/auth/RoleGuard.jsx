"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Wraps a route section and prevents any role other than the allowed ones
 * from seeing the content — even if they hit the URL directly or via
 * browser back/forward through history from a previous session.
 *
 * Renders a full-screen spinner while auth is loading, then either shows
 * children (role matches) or redirects (role mismatch / unauthenticated).
 */
export default function RoleGuard({ allowedRoles, redirectTo = "/" }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
    const role = user?.role?.toUpperCase();

    const allowed = Array.isArray(allowedRoles)
        ? allowedRoles.map(r => r.toUpperCase())
        : [allowedRoles.toUpperCase()];

    const isAllowed = isAuthenticated && role && allowed.includes(role);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Not logged in — send to sign-in
            router.replace("/?signin=true");
            return;
        }

        if (!isAllowed) {
            // Wrong role — replace so back button can't return here
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, isAllowed, router, redirectTo]);

    // Still loading — don't flash anything
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Role mismatch — show nothing while redirect fires
    if (!isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return null; // signal to parent to render children
}
