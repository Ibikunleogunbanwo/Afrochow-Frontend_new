import { User, Phone } from "lucide-react";
import ImageUploader from "@/components/image-uploader/ImageUploader";
import ErrorMessage from "@/components/register/customer/utils/errorMessage";
import InputField from "@/components/register/customer/utils/InputField";

export default function PersonalInformationSection({
                                                       formData,
                                                       errors,
                                                       handleInputChange,
                                                       setFormData,
                                                   }) {
    const handleImageChange = (file) => {
        setFormData({
            ...formData,
            profileImageUrl: file
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-100">
                👤 Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <InputField error={errors.firstName}>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.firstName
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>
                </InputField>

                {/* Last Name */}
                <InputField error={errors.lastName}>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.lastName
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>
                </InputField>

                {/* Phone */}
                <InputField error={errors.phone}>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors.phone
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>
                </InputField>

                {/* Profile Image - Stores File object */}
                <div className="space-y-2">
                    <ImageUploader
                        onChange={handleImageChange}
                        label="Profile Image (Optional)"
                        size="xl"
                        required={false}
                        helpText="Upload your profile picture"
                    />
                    {errors.profileImageUrl && <ErrorMessage message={errors.profileImageUrl} />}
                </div>
            </div>

            {/* Delivery Instructions */}
            <div className="mt-6 space-y-2">
                <label
                    htmlFor="defaultDeliveryInstructions"
                    className="block text-sm font-medium text-gray-700"
                >
                    Default Delivery Instructions{" "}
                    <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                    id="defaultDeliveryInstructions"
                    name="defaultDeliveryInstructions"
                    value={formData.defaultDeliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g., Ring doorbell twice, leave at front door"
                    rows={3}
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                />
            </div>
        </div>
    );
}