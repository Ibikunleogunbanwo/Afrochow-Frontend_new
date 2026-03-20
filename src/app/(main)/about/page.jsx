import Link from "next/link"
import { UtensilsCrossed, Heart, Globe2, Truck, Store, Users } from "lucide-react"

export const metadata = {
    title: "About Us | Afrochow",
    description: "Learn about Afrochow — bringing authentic African flavours to your doorstep across Canada.",
}

const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
)

const Stat = ({ value, label }) => (
    <div className="text-center">
        <p className="text-3xl font-black text-orange-500 mb-1">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
    </div>
)

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5">
                        <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4">About Afrochow</h1>
                    <p className="text-orange-100 text-lg leading-relaxed max-w-2xl mx-auto">
                        We're on a mission to celebrate African cuisine by connecting food lovers with the best
                        African restaurants across Canada — one delicious meal at a time.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">

                {/* Story */}
                <section className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Story</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-2 mb-4">Born from a love of African food</h2>
                        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                            <p>
                                Afrochow was founded by a team of first-generation Africans in Canada who were tired of
                                searching for a convenient way to find and order authentic African food. We wanted jollof
                                rice at 9pm on a Wednesday. We wanted egusi soup that tasted like home. We wanted suya
                                on a Friday night.
                            </p>
                            <p>
                                So we built it. Afrochow is the marketplace dedicated exclusively to African cuisine —
                                connecting customers who crave the real thing with the talented chefs and restaurants
                                serving it across Canada.
                            </p>
                            <p>
                                Every order placed on Afrochow supports an independent African restaurant and helps
                                keep our culinary traditions alive in the diaspora.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white flex flex-col justify-center">
                            <p className="text-4xl font-black mb-1">🌍</p>
                            <p className="font-bold text-lg">Pan-African</p>
                            <p className="text-orange-100 text-xs mt-1">Cuisines from across the continent</p>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center">
                            <p className="text-4xl font-black mb-1">🇨🇦</p>
                            <p className="font-bold text-lg">Canadian</p>
                            <p className="text-slate-400 text-xs mt-1">Proudly based and operated in Canada</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col justify-center col-span-2">
                            <p className="text-2xl font-black text-orange-600 mb-1">100% Authentic</p>
                            <p className="text-slate-500 text-xs">Every restaurant is vetted for genuine African cuisine</p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-200">
                        <Stat value="50+" label="Restaurant partners" />
                        <Stat value="20+" label="African cuisines" />
                        <Stat value="5,000+" label="Happy customers" />
                        <Stat value="10+" label="Cities across Canada" />
                    </div>
                </section>

                {/* Values */}
                <section>
                    <div className="text-center mb-10">
                        <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">What We Stand For</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-2">Our values</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <ValueCard
                            icon={Globe2}
                            title="Cultural Pride"
                            description="We celebrate the rich diversity of African food traditions from West to East, North to South Africa."
                        />
                        <ValueCard
                            icon={Heart}
                            title="Community First"
                            description="We uplift African restaurant owners and chefs in the Canadian diaspora by giving them a dedicated platform to grow."
                        />
                        <ValueCard
                            icon={Truck}
                            title="Reliable Delivery"
                            description="We work with trusted delivery partners to ensure your food arrives hot, fresh, and on time."
                        />
                        <ValueCard
                            icon={Store}
                            title="Authentic Only"
                            description="Every restaurant on our platform serves genuine African cuisine — no imitations, no shortcuts."
                        />
                        <ValueCard
                            icon={Users}
                            title="Built for the Diaspora"
                            description="Afrochow is by Africans, for Africans — and for anyone who loves the bold, rich flavours of African cooking."
                        />
                        <ValueCard
                            icon={UtensilsCrossed}
                            title="Quality Experience"
                            description="From browsing to checkout, we obsess over making your experience as good as the food."
                        />
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-10 text-white text-center">
                    <h2 className="text-2xl font-black mb-3">Ready to eat?</h2>
                    <p className="text-orange-100 mb-6 text-sm">Browse African restaurants near you and order in minutes.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/restaurants"
                            className="bg-white text-orange-600 font-bold px-7 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm"
                        >
                            Browse Restaurants
                        </Link>
                        <Link
                            href="/register/vendor/step-1"
                            className="border border-white/50 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                        >
                            List Your Restaurant
                        </Link>
                    </div>
                </section>

                {/* Contact nudge */}
                <section className="text-center">
                    <p className="text-slate-500 text-sm">
                        Questions? Reach us at{" "}
                        <a href="mailto:support@afrochow.ca" className="text-orange-600 hover:underline font-medium">
                            support@afrochow.ca
                        </a>
                    </p>
                </section>

            </div>
        </div>
    )
}
