"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/app/Component/user-context";

interface Order {
    _id: string;
    createdAt: string;
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    email: string;
    paymentMethod: string;
    status: string;
    totalAmount: number;
}

export default function CheckoutSuccessPage() {
    const { isAuthenticated } = useUser();
    // if signed in, show full order details
    return isAuthenticated ? <AuthenticatedSuccess /> : <GuestSuccess />;
}

function AuthenticatedSuccess() {
    const params = useSearchParams();
    const orderId = params.get("orderId");
    const [order, setOrder] = useState<Order | null>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

    useEffect(() => {
        if (!orderId) return;
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            }
        )
            .then(res => res.json())
            .then(({ data }) => setOrder(data))
            .catch(console.error);
    }, [orderId, token]);

    if (!order) {
        return (
            <div className="text-center p-10">
                <p>Loading your order details…</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Thank you for your order!
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Your payment was successful and your order is being processed.
                    </p>
                </div>

                <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900">
                            Order #{order._id}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Order Details</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                A confirmation email has been sent to{" "}
                                <strong>{order.email}</strong>.
                            </p>
                            <p className="text-sm text-gray-500">
                                Total Paid: Rs. {order.totalAmount.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900">
                                Shipping Information
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
                                {order.shippingAddress.city}{order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}{" "}
                                {order.shippingAddress.country}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Package className="h-5 w-5 mr-2 text-gray-400" />
                                <span>Estimated delivery: 3–5 business days</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Payment</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Method: {order.paymentMethod}
                            </p>
                            <p className="text-sm text-gray-500">Status: {order.status}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link href="/products">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>
                    <Link href="/user/dashboard/order-history">
                        <Button className="bg-purple-600 hover:bg-purple-700 flex items-center">
                            View Order History
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function GuestSuccess() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6 mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank you for your order!
                </h1>
                <p className="text-gray-600 mb-6">
                    Your order has been placed successfully.
                </p>
                <div className="space-x-2">
                    <Button onClick={() => router.push("/products")}>
                        Continue Shopping
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")}>
                        Go to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
