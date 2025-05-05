"use client"

import { useState, useEffect } from "react"
import { PremiumAdBanner } from "./premium-ad-banner"
import { useAdsByLocation } from "./ad-context"

type MSFoodsAdProps = {
    location: string
    className?: string
}

export function MSFoodsAd({ location, className }: MSFoodsAdProps) {
    const { ads, loading } = useAdsByLocation(location)
    const [currentAdIndex, setCurrentAdIndex] = useState(0)

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

    // Show loading state
    if (loading) {
        return <div className={`animate-pulse bg-gray-100 h-10 w-full rounded-none ${className}`}></div>
    }

    // If no ads available, show a default ad
    if (!currentAd) {
        return (
            <PremiumAdBanner
                location={location}
                title="big sale comming"
                text="this is the bi sale on all the store"
                endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()} // 7 days from now
                backgroundColor="#FFF8E1" // Warm cream background
                textColor="#5D4037" // Deep brown text
                className={className}
            />
        )
    }

    // Return the current ad with updated color scheme
    return (
        <PremiumAdBanner
            id={currentAd._id}
            title={currentAd.title}
            text={currentAd.text}
            startDate={currentAd.startDate}
            endDate={currentAd.endDate}
            mobileImage={currentAd.mobileImage}
            desktopImage={currentAd.desktopImage}
            location={location}
            isActive={currentAd.isActive}
            backgroundColor={currentAd.backgroundColor || "#FFF8E1"} // Warm cream background
            textColor={currentAd.textColor || "#5D4037"} // Deep brown text
            ctaText={currentAd.ctaText || "Shop Now"}
            ctaUrl={currentAd.ctaUrl}
            className={className}
        />
    )
}
