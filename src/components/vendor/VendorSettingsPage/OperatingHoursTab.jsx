"use client";
import React from 'react';
import { Save, RefreshCw, Clock, Calendar } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/components/vendor/VendorSettingsPage/utils/constants';
import PropTypes from 'prop-types';

const OperatingHoursTab = ({
                               profile,
                               operatingHours,
                               saving,
                               onToggleDay,
                               onUpdateHours,
                               onSave,
                           }) => {
    return (
        <div className="px-4 py-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-linear-to-br from-orange-500 to-amber-500 p-2 rounded-xl shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Operating Hours
                    </h2>
                </div>
                <p className="text-gray-600 ml-0 sm:ml-14 mt-1 sm:mt-0">
                    Set your weekly schedule and business hours
                </p>
            </div>

            <div className="space-y-6">
                {/* Current Status Card */}
                {profile && (
                    <div
                        className={`p-4 sm:p-6 rounded-2xl border-2 shadow-lg ${
                            profile.isOpenNow
                                ? 'bg-linear-to-br from-green-50 to-emerald-50 border-green-200'
                                : 'bg-linear-to-br from-gray-50 to-slate-50 border-gray-200'
                        }`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`h-4 w-4 rounded-full shrink-0 ${
                                        profile.isOpenNow
                                            ? 'bg-green-500 animate-pulse shadow-lg shadow-green-300'
                                            : 'bg-gray-400'
                                    }`}
                                />
                                <div>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                        {profile.isOpenNow ? '🟢 Currently Open' : '⚫ Currently Closed'}
                                    </p>
                                    {profile.todayHoursFormatted && (
                                        <p className="text-sm text-gray-600 font-medium">
                                            Today&rsquo;s Hours: {profile.todayHoursFormatted}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 self-end sm:self-auto" />
                        </div>
                    </div>
                )}

                {/* Weekly Schedule */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2 text-base sm:text-lg">
                        <Calendar className="h-5 w-5 text-orange-600 shrink-0" />
                        Weekly Schedule
                    </h3>

                    <div className="space-y-3">
                        {DAYS_OF_WEEK.map((day) => (
                            <div
                                key={day.key}
                                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border-2 border-white hover:border-orange-200 transition-all"
                            >
                                {/* Day row */}
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={operatingHours[day.key]?.isOpen || false}
                                            onChange={() => onToggleDay(day.key)}
                                            className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer shrink-0"
                                        />
                                        <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                      {day.label}
                    </span>
                                        {!operatingHours[day.key]?.isOpen && (
                                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        CLOSED
                      </span>
                                        )}
                                    </label>
                                </div>

                                {/* Time inputs */}
                                {operatingHours[day.key]?.isOpen && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-0 sm:pl-8">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                                Opening Time
                                            </label>
                                            <input
                                                type="time"
                                                value={operatingHours[day.key]?.openTime || '09:00'}
                                                onChange={(e) =>
                                                    onUpdateHours(day.key, 'openTime', e.target.value)
                                                }
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                                Closing Time
                                            </label>
                                            <input
                                                type="time"
                                                value={operatingHours[day.key]?.closeTime || '17:00'}
                                                onChange={(e) =>
                                                    onUpdateHours(day.key, 'closeTime', e.target.value)
                                                }
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info callout */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-900 mb-1">
                                Automatic Updates
                            </p>
                            <p className="text-sm text-amber-700">
                                Your restaurant status will automatically update based on the
                                hours you set. Customers will see when you&rsquo;re open or
                                closed in real-time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-[1.02] disabled:hover:scale-100"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Saving Hours...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save Operating Hours</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

OperatingHoursTab.propTypes = {
    profile: PropTypes.shape({
        isOpenNow: PropTypes.bool,
        todayHoursFormatted: PropTypes.string,
    }),
    operatingHours: PropTypes.object.isRequired,
    saving: PropTypes.bool.isRequired,
    onToggleDay: PropTypes.func.isRequired,
    onUpdateHours: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default OperatingHoursTab;