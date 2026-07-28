import { useState } from "react";
import { SignInModal } from "@/components/signin/SignInModal";

function LoginPrompt() {
    const [showSignIn, setShowSignIn] = useState(false);

    return (
        <>
            <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={() => setShowSignIn(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                    Sign in
                </button>
            </p>

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                context="vendor"
            />
        </>
    );
}

export default LoginPrompt;
