"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    rememberMe: z.boolean().default(false),
})

export function SignInModal({ isOpen, onClose, onSignUpClick, onForgotPasswordClick }) {
    const { login, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    // Pre-fill remembered email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        if (savedEmail) {
            form.setValue("email", savedEmail)
            form.setValue("rememberMe", true)
        }
    }, [form])

    // Reset password visibility when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowPassword(false)
        }
    }, [isOpen])

    const onSubmit = async (values) => {
        if (values.rememberMe) {
            localStorage.setItem("rememberedEmail", values.email)
        } else {
            localStorage.removeItem("rememberedEmail")
        }

        try {
            // login() handles role-based routing internally (VENDOR, ADMIN, customer)
            await login(values.email, values.password)
            toast.success("Welcome back!")
            onClose()
        } catch (err) {
            const errorMessage = err?.message?.toLowerCase() ?? ""

            if (errorMessage.includes("verify") || errorMessage.includes("not verified")) {
                toast.error("Email Not Verified", {
                    description: "Please check your inbox and verify your email to continue.",
                })
            } else if (errorMessage.includes("credentials") || errorMessage.includes("invalid")) {
                toast.error("Invalid Credentials", {
                    description: "Double-check your email and password and try again.",
                })
            } else {
                toast.error("Login Failed", {
                    description: err?.message || "Something went wrong. Please try again.",
                })
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center">Welcome back</DialogTitle>
                    <DialogDescription className="text-center text-black font-bold p-2">
                        Sign in to your Afrochow account
                    </DialogDescription>
                </DialogHeader>

                {onSignUpClick && (
                    <p className="text-center text-sm text-gray-500 -mt-2">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={onSignUpClick}
                            className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                        >
                            Sign Up
                        </button>
                    </p>
                )}

                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@example.com"
                                                type="email"
                                                autoComplete="email"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="font-bold">Password</FormLabel>
                                            {onForgotPasswordClick && (
                                                <button
                                                    type="button"
                                                    onClick={onForgotPasswordClick}
                                                    className="text-xs text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="current-password"
                                                    disabled={isLoading}
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword
                                                        ? <EyeOff className="w-4 h-4" />
                                                        : <Eye className="w-4 h-4" />
                                                    }
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Remember Me */}
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                            Remember me
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                variant="destructive"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in…" : "Sign in"}
                            </Button>
                        </form>
                    </Form>

                    <Separator />

                    <Button variant="google" className="w-full" disabled={isLoading}>
                        Sign in with Google
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}