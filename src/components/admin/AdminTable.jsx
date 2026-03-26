'use client';

import { cn } from '@/lib/utils';

/**
 * Outer wrapper — place inside your existing card div.
 * Adds a sticky header + clean row list in the member-list style.
 */
export function AdminTableRoot({ className, children, ...props }) {
    return (
        <div
            className={cn('w-full overflow-x-auto', className)}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Sticky header row. Pass an array of column configs:
 *   [{ label, className }]
 * Use className to control width (e.g. "w-32 shrink-0") or "flex-1" for the grow column.
 */
export function AdminTableHeader({ columns }) {
    return (
        <div className="flex items-center px-6 py-2.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10 min-w-max">
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
 * A single data row. Children should be divs with the same widths as the header columns.
 */
export function AdminTableRow({ className, children, onClick, ...props }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center px-6 py-3.5 border-b border-gray-100 last:border-b-0 text-sm min-w-max',
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
