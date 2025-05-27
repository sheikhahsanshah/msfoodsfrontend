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
    User,
    Lock,
    ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/app/Component/Header"
import Footer from "@/app/Component/Footer"

const emailSignupSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    verificationMethod: z.literal("email"),
})

const phoneSignupSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long"),
    phone: z
        .string()
        .regex(/^\+92\d{10}$/, "Phone must start with +92 followed by 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    verificationMethod: z.literal("phone"),
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SignupPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] =
        useState<"email" | "phone">("email")
    const [showPassword, setShowPassword] = useState(false)

    const emailForm = useForm<z.infer<typeof emailSignupSchema>>({
        resolver: zodResolver(emailSignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            verificationMethod: "email",
        },
    })

    const phoneForm = useForm<z.infer<typeof phoneSignupSchema>>({
        resolver: zodResolver(phoneSignupSchema),
        defaultValues: {
            name: "",
            phone: "",
            password: "",
            verificationMethod: "phone",
        },
    })

    // Clear the other form when switching tabs
    useEffect(() => {
        if (verificationMethod === "email") {
            phoneForm.reset()
        } else {
            emailForm.reset()
        }
    }, [verificationMethod, emailForm, phoneForm])

    const handleTabChange = (value: string) => {
        setVerificationMethod(value as "email" | "phone")
        setShowPassword(false)
    }

    async function onSubmitEmail(values: z.infer<typeof emailSignupSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
                toast({
                    title: "Signup Failed",
                    description: data.message || "Something went wrong. Please try again.",
                    variant: "destructive",
                })
                return
            }
            toast({
                title: "Success! 🎉",
                description: "Verification email sent. Check your inbox!",
            })
            router.push(
                `/auth/verification-sent?method=email&email=${encodeURIComponent(
                    values.email
                )}`
            )
        } catch {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Unable to connect. Please check your internet connection.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function onSubmitPhone(values: z.infer<typeof phoneSignupSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok && response.status !== 200) {
                toast({
                    title: "Signup Failed",
                    description: data.message || "Something went wrong. Please try again.",
                    variant: "destructive",
                })
                return
            }
            if (response.status === 200) {
                toast({
                    title: "Code Resent! 📱",
                    description: "New verification code sent to your phone.",
                })
                router.push(`/auth/verify-phone?phone=${values.phone}`)
                return
            }
            toast({
                title: "Success! 🎉",
                description: "Verification code sent to your phone!",
            })
            router.push(`/auth/verify-phone?phone=${values.phone}`)
        } catch {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Unable to connect. Please check your internet connection.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header />
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                {/* Animated background */}
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
                                    Create Account
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Choose your preferred verification method
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <Tabs
                                    value={verificationMethod}
                                    onValueChange={handleTabChange}
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

                                    <TabsContent value="email" className="space-y-4 mt-6">
                                        <Form {...emailForm}>
                                            <form
                                                onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                                                className="space-y-4"
                                            >
                                                {/* Full Name */}
                                                <FormField
                                                    control={emailForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Full Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        placeholder="Enter your full name"
                                                                        className="pl-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Email */}
                                                <FormField
                                                    control={emailForm.control}
                                                    name="email"
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

                                                {/* Password */}
                                                <FormField
                                                    control={emailForm.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="Create a strong password"
                                                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPassword(!showPassword)}
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

                                                {/* Hidden verificationMethod */}
                                                <input
                                                    type="hidden"
                                                    {...emailForm.register("verificationMethod")}
                                                    value="email"
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Sign Up with Email
                                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        </Form>
                                    </TabsContent>

                                    <TabsContent value="phone" className="space-y-4 mt-6">
                                        <Form {...phoneForm}>
                                            <form
                                                onSubmit={phoneForm.handleSubmit(onSubmitPhone)}
                                                className="space-y-4"
                                            >
                                                {/* Full Name */}
                                                <FormField
                                                    control={phoneForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Full Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        placeholder="Enter your full name"
                                                                        className="pl-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Phone */}
                                                <FormField
                                                    control={phoneForm.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Phone Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        placeholder="+923001234567"
                                                                        type="tel"
                                                                        className="pl-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Password */}
                                                <FormField
                                                    control={phoneForm.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="Create a strong password"
                                                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
                                                                        {...field}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setShowPassword(!showPassword)
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

                                                {/* Hidden verificationMethod */}
                                                <input
                                                    type="hidden"
                                                    {...phoneForm.register("verificationMethod")}
                                                    value="phone"
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Sign Up with Phone
                                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        </Form>
                                    </TabsContent>
                                </Tabs>

                                {/* Login Link */}
                                <div className="text-center pt-4 border-t border-gray-200/50">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <Link
                                            href="/auth/login"
                                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
