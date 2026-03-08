import { ArrowLeft } from 'lucide-react';

export default function AdminFormHeader({ onBack }) {
    return (
        <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-t-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

            {/* Content */}
            <div className="relative flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        Admin Registration
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Create a new administrator account
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>
        </div>
    );
}
