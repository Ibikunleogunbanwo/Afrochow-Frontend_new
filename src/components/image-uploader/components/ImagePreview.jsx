import { X } from "lucide-react";

/**
 * ImagePreview Component
 * Displays uploaded image as a circular profile picture with remove button and uploading state
 *
 * Uses regular <img> instead of Next.js Image because:
 * - Images come from local backend (localhost:8080) during development
 * - Next.js Image blocks private IPs for security (SSRF prevention)
 * - Regular img works fine for our own backend images
 * - In production, images will be from public domain and this continues to work
 *
 * @param {string} src - Image URL to display
 * @param {boolean} uploading - Whether image is currently uploading
 * @param {function} onRemove - Callback when remove button is clicked
 * @param {string} alt - Alt text for the image
 * @param {string} size - Size variant: 'sm' (64px), 'md' (96px), 'lg' (128px), 'xl' (160px)
 */
export default function ImagePreview({
                                         src,
                                         uploading,
                                         onRemove,
                                         alt = "Profile preview",
                                         size = "lg"
                                     }) {
    // Size variants for different use cases
    const sizeClasses = {
        sm: "w-16 h-16",   // 64px - Small thumbnail
        md: "w-24 h-24",   // 96px - Medium profile
        lg: "w-32 h-32",   // 128px - Large profile (default)
        xl: "w-40 h-40"    // 160px - Extra large
    };

    const buttonSizes = {
        sm: "w-5 h-5 top-0 right-0",
        md: "w-6 h-6 top-0 right-0",
        lg: "w-7 h-7 top-0.5 right-0.5",
        xl: "w-8 h-8 top-1 right-1"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
        lg: "w-4 h-4",
        xl: "w-5 h-5"
    };

    return (
        <div className={`relative ${sizeClasses[size]} shrink-0`}>
            {/* Circular Image Container */}
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Uploading Overlay */}
            {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    <span className="sr-only">Uploading image...</span>
                </div>
            )}

            {/* Remove Button */}
            {!uploading && (
                <button
                    type="button"
                    onClick={onRemove}
                    className={`absolute ${buttonSizes[size]} bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10`}
                    aria-label="Remove image"
                >
                    <X className={iconSizes[size]} />
                </button>
            )}
        </div>
    );
}