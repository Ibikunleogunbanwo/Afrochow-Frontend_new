"use client";
import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export const toaster = createToaster({
    placement: "top-end",
    gap: 16,
    overlap: true,
    duration: 8000,
});

const toastVariants = {
    success: {
        bg: "bg-gray-900 border-gray-800",
        title: "text-white",
        description: "text-gray-300",
        icon: CheckCircle,
        iconColor: "text-green-400",
    },
    error: {
        bg: "bg-gray-900 border-gray-800",
        title: "text-white",
        description: "text-gray-300",
        icon: AlertCircle,
        iconColor: "text-red-400",
    },
    warning: {
        bg: "bg-gray-900 border-gray-800",
        title: "text-white",
        description: "text-gray-300",
        icon: AlertTriangle,
        iconColor: "text-yellow-400",
    },
    info: {
        bg: "bg-gray-900 border-gray-800",
        title: "text-white",
        description: "text-gray-300",
        icon: Info,
        iconColor: "text-blue-400",
    },
};

/**
 * Toast Component - Global toast notifications
 *
 * Place this component at the root of your app (layout.jsx)
 * Use the exported `toaster` instance to show toasts from anywhere
 *
 * @example
 * // Show success toast
 * toaster.create({
 *   title: "Success!",
 *   description: "Admin registered successfully",
 *   type: "success",
 * });
 *
 * @example
 * // Show error toast
 * toaster.create({
 *   title: "Error",
 *   description: "Registration failed",
 *   type: "error",
 * });
 */
export function ToastProvider() {
    return (
        <Portal>
            <Toaster toaster={toaster}>
                {(toast) => {
                    const variant = toastVariants[toast.type] || toastVariants.info;
                    const Icon = variant.icon;

                    return (
                        <Toast.Root
                            className={`${variant.bg} rounded-xl shadow-lg border min-w-80 p-4 relative overflow-hidden transition-all duration-300 ease-default will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index)`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 ${variant.iconColor} shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <Toast.Title className={`${variant.title} font-semibold text-sm`}>
                                        {toast.title}
                                    </Toast.Title>
                                    {toast.description && (
                                        <Toast.Description className={`${variant.description} text-sm mt-1`}>
                                            {toast.description}
                                        </Toast.Description>
                                    )}
                                </div>
                                <Toast.CloseTrigger className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white shrink-0">
                                    <X className="w-4 h-4" />
                                </Toast.CloseTrigger>
                            </div>
                        </Toast.Root>
                    );
                }}
            </Toaster>
        </Portal>
    );
}

// Toast deduplication - prevent duplicate toasts with same content
const recentToasts = new Map();
const TOAST_DEBOUNCE_TIME = 1000; // 1 second

const createDedupedToast = (title, description, type) => {
    const key = `${type}-${title}-${description}`;
    const now = Date.now();
    const lastShown = recentToasts.get(key);

    // If same toast was shown recently, skip it
    if (lastShown && now - lastShown < TOAST_DEBOUNCE_TIME) {
        return;
    }

    recentToasts.set(key, now);

    // Cleanup old entries
    if (recentToasts.size > 50) {
        const oldestKey = recentToasts.keys().next().value;
        recentToasts.delete(oldestKey);
    }

    return toaster.create({ title, description, type });
};

export const toast = {
    success: (title, description) =>
        createDedupedToast(title, description, "success"),

    error: (title, description) =>
        createDedupedToast(title, description, "error"),

    warning: (title, description) =>
        createDedupedToast(title, description, "warning"),

    info: (title, description) =>
        createDedupedToast(title, description, "info"),
};