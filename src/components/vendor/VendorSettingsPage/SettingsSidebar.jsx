import React from 'react';
import { User, Store, MapPin, Clock, Image as ImageIcon, LogOut } from 'lucide-react';

const SettingsSidebar = ({ activeTab, setActiveTab, onLogout }) => {
    const menuItems = [
        { id: 'profile', label: 'Business Info', icon: Store, shortLabel: 'Info' },
        { id: 'address', label: 'Address', icon: MapPin, shortLabel: 'Address' },
        { id: 'hours', label: 'Operating Hours', icon: Clock, shortLabel: 'Hours' },
        { id: 'images', label: 'Branding', icon: ImageIcon, shortLabel: 'Images' },
        { id: 'account', label: 'Account', icon: User, shortLabel: 'Account' },
    ];

    return (
        <>
            {/* Mobile & Tablet: Horizontal scrollable tabs */}
            <div className="lg:hidden mb-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 overflow-x-auto">
                    <nav className="flex gap-2 min-w-max">
                        {menuItems.map(({ id, label, shortLabel, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                                    activeTab === id
                                        ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="text-xs font-medium hidden sm:inline">{shortLabel}</span>
                            </button>
                        ))}
                        <div className="border-l border-gray-200 mx-1"></div>
                        <button
                            onClick={onLogout}
                            className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span className="text-xs font-medium hidden sm:inline">Logout</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Desktop: Vertical sidebar */}
            <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-6">
                    <nav className="space-y-1.5">
                        {menuItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                    activeTab === id
                                        ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 scale-[1.02]'
                                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}
                        <div className="pt-2 mt-2 border-t border-gray-200"></div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-[1.02]"
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default SettingsSidebar;