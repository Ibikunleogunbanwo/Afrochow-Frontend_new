"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, ChefHat, Check, ArrowRight } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

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
        <ul className="space-y-3 mb-8">
            {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center space-x-3 group/item">
                    <div className="shrink-0 w-5 h-5 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                </li>
            ))}
        </ul>
    )
}

function SignInPrompt({ onSignInClick }) {
    if (!onSignInClick) return null
    return (
        <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <button
                type="button"
                onClick={onSignInClick}
                className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
            >
                Sign In
            </button>
        </p>
    )
}

export function SignUpModal({ isOpen, onClose, onSignInClick }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("Customer")

    const handleCustomerClick = () => {
        onClose()
        router.push("/register/customer")
    }

    const handleVendorClick = () => {
        onClose()
        router.push("/register/vendor/step-1")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader className="items-center">
                    <DialogTitle className="text-2xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Join Afrochow
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Choose how you'd like to get started
                    </DialogDescription>
                </DialogHeader>

                {/* Sign In Prompt — top */}
                {onSignInClick && (
                    <p className="text-center text-sm text-gray-500 -mt-2">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSignInClick}
                            className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                        >
                            Sign In
                        </button>
                    </p>
                )}

                {/* Custom Tab Switcher */}
                <div style={{
                    display: 'flex',
                    width: '100%',
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    height: '44px',
                    padding: '4px',
                    gap: '4px',
                    boxSizing: 'border-box',
                }}>
                    {["Customer", "Vendor"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                height: '100%',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: activeTab === tab ? '700' : '500',
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? 'black' : '#9ca3af',
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab) {
                                    e.currentTarget.style.backgroundColor = '#ea580c'
                                    e.currentTarget.style.color = 'white'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = '#9ca3af'
                                }
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Customer Tab */}
                {activeTab === "Customer" && (
                    <div className="mt-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">I'm a Customer</h3>
                                <p className="text-xs text-gray-500">Order African cuisine near you</p>
                            </div>
                        </div>

                        <BenefitsList benefits={customerBenefits} />

                        <button
                            onClick={handleCustomerClick}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Sign Up as Customer</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Vendor Tab */}
                {activeTab === "Vendor" && (
                    <div className="mt-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                <ChefHat className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">I'm a Vendor</h3>
                                <p className="text-xs text-gray-500">Grow your restaurant business online</p>
                            </div>
                        </div>

                        <BenefitsList benefits={vendorBenefits} />

                        <button
                            onClick={handleVendorClick}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Sign Up as Vendor</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}