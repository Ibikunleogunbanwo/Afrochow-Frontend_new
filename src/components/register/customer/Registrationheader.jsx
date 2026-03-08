import Logo from "@/components/Logo";

export default function RegistrationHeader() {
    return (
        <div className="bg-white rounded-t-2xl shadow-xl border border-gray-200 p-10 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
                <div className="mb-4">
                    <Logo showTagline={true} lightMode={false} />
                </div>
            </h1>
            <p className="text-lg text-gray-600 font-medium">
                Create Your Account
            </p>
            <p className="text-sm text-gray-500 mt-2">
                Join our community and start exploring delicious African cuisine
            </p>
        </div>
    );
}