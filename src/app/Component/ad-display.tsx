"use client"

import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { type Ad, useAdsByLocation } from "@/app/Component/ad-context"
import { cn } from "@/lib/utils"
import { Clock, ExternalLink } from "lucide-react"
import Image from "next/image"

type AdDisplayProps = {
    location: string
    className?: string
    onClick?: (ad: Ad) => void
}

export function AdDisplay({ location, className, onClick }: AdDisplayProps) {
    const isMobile = useIsMobile()
    const { ads, loading, error } = useAdsByLocation(location)
    const [currentAdIndex, setCurrentAdIndex] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

    // Get current ad or return null if no ads
    const currentAd = ads.length > 0 ? ads[currentAdIndex] : null

    // Rotate ads every 10 seconds if there are multiple
    useEffect(() => {
        if (ads.length <= 1) return

        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % ads.length)
        }, 10000)

        return () => clearInterval(interval)
    }, [ads.length])

    // Calculate and update time remaining for the current ad
    useEffect(() => {
        if (!currentAd?.endDate) return

        const calculateTimeRemaining = () => {
            const now = new Date()
            const end = new Date(currentAd.endDate as string)
            const diff = end.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining(0)
                return
            }

            setTimeRemaining(diff)
        }

        calculateTimeRemaining()
        const timer = setInterval(calculateTimeRemaining, 1000)

        return () => clearInterval(timer)
    }, [currentAd])

    // Format time remaining
    const formatTimeRemaining = () => {
        if (timeRemaining === null) return null

        const seconds = Math.floor((timeRemaining / 1000) % 60)
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60)
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))

        if (days > 0) {
            return `${days}d ${hours}h`
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`
        } else {
            return `${minutes}m ${seconds}s`
        }
    }

    // Handle ad click
    const handleClick = () => {
        if (currentAd && onClick) {
            onClick(currentAd)
        }
    }

    // Show loading state
    if (loading) {
        return (
            <div className={cn("animate-pulse bg-muted rounded-lg", className)}>
                <div className="h-40 w-full bg-muted-foreground/20 rounded-lg"></div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return null // Don't show anything if there's an error
    }

    // Show empty state
    if (!currentAd) {
        return null // Don't show anything if there are no ads
    }

    // Get the appropriate image based on device
    const imageUrl = isMobile ? currentAd.mobileImage : currentAd.desktopImage || currentAd.mobileImage // Fallback to mobile image if desktop not available

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg cursor-pointer",
                className,
            )}
            onClick={handleClick}
        >
            {/* Ad Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {imageUrl ? (
                    <Image src={imageUrl || "/placeholder.svg"} fill
                        alt={currentAd.title || "Advertisement"} className="h-full w-full object-cover transition-transform hover:scale-105" />

                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
                        <span className="text-lg font-bold text-white">{currentAd.title || "Special Offer"}</span>
                    </div>
                )}

                {/* Timer Badge */}
                {timeRemaining !== null && timeRemaining > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeRemaining()}</span>
                    </div>
                )}
            </div>

            {/* Ad Content */}
            {(currentAd.title || currentAd.text) && (
                <div className="p-3">
                    {currentAd.title && <h3 className="font-medium text-foreground">{currentAd.title}</h3>}
                    {currentAd.text && <p className="mt-1 text-sm text-muted-foreground">{currentAd.text}</p>}
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        <span>Sponsored</span>
                    </div>
                </div>
            )}

            {/* Ad Indicator (if multiple ads) */}
            {ads.length > 1 && (
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {ads.map((_: Ad, index) => (
                        <div
                            key={index}
                            className={cn("h-1.5 w-1.5 rounded-full bg-white/50", index === currentAdIndex && "bg-white")}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
