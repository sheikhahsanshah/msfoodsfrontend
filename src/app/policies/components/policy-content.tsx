"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface PolicyContentProps {
    title: string
    content: string
}

export function PolicyContent({ title, content }: PolicyContentProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
        return () => setIsVisible(false)
    }, [title])

    const paragraphs = content.split("\n\n").filter((p) => p.trim() !== "")

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-8"
        >
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 mt-2 md:mt-0">{title}</h1>
            <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="text-gray-700 leading-relaxed text-sm md:text-base"
                    >
                        {paragraph}
                    </motion.p>
                ))}
            </div>
        </motion.div>
    )
}
