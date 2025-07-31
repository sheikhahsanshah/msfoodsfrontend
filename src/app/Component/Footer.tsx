import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, ChevronDown } from "lucide-react"

const Footer = () => {
    return (
        <footer className="footer bg-surface py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <Link href={"/"} className="text-2xl font-bold">
                            msFoods
                        </Link>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm">Email: msfoodscontact@gmail.com</p>
                            <p className="text-sm">Phone: 0324-8120893</p>
                            
                           
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3">Information</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href={"/contact"} className="text-sm hover:underline">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href={"#!"} className="text-sm hover:underline">
                                    Career
                                </Link>
                            </li>
                            <li>
                                <Link href={"/user/dashboard/order-history"} className="text-sm hover:underline">
                                    Order & Returns
                                </Link>
                            </li>
                            <li>
                                <Link href={"/policies/faqs"} className="text-sm hover:underline">
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3">Customer Services</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href={"/policies/faqs"} className="text-sm hover:underline">
                                    Orders FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href={"/policies/shipping-service-policy"} className="text-sm hover:underline">
                                    Shipping
                                </Link>
                            </li>
                            <li>
                                <Link href={"/policies/privacy-policy"} className="text-sm hover:underline">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href={"/policies/refund-policy"} className="text-sm hover:underline">
                                    Return & Refund
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                   
                        <div className="flex gap-4 mt-4">
                            <Link href={"https://www.facebook.com/share/12CHsKxqB85/"} target="_blank" aria-label="Facebook">
                                <Facebook size={20} />
                            </Link>
                            <Link
                                href={"https://www.instagram.com/msfoods12?igsh=OGx2NWowdjl3djhy"}
                                target="_blank"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </Link>
                            <Link href={"https://www.twitter.com/"} target="_blank" aria-label="Twitter">
                                <Twitter size={20} />
                            </Link>
                            <Link href={"https://www.youtube.com/"} target="_blank" aria-label="YouTube">
                                <Youtube size={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm">©2024 msFoods. All Rights Reserved.</p>
                    <div className="flex gap-4 items-center">
                        <select className="bg-transparent text-sm border border-gray-300 p-1 rounded">
                            <option value="English">English</option>
                            <option value="Espana">Espana</option>
                            <option value="France">France</option>
                        </select>
                        <ChevronDown size={16} />
                        <select className="bg-transparent text-sm border border-gray-300 p-1 rounded">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
