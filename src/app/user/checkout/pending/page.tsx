'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PendingPage() {
    const params = useSearchParams()
    const orderId = params.get('orderId')
    const router = useRouter()

    // 1) Kick off the PayFast redirect
    useEffect(() => {
        if (!orderId) return
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(({ data }) => {
                if (data.paymentResult?.redirectUrl) {
                    window.location.href = data.paymentResult.redirectUrl
                }
            })
            .catch(console.error)
    }, [orderId])

    // 2) Poll for final outcome
    useEffect(() => {
        if (!orderId) return
        const iv = setInterval(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
                credentials: 'include'
            })
                .then(r => r.json())
                .then(({ data }) => {
                    if (data.status === 'Processing') {
                        clearInterval(iv)
                        router.push(`/user/checkout/success?orderId=${orderId}`)
                    }
                    if (data.status === 'Cancelled') {
                        clearInterval(iv)
                        router.push(`/user/checkout/failed?orderId=${orderId}`)
                    }
                })
                .catch(console.error)
        }, 3000)
        return () => clearInterval(iv)
    }, [orderId, router])

    return (
        <div className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Pending</h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Your payment is being processed. Please wait a few moments.
                    </p>
                </div>

                <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-medium text-gray-900">Order ID</h2>
                    <p className="mt-1 text-sm text-gray-500">{orderId ?? 'N/A'}</p>
                    <Separator className="my-6" />
                    <p className="text-sm text-gray-500">
                        We’re waiting for confirmation from PayFast. We’ll update your
                        order status shortly.
                    </p>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link href="/user/myOrders">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            View Orders
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button className="bg-yellow-500 hover:bg-yellow-600">
                            Need Help?
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
