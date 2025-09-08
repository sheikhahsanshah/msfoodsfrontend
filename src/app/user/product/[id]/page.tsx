"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Star, Share2, ShoppingCart, ShoppingBag, Eye, ArrowBigRight, X, ChevronUp, ChevronDown, } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/app/Component/CartContext"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
// import Header from "@/app/Component/Header"
// import Footer from "@/app/Component/Footer"

interface Category {
    _id: string
    name: string
}

interface PriceOption {
    type: string
    weight: number
    price: number
    salePrice: number | null
    calculatedSalePrice?: number
    originalPrice?: number
    globalSalePercentage?: number | null
    _id: string
}

interface Product {
    _id: string
    name: string
    description: string
    categories: Category[]
    stock: number
    images: { public_id: string; url: string; _id: string; id: string }[]
    ratings: number
    numOfReviews: number
    slug: string
    priceOptions: PriceOption[]
    sale: number | null
    calculatedPriceOptions?: PriceOption[]
    hasActiveSales?: boolean
    lowestPrice?: number
}

interface Review {
    _id: string
    user: {
        _id: string
        name: string
    }
    rating: number
    comment: string
    images: string[]
    createdAt: string
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function ProductDetail() {
    const params = useParams()
    const { id } = params
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [quantity, setQuantity] = useState(1)
    const [selectedPriceOption, setSelectedPriceOption] = useState<PriceOption | null>(null)
    const [selectedPriceType, setSelectedPriceType] = useState<string>("weight-based")
    const { cart, addToCart } = useCart()
    const { toast } = useToast()
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [animateIn, setAnimateIn] = useState(false)

    // New review-related state:
    const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({})
    const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null)
    useEffect(() => {
        setAnimateIn(true)
        return () => setAnimateIn(false)
    }, [])


    const fetchRelatedProducts = useCallback(
        async (categories: Category[]) => {
            try {
                const categoryIds = categories.map((cat) => cat._id).join(",")
                const res = await fetch(`${API_URL}/api/products/by-categories?categories=${categoryIds}`)
                if (!res.ok) {
                    throw new Error("Failed to fetch related products")
                }
                const data = await res.json()
                if (!data.success) {
                    throw new Error(data.message || "Failed to fetch related products")
                }
                // Store all products except current one
                const filteredProducts = data.data.filter((p: Product) => p._id !== id)
                setRelatedProducts(filteredProducts.slice(0, 4))
            } catch (err) {
                console.error("Error fetching related products:", err)
            }
        },
        [id],
    )

    useEffect(() => {
        if (!id) return

        const fetchProductAndReviews = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    fetch(`${API_URL}/api/products/${id}`),
                    fetch(`${API_URL}/api/reviews/${id}`),
                ])

                if (!productRes.ok) {
                    throw new Error("Failed to fetch product")
                }

                const productData = await productRes.json()
                if (!productData.success) {
                    throw new Error(productData.message || "Failed to fetch product")
                }

                setProduct(productData.data)
                setSelectedImage(productData.data.images[0]?.url || null)

                // Find default price options by type
                const packetOptions = productData.data.priceOptions.filter((option: PriceOption) => option.type === "packet")
                const weightOptions = productData.data.priceOptions.filter((option: PriceOption) => option.type === "weight-based")

                // Prefer weight-based options first, fall back to packet
                if (weightOptions.length > 0) {
                    setSelectedPriceType("weight-based")
                    setSelectedPriceOption(weightOptions[0])
                } else if (packetOptions.length > 0) {
                    setSelectedPriceType("packet")
                    setSelectedPriceOption(packetOptions[0])
                }

