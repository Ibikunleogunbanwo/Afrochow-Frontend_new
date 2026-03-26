import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination bar for admin tables.
 *
 * Props:
 *   page          – current 1-based page number
 *   totalPages    – total number of pages
 *   totalItems    – total item count (for the "Showing X–Y of Z" label)
 *   pageSize      – items per page
 *   onPageChange  – (newPage: number) => void
 */
export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
    if (totalPages <= 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, totalItems);

    // Build page number list with ellipsis
    const pages = buildPages(page, totalPages);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            {/* Result count */}
            <p className="text-sm text-gray-500 shrink-0">
                Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalItems}</span>
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400 select-none">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`min-w-[34px] px-2.5 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                p === page
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/** Returns an array of page numbers and '…' ellipsis markers */
function buildPages(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const delta = 1; // siblings either side of current
    const range = [];
    const rangeWithDots = [];

    for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
    ) {
        range.push(i);
    }

    // Always include first and last
    if (range[0] > 2) rangeWithDots.push(1, '…');
    else rangeWithDots.push(1);

    range.forEach(p => rangeWithDots.push(p));

    if (range[range.length - 1] < total - 1) rangeWithDots.push('…', total);
    else rangeWithDots.push(total);

    return rangeWithDots;
}
