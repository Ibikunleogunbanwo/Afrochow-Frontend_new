import React from 'react';
import Link from 'next/link';

const NotificationDropdown = ({ isOpen, notifications, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                notification.unread ? 'bg-orange-50' : ''
                            }`}
                        >
                            <p className="text-sm text-gray-900">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="px-4 py-3 text-center border-t border-gray-200">
                <Link
                    href="/vendor/notifications"
                    className="text-sm text-orange-600 font-semibold hover:text-orange-700"
                    onClick={onClose}
                >
                    View all notifications
                </Link>
            </div>
        </div>
    );
};

export default NotificationDropdown;