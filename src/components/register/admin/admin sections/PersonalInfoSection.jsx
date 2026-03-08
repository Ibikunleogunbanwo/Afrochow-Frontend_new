import { User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

function InputField({ icon: Icon, label, name, type = "text", value, onChange, error, placeholder }) {
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
                    type={type}
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
                {isValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                )}
                {error && (
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

export default function PersonalInfoSection({ data = {}, errors = {}, onChange }) {
    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Basic details about the admin</p>
                </div>
            </div>

            <div className="space-y-4">
                <InputField
                    icon={User}
                    label="First Name"
                    name="firstName"
                    value={data.firstName || ""}
                    onChange={onChange}
                    error={errors.firstName}
                    placeholder="Enter first name"
                />

                <InputField
                    icon={User}
                    label="Last Name"
                    name="lastName"
                    value={data.lastName || ""}
                    onChange={onChange}
                    error={errors.lastName}
                    placeholder="Enter last name"
                />

                <InputField
                    icon={Phone}
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={data.phone || ""}
                    onChange={onChange}
                    error={errors.phone}
                    placeholder="+1 (555) 000-0000"
                />
            </div>
        </section>
    );
}
