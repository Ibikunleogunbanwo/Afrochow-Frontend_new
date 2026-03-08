import { Upload } from "lucide-react";

export default function ImageUploadDropzone({
                                                onSelect,
                                                disabled,
                                                label,
                                                inputRef,
                                            }) {
    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`h-11 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-orange-600 hover:bg-orange-50'
            }`}
            aria-disabled={disabled}
        >
            <Upload className={`h-5 w-5 ${disabled ? 'text-slate-300' : 'text-slate-400'}`} />
            <span className={`text-sm ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>
                {disabled ? "Uploading..." : label || "Upload Image"}
            </span>

            <input
                ref={inputRef}
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => onSelect(e.target.files?.[0])}
                disabled={disabled}
                aria-label={label || "Upload Image"}
            />
        </div>
    );
}