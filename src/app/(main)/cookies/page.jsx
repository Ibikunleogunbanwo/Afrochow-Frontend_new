import Link from "next/link"
import { Cookie, Mail } from "lucide-react"

export const metadata = {
    title: "Cookie Policy | Afrochow",
    description: "Learn how Afrochow uses cookies and similar tracking technologies.",
}

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">{children}</div>
    </section>
)

const CookieRow = ({ name, purpose, duration, type }) => (
    <tr className="border-b border-slate-100 last:border-0">
        <td className="py-2.5 pr-4 font-medium text-slate-800 text-xs align-top">{name}</td>
        <td className="py-2.5 pr-4 text-slate-600 text-xs align-top">{purpose}</td>
        <td className="py-2.5 pr-4 text-slate-600 text-xs align-top whitespace-nowrap">{duration}</td>
        <td className="py-2.5 text-xs align-top">
            <span className={`px-2 py-0.5 rounded-full font-medium ${
                type === "Essential" ? "bg-blue-50 text-blue-700" :
                type === "Functional" ? "bg-green-50 text-green-700" :
                "bg-orange-50 text-orange-700"
            }`}>{type}</span>
        </td>
    </tr>
)

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Cookie className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
                    <p className="text-orange-100 text-sm">Last updated: March 2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        This Cookie Policy explains how Afrochow ("we", "us", or "our") uses cookies and similar
                        tracking technologies on our platform at{" "}
                        <span className="text-orange-600 font-medium">www.afrochow.ca</span>. By continuing to use
                        our platform, you consent to our use of cookies as described in this policy.
                    </p>

                    <Section title="1. What Are Cookies?">
                        <p>Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember your preferences and improve your experience over time.</p>
                        <p>Similar technologies include web beacons, pixels, and local storage, which serve comparable purposes. We refer to all of these collectively as "cookies" in this policy.</p>
                    </Section>

                    <Section title="2. Types of Cookies We Use">
                        <div className="overflow-x-auto -mx-1">
                            <table className="w-full text-left mt-2">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-2.5 pr-4 text-xs font-semibold text-slate-700">Cookie</th>
                                        <th className="py-2.5 pr-4 text-xs font-semibold text-slate-700">Purpose</th>
                                        <th className="py-2.5 pr-4 text-xs font-semibold text-slate-700">Duration</th>
                                        <th className="py-2.5 text-xs font-semibold text-slate-700">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <CookieRow name="session_token" purpose="Keeps you signed in during your session" duration="Session" type="Essential" />
                                    <CookieRow name="auth_refresh" purpose="Remembers your login between visits" duration="7 days" type="Essential" />
                                    <CookieRow name="cart_id" purpose="Preserves your cart contents" duration="24 hours" type="Essential" />
                                    <CookieRow name="user_city" purpose="Remembers your selected city for restaurant listings" duration="30 days" type="Functional" />
                                    <CookieRow name="user_prefs" purpose="Stores your UI preferences (e.g., saved filters)" duration="90 days" type="Functional" />
                                    <CookieRow name="_analytics" purpose="Helps us understand how users navigate our platform" duration="12 months" type="Analytics" />
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section title="3. Essential Cookies">
                        <p>Essential cookies are strictly necessary for the Platform to function. They enable core features such as authentication, shopping cart, and security. These cookies cannot be disabled as the Platform would not work without them.</p>
                    </Section>

                    <Section title="4. Functional Cookies">
                        <p>Functional cookies allow us to remember your preferences and provide a more personalized experience. For example, remembering your location so we can show nearby restaurants. You can disable these cookies through your browser settings, but some Platform features may not work as expected.</p>
                    </Section>

                    <Section title="5. Analytics Cookies">
                        <p>Analytics cookies help us understand how visitors interact with our Platform — for example, which pages are visited most, how long users spend on each page, and where users come from. This data is aggregated and anonymous, and helps us improve our service.</p>
                        <p>We may use analytics services such as Google Analytics. These services have their own privacy policies governing their use of the collected data.</p>
                    </Section>

                    <Section title="6. Managing Your Cookie Preferences">
                        <p>You can control and manage cookies in several ways:</p>
                        <p><strong className="text-slate-800">Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings. The process varies by browser — refer to your browser's help documentation for instructions.</p>
                        <p><strong className="text-slate-800">Opt-out Tools:</strong> You can opt out of Google Analytics tracking by installing the{" "}
                            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                        </p>
                        <p>Please note that disabling certain cookies may affect the functionality of the Platform, including your ability to stay signed in or keep items in your cart.</p>
                    </Section>

                    <Section title="7. Third-Party Cookies">
                        <p>Some cookies on our Platform are placed by third-party services we use, such as payment processors and analytics providers. We do not control these third-party cookies. Please refer to the respective third-party privacy policies for more information.</p>
                    </Section>

                    <Section title="8. Changes to This Policy">
                        <p>We may update this Cookie Policy from time to time. Changes will be reflected in the "Last updated" date at the top of this page. Continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.</p>
                    </Section>

                    <Section title="9. Contact Us">
                        <p>If you have any questions about our use of cookies, please contact us:</p>
                        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                            <Mail className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Afrochow Support</p>
                                <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline text-sm">support@afrochow.ca</a>
                            </div>
                        </div>
                    </Section>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                        <Link href="/privacy" className="text-sm text-orange-600 hover:underline font-medium">Privacy Policy →</Link>
                        <Link href="/terms" className="text-sm text-orange-600 hover:underline font-medium">Terms of Service →</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
