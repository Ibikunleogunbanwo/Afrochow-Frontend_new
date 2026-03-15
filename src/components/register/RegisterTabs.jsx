"use client"

import { useState } from 'react'
import { User, ChefHat, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { SignInModal } from '@/components/signin/SignInModal'

const customerBenefits = [
    "Browse hundreds of restaurants",
    "Fast & reliable delivery",
    "Exclusive deals & offers",
]

const vendorBenefits = [
    "Reach 5000+ customers daily",
    "Easy menu & order management",
    "Low commission rates",
]

function BenefitsList({ benefits }) {
    return (
        <ul className="space-y-4 mb-10">
            {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center space-x-3 group/item">
                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                </li>
            ))}
        </ul>
    )
}

function SignInPrompt({ onSignIn }) {
    return (
        <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <button
                onClick={onSignIn}
                className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
            >
                Sign In
            </button>
        </p>
    )
}

export function RegisterTabs() {
    const [showSignIn, setShowSignIn] = useState(false)

    return (
        <>
            <Tabs defaultValue="Customer" className="w-full max-w-[500px] mx-auto">
                <TabsList className="w-full bg-black border border-orange-100 h-12">
                    <TabsTrigger
                        value="Customer"
                        className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white px-4 py-2"
                    >
                        Customer
                    </TabsTrigger>
                    <TabsTrigger
                        value="Vendor"
                        className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white px-4 py-2"
                    >
                        Vendor
                    </TabsTrigger>
                </TabsList>

                {/* Customer Tab */}
                <TabsContent value="Customer">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-300 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden animate-fade-up">
                        <div className="absolute inset-0 bg-linear-to-br from-orange-50/0 via-orange-50/0 to-orange-100/0 group-hover:to-orange-100/30 transition-all duration-500 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-15 h-15 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                <User className="w-7 h-7 text-black group-hover:text-orange-700 transition-colors" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                I&#39;m a Customer
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Order delicious African cuisine from the best restaurants near you
                            </p>

                            <BenefitsList benefits={customerBenefits} />

                            <Link
                                href="/register/customer"
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 group/btn"
                            >
                                <span>Sign Up as Customer</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>

                            {/* Sign In Prompt */}
                            <SignInPrompt onSignIn={() => setShowSignIn(true)} />
                        </div>
                    </div>
                </TabsContent>

                {/* Vendor Tab */}
                <TabsContent value="Vendor">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-300 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden animate-fade-up">
                        <div className="absolute inset-0 bg-linear-to-br from-red-50/0 via-orange-50/0 to-red-100/0 group-hover:to-red-100/30 transition-all duration-500 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="absolute -top-2 -right-2 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                Grow Business
                            </div>

                            <div className="w-15 h-15 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                <ChefHat className="w-7 h-7 text-black group-hover:text-orange-700 transition-colors" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                I&#39;m a Vendor
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Grow your restaurant business and reach more customers online
                            </p>

                            <BenefitsList benefits={vendorBenefits} />

                            <Link
                                href="/register/vendor/step-1"
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 group/btn"
                            >
                                <span>Sign Up as Vendor</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>

                            {/* Sign In Prompt */}
                            <SignInPrompt onSignIn={() => setShowSignIn(true)} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
            />
        </>
    )
}