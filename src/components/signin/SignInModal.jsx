"use client"

import { useEffect, useState } from "react"
import { toast } from '@/components/ui/toast'
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
import { useGoogleLogin } from "@react-oauth/google"

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    rememberMe: z.boolean().default(false),
})

export function SignInModal({ isOpen, onClose, onSignUpClick, onForgotPasswordClick }) {
    const { login, loginWithGoogle, isLoading } = useAuth()
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

    const [googleLoading, setGoogleLoading] = useState(false)

    const handleGoogleSuccess = async (tokenResponse) => {
        setGoogleLoading(true)
        try {
            const destination = await loginWithGoogle(tokenResponse.id_token ?? tokenResponse.access_token)
            toast.success("Welcome to Afrochow!", { id: 'google-login-success' })
            const isRoleRoute = destination?.startsWith('/vendor') || destination?.startsWith('/admin')
            if (!isRoleRoute) onClose()
        } catch (err) {
            toast.error("Google Sign-In Failed", {
                description: err?.message || "Something went wrong. Please try again.",
            })
        } finally {
            setGoogleLoading(false)
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => toast.error("Google Sign-In Failed", {
            description: "Unable to sign in with Google. Please try again.",
        }),
        flow: 'implicit',
        scope: 'openid email profile',
    })

    const onSubmit = async (values) => {
        if (values.rememberMe) {
            localStorage.setItem("rememberedEmail", values.email)
        } else {
            localStorage.removeItem("rememberedEmail")
        }

        try {
            // login() handles role-based routing internally (VENDOR, ADMIN, customer)
            // and returns the destination path.
            const destination = await login(values.email, values.password)
            toast.success("Welcome back!", { id: 'login-success' })
            // Always close for customers (any destination).
            // For vendors/admins don't close — the router navigates to their
            // dashboard and onClose() would push "/" on top and override it.
            const isRoleRoute = destination?.startsWith('/vendor') || destination?.startsWith('/admin');
            if (!isRoleRoute) {
                onClose()
            }
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
            } else if (errorMessage.includes("locked")) {
                toast.error("Account Temporarily Locked", {
                    description: err?.message || "Too many failed attempts. Try again later or reset your password.",
                })
            } else if (errorMessage.includes("too many")) {
                toast.error("Too Many Attempts", {
                    description: err?.message || "Please wait a moment before trying again.",
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

                    <button
                        type="button"
                        onClick={() => googleLogin()}
                        disabled={isLoading || googleLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {googleLoading ? (
                            <svg className="w-4 h-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
                        )}
                        {googleLoading ? "Signing in…" : "Sign in with Google"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}