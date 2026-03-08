import React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';

const ProfileDropdown = ({ isOpen, onLogout, onClose }) => {
    if (!isOpen) return null;

    const handleLogoutClick = () => {
        onClose();
        onLogout();
    };

    return (
        <div className="absolute left-0 right-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="py-2">
                <Link
                    href="/vendor/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                </Link>

                <Link
                    href="/vendor/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                </Link>

                <hr className="my-2 border-gray-200" />

                <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;