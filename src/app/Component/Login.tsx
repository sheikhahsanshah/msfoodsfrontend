"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import {
    Loader2,
    Mail,
    Phone,
    Eye,
    EyeOff,
    Lock,
    ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useUser } from "@/app/Component/user-context"

const emailLoginSchema = z.object({
    identifier: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

const phoneLoginSchema = z.object({
    identifier: z.preprocess((raw) => {
        if (typeof raw !== "string") return raw
        const v = raw.trim()
        // if they typed 0XXXXXXXXXX, upgrade it
        if (/^0\d{10}$/.test(v)) {
            return `+92${v.slice(1)}`
        }
        return v
    },
        // now only accept +92XXXXXXXXXX
        z.string().regex(
            /^\+92\d{10}$/,
            "Phone must be in format 03XXXXXXXXX or +92XXXXXXXXX"
        )),
    password: z.string().min(1, "Password is required"),
})



const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function LoginPage() {
    const { toast } = useToast()
    const router = useRouter()
    const { login } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] =
        useState<"email" | "phone">("email")
    const [showPassword, setShowPassword] = useState(false)

    const emailForm = useForm<z.infer<typeof emailLoginSchema>>({
        resolver: zodResolver(emailLoginSchema),
        defaultValues: { identifier: "", password: "" },
    })
    const phoneForm = useForm<z.infer<typeof phoneLoginSchema>>({
        resolver: zodResolver(phoneLoginSchema),
        defaultValues: { identifier: "", password: "" },
        mode: "onBlur",        // ← validate when they leave the field
        // mode: "onChange",   // ← or validate as they type
    })

    // reset the unused form when the tab changes
    useEffect(() => {
        if (verificationMethod === "email") {
            phoneForm.reset()
        } else {
            emailForm.reset()
        }
    }, [verificationMethod, emailForm, phoneForm])

    async function onSubmitEmail(values: z.infer<typeof emailLoginSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const result = await res.json()
            if (!res.ok) {
                toast({
                    title: "Login Failed",
                    description: result.message || "Invalid credentials",
                    variant: "destructive",
                })
                return
            }
            login(
                result.data.user,
                {
                    accessToken: result.data.accessToken,
                    refreshToken: result.data.refreshToken,
                }
            )
            toast({
                title: "Welcome back! 🎉",
                description: "Redirecting...",
            })
            router.push(
                result.data.user.role === "admin"
                    ? "/admin/products"
                    : "/"
            )
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description:
                    err instanceof Error
                        ? err.message
                        : "Could not connect",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function onSubmitPhone(values: z.infer<typeof phoneLoginSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const result = await res.json()
            if (!res.ok) {
                toast({
                    title: "Login Failed",
                    description: result.message || "Invalid credentials",
                    variant: "destructive",
                })
                return
            }
            login(
                result.data.user,
                {
                    accessToken: result.data.accessToken,
                    refreshToken: result.data.refreshToken,
                }
            )
            toast({
                title: "Welcome back! 🎉",
                description: "Redirecting...",
            })
            router.push(
                result.data.user.role === "admin"
                    ? "/admin/products"
                    : "/"
            )
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description:
                    err instanceof Error
                        ? err.message
                        : "Could not connect",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                {/* animated background circles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-10 animate-pulse delay-500"></div>
                </div>

                <div className="relative min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <Card className="backdrop-blur-xl bg-white/70 border-0 shadow-2xl shadow-indigo-500/10 animate-scale-in">
                            <CardHeader className="text-center pb-6">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Welcome Back
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Enter your credentials to login
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <Tabs
                                    value={verificationMethod}
                                    onValueChange={(v) => {
                                        setVerificationMethod(v as "email" | "phone")
                                        setShowPassword(false)
                                    }}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 border border-gray-200/50 p-1 rounded-xl">
                                        <TabsTrigger
                                            value="email"
                                            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="phone"
                                            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Phone
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* ——— EMAIL LOGIN ——— */}
                                    <TabsContent
                                        value="email"
                                        className="space-y-4 mt-6"
                                    >
                                        <Form {...emailForm}>
                                            <form
                                                onSubmit={emailForm.handleSubmit(
                                                    onSubmitEmail
                                                )}
                                                className="space-y-4"
                                            >
                                                <FormField
                                                    control={emailForm.control}
                                                    name="identifier"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Email Address
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        placeholder="Enter your email"
                                                                        type="email"
                                                                        className="pl-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={emailForm.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center justify-between">
                                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                                    Password
                                                                </FormLabel>
                                                                <Link
                                                                    href="/auth/forgot-password"
                                                                    className="text-sm text-indigo-600 hover:underline"
                                                                >
                                                                    Forgot password?
                                                                </Link>
                                                            </div>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type={
                                                                            showPassword
                                                                                ? "text"
                                                                                : "password"
                                                                        }
                                                                        placeholder="Enter your password"
                                                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setShowPassword(
                                                                                (s) => !s
                                                                            )
                                                                        }
                                                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        {showPassword ? (
                                                                            <EyeOff className="h-4 w-4" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Logging In...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Login
                                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        </Form>
                                    </TabsContent>

                                    {/* ——— PHONE LOGIN ——— */}
                                    <TabsContent
                                        value="phone"
                                        className="space-y-4 mt-6"
                                    >
                                        <Form {...phoneForm}>
                                            <form
                                                onSubmit={phoneForm.handleSubmit(
                                                    onSubmitPhone
                                                )}
                                                className="space-y-4"
                                            >
                                                <FormField
                                                    control={phoneForm.control}
                                                    name="identifier"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone Number</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        placeholder="03XXXXXXXXX or +923XXXXXXXXX"
                                                                        type="tel"
                                                                        className="pl-10 h-12"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            {/* this will pick up your Zod error message */}
                                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                                        </FormItem>
                                                    )}
                                                />


                                                <FormField
                                                    control={phoneForm.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center justify-between">
                                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                                    Password
                                                                </FormLabel>
                                                                <Link
                                                                    href="/auth/forgot-password"
                                                                    className="text-sm text-indigo-600 hover:underline"
                                                                >
                                                                    Forgot password?
                                                                </Link>
                                                            </div>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type={
                                                                            showPassword
                                                                                ? "text"
                                                                                : "password"
                                                                        }
                                                                        placeholder="Enter your password"
                                                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setShowPassword(
                                                                                (s) => !s
                                                                            )
                                                                        }
                                                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        {showPassword ? (
                                                                            <EyeOff className="h-4 w-4" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Logging In...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Login
                                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        </Form>
                                    </TabsContent>
                                </Tabs>

                                <div className="text-center pt-4 border-t border-gray-200/50">
                                    <p className="text-sm text-gray-600">
                                        Don’t have an account?{" "}
                                        <Link
                                            href="/auth/signup"
                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Sign up here
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
           
        </>
    )
}
