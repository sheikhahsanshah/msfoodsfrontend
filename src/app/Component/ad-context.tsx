"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

// Define the Ad type based on your backend model
export type Ad = {
    _id: string
    title?: string
    text?: string
    startDate?: string
    endDate?: string
    mobileImage?: string
    desktopImage?: string
    location: string
    isActive?: boolean
    backgroundColor?: string
    textColor?: string
    ctaText?: string
    ctaUrl?: string
}

type AdContextType = {
    ads: Record<string, Ad[]>
    loading: boolean
    error: string | null
    fetchAdsByLocation: (location: string) => void
}

const AdContext = createContext<AdContextType | undefined>(undefined)

export function AdProvider({ children }: { children: React.ReactNode }) {
    const [ads, setAds] = useState<Record<string, Ad[]>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAdsByLocation = useCallback(async (location: string) => {
        if (ads[location]) return // Don't fetch if we already have ads for this location

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ad/${location}`)

            if (!response.ok) {
                throw new Error("Failed to fetch ads")
            }

            const data = await response.json()

            setAds((prev) => ({
                ...prev,
                [location]: data,
            }))
        } catch (err) {
            console.error("Error fetching ads:", err)
            setError("Failed to load advertisements")
        } finally {
            setLoading(false)
        }
    }, [ads])

    // Prefetch common ad locations on mount
    useEffect(() => {
        const commonLocations = ["header", "sidebar", "footer"]
        commonLocations.forEach((location) => {
            fetchAdsByLocation(location)
        })
    }, [fetchAdsByLocation])

    return <AdContext.Provider value={{ ads, loading, error, fetchAdsByLocation }}>{children}</AdContext.Provider>
}

export function useAds() {
    const context = useContext(AdContext)
    if (context === undefined) {
        throw new Error("useAds must be used within an AdProvider")
    }
    return context
}

export function useAdsByLocation(location: string) {
    const { ads, loading, error, fetchAdsByLocation } = useAds()

    useEffect(() => {
        fetchAdsByLocation(location)
    }, [location, fetchAdsByLocation])

    return {
        ads: ads[location] || [],
        loading,
        error,
    }
}
