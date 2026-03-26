// components/ui/empty.jsx
import { cn } from "@/lib/utils"

/**
 * Composable empty-state primitives.
 *
 * Usage:
 *   <Empty>
 *     <EmptyMedia>…icon or image…</EmptyMedia>
 *     <EmptyHeader>
 *       <EmptyTitle>No results</EmptyTitle>
 *       <EmptyDescription>Try a different search term.</EmptyDescription>
 *     </EmptyHeader>
 *     <EmptyContent>…optional CTA…</EmptyContent>
 *   </Empty>
 */

export function Empty({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 text-center",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function EmptyMedia({ className, children, ...props }) {
    return (
        <div
            className={cn("flex items-center justify-center", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function EmptyHeader({ className, children, ...props }) {
    return (
        <div className={cn("space-y-1.5", className)} {...props}>
            {children}
        </div>
    )
}

export function EmptyTitle({ className, children, ...props }) {
    return (
        <h3
            className={cn("text-lg font-semibold text-gray-900", className)}
            {...props}
        >
            {children}
        </h3>
    )
}

export function EmptyDescription({ className, children, ...props }) {
    return (
        <p
            className={cn("text-sm text-gray-500 max-w-sm mx-auto leading-relaxed", className)}
            {...props}
        >
            {children}
        </p>
    )
}

export function EmptyContent({ className, children, ...props }) {
    return (
        <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
            {children}
        </div>
    )
}
