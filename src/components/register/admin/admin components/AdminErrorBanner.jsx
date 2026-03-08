import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

/**
 * AdminErrorBanner - Displays error messages with optional auto-dismiss
 *
 * ⚠️ IMPORTANT: Add key={message} when using this component!
 * Example: <AdminErrorBanner key={error} message={error} onDismiss={...} />
 *
 * The key prop will remount the component when the message changes,
 * automatically resetting the dismissed state.
 *
 * @param {string} message - Error message to display
 * @param {function} onDismiss - Callback when banner is dismissed
 * @param {boolean} autoDismiss - Auto-dismiss after 5 seconds (default: false)
 */
export default function AdminErrorBanner({ message, onDismiss, autoDismiss = false }) {
    const [isDismissed, setIsDismissed] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
        if (onDismiss) {
            onDismiss();
        }
    }, [onDismiss]);

    // Auto-dismiss after 5 seconds if enabled
    useEffect(() => {
        if (autoDismiss && !isDismissed) {
            const timer = setTimeout(handleDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [autoDismiss, isDismissed, handleDismiss]);

    // Don't show if no message or if dismissed
    if (!message || isDismissed) return null;

    return (
        <div className="relative mb-6 animate-in slide-in-from-top duration-300">
            {/* Using your custom Tailwind utility classes */}
            <div className="bg-linear-to-r from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-sm border border-red-200/50 rounded-xl p-5 shadow-lg">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-red-400 to-red-600 rounded-l-xl" />

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                        <h3 className="text-sm font-semibold text-red-900 mb-1">
                            Error
                        </h3>
                        <p className="text-sm text-red-700 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors group"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
}