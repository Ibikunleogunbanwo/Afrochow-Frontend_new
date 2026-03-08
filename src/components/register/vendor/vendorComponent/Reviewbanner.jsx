import { ArrowLeft } from "lucide-react";

/**
 * ReviewBanner Component - Afrochow Theme
 * Shows when user is editing a step from the review page
 * Uses orange color to match Afrochow brand
 */
export default function ReviewBanner({ show = false }) {
    if (!show) return null;

    return (
        <div className="mb-3 flex items-center gap-2 text-orange-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Editing from Review</span>
        </div>
    );
}