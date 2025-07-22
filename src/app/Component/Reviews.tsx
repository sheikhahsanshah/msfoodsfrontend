"use client"

import { useState, useEffect, useRef } from "react"
// import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
// import { useMobile } from "@/hooks/use-mobilee"

// Review data
const reviews = [
  {
    id: 1,
    name: "Ahsan",
    role: "Marketing Director",
    content:
      "MS Foods offers the best selection of premium-quality spices and dry fruits. The aroma of their freshly packed spices is simply unmatched, and the nuts are always fresh and crunchy. A must-visit for anyone who loves authentic flavors!",
  },
  {
    id: 2,
    name: "Irfan Asif",
    role: "Manager",
    content:
      "At MS Foods, our mission has always been to deliver purity and quality with every product. From picking the finest spices to ensuring each dry fruit retains its natural freshness, we’re committed to offering nothing but the best. We thank our loyal customers for trusting us on this flavorful journey..",
  },
 ];


export default function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
//   const isMobile = useMobile()

  // Handle navigation
  const goToSlide = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToPrevSlide = () => {
    const newIndex = currentIndex === 0 ? reviews.length - 1 : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNextSlide = () => {
    const newIndex = currentIndex === reviews.length - 1 ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }

  // Auto-play functionality
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1))
      }, 5000) // Change slide every 5 seconds
    }

    startAutoPlay()

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [])

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Hero Image - Different for mobile and desktop */}
      <div className="flex justify-center items-center ms-4 ">
        <h2 className="text-2xl font-bold">Hear From Us</h2>
      </div>
      

      {/* Reviews Carousel */}
      <div className="w-full  px-4  md:px-8">
        <div className="max-w-4xl mx-auto relative">
          {/* Current Review */}
          <div className="min-h-[250px] flex flex-col items-center justify-center">
            <div
              className={cn("transition-opacity duration-500 text-center", isAnimating ? "opacity-0" : "opacity-100")}
            >
              <h3 className="text-xl md:text-2xl font-medium mb-1">{reviews[currentIndex].name}</h3>
              <p className="text-sm md:text-base text-gray-600 mb-8">{reviews[currentIndex].role}</p>
              <p className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto">{reviews[currentIndex].content}</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center  gap-2">
            <button
              onClick={goToPrevSlide}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2 mx-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentIndex === index ? "w-6 bg-gray-900" : "bg-gray-300 hover:bg-gray-400",
                  )}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextSlide}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

