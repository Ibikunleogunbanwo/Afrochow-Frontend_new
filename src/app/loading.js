export default function RootLoading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" aria-hidden="true" />
            <span className="sr-only">Loading</span>
        </div>
    );
}