                // Handle reviews
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json()
                    if (reviewsData.success) {
                        setReviews(reviewsData.data.reviews || [])
                    }
                }

                await fetchRelatedProducts(productData.data.categories)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductAndReviews()
    }, [id, fetchRelatedProducts])

    const handleImageClick = (url: string) => {
        setSelectedImage(url)
    }

    const handleQuantityChange = (value: number) => {
        if (value < 1) return
        if (product && value > product.stock) {
            toast({
                title: "Maximum stock reached",
                description: `Only ${product.stock} items available`,
                variant: "destructive",
                duration: 1000,
            })
            return
        }
        setQuantity(value)
    }

    const handlePriceTypeChange = (type: string) => {
        setSelectedPriceType(type)

        // Find first option of the selected type
        if (product) {
            const options = product.priceOptions.filter((option) => option.type === type)
            if (options.length > 0) {
                setSelectedPriceOption(options[0])
            }
        }
    }

    const handleAddToCart = () => {
        if (!product || !selectedPriceOption) return

        const currentCartItem = cart.find(
            (item) => item.id === product._id && item.priceOptionId === selectedPriceOption._id,
        )
        const currentQuantity = currentCartItem?.quantity || 0
        const totalQuantity = currentQuantity + quantity

        if (totalQuantity > product.stock) {
            toast({
                title: "Maximum stock reached",
                description: `Cannot add ${quantity} more items. Only ${product.stock - currentQuantity} available.`,
                variant: "destructive",
                duration: 1000,
            })
            return
        }

        // Determine the correct price to use (sale price takes priority)
        let price = selectedPriceOption.price

        if (selectedPriceOption.calculatedSalePrice && selectedPriceOption.calculatedSalePrice < selectedPriceOption.price) {
            price = selectedPriceOption.calculatedSalePrice
        } else if (selectedPriceOption.salePrice && selectedPriceOption.salePrice < selectedPriceOption.price) {
            price = selectedPriceOption.salePrice
        } else if (product.sale && product.sale > 0) {
            const discountMultiplier = (100 - product.sale) / 100
            price = Math.round(selectedPriceOption.price * discountMultiplier * 100) / 100
        }

        // Calculate original price and sale percentage
        let originalPrice = selectedPriceOption.price
        let salePercentage = 0

        if (selectedPriceOption.calculatedSalePrice && selectedPriceOption.calculatedSalePrice < selectedPriceOption.price) {
            originalPrice = selectedPriceOption.originalPrice || selectedPriceOption.price
            salePercentage = Math.round(((originalPrice - selectedPriceOption.calculatedSalePrice) / originalPrice) * 100)
        } else if (selectedPriceOption.salePrice && selectedPriceOption.salePrice < selectedPriceOption.price) {
            originalPrice = selectedPriceOption.price
            salePercentage = Math.round(((originalPrice - selectedPriceOption.salePrice) / originalPrice) * 100)
        } else if (product.sale && product.sale > 0) {
            originalPrice = selectedPriceOption.price
            salePercentage = product.sale
        }

        addToCart({
            id: product._id,
            name: product.name,
            price: price,
            originalPrice: originalPrice,
            salePercentage: salePercentage,
            quantity: quantity,
            image: product.images[0]?.url || "",
            stock: product.stock,
            priceOptionId: selectedPriceOption._id,
            weight: selectedPriceOption.weight,
            weightType: selectedPriceOption.type,
        })

        toast({
            title: "Added to cart",
            description: `${quantity} × ${product.name} added to your cart`,
            duration: 1000,
        })
    }

    const handleShareClick = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href)
            toast({
                title: "Link copied",
                description: "Product link copied to clipboard",
                duration: 1000,
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        })
    }

    // Format description with bullet points if it contains line breaks
    const formatDescription = (description: string) => {
        if (!description) return null

        // Check if description has bullet points or numbered lists
        if (description.includes("\r\n") || description.includes("\n")) {
            const paragraphs = description.split(/\r?\n/).filter((p) => p.trim() !== "")

            return (
                <div className="space-y-4">
                    {paragraphs.map((paragraph, index) => {
                        // Check if paragraph starts with a bullet point or number
                        if (
                            paragraph.trim().startsWith("•") ||
                            paragraph.trim().startsWith("-") ||
                            /^\d+\./.test(paragraph.trim())
                        ) {
                            return (
                                <p key={index} className="text-gray-700">
                                    {paragraph}
                                </p>
                            )
                        }

                        // Check if paragraph starts with a heading-like format (e.g., "Why Choose...")
                        if (paragraph.includes("?") || paragraph.includes(":")) {
                            const parts = paragraph.split(/[?:]/)
                            if (parts.length > 1) {
                                return (
                                    <div key={index}>
                                        <h3 className="font-medium text-gray-900">
                                            {parts[0]}
                                            {paragraph.includes("?") ? "?" : ":"}
                                        </h3>
                                        <p className="text-gray-700">{parts.slice(1).join(":")}</p>
                                    </div>
                                )
                            }
                        }

                        return (
                            <p key={index} className="text-gray-700">
                                {paragraph}
                            </p>
                        )
                    })}
                </div>
            )
        }

        // If no special formatting needed, return as a single paragraph
        return <p className="text-gray-700">{description}</p>
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (error || !product) {
        return <ErrorState error={error} />
    }

    // Calculate average rating
    const averageRating =
        reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0

    // Count ratings by star level
    const ratingCounts = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    }

    // Calculate percentages for rating bars
    const totalReviews = reviews.length
    const ratingPercentages = {
        5: totalReviews > 0 ? (ratingCounts[5] / totalReviews) * 100 : 0,
        4: totalReviews > 0 ? (ratingCounts[4] / totalReviews) * 100 : 0,
        3: totalReviews > 0 ? (ratingCounts[3] / totalReviews) * 100 : 0,
        2: totalReviews > 0 ? (ratingCounts[2] / totalReviews) * 100 : 0,
        1: totalReviews > 0 ? (ratingCounts[1] / totalReviews) * 100 : 0,
    }

    // Filter price options by selected type
    const filteredPriceOptions = product.priceOptions.filter((option) => option.type === selectedPriceType)

    // Get available price types
    const availablePriceTypes = Array.from(new Set(product.priceOptions.map((option) => option.type)))

    const getCategoryColor = () => {
        const colors = [
            "from-rose-500 to-orange-500",
            "from-emerald-500 to-teal-500",
            "from-violet-500 to-purple-500",
            "from-amber-400 to-yellow-500",
            "from-cyan-500 to-blue-500",
            "from-pink-500 to-fuchsia-500",
        ]

        // generate random 

        const charSum = Math.floor(Math.random() * 1000)
        return colors[charSum % colors.length]
    }

    // Get appropriate icon for category
    const getCategoryIcon = () => {


        return Tag
    }




    return (
        <>
            <div className="bg-white">
                {/* Breadcrumb */}


                {/* Product Details */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Product Images - Styled like Amna's website */}
                        <div>
                            <div className="relative h-96 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">

                                <Image
                                    src={selectedImage || product.images[0]?.url || "/placeholder.svg?height=600&width=600"}
                                    alt={product.name}

                                    width={900}
                                    height={900}
                                    className=" w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"

                                    priority
                                />



                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images.length > 1 && (
                                <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                                    {product.images.map((image) => (
                                        <div
                                            key={image._id}
                                            className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-md border ${selectedImage === image.url ? "border-purple-600 ring-1 ring-purple-600" : "border-gray-200"
                                                }`}
                                            onClick={() => handleImageClick(image.url)}
                                        >
                                            <Image
                                                src={image.url || "/placeholder.svg"}
                                                alt={`${product.name} thumbnail`}
                                                fill
                                                className="object-cover rounded-md p-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Brand Name */}
                            <div className="text-sm text-gray-500">MS Foods Naturals & Organics</div>

                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>

                                {/* Ratings Summary */}
                                {/* //if rating.lenght>0 then it sow other wise not show */}
                                {reviews.length > 0 &&
                                    <div className="flex items-center space-x-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                                        </span>
                                    </div>

                                }
                            </div>

                            {/* Price Display */}
                            <div className="mt-4">
                                {selectedPriceOption && (
                                    <div className="flex items-baseline">
                                        {(() => {
                                            // Check for calculated sale price from backend
                                            if (selectedPriceOption.calculatedSalePrice && selectedPriceOption.calculatedSalePrice < selectedPriceOption.price) {
                                                return (
                                                    <>
                                                        <p className="text-3xl font-bold text-red-600">
                                                            {formatPrice(selectedPriceOption.calculatedSalePrice)}
                                                        </p>
                                                        <p className="ml-2 text-lg text-gray-500 line-through">
                                                            {formatPrice(selectedPriceOption.originalPrice || selectedPriceOption.price)}
                                                        </p>
                                                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                            {selectedPriceOption.globalSalePercentage ? `${selectedPriceOption.globalSalePercentage}% OFF` : 'Sale'}
                                                        </span>
                                                    </>
                                                )
                                            }
                                            // Check for individual sale price
                                            else if (selectedPriceOption.salePrice && selectedPriceOption.salePrice < selectedPriceOption.price) {
                                                return (
                                                    <>
                                                        <p className="text-3xl font-bold text-red-600">
                                                            {formatPrice(selectedPriceOption.salePrice)}
                                                        </p>
                                                        <p className="ml-2 text-lg text-gray-500 line-through">
                                                            {formatPrice(selectedPriceOption.price)}
                                                        </p>
                                                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                                            Sale
                                                        </span>
                                                    </>
                                                )
                                            }
                                            // Check for global sale calculation
                                            else if (product.sale && product.sale > 0) {
                                                const originalPrice = selectedPriceOption.price || 0
                                                const discountMultiplier = (100 - product.sale) / 100
                                                const calculatedSalePrice = Math.round(originalPrice * discountMultiplier * 100) / 100

                                                if (calculatedSalePrice < originalPrice) {
                                                    return (
                                                        <>
                                                            <p className="text-3xl font-bold text-red-600">
                                                                {formatPrice(calculatedSalePrice)}
                                                            </p>
                                                            <p className="ml-2 text-lg text-gray-500 line-through">
                                                                {formatPrice(originalPrice)}
                                                            </p>
                                                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                                {product.sale}% OFF
                                                            </span>
                                                        </>
                                                    )
                                                }
                                            }

                                            // Default: no sale
                                            return (
                                                <p className="text-3xl font-bold text-gray-900">{formatPrice(selectedPriceOption.price)}</p>
                                            )
                                        })()}
                                    </div>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    {product.stock > 0 ? `In stock (${product.stock} available)` : "Sold Out"}
                                </p>
                            </div>

                            <Separator className="my-4" />

                            {/* Price Type Selection (if multiple types available) */}
                            {availablePriceTypes.length > 1 && (
                                <div>
                                    <h2 className="text-sm font-medium text-gray-700 mb-2">Option</h2>
                                    <div className="flex space-x-4">
                                        {availablePriceTypes.includes("packet") && (
                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-md ${selectedPriceType === "packet"
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    }`}
                                                onClick={() => handlePriceTypeChange("packet")}
                                            >
                                                Packet
                                            </button>
                                        )}
                                        {availablePriceTypes.includes("weight-based") && (
                                            <button
                                                type="button"
                                                className={`px-4 py-2 rounded-md ${selectedPriceType === "weight-based"
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    }`}
                                                onClick={() => handlePriceTypeChange("weight-based")}
                                            >
                                                By Weight
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Size/Weight Options */}
                            {filteredPriceOptions.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-medium text-gray-700 mb-2">
                                        {selectedPriceType === "weight-based" ? "Weight" : "Select Option"}
                                    </h2>
                                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {filteredPriceOptions.map((option) => (
                                            <button
                                                key={option._id}
                                                type="button"
                                                className={`relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium ${selectedPriceOption?._id === option._id
                                                    ? "border-purple-600 bg-purple-50 text-purple-700"
                                                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => setSelectedPriceOption(option)}
                                            >
                                                {selectedPriceType === "weight-based"
                                                    ? `${option.weight}g`
                                                    : (() => {
                                                        // Check for calculated sale price
                                                        if (option.calculatedSalePrice && option.calculatedSalePrice < option.price) {
                                                            return (
                                                                <div className="text-center">
                                                                    <div className="text-red-600 font-semibold">{formatPrice(option.calculatedSalePrice)}</div>
                                                                    <div className="text-xs text-gray-500 line-through">{formatPrice(option.originalPrice || option.price)}</div>
                                                                </div>
                                                            )
                                                        }
                                                        // Check for individual sale price
                                                        else if (option.salePrice && option.salePrice < option.price) {
                                                            return (
                                                                <div className="text-center">
                                                                    <div className="text-red-600 font-semibold">{formatPrice(option.salePrice)}</div>
                                                                    <div className="text-xs text-gray-500 line-through">{formatPrice(option.price)}</div>
                                                                </div>
                                                            )
                                                        }
                                                        // Default price
                                                        return formatPrice(option.price)
                                                    })()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div>
                                <h2 className="text-sm font-medium text-gray-700 mb-2">Quantity</h2>
                                <div className="flex items-center border border-gray-300 rounded-md w-32">
                                    <button
                                        type="button"
                                        className="p-2 text-gray-600 hover:text-gray-900 w-10 flex justify-center"
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center border-x border-gray-300 py-2">{quantity}</span>
                                    <button
                                        type="button"
                                        className="p-2 text-gray-600 hover:text-gray-900 w-10 flex justify-center"
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={product.stock <= quantity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}


                            <div className="pt-2 pb-2">
                                <div className="flex items-center gap-2 mb-3">

                                    <h3 className="text-lg font-medium">Categories</h3>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <AnimatePresence>
                                        {product.categories.map((category, index) => {
                                            const CategoryIcon = getCategoryIcon()
                                            const colorGradient = getCategoryColor()

                                            return (
                                                <motion.div
                                                    key={category._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{
                                                        opacity: animateIn ? 1 : 0,
                                                        y: animateIn ? 0 : 20,
                                                        transition: { delay: index * 0.1 },
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="relative"
                                                    onMouseEnter={() => setHoveredIndex(index)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        className={`relative overflow-hidden rounded-full px-4 py-2 font-medium transition-all duration-300 hover:text-white`}
                                                    >
                                                        <span className="relative z-10 flex items-center gap-1.5">
                                                            <CategoryIcon className="h-4 w-4" />
                                                            {category.name}
                                                        </span>

                                                        {/* Gradient background that appears on hover */}
                                                        <span
                                                            className={`absolute inset-0 bg-gradient-to-r ${colorGradient} opacity-0 transition-opacity duration-300 ${hoveredIndex === index ? "opacity-100" : ""}`}
                                                        />

                                                        {/* Subtle border gradient always visible */}
                                                        <span
                                                            className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorGradient} opacity-20 p-[1px]`}
                                                        />
                                                    </Button>

                                                    {/* Animated particles on hover */}
                                                    {hoveredIndex === index && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -inset-1 z-0">
                                                            {[...Array(5)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{
                                                                        x: 0,
                                                                        y: 0,
                                                                        opacity: 0.7,
                                                                        scale: 0.5 + Math.random() * 0.5,
                                                                    }}
                                                                    animate={{
                                                                        x: (Math.random() - 0.5) * 60,
                                                                        y: (Math.random() - 0.5) * 60,
                                                                        opacity: 0,
                                                                        scale: 0,
                                                                        transition: {
                                                                            duration: 0.8 + Math.random() * 0.5,
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "loop",
                                                                        },
                                                                    }}
                                                                    className={`absolute top-1/2 left-1/2 h-1 w-1 rounded-full bg-gradient-to-r ${colorGradient}`}
                                                                />
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* Category count badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
                                    className="mt-2"
                                >
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        {product.categories.length} {product.categories.length === 1 ? "category" : "categories"}
                                    </Badge>
                                </motion.div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                >

                                    <div className="flex items-center justify-center">
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        <span>Add to Cart</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="p-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleShareClick}
                                    aria-label="Share product"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                        <div className="prose max-w-none bg-gray-50 p-6 rounded-lg">{formatDescription(product.description)}</div>
                    </div>

                    {/* Customer Reviews */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Rating Summary */}
                            <div className="md:col-span-4">
                                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                                    <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                                    <div className="flex mt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-5 w-5 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Based on {reviews.length} reviews</p>

                                    <div className="w-full mt-4 space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <div key={rating} className="flex items-center">
                                                <div className="flex items-center mr-2">
                                                    <span className="text-sm text-gray-600">{rating}</span>
                                                    <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                    <div
                                                        className="h-2 bg-yellow-400 rounded-full"
                                                        style={{ width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%` }}
                                                    ></div>
                                                </div>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {ratingCounts[rating as keyof typeof ratingCounts]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Review List */}
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => {
                                        const hasImages = review.images && review.images.length > 0
                                        const isOpen = !!expandedReviews[review._id]

                                        return (
                                            <div key={review._id} className="border-b pb-6">
                                                <div className="flex items-center justify-between  w-96 ">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                                                            {review.user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="flex items-center">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {review.user.name}
                                                                </p>
                                                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                                    Verified
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center mt-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`h-4 w-4 ${star <= review.rating
                                                                            ? "text-yellow-400 fill-yellow-400"
                                                                            : "text-gray-300"
                                                                            }`}
                                                                    />
                                                                ))}
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    {formatDate(review.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {hasImages && (
                                                        <button
                                                            onClick={() =>
                                                                setExpandedReviews((prev) => ({
                                                                    ...prev,
                                                                    [review._id]: !prev[review._id],
                                                                }))
                                                            }
                                                            className="ml-auto"
                                                            aria-label={isOpen ? "Hide images" : "Show images"}
                                                        >
                                                            {isOpen ? (
                                                                <ChevronUp className="h-5 w-5 text-gray-600" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-gray-600" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4">
                                                    <p className="text-gray-700">{review.comment}</p>
                                                </div>

                                                {hasImages && isOpen && (
                                                    <div className="mt-4 flex space-x-12 overflow-auto w-full ">
                                                        {review.images.map((img, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="relative h-40 w-40 rounded-md overflow-hidden cursor-pointer"
                                                                onClick={() => setSelectedReviewImage(img)}
                                                            >
                                                                <Image
                                                                    src={img || "/placeholder.svg"}
                                                                    alt={`Review image ${idx + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No reviews yet for this product.</p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Lightbox Modal for Review Images */}

                    {selectedReviewImage && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                            onClick={() => setSelectedReviewImage(null)}
                        >
                            <div
                                className="relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-2 right-2 text-white"
                                    onClick={() => setSelectedReviewImage(null)}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                                <Image
                                    src={selectedReviewImage}
                                    alt="Enlarged review"
                                    width={800}
                                    height={600}
                                    className="max-w-[90vw] max-h-[90vh] mx-auto block object-contain"
                                />
                            </div>
                        </div>
                    )}



                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <div className='w-full flex justify-between items-center'>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
                                <Link href="/products" className="flex text-md font-bold text-black hover:underline mb-4">
                                    View All <ArrowBigRight />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                {relatedProducts.map((product) => (
                                    <div key={product._id} className="group relative">
                                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                                            <Image
                                                src={product.images[0]?.url || "/placeholder.svg?height=300&width=300"}
                                                alt={product.name}
                                                fill
                                                className="  group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {(product.sale || product.hasActiveSales) && (
                                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {product.sale ? `${product.sale}% OFF` : 'SALE'}
                                                </div>
                                            )}

                                            {/* Quick action buttons */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-opacity-20 transition-all duration-300">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/user/product/${product._id}`}
                                                        className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100"
                                                        aria-label="View product"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100"
                                                        aria-label="Add to cart"
                                                    >
                                                        <ShoppingBag className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-1">
                                            <div className="flex justify-between">
                                                <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                                    <Link href={`/user/product/${product._id}`}>
                                                        <span className="absolute inset-0" aria-hidden="true"></span>
                                                        {product.name}
                                                    </Link>
                                                </h3>
                                            </div>

                                            {product.priceOptions && product.priceOptions.length > 0 && (
                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {(() => {
                                                        const option = product.priceOptions[0]
                                                        // Check for calculated sale price
                                                        if (option.calculatedSalePrice && option.calculatedSalePrice < option.price) {
                                                            return (
                                                                <>
                                                                    <span className="text-red-600">Rs.{option.calculatedSalePrice.toLocaleString()}</span>
                                                                    <span className="ml-2 text-gray-500 line-through text-xs">
                                                                        Rs.{(option.originalPrice || option.price).toLocaleString()}
                                                                    </span>
                                                                </>
                                                            )
                                                        }
                                                        // Check for individual sale price
                                                        else if (option.salePrice && option.salePrice < option.price) {
                                                            return (
                                                                <>
                                                                    <span className="text-red-600">Rs.{option.salePrice.toLocaleString()}</span>
                                                                    <span className="ml-2 text-gray-500 line-through text-xs">
                                                                        Rs.{option.price.toLocaleString()}
                                                                    </span>
                                                                </>
                                                            )
                                                        }
                                                        // Default price
                                                        return <span>Rs.{option.price.toLocaleString()}</span>
                                                    })()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>

    )
}

function LoadingState() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-200 rounded-lg"></div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="aspect-square bg-gray-200 rounded-md"></div>
                            <div className="aspect-square bg-gray-200 rounded-md"></div>
                            <div className="aspect-square bg-gray-200 rounded-md"></div>
                            <div className="aspect-square bg-gray-200 rounded-md"></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="mt-12">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    )
}

function ErrorState({ error }: { error: string | null }) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">{error || "We couldn't find the product you're looking for."}</p>
            <Link href="/products" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700">
                Continue Shopping
            </Link>
        </div>
    )
}

