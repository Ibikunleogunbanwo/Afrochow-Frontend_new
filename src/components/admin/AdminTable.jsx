'use client';

import { cn } from '@/lib/utils';

/**
 * Outer wrapper.
 * Mobile  → flex column with gap so cards breathe.
 * Desktop → plain block so border-b dividers work normally.
 */
export function AdminTableRoot({ className, children, ...props }) {
    return (
        <div
            className={cn('flex flex-col gap-2 p-3 md:block md:p-0', className)}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Sticky header row — desktop only.
 */
export function AdminTableHeader({ columns }) {
    return (
        <div className="hidden md:flex items-center px-6 py-2.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            {columns.map((col, i) => (
                <div
                    key={i}
                    className={cn(
                        'text-[11px] font-semibold text-gray-400 uppercase tracking-wider',
                        col.className
                    )}
                >
                    {col.label}
                </div>
            ))}
        </div>
    );
}

/**
 * A single data row.
 * Mobile  → card with grey background, border and rounded corners.
 * Desktop → flat row with bottom divider (original style).
 */
export function AdminTableRow({ className, children, onClick, ...props }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                // ── Mobile card ────────────────────────────────────────
                'flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4',
                // ── Desktop row ────────────────────────────────────────
                'md:flex-row md:items-center md:gap-0 md:rounded-none md:border-0 md:border-b md:border-gray-100 md:last:border-b-0 md:bg-white md:px-6 md:py-3.5',
                'text-sm',
                onClick && 'cursor-pointer',
                'hover:bg-gray-100 md:hover:bg-gray-50 transition-colors',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Avatar circle with an optional coloured status dot.
 */
export function AdminAvatar({ initials, statusColor, size = 'md' }) {
    const sizeMap = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-xs',
        lg: 'w-10 h-10 text-sm',
    };

    return (
        <div className="relative shrink-0">
            <div
                className={cn(
                    'rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600',
                    sizeMap[size]
                )}
            >
                {initials}
            </div>
            {statusColor && (
                <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: statusColor }}
                />
            )}
        </div>
    );
}
