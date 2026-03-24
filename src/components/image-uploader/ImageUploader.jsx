"use client";
import { useState, useEffect, useRef } from 'react';
import { Upload, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function validateImageFile(file) {
    if (!file) return "No file selected";
    if (!IMAGE_TYPES.includes(file.type)) {
        return "Please select a valid image (JPEG, PNG, GIF, WebP)";
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return "Image size must be less than 5MB";
    }
    return null;
}

function createPreview(file) {
    return URL.createObjectURL(file);
}

function revokePreview(preview) {
    if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
    }
}

const SIZE_MAP = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    'xl-wide': 'w-64 h-48', // Rectangle for products
    banner: 'w-full h-44',  // Full-width landscape banner
};

const PLACEHOLDER_MAP = {
    sm: { icon: 'w-5 h-5', text: 'text-xs', gap: 'gap-1' },
    md: { icon: 'w-6 h-6', text: 'text-sm', gap: 'gap-1.5' },
    lg: { icon: 'w-8 h-8', text: 'text-sm', gap: 'gap-2' },
    xl: { icon: 'w-10 h-10', text: 'text-base', gap: 'gap-2.5' },
    'xl-wide': { icon: 'w-10 h-10', text: 'text-base', gap: 'gap-2.5' },
    banner: { icon: 'w-10 h-10', text: 'text-base', gap: 'gap-2.5' },
};

const REMOVE_BUTTON_MAP = {
    sm: { button: 'w-5 h-5', icon: 'w-3 h-3', position: 'top-0 right-0' },
    md: { button: 'w-6 h-6', icon: 'w-3.5 h-3.5', position: 'top-1 right-1' },
    lg: { button: 'w-7 h-7', icon: 'w-4 h-4', position: 'top-1 right-1' },
    xl: { button: 'w-8 h-8', icon: 'w-5 h-5', position: 'top-2 right-2' },
    'xl-wide': { button: 'w-8 h-8', icon: 'w-5 h-5', position: 'top-2 right-2' },
    banner: { button: 'w-8 h-8', icon: 'w-5 h-5', position: 'top-2 right-2' },
};

function ImageUploader({
                           onChange,
                           onUpload,
                           label,
                           id,
                           icon: Icon,
                           error,
                           value,
                           showSuccess = true,
                           helpText,
                           required,
                           className = '',
                           size = 'md',
                           showRetry = true,
                           labelExtra,
                           shape = 'round', // 'round' or 'square'
                       }) {
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const fileRef = useRef(null);


    useEffect(() => {
        if (value && typeof value === 'string') {
            setPreview(value);
        } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (!value) {
            setPreview('');
        }
    }, [value]);

    async function handleFileSelect(e) {
        const file = e.target?.files?.[0];
        if (!file) return;

        const validationErr = validateImageFile(file);
        if (validationErr) {
            setValidationError(validationErr);
            if (onChange) onChange(null);
            return;
        }

        if (preview && preview.startsWith('blob:')) {
            revokePreview(preview);
        }

        const url = createPreview(file);
        setPreview(url);
        setValidationError('');
        setUploadError('');
        fileRef.current = file;


        if (onChange && !onUpload) {
            onChange(file);
        }

        if (onUpload) {
            setUploading(true);
            try {
                const serverUrl = await onUpload(file);
                if (serverUrl) {
                    revokePreview(url);
                    setPreview(serverUrl);
                    if (onChange) onChange(serverUrl);
                }
            } catch (err) {
                setUploadError(err.message || 'Upload failed');
            } finally {
                setUploading(false);
            }
        }
    }

    async function handleRetry() {
        if (!fileRef.current || !onUpload) return;

        setUploadError('');
        setUploading(true);

        try {
            const serverUrl = await onUpload(fileRef.current);
            if (serverUrl) {
                if (preview && preview.startsWith('blob:')) {
                    revokePreview(preview);
                }
                setPreview(serverUrl);
                if (onChange) onChange(serverUrl);
            }
        } catch (err) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    function handleRemove() {
        if (preview && preview.startsWith('blob:')) {
            revokePreview(preview);
        }
        setPreview('');
        setValidationError('');
        setUploadError('');
        fileRef.current = null;
        if (onChange) onChange(null);
    }

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                revokePreview(preview);
            }
        };
    }, [preview]);

    const currentError = error || validationError || uploadError;
    const hasValue = !!preview;
    const isValid = hasValue && !currentError;
    const roundedClass = shape === 'square' ? 'rounded-xl' : 'rounded-full';

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label - Matches FormField pattern */}
            {label && (
                <Label htmlFor={id} className="text-slate-700 font-medium flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                    {isValid && showSuccess && (
                        <span className="text-green-600 text-xs font-semibold">✓</span>
                    )}
                    {labelExtra}
                </Label>
            )}

            {!preview ? (
                <label
                    htmlFor={id}
                    className={`relative ${SIZE_MAP[size]} ${roundedClass} border-2 border-dashed flex items-center justify-center cursor-pointer bg-slate-50 transition-colors group ${
                        uploading
                            ? 'opacity-50 cursor-not-allowed border-slate-300'
                            : currentError
                                ? 'border-red-500 hover:border-red-600'
                                : 'border-slate-300 hover:border-gray-500'
                    }`}
                >
                    <input
                        id={id}
                        type="file"
                        accept={IMAGE_TYPES.join(',')}
                        onChange={handleFileSelect}
                        className="sr-only"
                        disabled={uploading}
                    />
                    <div className={`flex flex-col items-center ${PLACEHOLDER_MAP[size].gap} text-center px-2`}>
                        <Upload className={`${PLACEHOLDER_MAP[size].icon} transition-colors ${
                            uploading
                                ? 'text-slate-400'
                                : currentError
                                    ? 'text-red-500'
                                    : 'text-slate-400 group-hover:text-gray-600'
                        }`} />
                        <span className={`${PLACEHOLDER_MAP[size].text} font-medium ${
                            uploading ? 'text-slate-500' : 'text-slate-600'
                        }`}>
                            {uploading ? 'Uploading...' : 'Upload photo'}
                        </span>
                        <span className="text-xs text-slate-500">

                        </span>
                    </div>
                </label>
            ) : (
                <div className={`relative ${SIZE_MAP[size]} ${roundedClass} overflow-visible`}>
                    <div className={`w-full h-full ${roundedClass} overflow-hidden border-4 border-white shadow-lg ring-2 bg-slate-100 ${
                        currentError ? 'ring-red-500' : isValid ? 'ring-green-500' : 'ring-slate-200'
                    }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Uploading Overlay */}
                    {uploading && (
                        <div className={`absolute inset-0 bg-black/50 ${roundedClass} flex items-center justify-center`}>
                            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                            <span className="sr-only">Uploading image...</span>
                        </div>
                    )}

                    {/* Remove Button */}
                    {!uploading && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className={`absolute ${REMOVE_BUTTON_MAP[size].position} ${REMOVE_BUTTON_MAP[size].button} bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 z-40`}
                            aria-label="Remove image"
                        >
                            <X className={REMOVE_BUTTON_MAP[size].icon} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            )}

            {/* Error Message - Matches FormField pattern */}
            {currentError && (
                <div className="flex items-start gap-1.5 text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm">{currentError}</p>
                        {uploadError && showRetry && onUpload && (
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="mt-1 text-sm underline flex items-center gap-1 hover:text-red-800 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Try again
                            </button>
                        )}
                    </div>
                </div>
            )}

            {helpText && !currentError && (
                <p className="text-xs text-slate-500">{helpText}</p>
            )}
        </div>
    );
}

export default ImageUploader;