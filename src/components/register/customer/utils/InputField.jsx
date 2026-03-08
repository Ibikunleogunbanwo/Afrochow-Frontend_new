import ErrorMessage from "@/components/register/customer/utils/errorMessage";
const InputField = ({ error, children, helpText }) => (
    <div className="space-y-2">
        {children}
        {error && <ErrorMessage message={error} />}
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
);

export default InputField;