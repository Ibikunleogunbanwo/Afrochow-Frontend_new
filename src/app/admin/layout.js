"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboardLayout from "@/components/admin/dashboard/AdminDashboardLayout";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
    const role = user?.role?.toUpperCase();

    const isAllowed = isAuthenticated && (role === "ADMIN" || role === "SUPERADMIN");

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace("/?signin=true");
            return;
        }
        if (!isAllowed) {
            // Customer or vendor pressed back into admin — hard redirect, no flash
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, isAllowed, router]);

    if (isLoading || !isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
