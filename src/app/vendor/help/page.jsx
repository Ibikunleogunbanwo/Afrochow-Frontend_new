import VendorHelpClient from "./VendorHelpClient";
import { getPublicFaqs } from "@/lib/api/content.api";

export default async function VendorHelpPage() {
    const faqDoc = await getPublicFaqs("vendor");
    return <VendorHelpClient faqDoc={faqDoc} />;
}
