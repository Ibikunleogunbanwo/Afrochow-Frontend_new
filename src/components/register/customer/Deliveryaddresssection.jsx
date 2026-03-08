import { MapPin, Building2, Globe } from "lucide-react";
import { CANADIAN_PROVINCES } from "@/lib/constants/provinces";
import InputField from "@/components/register/customer/utils/InputField";


export default function DeliveryAddressSection({
                                                   formData,
                                                   errors,
                                                   handleInputChange,
                                               }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-100">
                📍 Delivery Address
            </h2>
            <div className="space-y-6">
                <InputField error={errors["address.addressLine"]}>
                    <label htmlFor="address.addressLine" className="block text-sm font-medium text-gray-700">
                        Street Address
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="address.addressLine"
                            type="text"
                            name="address.addressLine"
                            value={formData.address.addressLine}
                            onChange={handleInputChange}
                            placeholder="123 Main Street, Apt 4B"
                            className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors["address.addressLine"]
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>
                </InputField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <InputField error={errors["address.city"]}>
                        <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="address.city"
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                                placeholder="Toronto"
                                className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                    errors["address.city"]
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                            />
                        </div>
                    </InputField>

                    {/* Province */}
                    <InputField error={errors["address.province"]}>
                        <label htmlFor="address.province" className="block text-sm font-medium text-gray-700">
                            Province
                        </label>
                        <select
                            id="address.province"
                            name="address.province"
                            value={formData.address.province}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors["address.province"]
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        >
                            <option value="">Select Province</option>
                            {CANADIAN_PROVINCES.map((province) => (
                                <option key={province.code} value={province.code}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </InputField>

                    {/* Postal Code */}
                    <InputField error={errors["address.postalCode"]}>
                        <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                            Postal Code
                        </label>
                        <input
                            id="address.postalCode"
                            type="text"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleInputChange}
                            placeholder="M5H 2N2"
                            className={`w-full px-4 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                errors["address.postalCode"]
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </InputField>

                    {/* Country */}
                    <InputField error={errors["address.country"]}>
                        <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                            Canada
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="address.country"
                                type="text"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleInputChange}
                                className={`w-full pl-10 py-2.5 h-11 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                                    errors["address.country"]
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                            />
                        </div>
                    </InputField>
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="address.defaultAddress"
                        name="address.defaultAddress"
                        checked={formData.address.defaultAddress}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-4 focus:ring-orange-100 cursor-pointer"
                    />
                    <label
                        htmlFor="address.defaultAddress"
                        className="text-sm text-gray-700 font-medium cursor-pointer"
                    >
                        Set as my default delivery address
                    </label>
                </div>
            </div>
        </div>
    );
}