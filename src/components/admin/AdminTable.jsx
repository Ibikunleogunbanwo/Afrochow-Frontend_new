'use client';

import { cn } from '@/lib/utils';

/**
 * Outer wrapper — place inside your existing card div.
 * Adds a sticky header + clean row list in the member-list style.
 */
export function AdminTableRoot({ className, children, ...props }) {
    return (
        <div
            className={cn('w-full', className)}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Sticky header row — desktop only.
 * Hidden on mobile; column labels are implied by the card layout instead.
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
 * On mobile  → flex-col card layout with padding + gap between stacked fields.
 * On desktop → flex-row aligned to the header columns.
 */
export function AdminTableRow({ className, children, onClick, ...props }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex flex-col md:flex-row md:items-center',
                'px-4 md:px-6',
                'py-4 md:py-3.5',
                'gap-3 md:gap-0',
                'border-b border-gray-100 last:border-b-0 text-sm',
                onClick && 'cursor-pointer',
                'hover:bg-gray-50 transition-colors',
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
 * statusColor — any valid CSS colour string or Tailwind arbitrary value.
 */
export function AdminAvatar({ initials, statusColor, size = 'md', imageUrl }) {
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
