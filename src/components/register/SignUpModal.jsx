"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, ChefHat, Check, ArrowRight } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

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

export function SignUpModal({ isOpen, onClose, onSignInClick }) {
    const router = useRouter()

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
                        Choose how you&#39;d like to get started
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="Customer" className="w-full mt-2">
                    <TabsList className="w-full bg-black border border-orange-100 h-11 md:h-13">
                        <TabsTrigger
                            value="Customer"
                            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                        >
                            Customer
                        </TabsTrigger>
                        <TabsTrigger
                            value="Vendor"
                            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                        >
                            Vendor
                        </TabsTrigger>
                    </TabsList>

                    {/* Customer Tab */}
                    <TabsContent value="Customer" className="mt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">I&#39;m a Customer</h3>
                                <p className="text-xs text-gray-500">Order African cuisine near you</p>
                            </div>
                        </div>

                        <BenefitsList benefits={customerBenefits} />

                        <button
                            onClick={handleCustomerClick}
                            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Sign Up as Customer</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {onSignInClick && (
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
                        )}
                    </TabsContent>

                    {/* Vendor Tab */}
                    <TabsContent value="Vendor" className="mt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <ChefHat className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">I&#39;m a Vendor</h3>
                                <p className="text-xs text-gray-500">Grow your restaurant business online</p>
                            </div>
                        </div>

                        <BenefitsList benefits={vendorBenefits} />

                        <button
                            onClick={handleVendorClick}
                            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Sign Up as Vendor</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {onSignInClick && (
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
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}