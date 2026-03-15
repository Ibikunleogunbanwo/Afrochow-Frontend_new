"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
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
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    rememberMe: z.boolean().default(false),
})

export function SignInModal({ isOpen, onClose }) {
    const { login, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        if (savedEmail) {
            form.setValue("email", savedEmail)
            form.setValue("rememberMe", true)
        }
    }, [form])

    const onSubmit = async (values) => {
        try {
            if (values.rememberMe) {
                localStorage.setItem("rememberedEmail", values.email)
            } else {
                localStorage.removeItem("rememberedEmail")
            }

            await login(values.email, values.password)
            toast.success("Welcome Back!", { description: "Login successful" })
            onClose()
        } catch (err) {
            console.error("Login failed:", err)

            const errorMessage = err.message?.toLowerCase() || ""

            if (errorMessage.includes("verify") || errorMessage.includes("not verified")) {
                toast.error("Email Not Verified", {
                    description: "Please verify your email to continue",
                })
                router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
            } else if (errorMessage.includes("credentials") || errorMessage.includes("invalid")) {
                toast.error("Invalid Credentials", {
                    description: "Check your email and password",
                })
            } else {
                toast.error("Login Failed", {
                    description: err.message || "Please try again",
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
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="block w-full text-black "
                                                placeholder="you@example.com"
                                                type="email"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
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
                            <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
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