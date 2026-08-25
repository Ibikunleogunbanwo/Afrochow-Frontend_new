"use client";

export default function GlobalError({ error, reset }) {
    console.error("Unhandled application error:", error);

    return (
        <html lang="en">
        <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="text-5xl" aria-hidden="true">🍛</div>
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="max-w-md text-gray-600">
                An unexpected error occurred. Please reload the page.
            </p>
            <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
                Reload
            </button>
        </div>
        </body>
        </html>
    );
}