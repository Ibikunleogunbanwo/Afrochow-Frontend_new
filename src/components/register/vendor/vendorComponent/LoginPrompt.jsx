import {useForm} from "@/app/(auth)/register/vendor/context/Provider";
import {useRouter} from "next/navigation";
import {useReviewMode} from "@/components/register/vendor/hooks/Usereviewmode";
import {useState} from "react";

function LoginPrompt() {
    return (
        <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
                href="/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
            >
                Sign in
            </a>
        </p>
    );
}

export default LoginPrompt