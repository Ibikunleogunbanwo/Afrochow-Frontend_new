import { Cookie } from "lucide-react"
import PolicyPage from "@/components/content/PolicyPage"
import { getPolicy } from "@/lib/api/content.api"

export const metadata = {
    title: "Cookie Policy | Afrochow",
    description: "Learn how Afrochow uses cookies and similar tracking technologies.",
}

export default async function CookiePolicyPage() {
    const doc = await getPolicy("cookies")
    return (
        <PolicyPage
            doc={doc}
            icon={Cookie}
            fallbackTitle="Cookie Policy"
            relatedLinks={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
            ]}
        />
    )
}
