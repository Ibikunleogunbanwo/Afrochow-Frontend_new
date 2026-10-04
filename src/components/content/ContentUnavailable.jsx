import { Mail } from "lucide-react";

// Shown when backend-owned content (help, policies) can't be loaded.
export default function ContentUnavailable({ what = "This content" }) {
    return (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">{what} is temporarily unavailable.</p>
            <p>
                Please try again in a few minutes, or email us at{" "}
                <a href="mailto:support@afrochow.ca" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                    <Mail className="w-3.5 h-3.5" />support@afrochow.ca
                </a>.
            </p>
        </div>
    );
}
