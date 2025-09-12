"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface PaymentMethod {
    _id: string;
    name: string;
    accountNumber: string;
    ownerName: string;
}
import Link from "next/link"
import { useCart } from "@/app/Component/CartContext"
import { useUser } from "@/app/Component/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {

    Truck,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Tag,
    AlertCircle,
    CreditCard,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Cookies from "js-cookie"

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://msfoodsbackend.vercel.app";

export default function CheckoutPage() {
    const { cart, getTotalPrice, getTotalSavings, getOriginalTotalPrice, clearCart } = useCart()
    const { user, isAuthenticated } = useUser()
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "BankTransfer">("BankTransfer")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [eligibleItems, setEligibleItems] = useState<EligibleItem[]>([])
    const [eligibleSubtotal, setEligibleSubtotal] = useState(0)
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true)
    const [shippingFee, setShippingFee] = useState(0)
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000)
    const [codFee, setCodFee] = useState(0)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Pakistan",
    })
    const [phoneError, setPhoneError] = useState("");
    const [bankMethods, setBankMethods] = useState<PaymentMethod[]>([])
    const [selectedBankId, setSelectedBankId] = useState<string>("")
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetch(`${API_URL}/api/payment-methods`, { credentials: "include" })
                if (!res.ok) throw new Error("Failed to load banks")
                setBankMethods(await res.json())
            } catch (err) {
                toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
            }
        })()
    }, [toast])

    useEffect(() => {
        if (paymentMethod !== "BankTransfer") {
            setSelectedBankId("");
            setScreenshotFile(null);
            setScreenshotPreview(null);
        }
    }, [paymentMethod]);
    // Calculate order summary
    const subtotal = getTotalPrice()
    const saleSavings = getTotalSavings()
    const originalSubtotal = getOriginalTotalPrice()
    const discount = couponApplied ? couponDiscount : 0
    // shippingCost is now derived
    // const codFee = paymentMethod === 'COD' ? 100 : 0;

    // update how you derive shippingCost & orderTotal:
    const shippingCost = subtotal > freeShippingThreshold ? 0 : shippingFee;
    const codFeeAmount = paymentMethod === 'COD' ? codFee : 0;
    const orderTotal = subtotal + shippingCost + codFeeAmount - discount;

    // Debug logging
    // console.log("Shipping calculation:", {
    //     subtotal,
    //     freeShippingThreshold,
    //     shippingFee,
    //     shippingCost,
    //     orderTotal
    // })

    // Fetch shipping cost from backend
    const fetchShippingCost = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch settings: ${response.status}`)
            }

            const data = await response.json()
            // console.log("Fetched shipping settings:", data) // Debug log

            // Always update settings if data exists, regardless of shipping fee value
            if (data) {
                setShippingFee(data.shippingFee ?? 0);
                setFreeShippingThreshold(data.freeShippingThreshold ?? 2000);
                setCodFee(data.codFee ?? 0);
                // console.log("Updated shipping settings - Fee:", data.shippingFee, "Threshold:", data.freeShippingThreshold) // Debug log
            }
        } catch {
            // console.error("Failed to fetch shipping cost:", error)
            toast({
                title: "Error",
                description: "Failed to fetch shipping cost. Using default value.",
                variant: "destructive",
                duration: 1000,
            })
        }
    }, [toast])

    // Fill user data if logged in
    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                fullName: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            }))
        }
    }, [user])

    // Fetch shipping cost on page load
    useEffect(() => {
        fetchShippingCost()
    }, [fetchShippingCost])

    const handlePhoneBlur = () => {
        let phone = formData.phone.trim()
        // if they typed 0XXXXXXXXXX, turn it into +92XXXXXXXXXX
        if (/^0\d{10}$/.test(phone)) {
            phone = `+92${phone.slice(1)}`
            setFormData(prev => ({ ...prev, phone }))
            setPhoneError("")
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            // strip spaces
            const val = value.trim()

            // valid if either +92XXXXXXXXXX or 0XXXXXXXXXX
            const intlRegex = /^\+92\d{10}$/
            const localRegex = /^0\d{10}$/
            if (val === "" || intlRegex.test(val) || localRegex.test(val)) {
                setPhoneError("")
            } else {
                setPhoneError("Must be 0XXXXXXXXXX or +92XXXXXXXXXX")
            }

            // always store raw user input, normalization happens on blur or submit
            setFormData(prev => ({ ...prev, phone: val }))
            return
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast({
                title: "Please enter a coupon code",
                variant: "destructive",
                duration: 1000,
            })
            return
        }

        // Check if user is authenticated before applying coupon
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to apply a coupon code",
                variant: "destructive",
                duration: 1000,
            })
            return
        }

        try {
            setIsSubmitting(true)

            // Get the access token
            const accessToken = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken") || ""

            if (!accessToken) {
                throw new Error("Authentication required to apply coupon")
            }

            const response = await fetch(`${API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    code: couponCode,
                    cartTotal: subtotal,
                    items: cart.map(item => ({
                        productId: item.id,
                        priceOptionId: item.priceOptionId,
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }))
                }),
                credentials: "include",
            })

            const data = await response.json()

            if (data.success) {
                setCouponDiscount(data.data.discount)
                setCouponApplied(true)
                setEligibleItems(data.data.eligibleItems)
                setEligibleSubtotal(data.data.eligibleSubtotal)
                toast({
                    title: "Coupon applied!",
                    description: `You saved Rs.${data.data.discount.toLocaleString()}`,
                    duration: 1000,
                })
            } else {
                throw new Error(data.message || "Invalid coupon code")
            }
        } catch (error) {
            toast({
                title: "Coupon Error",
                description: error instanceof Error ? error.message : "Failed to apply coupon",
                variant: "destructive",
                duration: 1000,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1️⃣ Basic form validation
            const required = ["fullName", "email", "phone", "address", "city"];
            const missing = required.filter(f => !formData[f as keyof typeof formData]);
            if (missing.length) {
                throw new Error(`Missing required fields: ${missing.join(", ")}`);
            }

            // 2️⃣ Prepare order items & addresses
            const items = cart.map(item => ({
                productId: item.id,
                priceOptionId: item.priceOptionId,
                quantity: item.quantity,
            }));
            const shippingAddress = {
                fullName: formData.fullName,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country,
                email: formData.email,
                phone: formData.phone,
            };

            // 3️⃣ BANK TRANSFER branch
            if (paymentMethod === "BankTransfer") {
                if (!selectedBankId) {
                    throw new Error("Please select a bank account");
                }
                if (!screenshotFile) {
                    throw new Error("Please upload a payment proof image");
                }

                // build multipart form
                const payload = new FormData();
                payload.append("paymentMethod", paymentMethod);
                payload.append("bankMethodId", selectedBankId);
                payload.append("paymentScreenshot", screenshotFile);

                payload.append("items", JSON.stringify(items));
                payload.append("shippingAddress", JSON.stringify(shippingAddress));

                payload.append("subtotal", subtotal.toString());
                payload.append("shippingCost", shippingCost.toString());
                payload.append("discount", discount.toString());
                payload.append("totalAmount", orderTotal.toString());
                if (couponApplied) payload.append("couponCode", couponCode);

                const token =
                    user?.accessToken ||
                    localStorage.getItem("accessToken") ||
                    Cookies.get("accessToken") ||
                    "";

                const res = await fetch(`${API_URL}/api/orders`, {
                    method: "POST",
                    body: payload,
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    credentials: "include",
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Order failed");

                clearCart();
                router.push(`/user/checkout/success?orderId=${result.data._id}`);
                return; // done!
            }

            // 4️⃣ COD fallback
            const orderData = {
                items,
                shippingAddress,
                paymentMethod,
                couponCode: couponApplied ? couponCode : undefined,
                subtotal,
                shippingCost,
                discount,
                codFee: codFeeAmount,
                totalAmount: orderTotal,
            };

            const token =
                user?.accessToken ||
                localStorage.getItem("accessToken") ||
                Cookies.get("accessToken") ||
                "";

            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(orderData),
                credentials: "include",
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Order failed");

            clearCart();
            router.push(`/user/checkout/success?orderId=${result.data._id}`);
        } catch (err) {
            toast({
                title: "Order Error",
                description: err instanceof Error ? err.message : "Failed to place order",
                variant: "destructive",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("")
        setCouponApplied(false)
        setCouponDiscount(0)
        setEligibleItems([])
        setEligibleSubtotal(0)
        toast({
            title: "Coupon removed",
            description: "The coupon has been removed from your order.",
            duration: 1000,
        })
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
                <div className="mb-8">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mt-2 text-gray-500">Please add items to your cart before proceeding to checkout.</p>
                </div>
                <Link href="/products">
                    <Button className="bg-purple-600 hover:bg-purple-700">Browse Products</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/user/cart" className="text-purple-600 hover:text-purple-800 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to cart
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {/* Authentication warning for coupon usage */}
                {!isAuthenticated && (
                    <Alert variant="default" className="mb-6 border-yellow-500 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Authentication Required for Coupons</AlertTitle>
                        <AlertDescription>
                            You need to{" "}
                            <Link href="/auth/login" className="font-medium underline">
                                log in
                            </Link>{" "}
                            to apply or use coupon codes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Order Summary - Mobile Only (Top) */}
                <div className="lg:hidden mb-6">
                    <OrderSummaryCollapsible
                        cart={cart}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        discount={discount}
                        codFee={codFeeAmount}
                        orderTotal={orderTotal}
                        isOpen={isOrderSummaryOpen}
                        setIsOpen={setIsOrderSummaryOpen}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        couponApplied={couponApplied}
                        handleApplyCoupon={handleApplyCoupon}
                        handleRemoveCoupon={handleRemoveCoupon}
                        isSubmitting={isSubmitting}
                        isAuthenticated={isAuthenticated}
                        eligibleItems={eligibleItems}
                        eligibleSubtotal={eligibleSubtotal}
                        saleSavings={saleSavings}
                        originalSubtotal={originalSubtotal}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} id="checkout-form">
                            {/* Contact Information */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onBlur={handlePhoneBlur}
                                            required
                                            placeholder="03211234567"
                                        />
                                        {phoneError && (
                                            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="address">Street Address</Label>
                                        <Input id="address" required name="address" value={formData.address} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                                            <Input
                                                id="postalCode"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" value={formData.country} onChange={handleInputChange} disabled />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            {/* ——— PAYMENT METHOD ——— */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as "COD" | "BankTransfer")}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {/* COD Card */}
                                    <div
                                        className={`
        relative flex items-center p-4 rounded-lg border
        cursor-pointer transition
        ${paymentMethod === "COD"
                                                ? "border-indigo-600 bg-indigo-50"
                                                : "border-gray-200 hover:border-gray-300"}
      `}
                                    >
                                        <RadioGroupItem
                                            value="COD"
                                            id="cod"
                                            className="sr-only"
                                        />

                                    </div>

                                    {/* Bank Transfer Card */}
                                    <div
                                        className={`
        relative flex items-center p-4 rounded-lg border
        cursor-pointer transition
        ${paymentMethod === "BankTransfer"
                                                ? "border-indigo-600 bg-indigo-50"
                                                : "border-gray-200 hover:border-gray-300"}
      `}
                                    >
                                        <RadioGroupItem
                                            value="BankTransfer"
                                            id="bank"
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor="bank"
                                            className="flex items-center space-x-2 w-full cursor-pointer"
                                        >
                                            <CreditCard
                                                className={`h-6 w-6 ${paymentMethod === "BankTransfer"
                                                    ? "text-indigo-600"
                                                    : "text-gray-400"
                                                    }`}
                                            />
                                            <span
                                                className={`font-medium ${paymentMethod === "BankTransfer"
                                                    ? "text-indigo-900"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                Bank Transfer
                                            </span>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* ——— BANK TRANSFER DETAILS ——— */}
                            {paymentMethod === "BankTransfer" && (
                                <div className="space-y-6 mb-6">
                                    {/* Select Bank */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Choose Bank Account
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {bankMethods.map((b) => (
                                                <label
                                                    key={b._id}
                                                    className={`
              flex items-start p-4 rounded-lg border cursor-pointer transition
              ${selectedBankId === b._id
                                                            ? "border-indigo-600 bg-indigo-50"
                                                            : "border-gray-200 hover:shadow-sm hover:border-gray-300"}
            `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="selectedBank"
                                                        value={b._id}
                                                        checked={selectedBankId === b._id}
                                                        onChange={() => setSelectedBankId(b._id)}
                                                        className="mt-1 h-4 w-4 text-indigo-600"
                                                    />
                                                    <div className="ml-3">
                                                        <p className="text-gray-800 font-semibold">{b.name}</p>
                                                        <p className="text-gray-600 text-sm">
                                                            Acct No: <span className="font-mono">{b.accountNumber}</span>
                                                        </p>
                                                        <p className="text-gray-600 text-sm">
                                                            Holder: {b.ownerName}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Drag-and-Drop Uploader */}
                                    <div>
                                        <Label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Payment Proof
                                        </Label>
                                        <div
                                            className={`
          relative flex justify-center items-center px-6 py-8 border-2 border-dashed rounded-lg
          cursor-pointer transition
          ${screenshotPreview ? "border-transparent" : "border-gray-300 hover:border-gray-400"}
        `}
                                            onClick={() => document.getElementById("screenshot")?.click()}
                                        >
                                            {screenshotPreview ? (
                                                <div className="relative w-32 h-32">
                                                    <Image
                                                        src={screenshotPreview}
                                                        alt="Payment Proof Preview"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setScreenshotFile(null)
                                                            setScreenshotPreview(null)
                                                        }}
                                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-center">
                                                    <svg
                                                        className="mx-auto h-8 w-8 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-3 3m3-3l3 3m-3-15v6"
                                                        />
                                                    </svg>
                                                    <p className="text-sm text-gray-600">
                                                        Click to upload or drag & drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG up to 5MB
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                id="screenshot"
                                                name="screenshot"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    setScreenshotFile(file);
                                                    setScreenshotPreview(file ? URL.createObjectURL(file) : null);
                                                    e.target.value = ""; // Reset input so same file can be selected again
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}



                            <div className="lg:hidden">
                                <Button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Place Order"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary - Desktop Only */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-6">
                            <OrderSummaryCollapsible
                                cart={cart}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                discount={discount}
                                codFee={codFeeAmount}
                                orderTotal={orderTotal}
                                isOpen={true}
                                setIsOpen={() => { }}
                                couponCode={couponCode}
                                setCouponCode={setCouponCode}
                                couponApplied={couponApplied}
                                handleApplyCoupon={handleApplyCoupon}
                                handleRemoveCoupon={handleRemoveCoupon}
                                isSubmitting={isSubmitting}
                                isAuthenticated={isAuthenticated}
                                eligibleItems={eligibleItems}
                                eligibleSubtotal={eligibleSubtotal}
                                saleSavings={saleSavings}
                                originalSubtotal={originalSubtotal}
                            />

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : "Place Order"}
                            </Button>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Truck className="h-5 w-5 mr-2 text-gray-400" />
                                    Free shipping on orders over Rs.{freeShippingThreshold.toLocaleString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <ShieldCheck className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>Secure payment processing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CartItem {
    id: string | number;
    priceOptionId: string | number;
    name: string;
    price: number;
    originalPrice?: number;
    salePercentage?: number;
    quantity: number;
    image?: string;
    weightType?: string;
    weight?: number;
}

interface EligibleItem {
    productId: string | number;
    priceOptionId: string | number;
    name: string;
    price: number;
    quantity: number;
    discount: number;
}

interface OrderSummaryProps {
    cart: CartItem[]
    subtotal: number
    shippingCost: number
    discount: number
    codFee: number
    orderTotal: number
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    couponCode: string
    setCouponCode: (code: string) => void
    couponApplied: boolean
    handleApplyCoupon: () => void
    handleRemoveCoupon: () => void
    isSubmitting: boolean
    isAuthenticated: boolean
    eligibleItems?: EligibleItem[]
    eligibleSubtotal?: number
    saleSavings: number
    originalSubtotal: number
}

function OrderSummaryCollapsible({
    cart,
    subtotal,
    shippingCost,
    discount,
    codFee,
    orderTotal,
    isOpen,
    setIsOpen,
    couponCode,
    setCouponCode,
    couponApplied,
    handleApplyCoupon,
    handleRemoveCoupon,
    isSubmitting,
    isAuthenticated,
    eligibleItems,
    eligibleSubtotal,
    saleSavings,
    originalSubtotal,
}: OrderSummaryProps) {
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                        <p className="text-sm text-gray-500">
                            {cart.length} {cart.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 font-medium">Rs.{orderTotal.toLocaleString()}</span>
                        {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>

                    <Separator />
                    <div className="p-6">
                        <div className="max-h-80 overflow-y-auto mb-4">
                            {cart.map((item) => {
                                const isEligible = eligibleItems?.some(eligible =>
                                    eligible.productId === item.id
                                );
                                return (
                                    <div key={`${item.id}-${item.priceOptionId}`} className="flex py-4 border-b border-gray-200">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image || "/placeholder.svg?height=64&width=64"}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                            />
                                            <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                            {item.weightType === "weight-based" && <p className="text-xs text-gray-500">{item.weight}g</p>}
                                            <p className="text-sm text-gray-900 mt-1">
                                                {item.originalPrice && item.originalPrice > item.price ? (
                                                    <>
                                                        <span className="text-red-600 font-medium">Rs.{item.price.toLocaleString()}</span>
                                                        <span className="text-gray-500 line-through ml-2">Rs.{item.originalPrice.toLocaleString()}</span>
                                                        <span className="text-xs text-green-600 ml-2">({item.salePercentage}% off)</span>
                                                    </>
                                                ) : (
                                                    <span>Rs.{item.price.toLocaleString()}</span>
                                                )} × {item.quantity}
                                            </p>
                                            {couponApplied && isEligible && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    ✓ Eligible for discount
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Rs.{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Coupon Code */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Discount Code</h3>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={couponApplied || isSubmitting || !isAuthenticated}
                                    />
                                </div>
                                {couponApplied ? (
                                    <Button type="button" variant="outline" onClick={handleRemoveCoupon} disabled={isSubmitting}>
                                        Remove
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={isSubmitting || !isAuthenticated}
                                    >
                                        {isSubmitting ? "..." : "Apply"}
                                    </Button>
                                )}
                            </div>
                            {!isAuthenticated && <p className="mt-2 text-xs text-amber-600">Please log in to use coupon codes</p>}
                            {couponApplied && (
                                <div className="mt-2 flex items-center text-sm text-green-600">
                                    <Tag className="h-4 w-4 mr-1" />
                                    <span>Discount of Rs.{discount.toLocaleString()} applied</span>
                                </div>
                            )}
                            {couponApplied && eligibleSubtotal && eligibleSubtotal !== subtotal && (
                                <div className="mt-1 text-xs text-gray-600">
                                    Applied to eligible products only (Rs.{eligibleSubtotal.toLocaleString()})
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {saleSavings > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">Original Subtotal</p>
                                    <p className="text-sm text-gray-500 line-through">Rs.{originalSubtotal.toLocaleString()}</p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="text-sm font-medium text-gray-900">Rs.{subtotal.toLocaleString()}</p>
                            </div>

                            {saleSavings > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">Sale Savings</p>
                                    <p className="text-sm font-medium text-green-600">-Rs.{saleSavings.toLocaleString()}</p>
                                </div>
                            )}

                            {discount > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">Coupon Discount</p>
                                    <p className="text-sm font-medium text-green-600">-Rs.{discount.toLocaleString()}</p>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <p className="text-sm text-gray-600">Shipping</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {shippingCost === 0 ? "Free" : `Rs.${shippingCost.toLocaleString()}`}
                                </p>
                            </div>

                            <Separator />
                            {codFee > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">COD Fee</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        Rs.{codFee.toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <p className="text-base font-medium text-gray-900">Total</p>
                                <p className="text-base font-medium text-gray-900">Rs.{orderTotal.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

