"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"

const faqs = [
    {
        question: "How do I place an order on msFoods?",
        answer:
            "To place an order, browse our products, add items to your cart, and proceed to checkout. Follow the prompts to enter your shipping and payment information, then confirm your order. You'll receive an order confirmation via email once your purchase is complete.",
    },
    {
        question: "What payment methods do you accept?",
        answer:
            "We accept various payment methods including credit/debit cards, online banking, digital wallets like EasyPaisa and JazzCash, and cash on delivery (for select areas). All payment options will be displayed during checkout.",
    },
    {
        question: "How long will it take to receive my order?",
        answer:
            "Most orders are delivered within 3-5 business days after processing. Delivery times may vary depending on your location. For major cities like Karachi, Lahore, and Islamabad, we offer express delivery options that can deliver your order within 24 hours of processing for an additional fee.",
    },
    {
        question: "Can I track my order?",
        answer:
            "Yes, once your order has been dispatched, you'll receive a shipping confirmation via email or SMS with a tracking number and link to monitor your delivery in real-time.",
    },
    {
        question: "What if I receive damaged or incorrect items?",
        answer:
            "If your order arrives damaged, incorrect, or incomplete, please contact our customer support team within 48 hours of receiving your order. Include clear photographic evidence of the issue along with your order number and contact details so we can resolve the issue promptly.",
    },
    {
        question: "Do you offer international shipping?",
        answer:
            "International shipping is currently limited to select countries. Please contact our customer service team to discuss available options, associated costs, and estimated delivery timeframes for international orders.",
    },
    {
        question: "How do I create an account on msFoods?",
        answer:
            "To create an account, click on the 'Sign Up' or 'Register' button on our website. Fill in your personal details, create a password, and submit the form. You'll receive a confirmation email to verify your account. Having an account allows you to track orders, save favorite products, and enjoy a faster checkout process.",
    },
    {
        question: "Are there any minimum order requirements?",
        answer:
            "For standard deliveries, there is no minimum order requirement. However, for free shipping promotions or certain delivery options, a minimum order value may apply. These requirements will be clearly indicated during the checkout process.",
    },
    {
        question: "How do I apply a discount code to my order?",
        answer:
            "During checkout, you'll find a field labeled 'Discount Code' or 'Promo Code' where you can enter your code. Click 'Apply' to see the discount reflected in your order total before completing your purchase.",
    },
    {
        question: "What should I do if I have allergies or dietary restrictions?",
        answer:
            "We provide detailed ingredient information for all our food products. If you have specific allergies or dietary concerns, please review the product descriptions carefully or contact our customer service team before placing your order. We can provide additional information about potential allergens or cross-contamination risks.",
    },
]

export default function FAQsPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold mb-8"
            >
                Frequently Asked Questions
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
            >
                <p className="text-lg text-gray-700 mb-8">
                    Find answers to the most common questions about msFoods products, ordering, shipping, and more. If you can&apos;t
                    find what you&apos;re looking for, please don&apos;t hesitate to contact our customer support team.
                </p>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        >
                            <AccordionItem value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        </motion.div>
                    ))}
                </Accordion>
            </motion.div>
        </div>
    )
}
