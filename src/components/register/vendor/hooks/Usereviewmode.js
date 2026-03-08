import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export function useReviewMode() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fromReview, setFromReview] = useState(false);

    useEffect(() => {
        setFromReview(searchParams.get('from') === 'review');
    }, [searchParams]);

    const isFromReview = () => {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        return params.get('from') === 'review';
    };

    const navigateToReview = () => {
        router.push("/register/vendor/review");
    };

    const navigateToNextStep = (nextStepPath) => {
        router.push(nextStepPath);
    };

    return {
        fromReview,
        isFromReview,
        navigateToReview,
        navigateToNextStep,
    };
}