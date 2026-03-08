import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                        <LogOut className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                    <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            You&#39;ll need to log in again to access your restaurant dashboard and manage orders.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all hover:scale-[1.02]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3.5 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.02]"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;