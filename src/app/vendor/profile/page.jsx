"use client";
import React, { useState, useEffect } from 'react';
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { AuthAPI } from '@/lib/api/auth.api';
import { deleteImage } from '@/lib/api/imageUpload';
import { toast } from 'sonner';
import SettingsSidebar from '@/components/vendor/VendorSettingsPage/SettingsSidebar';
import LoadingState from '@/components/vendor/VendorSettingsPage/LoadingState';
import RestaurantInfoTab from '@/components/vendor/VendorSettingsPage/RestaurantInfoTab';
import AddressTab from '@/components/vendor/VendorSettingsPage/AddressTab';
import OperatingHoursTab from '@/components/vendor/VendorSettingsPage/OperatingHoursTab';
import BrandingTab from '@/components/vendor/VendorSettingsPage/BrandingTab';
import AccountTab from '@/components/vendor/VendorSettingsPage/AccountTab';
import LogoutModal from '@/components/vendor/VendorSettingsPage/LogoutModal';
import { useAuth } from "@/hooks/useAuth";

const VendorSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const {logout } = useAuth();

    const [profileForm, setProfileForm] = useState({
        restaurantName: '',
        description: '',
        cuisineType: '',
        offersDelivery: true,
        offersPickup: true,
        preparationTime: '',
        deliveryFee: '',
        minimumOrderAmount: '',
        estimatedDeliveryMinutes: '',
        maxDeliveryDistanceKm: ''
    });

    const [addressForm, setAddressForm] = useState({
        addressLine: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada'
    });

    const [operatingHours, setOperatingHours] = useState({
        monday:    { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        tuesday:   { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        wednesday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        thursday:  { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        friday:    { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        saturday:  { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        sunday:    { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    });

    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                await fetchProfile();
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        })();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [profileResponse, userResponse] = await Promise.all([
                VendorProfileAPI.getVendorProfile(),
                AuthAPI.getCurrentUser().catch(() => null)
            ]);

            if (profileResponse?.success) {
                const data = profileResponse.data;
                if (userResponse?.success && userResponse.data) {
                    data.user = userResponse.data;
                }
                setProfile(data);
                
                setProfileForm({
                    restaurantName: data.restaurantName || '',
                    description: data.description || '',
                    cuisineType: data.cuisineType || '',
                    offersDelivery: data.offersDelivery !== false,
                    offersPickup: data.offersPickup !== false,
                    preparationTime: data.preparationTime || '',
                    deliveryFee: data.deliveryFee || '',
                    minimumOrderAmount: data.minimumOrderAmount || '',
                    estimatedDeliveryMinutes: data.estimatedDeliveryMinutes || '',
                    maxDeliveryDistanceKm: data.maxDeliveryDistanceKm || '',
                });

                if (data.address) {
                    setAddressForm({
                        addressLine: data.address.addressLine || '',
                        city: data.address.city || '',
                        province: data.address.province || '',
                        postalCode: data.address.postalCode || '',
                        country: data.address.country || 'Canada'
                    });
                }

                if (data.weeklySchedule) {
                    setOperatingHours(prev =>
                        ({
                            monday:    { ...prev.monday,    ...(data.weeklySchedule.monday || {})    },
                            tuesday:   { ...prev.tuesday,   ...(data.weeklySchedule.tuesday || {})   },
                            wednesday: { ...prev.wednesday, ...(data.weeklySchedule.wednesday || {}) },
                            thursday:  { ...prev.thursday,  ...(data.weeklySchedule.thursday || {})  },
                            friday:    { ...prev.friday,    ...(data.weeklySchedule.friday || {})    },
                            saturday:  { ...prev.saturday,  ...(data.weeklySchedule.saturday || {})  },
                            sunday:    { ...prev.sunday,    ...(data.weeklySchedule.sunday || {})    },
                        })
                    );
                }
                if (data.logoUrl) setLogoFile(data.logoUrl);
                if (data.bannerUrl) setBannerFile(data.bannerUrl);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(error.message || 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const saveVendorSection = async (sectionData) => {
        try {
            setSaving(true);
            const res = await VendorProfileAPI.updateVendorProfile(sectionData);
            if (res?.success) {
                toast.success('Saved successfully');
                await fetchProfile();
            }
            return res;
        } catch (e) {
            console.error('Error updating section:', e);
            toast.error(e.message || 'Update failed');
            throw e;
        } finally {
            setSaving(false);
        }
    };


    const handleUpdateProfile = async () => {
        await saveVendorSection({
            restaurantName: profileForm.restaurantName,
            description: profileForm.description,
            cuisineType: profileForm.cuisineType,
            offersDelivery: profileForm.offersDelivery,
            offersPickup: profileForm.offersPickup,
            preparationTime: profileForm.preparationTime,
            deliveryFee: profileForm.deliveryFee,
            minimumOrderAmount: profileForm.minimumOrderAmount,
            estimatedDeliveryMinutes: profileForm.estimatedDeliveryMinutes,
            maxDeliveryDistanceKm: profileForm.maxDeliveryDistanceKm,
            operatingHours
        });
    };


    const handleUpdateAddress = () =>
        saveVendorSection({ address: addressForm });


    const handleUpdateOperatingHours = () =>
        saveVendorSection({ operatingHours });


    const handleImageUpload = async (file, uploaderId, setFileState) => {
        let type;
        if (uploaderId.toLowerCase().includes('logo')) {
            type = 'logo';
        } else if (uploaderId.toLowerCase().includes('banner')) {
            type = 'banner';
        } else {
            toast.error('Invalid uploader type');
            return;
        }

        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File is too large. Maximum size is 5MB.');
            return;
        }

        const oldUrl = type === 'logo' ? profile?.logoUrl : profile?.bannerUrl;

        try {
            const response = await VendorProfileAPI.uploadVendorImage(file, type);

            if (response?.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);

                const newUrl = type === 'logo' ? response.data?.logoUrl : response.data?.bannerUrl;

                if (setFileState) {
                    setFileState(newUrl);
                }

                await fetchProfile();

                if (oldUrl && oldUrl !== newUrl) {
                    deleteImage(oldUrl);
                }

                return newUrl;
            }
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            toast.error(error.message || `Failed to upload ${type}`);
            throw error;
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const toggleDayOpen = (day) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                isOpen: !prev[day]?.isOpen,
                openTime: prev[day]?.openTime || '09:00',
                closeTime: prev[day]?.closeTime || '17:00'
            }
        }));
    };

    const updateOperatingHours = (day, field, value) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Enhanced Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                                Profile
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Manage your settings and preferences</p>
                        </div>
                        {profile && (
                            <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-orange-100 w-fit">
                                <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${profile.isOpenNow ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                    {profile.isOpenNow ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {/* SettingsSidebar renders mobile tabs (outside grid) and desktop sidebar (inside grid) */}
                    <SettingsSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onLogout={() => setShowLogoutModal(true)}
                    />

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {activeTab === 'profile' && (
                                <RestaurantInfoTab
                                    profileForm={profileForm}
                                    setProfileForm={setProfileForm}
                                    saving={saving}
                                    onSave={handleUpdateProfile}
                                />
                            )}

                            {activeTab === 'address' && (
                                <AddressTab
                                    addressForm={addressForm}
                                    setAddressForm={setAddressForm}
                                    profile={profile}
                                    saving={saving}
                                    onSave={handleUpdateAddress}
                                />
                            )}

                            {activeTab === 'hours' && (
                                <OperatingHoursTab
                                    profile={profile}
                                    operatingHours={operatingHours}
                                    saving={saving}
                                    onToggleDay={toggleDayOpen}
                                    onUpdateHours={updateOperatingHours}
                                    onSave={handleUpdateOperatingHours}   // ← this one
                                />
                            )}

                            {activeTab === 'images' && (
                                <BrandingTab
                                    logoFile={logoFile}
                                    setLogoFile={setLogoFile}
                                    bannerFile={bannerFile}
                                    setBannerFile={setBannerFile}
                                    onImageUpload={handleImageUpload}
                                />
                            )}

                            {activeTab === 'account' && profile && (
                                <AccountTab profile={profile} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
};

export default VendorSettingsPage;