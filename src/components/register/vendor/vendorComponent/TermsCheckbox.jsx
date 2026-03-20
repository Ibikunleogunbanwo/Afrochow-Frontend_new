import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import { AlertCircle } from "lucide-react";

function TermsCheckbox({ control, error }) {
    return (
        <div className="space-y-2 pt-2">
            <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                error
                    ? "bg-red-50 border-red-300"
                    : "bg-gray-50 border-gray-300 hover:border-orange-300 hover:bg-orange-50/30"
            }`}>
                <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="acceptTerms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={error ? "border-red-500" : ""}
                        />
                    )}
                />
                <Label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-800 leading-relaxed cursor-pointer font-normal"
                >
                    I agree to the{" "}
                    <a
                        href="/terms"
                        className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                        href="/privacy"
                        className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </a>
                </Label>
            </div>
            {error && (
                <div className="flex items-center gap-1.5 text-red-600 ml-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-medium">{error.message}</p>
                </div>
            )}
        </div>
    );
}

export default TermsCheckbox;
