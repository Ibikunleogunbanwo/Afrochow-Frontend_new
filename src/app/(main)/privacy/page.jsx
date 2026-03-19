import Link from "next/link"
import { Shield, Mail } from "lucide-react"

export const metadata = {
    title: "Privacy Policy | Afrochow",
    description: "Learn how Afrochow collects, uses, and protects your personal information.",
}

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">{children}</div>
    </section>
)

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-orange-100 text-sm">Last updated: March 2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        Welcome to Afrochow. We are committed to protecting your personal information and your right to
                        privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you use our platform, available at{" "}
                        <span className="text-orange-600 font-medium">www.afrochow.ca</span> and our mobile
                        application. Please read this policy carefully.
                    </p>

                    <Section title="1. Information We Collect">
                        <p><strong className="text-slate-800">Account Information:</strong> When you register, we collect your name, email address, phone number, and password.</p>
                        <p><strong className="text-slate-800">Order Information:</strong> We collect your delivery address, order history, payment method type (we do not store full card details), and special delivery instructions.</p>
                        <p><strong className="text-slate-800">Profile Information:</strong> Any profile photo, preferences, or other details you voluntarily provide.</p>
                        <p><strong className="text-slate-800">Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited, features used, device type, browser, and IP address.</p>
                        <p><strong className="text-slate-800">Location Data:</strong> With your permission, we collect your location to show nearby restaurants and calculate delivery estimates.</p>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Process and deliver your food orders</li>
                            <li>Create and manage your account</li>
                            <li>Send order confirmations, updates, and receipts</li>
                            <li>Provide customer support</li>
                            <li>Improve our platform and develop new features</li>
                            <li>Send promotional communications (you may opt out at any time)</li>
                            <li>Comply with legal obligations</li>
                            <li>Detect and prevent fraud or abuse</li>
                        </ul>
                    </Section>

                    <Section title="3. Sharing Your Information">
                        <p>We do not sell your personal information. We may share your information with:</p>
                        <p><strong className="text-slate-800">Restaurant Partners:</strong> Your name, delivery address, phone number, and order details are shared with the restaurant fulfilling your order.</p>
                        <p><strong className="text-slate-800">Payment Processors:</strong> We use trusted third-party payment processors. Your payment data is handled by them under their own privacy policies.</p>
                        <p><strong className="text-slate-800">Service Providers:</strong> We may share data with vendors who assist us in operating the platform (e.g., cloud hosting, email delivery, analytics), bound by confidentiality agreements.</p>
                        <p><strong className="text-slate-800">Legal Requirements:</strong> We may disclose your information if required by law or to protect the rights and safety of Afrochow, our users, or others.</p>
                    </Section>

                    <Section title="4. Data Retention">
                        <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us at{" "}
                            <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline">support@afrochow.ca</a>.
                        </p>
                        <p>Certain information may be retained for longer periods where required by law or for legitimate business purposes such as fraud prevention and dispute resolution.</p>
                    </Section>

                    <Section title="5. Cookies and Tracking">
                        <p>We use cookies and similar tracking technologies to enhance your experience on our platform. These include essential cookies required for the platform to function, as well as analytics cookies that help us understand how users interact with our service.</p>
                        <p>You can manage your cookie preferences through your browser settings. For more details, please review our{" "}
                            <Link href="/cookies" className="text-orange-600 hover:underline">Cookie Policy</Link>.
                        </p>
                    </Section>

                    <Section title="6. Security">
                        <p>We implement industry-standard security measures including encryption in transit (HTTPS), hashed passwords, and access controls to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                    </Section>

                    <Section title="7. Your Rights (Canadian Residents)">
                        <p>Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws, you have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Withdraw consent for non-essential uses</li>
                            <li>Request deletion of your account and data</li>
                            <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
                        </ul>
                        <p>To exercise any of these rights, contact us at{" "}
                            <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline">support@afrochow.ca</a>.
                        </p>
                    </Section>

                    <Section title="8. Children's Privacy">
                        <p>Afrochow is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, please contact us and we will delete it promptly.</p>
                    </Section>

                    <Section title="9. Changes to This Policy">
                        <p>We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. For significant changes, we may notify you by email or through a notice on our platform. We encourage you to review this policy periodically.</p>
                    </Section>

                    <Section title="10. Contact Us">
                        <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                            <Mail className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Afrochow Privacy Team</p>
                                <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline text-sm">support@afrochow.ca</a>
                            </div>
                        </div>
                    </Section>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                        <Link href="/terms" className="text-sm text-orange-600 hover:underline font-medium">Terms of Service →</Link>
                        <Link href="/cookies" className="text-sm text-orange-600 hover:underline font-medium">Cookie Policy →</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
