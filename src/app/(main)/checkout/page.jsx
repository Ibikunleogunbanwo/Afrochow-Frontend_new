import { StripeProvider } from "@/contexts/Stripeprovider";
import CheckoutPage from "@/components/checkout/CheckoutPage";
import CustomerWaitlistNotice from "@/components/mvp/CustomerWaitlistNotice";
import { isOrderingEnabled } from "@/lib/mvp";

export default function Page() {
    if (!isOrderingEnabled) {
        return (
            <CustomerWaitlistNotice
                title="Checkout is not open yet"
                message="We are onboarding vendors first, so customer checkout is paused until the customer launch."
            />
        );
    }

    return (
        <StripeProvider>
            <CheckoutPage />
        </StripeProvider>
    );
}
