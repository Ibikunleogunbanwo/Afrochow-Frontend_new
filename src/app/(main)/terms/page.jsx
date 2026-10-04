import { ScrollText } from "lucide-react"
import PolicyPage from "@/components/content/PolicyPage"
import { getPolicy } from "@/lib/api/content.api"

export const metadata = {
    title: "Terms of Service | Afrochow",
    description: "Read the Terms of Service governing your use of the Afrochow platform.",
}

export default async function TermsOfServicePage() {
    const doc = await getPolicy("terms")
    return (
        <PolicyPage
            doc={doc}
            icon={ScrollText}
            fallbackTitle="Terms of Service"
            relatedLinks={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/cookies", label: "Cookie Policy" },
            ]}
        />
    )
}
