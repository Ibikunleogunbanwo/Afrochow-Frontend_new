import { StripeProvider } from "@/contexts/Stripeprovider";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export default function Page() {
    return (
        <StripeProvider>
            <CheckoutPage />
        </StripeProvider>
    );
}
