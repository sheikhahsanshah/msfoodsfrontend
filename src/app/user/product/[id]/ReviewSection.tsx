import { useState } from "react"
import { Star, ChevronDown, ChevronUp, X as XIcon } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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

interface ReviewProps {
    reviews: Review[]
}

export default function ReviewSection({ reviews }: ReviewProps) {
    // track which reviews have their images expanded
    const [expandedImages, setExpandedImages] = useState<Record<string, boolean>>({})
    // track which image is currently open in the lightbox
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const numOfReviews = reviews.length
    const productRating =
        reviews.reduce((acc, review) => acc + review.rating, 0) / numOfReviews

    const toggleImages = (reviewId: string) => {
        setExpandedImages((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }))
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        )
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

            {/* Overall Rating */}
            <div className="flex items-center mb-4">
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(productRating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                        />
                    ))}
                </div>
                <span className="ml-2 text-gray-600">
                    {productRating.toFixed(1)} out of 5 ({numOfReviews} reviews)
                </span>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
                {reviews.map((review) => {
                    const hasImages = review.images && review.images.length > 0
                    const isExpanded = !!expandedImages[review._id]

                    return (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-2">
                                {/* Avatar */}
                                <div className="mr-2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-semibold">
                                        {review.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Name & Rating */}
                                <div>
                                    <p className="font-semibold">{review.user.name}</p>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating
                                                        ? "text-yellow-400 fill-current"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Only show dropdown toggle if images exist */}
                                {hasImages && (
                                    <button
                                        onClick={() => toggleImages(review._id)}
                                        className="ml-auto"
                                        aria-label={
                                            isExpanded ? "Hide images" : "Show images"
                                        }
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Always show comment */}
                            <p className="text-gray-600 mb-2">{review.comment}</p>

                            {/* AnimatePresence for image collapse/expand */}
                            <AnimatePresence>
                                {hasImages && isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-2 flex space-x-2 overflow-hidden"
                                    >
                                        {review.images.map((imgUrl, idx) => (
                                            <div
                                                key={idx}
                                                className="relative w-24 h-24 rounded-md overflow-hidden cursor-pointer"
                                                onClick={() => setSelectedImage(imgUrl)}
                                            >
                                                <Image
                                                    src={imgUrl || "/placeholder.svg"}
                                                    alt={`Review image ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Timestamp */}
                            <p className="text-sm text-gray-400 mt-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-white"
                            onClick={() => setSelectedImage(null)}
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                        <Image
                            src={selectedImage}
                            alt="Enlarged review image"
                            width={800}
                            height={800}
                            className="object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
