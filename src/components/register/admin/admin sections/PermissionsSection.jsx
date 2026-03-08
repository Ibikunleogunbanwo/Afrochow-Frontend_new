import { Shield, Check, X } from 'lucide-react';
import { PERMISSION_KEYS } from "@/components/register/admin/utils/permissions";
import {
    countEnabledPermissions,
    areAllPermissionsGranted,
    toggleAllPermissions,
    formatPermissionLabel
} from "@/components/register/admin/utils/Permissionutils";

function PermissionCard({ permissionKey, checked, onChange }) {
    return (
        <label className="relative group cursor-pointer">
            <input style={{ color: 'black', backgroundColor: 'white' }}
                type="checkbox"
                name={permissionKey}
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
            />
            <div className={`
                flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                ${checked
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }
                peer-focus:ring-4 peer-focus:ring-blue-100
            `}>
                <div className={`
                    shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${checked
                    ? 'bg-emerald-500 shadow-md'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }
                `}>
                    {checked ? (
                        <Check className="w-5 h-5 text-white" />
                    ) : (
                        <div className="w-3 h-3 rounded border-2 border-gray-400" />
                    )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                    checked ? 'text-emerald-900' : 'text-gray-700'
                }`}>
                    {formatPermissionLabel(permissionKey)}
                </span>
            </div>
        </label>
    );
}

export default function PermissionsSection({ data = {}, onChange, onBulkChange }) {
    const selectedCount = countEnabledPermissions(data);
    const allGranted = areAllPermissionsGranted(data);
    const totalPermissions = PERMISSION_KEYS.length;

    const handleToggleAll = () => {
        const newState = toggleAllPermissions(!allGranted);

        // Use onBulkChange if provided, otherwise fall back to onChange
        if (onBulkChange) {
            onBulkChange(newState);
        } else {
            onChange({
                target: { name: "permissions", value: newState },
            });
        }
    };

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Permissions</h2>
                        <p className="text-sm text-gray-500">
                            {selectedCount} of {totalPermissions} permissions granted
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleToggleAll}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md
                        ${allGranted
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }
                    `}
                >
                    {allGranted ? (
                        <>
                            <X className="w-4 h-4" />
                            Revoke All
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Grant All
                        </>
                    )}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-emerald-500 to-green-600 transition-all duration-500 ease-out"
                        style={{ width: `${(selectedCount / totalPermissions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Permission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERMISSION_KEYS.map((key) => (
                    <PermissionCard
                        key={key}
                        permissionKey={key}
                        checked={data[key] || false}
                        onChange={onChange}
                    />
                ))}
            </div>
        </section>
    );
}