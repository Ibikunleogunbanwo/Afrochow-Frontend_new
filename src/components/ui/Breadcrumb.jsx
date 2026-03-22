import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb — renders a trail of links with a Home root.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "Profile",  href: "/profile"  },
 *     { label: "Settings", href: "/settings" },  // optional: more crumbs
 *   ]} />
 *
 * The last item is always rendered as plain text (current page).
 * All prior items are rendered as links.
 */
export default function Breadcrumb({ items = [] }) {
    const crumbs = [{ label: "Home", href: "/" }, ...items];

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
            {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                    <span key={crumb.href ?? crumb.label} className="flex items-center gap-1.5">
                        {idx > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        {idx === 0 ? (
                            <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors">
                                <Home className="w-3.5 h-3.5" />
                                <span className="sr-only">Home</span>
                            </Link>
                        ) : isLast ? (
                            <span className="font-medium text-gray-900">{crumb.label}</span>
                        ) : (
                            <Link href={crumb.href} className="text-gray-400 hover:text-orange-500 transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
