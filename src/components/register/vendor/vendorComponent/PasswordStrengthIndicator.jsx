import {getPasswordStrength} from "@/components/register/PasswordStrength";

function PasswordStrengthIndicator({ password, visible }) {
    if (!password || !visible) return null;

    const strength = getPasswordStrength(password);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${
                    strength.text === "Weak" ? "text-red-600" :
                        strength.text === "Medium" ? "text-amber-600" :
                            "text-green-600"
                }`}>
          {strength.text}
        </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.level}%` }}
                />
            </div>
        </div>
    );
}

export default PasswordStrengthIndicator