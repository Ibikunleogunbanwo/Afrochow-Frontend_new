import { Card } from "@/components/ui/card";
import StepIndicator from "@/components/register/StepIndicator";
import ReviewBanner from "@/components/register/vendor/vendorComponent/Reviewbanner";

/**
 * Shared Form Container Component
 * Provides consistent layout for all vendor registration steps
 */
export default function FormContainer({
  currentStep,
  totalSteps = 6,
  title,
  description,
  fromReview = false,
  children,
  maxWidth = "md", // sm, md, lg, xl, 2xl, 3xl
}) {
  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className={`w-full ${widthClasses[maxWidth]} shadow-lg !bg-white`}>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className="p-6 pb-4 !bg-white">
          <ReviewBanner show={fromReview} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>

        <div className="px-6 pb-6 !bg-white">{children}</div>
      </Card>
    </div>
  );
}
