import Link from "next/link";
import ErrorMessage from "@/components/register/customer/utils/errorMessage";


export default function TermsAndConditionsSection({
                                                      formData,
                                                      errors,
                                                      handleInputChange,
                                                  }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-100">
                📋 Terms & Conditions
            </h2>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className={`w-5 h-5 rounded mt-0.5 cursor-pointer ${
                        errors.acceptTerms
                            ? "border-red-500 text-red-600 focus:ring-red-100"
                            : "border-gray-300 text-orange-600 focus:ring-4 focus:ring-orange-100"
                    }`}
                />
                <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                >
                    I agree to the{" "}
                    <Link
                        href="/terms"
                        className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2"
                    >
                        Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2"
                    >
                        Privacy Policy
                    </Link>
                </label>
            </div>
            {errors.acceptTerms && <ErrorMessage message={errors.acceptTerms} />}
        </div>
    );
}