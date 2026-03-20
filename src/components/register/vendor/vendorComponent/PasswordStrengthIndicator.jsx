import { Check, X } from "lucide-react";
import { getPasswordStrength } from "@/components/register/PasswordStrength";

const REQUIREMENTS = [
  { label: "At least 8 characters",         test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)",     test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",     test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)",               test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)",  test: (p) => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(p) },
];

function PasswordStrengthIndicator({ password, visible }) {
  if (!password || !visible) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Strength bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.level}%` }}
          />
        </div>
        <span className={`text-xs font-semibold min-w-[48px] text-right ${
          strength.text === "Weak"   ? "text-red-600"   :
          strength.text === "Medium" ? "text-amber-600" :
          strength.text === "Strong" ? "text-green-600" : "text-gray-400"
        }`}>
          {strength.text}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {REQUIREMENTS.map(({ label, test }) => {
          const met = test(password);
          return (
            <div key={label} className="flex items-center gap-1.5">
              {met ? (
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              )}
              <span className={`text-xs transition-colors ${met ? "text-green-700" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordStrengthIndicator;
