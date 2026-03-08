import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Reusable FormField Component - Afrochow Theme
 * Handles input, textarea, and custom children with consistent styling
 * Uses orange/red focus colors to match Afrochow brand
 */
export default function FormField({
                                      label,
                                      id,
                                      icon: Icon,
                                      error,
                                      value,
                                      showSuccess = true,
                                      helpText,
                                      children,
                                      type = "input",
                                      inputProps = {},
                                      textareaProps = {},
                                      labelExtra,
                                  }) {
    const hasValue = value && value.length > 0;
    const isValid = hasValue && !error;

    return (
        <div className="space-y-2">
            {/* Label */}
            {label && (
                <Label htmlFor={id} className="text-gray-700 font-medium flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                    {isValid && showSuccess && (
                        <span className="text-green-600 text-xs font-semibold">✓</span>
                    )}
                    {labelExtra}
                </Label>
            )}

            {/* Input/Textarea/Custom */}
            {type === "input" && (
                <div className="relative">
                    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
                    <Input
                        id={id}
                        className={`${Icon ? 'pl-10' : ''} h-11 ${
                            hasValue && isValid ? 'pr-12' : ''
                        } ${
                            error
                                ? "border-red-500 focus-visible:ring-red-500"
                                : "border-gray-300 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                        }`}
                        {...inputProps}
                    />
                    {isValid && showSuccess && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 shrink-0" />
                    )}
                </div>
            )}

            {type === "textarea" && (
                <div className="relative">
                    {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
                    <Textarea
                        id={id}
                        className={`${Icon ? 'pl-10' : ''} resize-y ${
                            error
                                ? "border-red-500 focus-visible:ring-red-500"
                                : "border-gray-300 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                        }`}
                        {...textareaProps}
                    />
                    {isValid && showSuccess && (
                        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500 shrink-0" />
                    )}
                </div>
            )}

            {type === "custom" && children}

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-1.5 text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Help Text */}
            {helpText && !error && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}
        </div>
    );
}