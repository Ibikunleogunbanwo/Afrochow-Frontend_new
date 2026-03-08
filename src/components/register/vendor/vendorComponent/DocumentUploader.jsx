import { FileText} from "lucide-react";
import {useState, useEffect} from "react";
import Step4 from "@/app/(auth)/register/vendor/step-4/page";

function DocumentUploader({ label, helpText, value, onChange, error, required = false }) {
    const [preview, setPreview] = useState(value || null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (value && value !== preview) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreview(value);
        }
    }, [value]);

    const handleFileSelect = (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        // Validate file
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload PDF, JPG, PNG, or WEBP');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File is too large. Maximum size is 10MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPreview(base64);
            if (onChange) onChange(file, base64);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setPreview(null);
        if (onChange) onChange(null, null);
    };

    const handleDrag = (e, entering) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(entering);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer?.files?.[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const isPDF = preview && (preview === 'pdf' || preview.startsWith('data:application/pdf'));

    return (
        <div className="space-y-2">
            <label className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                {label}
                {required && <span className="text-red-500">*</span>}
                {!required && <span className="text-gray-400 font-normal text-xs">(Optional)</span>}
                {preview && <span className="text-green-600 text-xs font-semibold">✓</span>}
            </label>

            {preview ? (
                <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                        {isPDF ? (
                            <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="h-10 w-10 text-red-600" />
                            </div>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                            />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                            <p className="text-xs text-gray-500 mt-1">File uploaded successfully</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg transition-all ${
                        dragActive
                            ? 'border-orange-500 bg-orange-50'
                            : error
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 bg-gray-50 hover:border-orange-400'
                    }`}
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <input style={{ color: 'black', backgroundColor: 'white' }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Drop your document or click to browse
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP, or PDF (max. 10MB)</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
            {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
    );
}

export default DocumentUploader;

