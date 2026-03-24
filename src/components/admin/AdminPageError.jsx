'use client';

import { ShieldOff, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Shared error state for admin pages.
 * Detects 403 permission errors and shows a targeted fix hint,
 * otherwise shows a generic retry card.
 */
export default function AdminPageError({ error, onRetry }) {
    const is403 =
        error?.toLowerCase().includes('permission') ||
        error?.toLowerCase().includes('access') ||
        error?.toLowerCase().includes('forbidden') ||
        error?.toLowerCase().includes('403');

    if (is403) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <ShieldOff className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Permission denied</h2>
                    <p className="text-gray-500 text-sm max-w-md">
                        Your account doesn&apos;t have access to this resource. The backend controller
                        needs to be updated from{' '}
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">
                            hasRole(&apos;ADMIN&apos;)
                        </code>{' '}
                        to{' '}
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">
                            hasAnyRole(&apos;ADMIN&apos;, &apos;SUPERADMIN&apos;)
                        </code>
                        .
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left max-w-sm w-full">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Backend fix required:</p>
                    <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
{`// Change on this controller:
@PreAuthorize("hasRole('ADMIN')")

// To:
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`}
                    </pre>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
                <p className="text-gray-700 font-semibold mb-1">Something went wrong</p>
                <p className="text-sm text-gray-500">{error}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
