import { Loader2 } from "lucide-react";

export default function UniversalButton({
                                            loading,
                                            loadingText,
                                            disabled,
                                            children,
                                            className = "",
                                            variant = "primary",
                                            type = "submit",
                                            ...props
                                        }) {
    const variants = {
        primary: "bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl",
        success: "bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl",
        danger: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl",
        outline: "bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 shadow-sm",
    };

    return (
        <button
            type={type}  // ← Use the prop instead of hardcoded "submit"
            disabled={loading || disabled}
            className={`
                w-full flex items-center justify-center gap-2 
                py-3 px-6 rounded-xl font-semibold 
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-[1.02] active:scale-[0.98]
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingText || "Loading..."}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}