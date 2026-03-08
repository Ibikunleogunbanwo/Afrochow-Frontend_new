import { AlertCircle, RefreshCw, X } from "lucide-react";

export default function ImageErrorBanner({ error, onRetry, onDismiss }) {
    if (!error) return null;

    return (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-1 text-sm underline flex items-center gap-1 hover:text-red-800 transition-colors"
                    >
                        <RefreshCw className="h-3 w-3" /> Try again
                    </button>
                )}
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Dismiss error"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}