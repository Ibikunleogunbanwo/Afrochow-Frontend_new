import Link from "next/link"
import { ScrollText, Mail } from "lucide-react"

export const metadata = {
    title: "Terms of Service | Afrochow",
    description: "Read the Terms of Service governing your use of the Afrochow platform.",
}

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">{children}</div>
    </section>
)

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ScrollText className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-orange-100 text-sm">Last updated: March 2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        These Terms of Service ("Terms") govern your access to and use of the Afrochow platform,
                        including the website at <span className="text-orange-600 font-medium">www.afrochow.ca</span> and
                        any associated mobile applications (collectively, the "Platform"). By creating an account or
                        placing an order, you agree to be bound by these Terms. If you do not agree, please do not use
                        our Platform.
                    </p>

                    <Section title="1. About Afrochow">
                        <p>Afrochow is an online food ordering marketplace that connects customers with independent African cuisine restaurants and vendors across Canada. We facilitate the ordering process but are not the restaurant or food preparer. Individual restaurant partners are solely responsible for the food they prepare and deliver.</p>
                    </Section>

                    <Section title="2. Eligibility">
                        <p>You must be at least 18 years of age to create an account and use the Platform. By using Afrochow, you represent and warrant that you meet this requirement.</p>
                        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at{" "}
                            <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline">support@afrochow.ca</a> if you suspect unauthorized access to your account.
                        </p>
                    </Section>

                    <Section title="3. Orders and Payments">
                        <p><strong className="text-slate-800">Placing Orders:</strong> When you place an order through Afrochow, you are making a purchase offer to the restaurant partner. Orders are confirmed once you receive an order confirmation notification.</p>
                        <p><strong className="text-slate-800">Pricing:</strong> All prices displayed on the Platform are in Canadian dollars (CAD) and include applicable taxes unless stated otherwise. Prices are set by restaurant partners and may change without notice.</p>
                        <p><strong className="text-slate-800">Payment:</strong> Payment is collected at the time of order placement. We accept major credit and debit cards through our secure payment processor. By submitting payment information, you authorize us to charge the applicable amount.</p>
                        <p><strong className="text-slate-800">Cancellations & Refunds:</strong> Once an order is accepted by a restaurant, cancellation may not be possible. Refund eligibility is determined on a case-by-case basis. Please contact our support team within 24 hours for order issues.</p>
                    </Section>

                    <Section title="4. Vendor / Restaurant Partners">
                        <p>Restaurant partners listed on Afrochow are independent businesses. Afrochow does not prepare, package, or deliver food. We are not responsible for the quality, safety, or accuracy of food prepared by restaurant partners.</p>
                        <p>Restaurant partners must comply with all applicable food safety regulations and health codes in their jurisdiction. Concerns about food safety should be reported to us and to your local public health authority.</p>
                        <p>If you are a vendor interested in joining Afrochow, your use of the Platform is also governed by the Vendor Agreement accepted during registration.</p>
                    </Section>

                    <Section title="5. Prohibited Conduct">
                        <p>When using Afrochow, you agree not to:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Provide false or misleading information during registration or checkout</li>
                            <li>Use the Platform for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to any part of the Platform</li>
                            <li>Post fraudulent reviews or manipulate ratings</li>
                            <li>Interfere with or disrupt the operation of the Platform</li>
                            <li>Use automated tools to scrape, crawl, or extract data from the Platform</li>
                            <li>Impersonate any person or entity</li>
                        </ul>
                        <p>Violation of these prohibitions may result in immediate suspension or termination of your account.</p>
                    </Section>

                    <Section title="6. Intellectual Property">
                        <p>All content on the Afrochow Platform, including text, graphics, logos, images, and software, is the property of Afrochow or its content suppliers and is protected by applicable Canadian and international intellectual property laws.</p>
                        <p>You may not copy, reproduce, distribute, or create derivative works from any content on the Platform without our express written permission.</p>
                    </Section>

                    <Section title="7. User-Generated Content">
                        <p>By submitting reviews, photos, or other content to the Platform, you grant Afrochow a non-exclusive, royalty-free, worldwide license to use, display, and distribute that content in connection with operating our Platform.</p>
                        <p>You are solely responsible for any content you submit. You warrant that your content does not infringe any third-party rights and does not contain false, defamatory, or harmful material.</p>
                    </Section>

                    <Section title="8. Disclaimers and Limitation of Liability">
                        <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, AFROCHOW DISCLAIMS ALL WARRANTIES, INCLUDING FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.</p>
                        <p>AFROCHOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO FOOD QUALITY ISSUES, DELIVERY DELAYS, OR DATA LOSS.</p>
                        <p>Our total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the amount you paid for the order giving rise to the claim.</p>
                    </Section>

                    <Section title="9. Governing Law">
                        <p>These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</p>
                        <p>Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Ontario, Canada.</p>
                    </Section>

                    <Section title="10. Changes to These Terms">
                        <p>We reserve the right to modify these Terms at any time. We will notify you of significant changes by updating the "Last updated" date and, where appropriate, by sending an email notification. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms.</p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>If you have questions about these Terms, please contact us:</p>
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
                        <Link href="/cookies" className="text-sm text-orange-600 hover:underline font-medium">Cookie Policy →</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
