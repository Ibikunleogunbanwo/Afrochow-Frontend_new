import UniversalButton from "@/components/UniversalButton";
import { Save } from "lucide-react";

/**
 * Reusable FormActions Component — mobile-first
 *
 * Mobile:   primary action full-width on top, secondary below
 * Desktop:  side-by-side (secondary left, primary right)
 */
export default function FormActions({
    onBack,
    onContinue,
    onSaveAndReturn,
    continueText = "Continue",
    showBackButton = true,
    fromReview = false,
    isSubmitting = false,
}) {
    if (fromReview) {
        return (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <UniversalButton
                    type="button"
                    onClick={onContinue}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1"
                >
                    Continue to Next Step
                </UniversalButton>
                <UniversalButton
                    type="submit"
                    onClick={onSaveAndReturn}
                    variant="primary"
                    loading={isSubmitting}
                    loadingText="Saving..."
                    className="w-full sm:flex-1"
                >
                    <Save className="h-4 w-4" />
                    Save & Return
                </UniversalButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            {showBackButton && (
                <UniversalButton
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1"
                >
                    Back
                </UniversalButton>
            )}
            <UniversalButton
                type="submit"
                variant="primary"
                loading={isSubmitting}
                loadingText="Processing..."
                className={`w-full ${showBackButton ? "sm:flex-1" : ""}`}
            >
                {continueText}
            </UniversalButton>
        </div>
    );
}
