import { CheckCircle2, User, Mail, CreditCard, Building2, Shield } from 'lucide-react';

export default function AdminSuccessMessage({ data }) {
    if (!data) return null;

    const details = [
        { icon: User, label: 'Name', value: data.name },
        { icon: Mail, label: 'Email', value: data.email },
        { icon: CreditCard, label: 'Employee ID', value: data.employeeId },
        { icon: Building2, label: 'Department', value: data.department },
        { icon: Shield, label: 'Access Level', value: data.accessLevel }
    ];

    return (
        <div className="relative mb-6 animate-in slide-in-from-top duration-500">
            <div className="bg-linear-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 backdrop-blur-sm border border-emerald-200/50 rounded-2xl overflow-hidden shadow-xl">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-400 to-green-600 rounded-l-2xl" />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-20 w-24 h-24 bg-green-400/20 rounded-full blur-2xl" />

                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-emerald-900 mb-1">
                                Admin Created Successfully
                            </h2>
                            <p className="text-sm text-emerald-700">
                                New administrator account has been registered
                            </p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {details.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-emerald-100/50 hover:bg-white/70 transition-colors"
                            >
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                                        {label}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
