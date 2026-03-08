import { Info, AlertCircle, Sparkles } from "lucide-react";

/**
 * Reusable Info/Alert Box Component
 * For displaying helpful information, warnings, or tips
 */
export default function InfoBox({
  variant = "info", // info, warning, tip
  title,
  children,
  className = ""
}) {
  const variants = {
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      titleColor: "text-blue-900",
      iconColor: "text-blue-600",
      Icon: Info,
    },
    warning: {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      titleColor: "text-orange-900",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    tip: {
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      titleColor: "text-amber-900",
      iconColor: "text-amber-600",
      Icon: Sparkles,
    },
  };

  const config = variants[variant];
  const Icon = config.Icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-xs ${config.textColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
