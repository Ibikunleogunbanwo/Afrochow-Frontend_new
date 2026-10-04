import HelpPageClient from "./HelpPageClient";
import { getPublicFaqs } from "@/lib/api/content.api";

export const metadata = {
    title: "Help & Support | Afrochow",
    description: "Answers about ordering, delivery, payments, and managing your Afrochow account.",
};

export default async function HelpPage() {
    const faqDoc = await getPublicFaqs("customer");
    return <HelpPageClient faqDoc={faqDoc} />;
}
