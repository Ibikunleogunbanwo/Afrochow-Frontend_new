import React from 'react';

const LoadingState = () => {
    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
                    <div className="relative inline-block mb-6">
                        <div className="animate-spin h-16 w-16 border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
                        <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-orange-300 rounded-full opacity-20"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Your Settings</h3>
                    <p className="text-gray-600">Please wait while we fetch your restaurant details...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;