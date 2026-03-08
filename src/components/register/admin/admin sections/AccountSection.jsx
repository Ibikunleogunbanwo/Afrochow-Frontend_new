import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

function InputField({ icon: Icon, label, name, type = "text", value, onChange, error, placeholder, showPasswordToggle }) {
    const [showPassword, setShowPassword] = useState(false);
    const actualType = showPasswordToggle ? (showPassword ? "text" : "password") : type;
    const isValid = value && !error;

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon className={`w-5 h-5 transition-colors ${error ? 'text-red-400' : isValid ? 'text-emerald-500' : 'text-gray-400'}`} />
                </div>
                <input style={{ color: 'black', backgroundColor: 'white' }}
                    id={name}
                    name={name}
                    type={actualType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        error
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : isValid
                                ? 'border-emerald-300 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                )}
                {!showPasswordToggle && isValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                )}
                {!showPasswordToggle && error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

export default function AccountSection({ data = {}, errors = {}, onChange }) {
    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                    <p className="text-sm text-gray-500">Set up login credentials</p>
                </div>
            </div>

            <div className="space-y-4">
                <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email || ""}
                    onChange={onChange}
                    error={errors.email}
                    placeholder="admin@example.com"
                />

                <InputField
                    icon={Lock}
                    label="Password"
                    name="password"
                    value={data.password || ""}
                    onChange={onChange}
                    error={errors.password}
                    placeholder="Create a strong password"
                    showPasswordToggle
                />

                <InputField
                    icon={Lock}
                    label="Confirm Password"
                    name="confirmPassword"
                    value={data.confirmPassword || ""}
                    onChange={onChange}
                    error={errors.confirmPassword}
                    placeholder="Re-enter your password"
                    showPasswordToggle
                />
            </div>
        </section>
    );
}