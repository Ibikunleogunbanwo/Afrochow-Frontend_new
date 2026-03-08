import {AlertCircle} from "lucide-react";

const ErrorMessage = ({ message }) => (
    <div className="flex items-start gap-1.5 text-red-600">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <p className="text-sm">{message}</p>
    </div>
);

export default ErrorMessage;