"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type AdBannerProps = {
    id?: string
    title?: string
    text?: string
    startDate?: string
    endDate?: string
    mobileImage?: string
    desktopImage?: string
    location: string
    isActive?: boolean
    className?: string
    onClick?: () => void
    onClose?: () => void
    showCloseButton?: boolean
    ctaText?: string
    ctaUrl?: string
    backgroundColor?: string
    textColor?: string
}

export function PremiumAdBanner({
    title = "big sale comming",
    text = "this is the bi sale on all the store",
    endDate,
    className,
    onClick,
    ctaText = "Shop Now",
    ctaUrl = "/products",
    backgroundColor = "#FFF8E1", // Warm cream background
    textColor = "#5D4037", // Deep brown text
}: AdBannerProps) {
    const isMobile = useIsMobile()
    const [timeRemaining, setTimeRemaining] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)
    const [isVisible] = useState(true)

    // Calculate and update time remaining
    useEffect(() => {
        if (!endDate) return

        const calculateTimeRemaining = () => {
            const now = new Date()
            const end = new Date(endDate)
            const diff = end.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeRemaining({ days, hours, minutes, seconds })
        }

        calculateTimeRemaining()
        const timer = setInterval(calculateTimeRemaining, 1000)

        return () => clearInterval(timer)
    }, [endDate])

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else if (ctaUrl) {
            window.location.href = ctaUrl
        }
    }

    

    // Don't render if not visible
    if (!isVisible) return null

    // Get the appropriate image based on device

    // Mobile layout
    if (isMobile) {
        return (
            <div
                className={cn("w-full overflow-hidden cursor-pointer", className)}
                style={{ backgroundColor }}
                onClick={handleClick}
            >
                <div className="flex flex-col px-3 py-2">
                    {/* Top row with title and button */}
                    <div className="flex justify-between items-center mb-1">
                        {/* Title */}
                        <h3 className="text-base font-bold" style={{ color: textColor }}>
                            {title}
                        </h3>

                        {/* CTA Button */}
                        <button className="flex items-center space-x-1 px-3 py-1 bg-black text-white rounded-full text-xs">
                            <span>{ctaText}</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                    </div>

                    {/* Middle row with timer */}
                    {timeRemaining && (
                        <div className="flex justify-center items-center my-1">
                            <Clock className="h-4 w-4 mr-1" style={{ color: textColor }} />
                            <div className="flex space-x-1 font-mono text-xs font-medium" style={{ color: textColor }}>
                                <div className="flex flex-col items-center">
                                    <span className="bg-black/10 px-1 py-0.5 rounded">
                                        {timeRemaining.days.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] mt-0.5">d</span>
                                </div>
                                <span className="self-center">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-black/10 px-1 py-0.5 rounded">
                                        {timeRemaining.hours.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] mt-0.5">h</span>
                                </div>
                                <span className="self-center">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-black/10 px-1 py-0.5 rounded">
                                        {timeRemaining.minutes.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] mt-0.5">m</span>
                                </div>
                                <span className="self-center">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-black/10 px-1 py-0.5 rounded">
                                        {timeRemaining.seconds.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] mt-0.5">s</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom row with description */}
                    {text && (
                        <p className="text-xs text-center mt-1" style={{ color: textColor }}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Desktop layout - exactly as in the sketch
    return (
        <div
            className={cn("w-full overflow-hidden cursor-pointer", className)}
            style={{ backgroundColor }}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between h-16 w-full">
               

                {/* Middle section - Title and Text */}
                <div className="flex flex-col justify-center px-4" style={{ color: textColor }}>
                    {title && <h3 className="text-base font-bold">{title}</h3>}
                    {text && <p className="text-xs">{text}</p>}
                </div>

                <div className="w-1/3">
                {/* Timer section */}
                {timeRemaining && (
                    <div className="flex items-center justify-center ml-auto mr-4  ">
                        <Clock className="h-4 w-4 mr-1" style={{ color: textColor }} />
                        <div className="flex space-x-1 font-mono text-xs font-medium" style={{ color: textColor }}>
                            <div className="flex flex-col items-center">
                                <span className="bg-black/10 px-1 py-0.5 rounded">
                                    {timeRemaining.days.toString().padStart(2, "0")}
                                </span>
                                <span className="text-[10px] mt-0.5">d</span>
                            </div>
                            <span className="self-center">:</span>
                            <div className="flex flex-col items-center">
                                <span className="bg-black/10 px-1 py-0.5 rounded">
                                    {timeRemaining.hours.toString().padStart(2, "0")}
                                </span>
                                <span className="text-[10px] mt-0.5">h</span>
                            </div>
                            <span className="self-center">:</span>
                            <div className="flex flex-col items-center">
                                <span className="bg-black/10 px-1 py-0.5 rounded">
                                    {timeRemaining.minutes.toString().padStart(2, "0")}
                                </span>
                                <span className="text-[10px] mt-0.5">m</span>
                            </div>
                            <span className="self-center">:</span>
                            <div className="flex flex-col items-center">
                                <span className="bg-black/10 px-1 py-0.5 rounded">
                                    {timeRemaining.seconds.toString().padStart(2, "0")}
                                </span>
                                <span className="text-[10px] mt-0.5">s</span>
                            </div>
                        </div>
                    </div>  
                )}
                </div>

                {/* Right section - Text and CTA Button */}
                <div className="flex items-center mr-4">
                    <button className="flex items-center space-x-1 px-4 py-2 bg-black text-white rounded-full text-sm">
                        <span>{ctaText}</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    )
}
