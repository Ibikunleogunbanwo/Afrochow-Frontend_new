import ImageUploader from "@/components/image-uploader/ImageUploader";

export default function ProfileImageSection({ data, errors, onChange }) {
    const handleImageChange = (file) => {
        onChange({
            target: {
                name: "profileImageFile",
                value: file,
                type: "file",
            },
        });
    };

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white mr-3">
          3
        </span>
                Profile Image <span className="text-red-500 ml-1">*</span>
            </h2>

            <div className="flex flex-col items-center space-y-4">
                {/* Circular Image Uploader */}
                <ImageUploader
                    label="Profile Picture"
                    size="xl"
                    required
                    onChange={handleImageChange}
                />

                {/* File metadata (only when selected) */}
                {data.profileImageFile && (
                    <p className="text-sm text-gray-600">
            <span className="font-semibold">
              {data.profileImageFile.name}
            </span>
                        {" • "}
                        <span className="text-gray-500">
              {(data.profileImageFile.size / 1024).toFixed(1)} KB
            </span>
                    </p>
                )}

                {/* Error */}
                {errors.profileImageFile && (
                    <p className="text-sm text-red-600">
                        {errors.profileImageFile}
                    </p>
                )}

                {/* Help text */}
                <p className="text-xs text-gray-500 text-center max-w-xs">
                    Recommended: square image, at least 400×400px.
                    Max 5MB. Formats: JPG, PNG, WEBP.
                </p>
            </div>
        </section>
    );
}
