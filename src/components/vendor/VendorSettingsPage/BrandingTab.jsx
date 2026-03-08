import React from 'react';
import ImageUploader from '@/components/image-uploader/ImageUploader';
import { Image, Upload, Sparkles } from 'lucide-react';

const BrandingTab = ({ logoFile, setLogoFile, bannerFile, setBannerFile, onImageUpload }) => {
    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-orange-400/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="bg-linear-to-br from-orange-500 to-amber-500 p-2.5 sm:p-3 rounded-xl shadow-lg w-fit">
                        <Image
                            className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Restaurant Branding</h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Upload your logo and banner to showcase your brand identity</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
                {/* Logo Section */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-sm w-fit">

                            <Image
                                className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Restaurant Logo</h3>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                Upload a square logo (recommended 512x512px) that represents your brand. This will appear on your restaurant profile and menu listings.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-dashed border-orange-200 hover:border-orange-400 transition-all duration-200">
                        <div className="flex justify-center">
                            <ImageUploader
                                id="vendor-logo"
                                value={logoFile}
                                onChange={setLogoFile}
                                onUpload={(file) => onImageUpload(file, 'vendor-logo', setLogoFile)}
                                size="xl"
                                shape="round"
                                helpText="JPG, PNG, GIF or WebP (max 5MB)"
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Section */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-sm w-fit">
                            <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Restaurant Banner</h3>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                Upload a wide banner image (recommended 1920x600px) to showcase your restaurant&#39;s atmosphere, signature dishes, or dining experience.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all duration-200">
                        <div className="flex justify-center">
                            <ImageUploader
                                id="vendor-banner"
                                value={bannerFile}
                                onChange={setBannerFile}
                                onUpload={(file) => onImageUpload(file, 'vendor-banner', setBannerFile)}
                                size="xl-wide"
                                shape="square"
                                helpText="JPG, PNG, GIF or WebP (max 5MB)"
                            />
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-linear-to-br from-purple-50 to-violet-50 border-l-4 border-purple-500 rounded-r-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex gap-3 sm:gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-purple-900 mb-2 sm:mb-3 text-sm sm:text-base">Pro Tips for Great Images</p>
                            <ul className="text-xs sm:text-sm text-purple-800 space-y-1.5 sm:space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold shrink-0">•</span>
                                    <span>Use high-quality images that are well-lit and in focus</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold shrink-0">•</span>
                                    <span>Keep your logo simple and recognizable</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold shrink-0">•</span>
                                    <span>Choose a banner that showcases your best dishes or ambiance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold shrink-0">•</span>
                                    <span>Ensure images are properly sized to avoid distortion</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingTab;