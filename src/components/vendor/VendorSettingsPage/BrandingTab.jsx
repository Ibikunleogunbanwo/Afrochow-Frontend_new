"use client";
import React from 'react';
import ImageUploader from '@/components/image-uploader/ImageUploader';
import { ImageIcon, Upload, Sparkles } from 'lucide-react';

const BrandingTab = ({ logoFile, setLogoFile, bannerFile, setBannerFile, onImageUpload }) => {
    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="bg-gray-900 p-2.5 sm:p-3 rounded-xl w-fit">
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Restaurant Branding</h2>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">Upload your logo and banner to showcase your brand identity</p>
                </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
                {/* Logo Section */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 w-fit">
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Restaurant Logo</h3>
                            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                                Upload a square logo (recommended 512×512 px). This appears on your restaurant profile and menu listings.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                        <div className="flex justify-center">
                            <ImageUploader
                                id="vendor-logo"
                                value={logoFile}
                                onChange={setLogoFile}
                                onUpload={(file) => onImageUpload(file, 'vendor-logo', setLogoFile)}
                                size="xl"
                                shape="square"
                                helpText="JPG, PNG or WebP · max 5 MB"
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Section */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 w-fit">
                            <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Restaurant Banner</h3>
                            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                                Upload a wide banner image (recommended 1920×600 px) to showcase your restaurant&#39;s atmosphere or signature dishes.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                        <div className="flex justify-center">
                            <ImageUploader
                                id="vendor-banner"
                                value={bannerFile}
                                onChange={setBannerFile}
                                onUpload={(file) => onImageUpload(file, 'vendor-banner', setBannerFile)}
                                size="xl-wide"
                                shape="square"
                                helpText="JPG, PNG or WebP · max 5 MB · wide images work best"
                            />
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-gray-50 border-l-4 border-gray-900 rounded-r-xl p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shrink-0">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Tips for great images</p>
                            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 font-bold shrink-0">·</span>
                                    <span>Use high-quality images that are well-lit and in focus</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 font-bold shrink-0">·</span>
                                    <span>Keep your logo simple and recognizable at small sizes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 font-bold shrink-0">·</span>
                                    <span>Choose a banner that showcases your best dishes or ambiance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 font-bold shrink-0">·</span>
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
