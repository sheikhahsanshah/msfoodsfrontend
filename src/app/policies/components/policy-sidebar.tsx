"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Menu, X } from "lucide-react"

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
    const [isOpen, setIsOpen] = useState(false)

    // Find the current policy title for mobile display
    const currentPolicy = policies.find((policy) => pathname === `/policies/${policy.id}`)
    const currentTitle = currentPolicy?.title || "Policies"

    return (
        <>
            {/* Mobile toggle and current policy title */}
            <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <h2 className="text-lg font-bold">{currentTitle}</h2>
                <div className="w-10"></div> {/* Empty div for flex spacing */}
            </div>

            {/* Sidebar - transforms to drawer on mobile */}
            <div
                className={`${isOpen ? "block" : "hidden"
                    } md:block w-full md:w-64 border-r bg-white md:relative fixed inset-0 top-[57px] z-20 transition-all duration-300 ease-in-out`}
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4 hidden md:block">Policies</h2>
                    <nav className="space-y-1">
                        {policies.map((policy) => {
                            const isActive = pathname === `/policies/${policy.id}`

                            return (
                                <Link
                                    key={policy.id}
                                    href={`/policies/${policy.id}`}
                                    onClick={() => setIsOpen(false)} // Close menu on mobile when clicking a link
                                    className={`flex items-center gap-2 px-3 py-3 rounded-md transition-colors ${isActive
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

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    )
}
