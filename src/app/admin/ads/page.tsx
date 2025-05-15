"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Edit, Trash2, Loader2, Upload, X, Search, Plus, Calendar, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Ad {
    _id: string
    title: string
    text?: string
    startDate: string
    endDate: string
    mobileImage: string
    desktopImage: string
    location: "header" | "sidebar" | "footer"
    isActive: boolean
    createdAt: string
}

interface HeroImage {
    _id: string
    mobileImage: {
        url: string
        public_id: string
    }
    desktopImage: {
        url: string
        public_id: string
    }
    isActive: boolean
    createdAt: string
}

export default function AdsPage() {
    const [ads, setAds] = useState<Ad[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddAdDialogOpen, setIsAddAdDialogOpen] = useState(false)
    const [isEditAdDialogOpen, setIsEditAdDialogOpen] = useState(false)
    const [currentAd, setCurrentAd] = useState<Ad | null>(null)
    const [newAd, setNewAd] = useState({
        title: "",
        text: "",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        location: "header" as "header" | "sidebar" | "footer",
        isActive: true,
    })

    // Image handling states
    const [mobileImage, setMobileImage] = useState<File | null>(null)
    const [desktopImage, setDesktopImage] = useState<File | null>(null)
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null)
    const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null)
    const [editMobileImage, setEditMobileImage] = useState<File | null>(null)
    const [editDesktopImage, setEditDesktopImage] = useState<File | null>(null)
    const [editMobileImagePreview, setEditMobileImagePreview] = useState<string | null>(null)
    const [editDesktopImagePreview, setEditDesktopImagePreview] = useState<string | null>(null)

    // Preview states
    const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("desktop")

    // Hero image states
    const [heroImages, setHeroImages] = useState<HeroImage[]>([])
    const [isAddHeroDialogOpen, setIsAddHeroDialogOpen] = useState(false)
    const [heroMobileImage, setHeroMobileImage] = useState<File | null>(null)
    const [heroDesktopImage, setHeroDesktopImage] = useState<File | null>(null)
    const [heroMobileImagePreview, setHeroMobileImagePreview] = useState<string | null>(null)
    const [heroDesktopImagePreview, setHeroDesktopImagePreview] = useState<string | null>(null)
    const [isHeroLoading, setIsHeroLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("ads")

    const { toast } = useToast()

    // Helper function for authenticated API requests
    const authFetch = async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem("accessToken")
        const headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        }
        return fetch(url, { ...options, headers })
    }

    // Fetch all ads
    const fetchAds = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await authFetch(`${API_URL}/api/ad`)
            const data = await response.json()

            if (!response.ok) throw new Error("Failed to fetch ads")
            setAds(Array.isArray(data) ? data : [])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch ads",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    // Fetch hero images
    const fetchHeroImages = useCallback(async () => {
        try {
            setIsHeroLoading(true)
            const response = await authFetch(`${API_URL}/api/hero`)
            const data = await response.json()

            if (!response.ok) throw new Error("Failed to fetch hero images")
            setHeroImages(data.success ? [data.data] : [])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch hero images",
            })
        } finally {
            setIsHeroLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchAds()
        fetchHeroImages()
    }, [fetchAds, fetchHeroImages])

    // Delete an ad
    const handleDeleteAd = async (adId: string) => {
        if (!confirm("Are you sure you want to delete this ad?")) return

        setIsLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/ad/${adId}`, { method: "DELETE" })
            if (!response.ok) throw new Error("Failed to delete ad")

            fetchAds()
            toast({ title: "Success", description: "Ad deleted successfully" })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete ad",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a hero image
    const handleDeleteHeroImage = async (heroId: string) => {
        if (!confirm("Are you sure you want to delete this hero image?")) return

        setIsHeroLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/hero/${heroId}`, { method: "DELETE" })
            if (!response.ok) throw new Error("Failed to delete hero image")

            fetchHeroImages()
            toast({ title: "Success", description: "Hero image deleted successfully" })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete hero image",
            })
        } finally {
            setIsHeroLoading(false)
        }
    }

    // Add a new ad
    const handleAddAd = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!mobileImage || !desktopImage) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Both mobile and desktop images are required",
            })
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", newAd.title)
            formData.append("text", newAd.text || "")
            formData.append("startDate", newAd.startDate)
            formData.append("endDate", newAd.endDate)
            formData.append("location", newAd.location)
            formData.append("isActive", String(newAd.isActive))
            formData.append("mobileImage", mobileImage)
            formData.append("desktopImage", desktopImage)

            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/ad`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to add ad")
            }

            fetchAds()
            setIsAddAdDialogOpen(false)
            resetForm()
            toast({ title: "Success", description: "Ad added successfully" })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add ad",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Add a new hero image
    const handleAddHeroImage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!heroMobileImage || !heroDesktopImage) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Both mobile and desktop hero images are required",
            })
            return
        }

        setIsHeroLoading(true)
        try {
            const formData = new FormData()
            formData.append("mobileImage", heroMobileImage)
            formData.append("desktopImage", heroDesktopImage)

            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/hero`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to add hero image")
            }

            fetchHeroImages()
            setIsAddHeroDialogOpen(false)
            resetHeroForm()
            toast({ title: "Success", description: "Hero image added successfully" })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add hero image",
            })
        } finally {
            setIsHeroLoading(false)
        }
    }

    // Update an existing ad
    const handleUpdateAd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentAd) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", currentAd.title)
            formData.append("text", currentAd.text || "")
            formData.append("startDate", currentAd.startDate)
            formData.append("endDate", currentAd.endDate)
            formData.append("location", currentAd.location)
            formData.append("isActive", String(currentAd.isActive))

            if (editMobileImage) formData.append("mobileImage", editMobileImage)
            if (editDesktopImage) formData.append("desktopImage", editDesktopImage)

            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/api/ad/${currentAd._id}`, {
                method: "PUT",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update ad")
            }

            fetchAds()
            setIsEditAdDialogOpen(false)
            setCurrentAd(null)
            resetEditImageStates()
            toast({ title: "Success", description: "Ad updated successfully" })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update ad",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Handle image changes and previews
    const handleImageChange =
        (
            setter: React.Dispatch<React.SetStateAction<File | null>>,
            previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
        ) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0]
                    setter(file)

                    const reader = new FileReader()
                    reader.onloadend = () => previewSetter(reader.result as string)
                    reader.readAsDataURL(file)
                }
            }

    // Reset form and state helpers
    const resetForm = () => {
        setNewAd({
            title: "",
            text: "",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: "header",
            isActive: true,
        })
        setMobileImage(null)
        setDesktopImage(null)
        setMobileImagePreview(null)
        setDesktopImagePreview(null)
    }

    const resetHeroForm = () => {
        setHeroMobileImage(null)
        setHeroDesktopImage(null)
        setHeroMobileImagePreview(null)
        setHeroDesktopImagePreview(null)
    }

    const resetEditImageStates = () => {
        setEditMobileImage(null)
        setEditDesktopImage(null)
        setEditMobileImagePreview(null)
        setEditDesktopImagePreview(null)
    }

    const clearImagePreview = (
        imageSetter: React.Dispatch<React.SetStateAction<File | null>>,
        previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    ) => {
        imageSetter(null)
        previewSetter(null)
    }

    // Filter ads based on search term
    const filteredAds = ads.filter(
        (ad) =>
            ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ad.text && ad.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ad.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Get active ads for preview
    const getActiveAdsForPreview = (location: string) => {
        return ads.filter(
            (ad) =>
                ad.isActive &&
                ad.location === location &&
                new Date(ad.startDate) <= new Date() &&
                new Date(ad.endDate) >= new Date(),
        )
    }

    // UI helper functions
    const getLocationBadgeColor = (location: string) => {
        const colors = {
            header: "bg-purple-100 text-purple-800",
            sidebar: "bg-orange-100 text-orange-800",
            footer: "bg-blue-100 text-blue-800",
        }
        return colors[location as keyof typeof colors] || "bg-gray-100 text-gray-800"
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "PPP")
        } catch {
            return "Invalid date"
        }
    }

    // Check if ad is currently active based on date range
    const isAdActive = (ad: Ad) => {
        const now = new Date()
        const start = new Date(ad.startDate)
        const end = new Date(ad.endDate)
        return ad.isActive && start <= now && end >= now
    }

    // Get remaining time for an ad
    const getRemainingTime = (endDate: string) => {
        const end = new Date(endDate)
        const now = new Date()

        if (end <= now) return "Expired"

        const diffMs = end.getTime() - now.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h remaining`
        } else {
            return `${diffHours}h remaining`
        }
    }

    // Loading state
    if ((isLoading && !ads.length) || (isHeroLoading && !heroImages.length)) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Content Management</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="ads">Advertisements</TabsTrigger>
                    <TabsTrigger value="hero">Hero Images</TabsTrigger>
                </TabsList>

                <TabsContent value="ads">
                    <Card className="mb-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Advertisements</CardTitle>
                            <Dialog open={isAddAdDialogOpen} onOpenChange={setIsAddAdDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Ad
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <ScrollArea className="h-[350px] border rounded-md p-8 ">
                                        <DialogHeader>
                                            <DialogTitle>Add New Advertisement</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddAd} className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newAd.title}
                                                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="text">Text (Optional)</Label>
                                                <Textarea
                                                    id="text"
                                                    value={newAd.text}
                                                    onChange={(e) => setNewAd({ ...newAd, text: e.target.value })}
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Date Range Pickers */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="startDate">Start Date</Label>
                                                    <div className="mt-1">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    {formatDate(newAd.startDate)}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={new Date(newAd.startDate)}
                                                                    onSelect={(date) => date && setNewAd({ ...newAd, startDate: date.toISOString() })}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="endDate">End Date</Label>
                                                    <div className="mt-1">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    {formatDate(newAd.endDate)}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={new Date(newAd.endDate)}
                                                                    onSelect={(date) => date && setNewAd({ ...newAd, endDate: date.toISOString() })}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="location">Location</Label>
                                                <Select
                                                    value={newAd.location}
                                                    onValueChange={(value) =>
                                                        setNewAd({ ...newAd, location: value as "header" | "sidebar" | "footer" })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select location" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="header">Header</SelectItem>
                                                        <SelectItem value="sidebar">Sidebar</SelectItem>
                                                        <SelectItem value="footer">Footer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Mobile Image Upload */}
                                                <div>
                                                    <Label htmlFor="mobileImage">Mobile Image</Label>
                                                    <div className="mt-1">
                                                        {mobileImagePreview ? (
                                                            <div className="relative w-full h-40 mb-2">
                                                                <Image
                                                                    src={mobileImagePreview || "/placeholder.svg"}
                                                                    alt="Mobile preview"
                                                                    fill
                                                                    className="object-cover rounded-md"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6"
                                                                    onClick={() => clearImagePreview(setMobileImage, setMobileImagePreview)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full">
                                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                                            <span className="font-semibold">Mobile Image</span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            PNG, JPG or JPEG (MAX. 5MB)
                                                                        </p>
                                                                    </div>
                                                                    <input
                                                                        id="mobileImage"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                        onChange={handleImageChange(setMobileImage, setMobileImagePreview)}
                                                                        required
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desktop Image Upload */}
                                                <div>
                                                    <Label htmlFor="desktopImage">Desktop Image</Label>
                                                    <div className="mt-1">
                                                        {desktopImagePreview ? (
                                                            <div className="relative w-full h-40 mb-2">
                                                                <Image
                                                                    src={desktopImagePreview || "/placeholder.svg"}
                                                                    alt="Desktop preview"
                                                                    fill
                                                                    className="object-cover rounded-md"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6"
                                                                    onClick={() => clearImagePreview(setDesktopImage, setDesktopImagePreview)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full">
                                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                                            <span className="font-semibold">Desktop Image</span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            PNG, JPG or JPEG (MAX. 5MB)
                                                                        </p>
                                                                    </div>
                                                                    <input
                                                                        id="desktopImage"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                        onChange={handleImageChange(setDesktopImage, setDesktopImagePreview)}
                                                                        required
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="isActive"
                                                    checked={newAd.isActive}
                                                    onCheckedChange={(checked) => setNewAd({ ...newAd, isActive: checked })}
                                                />
                                                <Label htmlFor="isActive">Active</Label>
                                            </div>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                                    </>
                                                ) : (
                                                    "Add Advertisement"
                                                )}
                                            </Button>
                                        </form>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    placeholder="Search ads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Images</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Timeline</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAds.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No ads found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAds.map((ad) => (
                                                <TableRow key={ad._id}>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                                                <Image
                                                                    src={ad.mobileImage || "/placeholder.svg"}
                                                                    alt={`${ad.title} mobile`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[8px] text-center">
                                                                    Mobile
                                                                </div>
                                                            </div>
                                                            <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                                                <Image
                                                                    src={ad.desktopImage || "/placeholder.svg"}
                                                                    alt={`${ad.title} desktop`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[8px] text-center">
                                                                    Desktop
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{ad.title}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getLocationBadgeColor(ad.location)}`}>
                                                            {ad.location.charAt(0).toUpperCase() + ad.location.slice(1)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="text-xs text-muted-foreground">Start: {formatDate(ad.startDate)}</div>
                                                            <div className="text-xs text-muted-foreground">End: {formatDate(ad.endDate)}</div>
                                                            <div className="text-xs font-medium">
                                                                {isAdActive(ad) ? (
                                                                    <span className="text-green-600">{getRemainingTime(ad.endDate)}</span>
                                                                ) : (
                                                                    <span className="text-red-600">
                                                                        {new Date(ad.startDate) > new Date() ? "Not started yet" : "Expired"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs ${ad.isActive && isAdActive(ad)
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {ad.isActive && isAdActive(ad) ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Dialog
                                                            open={isEditAdDialogOpen && currentAd?._id === ad._id}
                                                            onOpenChange={(open) => {
                                                                setIsEditAdDialogOpen(open)
                                                                if (!open) {
                                                                    setCurrentAd(null)
                                                                    resetEditImageStates()
                                                                }
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setCurrentAd(ad)
                                                                        setEditMobileImagePreview(ad.mobileImage)
                                                                        setEditDesktopImagePreview(ad.desktopImage)
                                                                    }}
                                                                    className="mr-2"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                {currentAd && (
                                                                    <>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Edit Advertisement</DialogTitle>
                                                                        </DialogHeader>
                                                                        <form onSubmit={handleUpdateAd} className="space-y-4">
                                                                            <div>
                                                                                <Label htmlFor="edit-title">Title</Label>
                                                                                <Input
                                                                                    id="edit-title"
                                                                                    value={currentAd.title}
                                                                                    onChange={(e) => setCurrentAd({ ...currentAd, title: e.target.value })}
                                                                                    required
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label htmlFor="edit-text">Text (Optional)</Label>
                                                                                <Textarea
                                                                                    id="edit-text"
                                                                                    value={currentAd.text || ""}
                                                                                    onChange={(e) => setCurrentAd({ ...currentAd, text: e.target.value })}
                                                                                    rows={3}
                                                                                />
                                                                            </div>

                                                                            {/* Edit Date Range Pickers */}
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <Label htmlFor="edit-startDate">Start Date</Label>
                                                                                    <div className="mt-1">
                                                                                        <Popover>
                                                                                            <PopoverTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    className="w-full justify-start text-left font-normal"
                                                                                                >
                                                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                                                    {formatDate(currentAd.startDate)}
                                                                                                </Button>
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent className="w-auto p-0">
                                                                                                <CalendarComponent
                                                                                                    mode="single"
                                                                                                    selected={new Date(currentAd.startDate)}
                                                                                                    onSelect={(date) =>
                                                                                                        date &&
                                                                                                        setCurrentAd({ ...currentAd, startDate: date.toISOString() })
                                                                                                    }
                                                                                                    initialFocus
                                                                                                />
                                                                                            </PopoverContent>
                                                                                        </Popover>
                                                                                    </div>
                                                                                </div>

                                                                                <div>
                                                                                    <Label htmlFor="edit-endDate">End Date</Label>
                                                                                    <div className="mt-1">
                                                                                        <Popover>
                                                                                            <PopoverTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    className="w-full justify-start text-left font-normal"
                                                                                                >
                                                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                                                    {formatDate(currentAd.endDate)}
                                                                                                </Button>
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent className="w-auto p-0">
                                                                                                <CalendarComponent
                                                                                                    mode="single"
                                                                                                    selected={new Date(currentAd.endDate)}
                                                                                                    onSelect={(date) =>
                                                                                                        date && setCurrentAd({ ...currentAd, endDate: date.toISOString() })
                                                                                                    }
                                                                                                    initialFocus
                                                                                                />
                                                                                            </PopoverContent>
                                                                                        </Popover>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <Label htmlFor="edit-location">Location</Label>
                                                                                <Select
                                                                                    value={currentAd.location}
                                                                                    onValueChange={(value) =>
                                                                                        setCurrentAd({
                                                                                            ...currentAd,
                                                                                            location: value as "header" | "sidebar" | "footer",
                                                                                        })
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select location" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="header">Header</SelectItem>
                                                                                        <SelectItem value="sidebar">Sidebar</SelectItem>
                                                                                        <SelectItem value="footer">Footer</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>

                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                {/* Edit Mobile Image */}
                                                                                <div>
                                                                                    <Label htmlFor="edit-mobileImage">Mobile Image</Label>
                                                                                    <div className="mt-1">
                                                                                        <div className="relative w-full h-40 mb-2">
                                                                                            <Image
                                                                                                src={editMobileImagePreview || "/placeholder.svg"}
                                                                                                alt="Mobile preview"
                                                                                                fill
                                                                                                className="object-cover rounded-md"
                                                                                            />
                                                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                                                <label className="cursor-pointer bg-white text-black px-3 py-1 rounded-md text-sm">
                                                                                                    Change Image
                                                                                                    <input
                                                                                                        id="edit-mobileImage"
                                                                                                        type="file"
                                                                                                        className="hidden"
                                                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                                                        onChange={handleImageChange(
                                                                                                            setEditMobileImage,
                                                                                                            setEditMobileImagePreview,
                                                                                                        )}
                                                                                                    />
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Edit Desktop Image */}
                                                                                <div>
                                                                                    <Label htmlFor="edit-desktopImage">Desktop Image</Label>
                                                                                    <div className="mt-1">
                                                                                        <div className="relative w-full h-40 mb-2">
                                                                                            <Image
                                                                                                src={editDesktopImagePreview || "/placeholder.svg"}
                                                                                                alt="Desktop preview"
                                                                                                fill
                                                                                                className="object-cover rounded-md"
                                                                                            />
                                                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                                                <label className="cursor-pointer bg-white text-black px-3 py-1 rounded-md text-sm">
                                                                                                    Change Image
                                                                                                    <input
                                                                                                        id="edit-desktopImage"
                                                                                                        type="file"
                                                                                                        className="hidden"
                                                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                                                        onChange={handleImageChange(
                                                                                                            setEditDesktopImage,
                                                                                                            setEditDesktopImagePreview,
                                                                                                        )}
                                                                                                    />
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center space-x-2">
                                                                                <Switch
                                                                                    id="edit-isActive"
                                                                                    checked={currentAd.isActive}
                                                                                    onCheckedChange={(checked) =>
                                                                                        setCurrentAd({ ...currentAd, isActive: checked })
                                                                                    }
                                                                                />
                                                                                <Label htmlFor="edit-isActive">Active</Label>
                                                                            </div>
                                                                            <Button type="submit" disabled={isLoading}>
                                                                                {isLoading ? (
                                                                                    <>
                                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                                                                    </>
                                                                                ) : (
                                                                                    "Update Advertisement"
                                                                                )}
                                                                            </Button>
                                                                        </form>
                                                                    </>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteAd(ad._id)}
                                                            disabled={isLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ad Preview Section */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Ad Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="desktop" className="mb-6">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    <TabsTrigger value="desktop" onClick={() => setPreviewDevice("desktop")}>
                                        Desktop
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile" onClick={() => setPreviewDevice("mobile")}>
                                        Mobile
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-8">
                                {/* Header Preview */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-4">Header Ads</h3>
                                    {previewDevice === "desktop" ? (
                                        <div className="bg-gray-100 p-4 rounded-lg w-full h-[120px] flex items-center justify-center">
                                            {getActiveAdsForPreview("header").length > 0 ? (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={getActiveAdsForPreview("header")[0].desktopImage || "/placeholder.svg"}
                                                        alt="Header ad"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                                                            <h4 className="font-bold">{getActiveAdsForPreview("header")[0].title}</h4>
                                                            <p className="text-sm">{getActiveAdsForPreview("header")[0].text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">No active header ads to display</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 p-4 rounded-lg w-[320px] h-[100px] mx-auto flex items-center justify-center">
                                            {getActiveAdsForPreview("header").length > 0 ? (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={getActiveAdsForPreview("header")[0].mobileImage || "/placeholder.svg"}
                                                        alt="Header ad"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                                                            <h4 className="font-bold text-sm">{getActiveAdsForPreview("header")[0].title}</h4>
                                                            <p className="text-xs">{getActiveAdsForPreview("header")[0].text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">No active header ads to display</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Preview */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-4">Sidebar Ads</h3>
                                    {previewDevice === "desktop" ? (
                                        <div className="flex">
                                            <div className="bg-gray-200 p-4 w-2/3 h-[300px] rounded-l-lg">
                                                <div className="bg-white h-full rounded flex items-center justify-center">
                                                    <p className="text-muted-foreground">Main Content Area</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 p-4 w-1/3 h-[300px] rounded-r-lg flex items-center justify-center">
                                                {getActiveAdsForPreview("sidebar").length > 0 ? (
                                                    <div className="relative w-full h-[250px]">
                                                        <Image
                                                            src={getActiveAdsForPreview("sidebar")[0].desktopImage || "/placeholder.svg"}
                                                            alt="Sidebar ad"
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                                                                <h4 className="font-bold">{getActiveAdsForPreview("sidebar")[0].title}</h4>
                                                                <p className="text-sm">{getActiveAdsForPreview("sidebar")[0].text}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No active sidebar ads to display</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-200 p-4 w-[320px] h-[400px] mx-auto rounded-lg">
                                            <div className="bg-white h-[300px] rounded mb-4 flex items-center justify-center">
                                                <p className="text-muted-foreground">Main Content Area</p>
                                            </div>
                                            <div className="bg-gray-100 p-2 h-[80px] rounded flex items-center justify-center">
                                                {getActiveAdsForPreview("sidebar").length > 0 ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={getActiveAdsForPreview("sidebar")[0].mobileImage || "/placeholder.svg"}
                                                            alt="Sidebar ad"
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-black bg-opacity-50 text-white p-1 rounded">
                                                                <h4 className="font-bold text-xs">{getActiveAdsForPreview("sidebar")[0].title}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground text-sm">No active sidebar ads to display</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Preview */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-4">Footer Ads</h3>
                                    {previewDevice === "desktop" ? (
                                        <div className="bg-gray-200 p-4 rounded-lg">
                                            <div className="bg-white h-[200px] rounded mb-4 flex items-center justify-center">
                                                <p className="text-muted-foreground">Main Content Area</p>
                                            </div>
                                            <div className="bg-gray-100 p-4 h-[100px] rounded flex items-center justify-center">
                                                {getActiveAdsForPreview("footer").length > 0 ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={getActiveAdsForPreview("footer")[0].desktopImage || "/placeholder.svg"}
                                                            alt="Footer ad"
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                                                                <h4 className="font-bold">{getActiveAdsForPreview("footer")[0].title}</h4>
                                                                <p className="text-sm">{getActiveAdsForPreview("footer")[0].text}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No active footer ads to display</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-200 p-4 w-[320px] h-[300px] mx-auto rounded-lg">
                                            <div className="bg-white h-[200px] rounded mb-4 flex items-center justify-center">
                                                <p className="text-muted-foreground">Main Content Area</p>
                                            </div>
                                            <div className="bg-gray-100 p-2 h-[80px] rounded flex items-center justify-center">
                                                {getActiveAdsForPreview("footer").length > 0 ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={getActiveAdsForPreview("footer")[0].mobileImage || "/placeholder.svg"}
                                                            alt="Footer ad"
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-black bg-opacity-50 text-white p-1 rounded">
                                                                <h4 className="font-bold text-xs">{getActiveAdsForPreview("footer")[0].title}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground text-sm">No active footer ads to display</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hero">
                    <Card className="mb-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Hero Images</CardTitle>
                            <Dialog open={isAddHeroDialogOpen} onOpenChange={setIsAddHeroDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Hero Image
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <ScrollArea className="h-[350px] border rounded-md p-8">
                                        <DialogHeader>
                                            <DialogTitle>Add New Hero Image</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddHeroImage} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Mobile Hero Image Upload */}
                                                <div>
                                                    <Label htmlFor="heroMobileImage" className="text-base font-medium mb-2 block">
                                                        Mobile Hero Image
                                                    </Label>
                                                    <div className="mt-1">
                                                        {heroMobileImagePreview ? (
                                                            <div className="relative w-full h-60 mb-2">
                                                                <Image
                                                                    src={heroMobileImagePreview || "/placeholder.svg"}
                                                                    alt="Mobile hero preview"
                                                                    fill
                                                                    className="object-cover rounded-md"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6"
                                                                    onClick={() => clearImagePreview(setHeroMobileImage, setHeroMobileImagePreview)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full">
                                                                <label className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <Upload className="w-10 h-10 mb-4 text-gray-500" />
                                                                        <p className="mb-2 text-sm text-gray-500">
                                                                            <span className="font-semibold">Mobile Hero Image</span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Recommended size: 640x960px</p>
                                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (MAX. 5MB)</p>
                                                                    </div>
                                                                    <input
                                                                        id="heroMobileImage"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                        onChange={handleImageChange(setHeroMobileImage, setHeroMobileImagePreview)}
                                                                        required
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desktop Hero Image Upload */}
                                                <div>
                                                    <Label htmlFor="heroDesktopImage" className="text-base font-medium mb-2 block">
                                                        Desktop Hero Image
                                                    </Label>
                                                    <div className="mt-1">
                                                        {heroDesktopImagePreview ? (
                                                            <div className="relative w-full h-60 mb-2">
                                                                <Image
                                                                    src={heroDesktopImagePreview || "/placeholder.svg"}
                                                                    alt="Desktop hero preview"
                                                                    fill
                                                                    className="object-cover rounded-md"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6"
                                                                    onClick={() => clearImagePreview(setHeroDesktopImage, setHeroDesktopImagePreview)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full">
                                                                <label className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <Upload className="w-10 h-10 mb-4 text-gray-500" />
                                                                        <p className="mb-2 text-sm text-gray-500">
                                                                            <span className="font-semibold">Desktop Hero Image</span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Recommended size: 1920x600px</p>
                                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (MAX. 5MB)</p>
                                                                    </div>
                                                                    <input
                                                                        id="heroDesktopImage"
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/png, image/jpeg, image/jpg"
                                                                        onChange={handleImageChange(setHeroDesktopImage, setHeroDesktopImagePreview)}
                                                                        required
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={isHeroLoading}>
                                                {isHeroLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                                    </>
                                                ) : (
                                                    "Upload Hero Images"
                                                )}
                                            </Button>
                                        </form>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {heroImages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hero images found</h3>
                                        <p className="text-sm text-gray-500 max-w-md mb-6">
                                            Add a hero image to showcase on your website&apos;s homepage. You can upload both mobile and desktop
                                            versions.
                                        </p>
                                        <Button onClick={() => setIsAddHeroDialogOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Hero Image
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mobile Image</TableHead>
                                                <TableHead>Desktop Image</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created At</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {heroImages.map((hero) => (
                                                <TableRow key={hero._id}>
                                                    <TableCell>
                                                        <div className="relative h-20 w-32 rounded-md overflow-hidden">
                                                            <Image
                                                                src={hero.mobileImage.url || "/placeholder.svg"}
                                                                alt="Mobile hero"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="relative h-20 w-40 rounded-md overflow-hidden">
                                                            <Image
                                                                src={hero.desktopImage.url || "/placeholder.svg"}
                                                                alt="Desktop hero"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs ${hero.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                        >
                                                            {hero.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{formatDate(hero.createdAt)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteHeroImage(hero._id)}
                                                            disabled={isHeroLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hero Image Preview */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Hero Image Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="desktop" className="mb-6">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    <TabsTrigger value="desktop" onClick={() => setPreviewDevice("desktop")}>
                                        Desktop
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile" onClick={() => setPreviewDevice("mobile")}>
                                        Mobile
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {previewDevice === "desktop" ? (
                                <div className="bg-gray-100 p-4 rounded-lg w-full h-[400px] flex items-center justify-center">
                                    {heroImages.length > 0 ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={heroImages[0].desktopImage.url || "/placeholder.svg"}
                                                alt="Hero image"
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-muted-foreground">No hero image to display</p>
                                            <Button variant="outline" className="mt-4" onClick={() => setIsAddHeroDialogOpen(true)}>
                                                Add Hero Image
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-lg w-[320px] h-[480px] mx-auto flex items-center justify-center">
                                    {heroImages.length > 0 ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={heroImages[0].mobileImage.url || "/placeholder.svg"}
                                                alt="Hero image"
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-muted-foreground">No hero image to display</p>
                                            <Button variant="outline" className="mt-4" onClick={() => setIsAddHeroDialogOpen(true)}>
                                                Add Hero Image
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
