import { Building2, Shield, ChevronDown, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { applyAccessLevelPermissions } from '@/components/register/admin/utils/Permissionutils';

function SelectField({ icon: Icon, label, name, value, onChange, error, options, placeholder, info }) {
    const isValid = value && !error;

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Icon className={`w-5 h-5 transition-colors ${error ? 'text-red-400' : isValid ? 'text-emerald-500' : 'text-gray-400'}`} />
                </div>
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border-2 transition-all duration-200 outline-none appearance-none cursor-pointer ${
                        error
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : isValid
                                ? 'border-emerald-300 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }`}
                >
                    <option value="">{placeholder}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                    {isValid && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {error && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <ChevronDown className={`w-5 h-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
            {info && !error && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {info}
                </p>
            )}
        </div>
    );
}

export default function AdminConfigSection({
                                               data = {},
                                               errors = {},
                                               onChange,
                                               onAccessLevelChange
                                           }) {

    const departments = [
        { value: 'OPERATIONS', label: 'Operations' },
        { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
        { value: 'FINANCE', label: 'Finance' },
        { value: 'MARKETING', label: 'Marketing' },
        { value: 'HR', label: 'HR' }
    ];


    const accessLevels = [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'MODERATOR', label: 'Moderator' },
        { value: 'SUPPORT', label: 'Support' }
    ];

    const handleAccessLevelChange = (e) => {
        const accessLevel = e.target.value;

        onChange(e);

        if (onAccessLevelChange && accessLevel) {
            const defaultPermissions = applyAccessLevelPermissions(accessLevel);
            onAccessLevelChange(accessLevel, defaultPermissions);
        }
    };

    const getAccessLevelInfo = (level) => {
        switch (level) {
            case 'SUPER_ADMIN':
                return 'Full system access';
            case 'MANAGER':
                return 'Can manage vendors and users';
            case 'MODERATOR':
                return 'Limited - can review content only';
            case 'SUPPORT':
                return 'Can help customers, view orders';
            default:
                return '';
        }
    };

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Admin Configuration</h2>
                    <p className="text-sm text-gray-500">Set permissions and department</p>
                </div>
            </div>

            <div className="space-y-4">
                <SelectField
                    icon={Building2}
                    label="Department"
                    name="department"
                    value={data.department || ""}
                    onChange={onChange}
                    error={errors.department}
                    options={departments}
                    placeholder="Select Department"
                />

                <SelectField
                    icon={Shield}
                    label="Access Level"
                    name="accessLevel"
                    value={data.accessLevel || ""}
                    onChange={handleAccessLevelChange}
                    error={errors.accessLevel}
                    options={accessLevels}
                    placeholder="Select Access Level"
                    info={getAccessLevelInfo(data.accessLevel)}
                />

                {/* Auto-apply notice */}
                {data.accessLevel && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-800">
                                <strong>Auto-applied:</strong> Default permissions for {accessLevels.find(l => l.value === data.accessLevel)?.label} have been set.
                                You can customize them below.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}