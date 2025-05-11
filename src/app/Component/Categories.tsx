"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronRight } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

interface Category {
    _id: string
    name: string
    images: { public_id: string; url: string }[]
    description?: string
}

// Pastel colors matching the image
const pastelColors = [
    "#FAD2E1", // Soft Blush Pink
    "#B5EAD7", // Mint Green
    "#FFDAC1", // Peach
    "#C7CEEA", // Periwinkle
    "#A2D2FF", // Baby Blue
    "#FFF5BA", // Pastel Yellow
]

export default function CreativeCategoryShowcase() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch categories")
            }

            setCategories(data)
        } catch (error) {
            console.error("Error fetching categories:", error)
            setError(error instanceof Error ? error.message : "An unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        setStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return

        const currentY = e.touches[0].clientY
        const diff = startY - currentY

        if (Math.abs(diff) > 30) {
            if (diff > 0 && activeIndex < categories.length - 1) {
                setActiveIndex(activeIndex + 1)
            } else if (diff < 0 && activeIndex > 0) {
                setActiveIndex(activeIndex - 1)
            }
            setIsDragging(false)
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 0 && activeIndex < categories.length - 1) {
            setActiveIndex(activeIndex + 1)
        } else if (e.deltaY < 0 && activeIndex > 0) {
            setActiveIndex(activeIndex - 1)
        }
    }

    const selectCategory = (index: number) => {
        setActiveIndex(index)
    }

    if (isLoading) {
        return (
            <CategorySkeleton />
        )
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    if (categories.length === 0) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <h2 className="text-2xl font-bold mb-4">No Categories Available</h2>
                <p className="text-black">Check back later for more categories!</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-4 ">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Categories</h2>
                <Link href="/categories" className="flex items-center gap-1 text-sm font-medium">
                    See All <ChevronRight size={16} />
                </Link>
            </div>

            <div
                className="relative h-[50vh] overflow-hidden"
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
            >
               

                {/* Category wheel */}
                <div className="absolute left-0 right-0 top-[30%]">
                    {categories.map((category, index) => {
                        const distance = index - activeIndex
                        const yPosition = distance * 120
                        const scale = 1 - Math.min(0.3, Math.abs(distance) * 0.15)
                        const opacity = 1 - Math.min(0.7, Math.abs(distance) * 0.25)
                        const zIndex = 10 - Math.abs(distance)
                        const bgColor = pastelColors[index % pastelColors.length]
                        const isActive = index === activeIndex

                        return (
                            <motion.div
                                key={category._id}
                                className="absolute left-0 right-0 flex justify-center items-center cursor-pointer"
                                style={{ zIndex }}
                                initial={{ y: yPosition, scale, opacity }}
                                animate={{ y: yPosition, scale, opacity }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={() => selectCategory(index)}
                            >
                                <div
                                    className={`flex items-center w-full max-w-sm p-4 rounded-2xl transition-all duration-300 ${isActive ? "shadow-lg" : ""}`}
                                    style={{
                                        backgroundColor: isActive ? bgColor + "40" : "transparent",
                                    }}
                                >
                                    <div className="relative w-20 h-20 rounded-full flex-shrink-0 mr-4 overflow-hidden">
                                        <Image
                                            src={category.images[0]?.url || "/placeholder.svg"}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Decorative elements */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-tr"
                                            style={{ backgroundColor: bgColor + "40" }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isActive ? 0.3 : 0 }}
                                        />
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="font-bold text-xl mb-1">{category.name}</h3>

                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Link href={`/products/${category.name}`}>
                                                        <motion.button
                                                            className="flex items-center gap-2 text-sm font-medium mt-1 px-4 py-2 rounded-full"
                                                            style={{ backgroundColor: bgColor }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Explore <ArrowRight size={14} />
                                                        </motion.button>
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Swipe indicator */}
            </div>
                <div className="  flex justify-center items-center text-sm text-gray-500 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-center mb-1">Swipe to explore</div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        </div>
                    </motion.div>
                </div>

            {/* Dots indicator */}
            <div className="flex justify-center mt-6 gap-2">
                {categories.map((_, index) => (
                    <button
                        key={`dot-${index}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "w-6 bg-gray-800" : "bg-gray-300"
                            }`}
                        onClick={() => selectCategory(index)}
                    />
                ))}
            </div>
        </div>
    )
}

function CategorySkeleton() {
    return (
        <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            </div>

            <div className="relative h-[500px]">
                {/* Skeleton categories */}
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        className="absolute left-0 right-0 flex justify-center"
                        style={{
                            top: `${index * 120}px`,
                            opacity: index === 0 ? 1 : 1 - index * 0.3,
                            zIndex: 10 - index,
                        }}
                    >
                        <div className="flex items-center w-full max-w-sm p-4 rounded-2xl">
                            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mr-4"></div>
                            <div className="flex-grow">
                                <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                                {index === 0 && <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse mt-2"></div>}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Skeleton swipe indicator */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                        </div>
                    </div>
                </div>

                {/* Skeleton dots */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full bg-gray-200 animate-pulse ${index === 0 ? "w-6" : "w-2"}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
