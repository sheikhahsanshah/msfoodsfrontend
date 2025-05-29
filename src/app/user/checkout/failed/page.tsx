'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function OrderFailedPage() {
    const params = useSearchParams()
    const orderId = params.get('orderId')

    return (
        <div className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Unfortunately, your payment was not successful.
                    </p>
                </div>

                <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-medium text-gray-900">Order ID</h2>
                    <p className="mt-1 text-sm text-gray-500">{orderId ?? 'N/A'}</p>
                    <Separator className="my-6" />
                    <p className="text-sm text-gray-500">
                        Please check your payment method or try again. If it persists,
                        contact our support team.
                    </p>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link href="/products">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button className="bg-red-600 hover:bg-red-700">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
