"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText } from "lucide-react"

const policies = [
    { id: "privacy-policy", title: "Privacy Policy" },
    { id: "return-policy", title: "Return Policy" },
    { id: "shipping-service-policy", title: "Shipping/Service Policy" },
    { id: "refund-policy", title: "Refund Policy" },
    { id: "terms-conditions", title: "Terms & Conditions" },
    { id: "faqs", title: "FAQs" },
]

export function PolicySidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 border-r bg-white overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Policies</h2>
                <nav className="space-y-1">
                    {policies.map((policy) => {
                        const isActive = pathname === `/policies/${policy.id}`

                        return (
                            <Link
                                key={policy.id}
                                href={`/policies/${policy.id}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? "bg-gray-100 text-gray-900 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                <span>{policy.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
