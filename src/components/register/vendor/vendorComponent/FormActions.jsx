import UniversalButton from "@/components/UniversalButton";
import { Save } from "lucide-react";

/**
 * Reusable FormActions Component - Afrochow Theme
 * Handles Back/Continue and Save & Return button patterns
 * Uses UniversalButton with orange/red gradient
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
            <div className="flex gap-3 pt-2">
                <UniversalButton
                    type="button"
                    onClick={onContinue}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    Continue to Next Step
                </UniversalButton>
                <UniversalButton
                    type="submit"
                    onClick={onSaveAndReturn}
                    variant="primary"
                    loading={isSubmitting}
                    loadingText="Saving..."
                    className="flex-1"
                >
                    <Save className="h-4 w-4" />
                    Save & Return
                </UniversalButton>
            </div>
        );
    }

    return (
        <div className="flex gap-3 pt-2">
            {showBackButton && (
                <UniversalButton
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    Back
                </UniversalButton>
            )}
            <UniversalButton
                type="submit"
                variant="primary"
                loading={isSubmitting}
                loadingText="Processing..."
                className={showBackButton ? 'flex-1' : ''}
            >
                {continueText}
            </UniversalButton>
        </div>
    );
}