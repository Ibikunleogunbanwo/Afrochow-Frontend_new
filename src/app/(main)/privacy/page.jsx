import { Shield } from "lucide-react"
import PolicyPage from "@/components/content/PolicyPage"
import { getPolicy } from "@/lib/api/content.api"

export const metadata = {
    title: "Privacy Policy | Afrochow",
    description: "Learn how Afrochow collects, uses, and protects your personal information.",
}

export default async function PrivacyPolicyPage() {
    const doc = await getPolicy("privacy")
    return (
        <PolicyPage
            doc={doc}
            icon={Shield}
            fallbackTitle="Privacy Policy"
            relatedLinks={[
                { href: "/terms", label: "Terms of Service" },
                { href: "/cookies", label: "Cookie Policy" },
            ]}
        />
    )
}
