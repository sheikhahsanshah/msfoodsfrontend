"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect, useCallback } from "react"
import {
    Search,
    Mail,
    Send,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    UserCheck,
    Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authFetch } from "@/app/utils/auth-helpers"

// Types
interface User {
    _id: string
    name: string
    email: string
    isVerified: boolean
    createdAt: string
    lastOrderAt?: string
    orderCount?: number
    totalSpent?: number
}

interface EmailMarketingStats {
    totalUsers: number
    verifiedUsers: number
    activeUsers: number
}

interface EmailMessageResult {
    success: boolean
    totalUsers: number
    successCount: number
    failureCount: number
    results: { userId: string; email: string; status: string; error?: string }[]
}

interface EmailImage {
    url: string
    alt: string
    position?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function EmailMarketingPage() {
    const { toast } = useToast()

    // States
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState<EmailMarketingStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [activeTab, setActiveTab] = useState("compose")

    // Pagination
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
    })

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        targetType: "all", // all, verified, active
        sortBy: "createdAt",
        sortOrder: "desc"
    })

    // Email composition
    const [emailData, setEmailData] = useState({
        subject: "",
        message: "",
        targetUsers: "all", // all, specific, verified, active
        specificUserIds: [] as string[],
        includeImages: true,
        images: [] as EmailImage[]
    })

    // User selection
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [selectAllUsers, setSelectAllUsers] = useState(false)

    // Results
    const [showResults, setShowResults] = useState(false)
    const [emailResults, setEmailResults] = useState<EmailMessageResult | null>(null)

    // Image upload
    const [imageUrl, setImageUrl] = useState("")
    const [imageAlt, setImageAlt] = useState("")

    // Fetch users for email marketing
    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                targetType: filters.targetType,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            })

            if (filters.search) queryParams.append("search", filters.search)

            const response = await authFetch(
                `${API_URL}/api/webhook/email-marketing/users?${queryParams}`
            )

            if (!response.ok) {
                throw new Error("Failed to fetch users")
            }

            const data = await response.json()

            if (data.success) {
                setUsers(data.data.users)
                setPagination(prev => ({
                    ...prev,
                    total: data.data.pagination.total,
                    pages: data.data.pagination.pages,
                }))
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [pagination.page, pagination.limit, filters, toast])

    // Fetch email marketing stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await authFetch(
                `${API_URL}/api/webhook/email-marketing/stats`
            )

            if (!response.ok) {
                throw new Error("Failed to fetch stats")
            }

            const data = await response.json()

            if (data.success) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
        fetchStats()
    }, [fetchUsers, fetchStats])

    // Handle user selection
    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId)
            } else {
                return [...prev, userId]
            }
        })
    }

    const toggleSelectAll = () => {
        if (selectAllUsers) {
            setSelectedUsers([])
            setSelectAllUsers(false)
        } else {
            setSelectedUsers(users.map(user => user._id))
            setSelectAllUsers(true)
        }
    }

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const handleLimitChange = (newLimit: string) => {
        setPagination(prev => ({ ...prev, page: 1, limit: parseInt(newLimit) }))
    }

    // Add image to email
    const addImage = () => {
        if (imageUrl.trim()) {
            setEmailData(prev => ({
                ...prev,
                images: [...prev.images, {
                    url: imageUrl.trim(),
                    alt: imageAlt.trim() || "Marketing Image"
                }]
            }))
            setImageUrl("")
            setImageAlt("")
        }
    }

    // Remove image from email
    const removeImage = (index: number) => {
        setEmailData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    // Send marketing email
    const sendMarketingEmail = async () => {
        if (!emailData.subject.trim() || !emailData.message.trim()) {
            toast({
                title: "Error",
                description: "Subject and message are required",
                variant: "destructive",
            })
            return
        }

        if (emailData.targetUsers === "specific" && selectedUsers.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one user when targeting specific users",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)
        try {
            const payload = {
                subject: emailData.subject,
                message: emailData.message,
                images: emailData.images,
                targetUsers: emailData.targetUsers,
                specificUserIds: emailData.targetUsers === "specific" ? selectedUsers : [],
                includeImages: emailData.includeImages
            }

            const response = await authFetch(
                `${API_URL}/api/webhook/email-marketing/send`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json()

            if (data.success) {
                setEmailResults(data)
                setShowResults(true)
                toast({
                    title: "Success",
                    description: `Email sent to ${data.totalUsers} users (${data.successCount} successful, ${data.failureCount} failed)`,
                })

                // Reset form
                setEmailData({
                    subject: "",
                    message: "",
                    targetUsers: "all",
                    specificUserIds: [],
                    includeImages: true,
                    images: []
                })
                setSelectedUsers([])
                setSelectAllUsers(false)
            } else {
                throw new Error(data.message || "Failed to send email")
            }
        } catch (error) {
            console.error("Error sending email:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send email",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    // Reset filters
    const resetFilters = () => {
        setFilters({
            search: "",
            targetType: "all",
            sortBy: "createdAt",
            sortOrder: "desc"
        })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Marketing</h1>
                <p className="text-gray-600">Send marketing emails to your users with rich content and targeting options</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-blue-600 mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <UserCheck className="h-8 w-8 text-green-600 mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Verified Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Target className="h-8 w-8 text-purple-600 mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="compose">Compose Email</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compose Marketing Email</CardTitle>
                            <CardDescription>
                                Create and send marketing emails to your users with rich content and targeting options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Target Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Target Audience</h3>
                                <Select
                                    value={emailData.targetUsers}
                                    onValueChange={(value) => setEmailData(prev => ({ ...prev, targetUsers: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select target audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users ({stats?.totalUsers || 0})</SelectItem>
                                        <SelectItem value="verified">Verified Users Only ({stats?.verifiedUsers || 0})</SelectItem>
                                        <SelectItem value="active">Active Users Only ({stats?.activeUsers || 0})</SelectItem>
                                        <SelectItem value="specific">Specific Users ({selectedUsers.length} selected)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email Content */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Email Content</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Line *
                                    </label>
                                    <Input
                                        placeholder="Enter email subject..."
                                        value={emailData.subject}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {emailData.subject.length}/100 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Content *
                                    </label>
                                    <Textarea
                                        placeholder="Write your email message here... Use [IMAGE] to place images at specific positions"
                                        value={emailData.message}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                                        className="min-h-[200px]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {emailData.message.length} characters
                                    </p>
                                </div>

                                {/* Image Management */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-md font-medium">Images</h4>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="includeImages"
                                                checked={emailData.includeImages}
                                                onCheckedChange={(checked) =>
                                                    setEmailData(prev => ({ ...prev, includeImages: checked as boolean }))
                                                }
                                            />
                                            <label htmlFor="includeImages" className="text-sm">
                                                Include images in email
                                            </label>
                                        </div>
                                    </div>

                                    {emailData.includeImages && (
                                        <div className="space-y-4">
                                            {/* Add Image Form */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Input
                                                    placeholder="Image URL"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Alt text (optional)"
                                                    value={imageAlt}
                                                    onChange={(e) => setImageAlt(e.target.value)}
                                                />
                                                <Button onClick={addImage} disabled={!imageUrl.trim()}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Image
                                                </Button>
                                            </div>

                                            {/* Image Preview */}
                                            {emailData.images.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">Added Images:</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {emailData.images.map((image, index) => (
                                                            <div key={index} className="relative border rounded-lg p-2">
                                                                <Image
                                                                    src={image.url}
                                                                    alt={image.alt}
                                                                    width={200}
                                                                    height={150}
                                                                    className="w-full h-32 object-cover rounded"
                                                                />
                                                                <p className="text-xs mt-1 truncate">{image.alt}</p>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    <XCircle className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEmailData({
                                        subject: "",
                                        message: "",
                                        targetUsers: "all",
                                        specificUserIds: [],
                                        includeImages: true,
                                        images: []
                                    })
                                    setSelectedUsers([])
                                    setSelectAllUsers(false)
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={sendMarketingEmail}
                                disabled={
                                    isSending ||
                                    !emailData.subject.trim() ||
                                    !emailData.message.trim() ||
                                    (emailData.targetUsers === "specific" && selectedUsers.length === 0)
                                }
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                Browse and select users for targeted email campaigns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-6 space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                        <Input
                                            placeholder="Search users by name or email..."
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                        <Button type="submit">
                                            <Search className="h-4 w-4 mr-2" />
                                            Search
                                        </Button>
                                    </form>
                                    <Select value={filters.targetType} onValueChange={(value) => handleFilterChange("targetType", value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="verified">Verified Only</SelectItem>
                                            <SelectItem value="active">Active Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="createdAt">Join Date</SelectItem>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={resetFilters}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            {/* Users Table */}
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10">
                                    <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium">No users found</h3>
                                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">
                                                        <Checkbox
                                                            checked={selectAllUsers}
                                                            onCheckedChange={toggleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Join Date</TableHead>
                                                    <TableHead>Orders</TableHead>
                                                    <TableHead>Total Spent</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedUsers.includes(user._id)}
                                                                onCheckedChange={() => toggleUserSelection(user._id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            {user.isVerified ? (
                                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">Unverified</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>{user.orderCount || 0}</TableCell>
                                                        <TableCell>
                                                            {user.totalSpent ? `Rs ${user.totalSpent.toLocaleString()}` : "Rs 0"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                Showing {users.length} of {pagination.total} users
                                            </span>
                                            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                                                <SelectTrigger className="w-[80px]">
                                                    <SelectValue placeholder="10" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="20">20</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page <= 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm">
                                                Page {pagination.page} of {pagination.pages || 1}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page >= pagination.pages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Email Campaign Results</DialogTitle>
                        <DialogDescription>
                            Results of your email marketing campaign
                        </DialogDescription>
                    </DialogHeader>

                    {emailResults && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{emailResults.totalUsers}</p>
                                        <p className="text-sm text-gray-600">Total Recipients</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">{emailResults.successCount}</p>
                                        <p className="text-sm text-gray-600">Successful</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-2xl font-bold text-red-600">{emailResults.failureCount}</p>
                                        <p className="text-sm text-gray-600">Failed</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Results */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Detailed Results</h3>
                                <div className="max-h-60 overflow-y-auto border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {emailResults.results.map((result, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{result.email}</TableCell>
                                                    <TableCell>
                                                        {result.status === "success" ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Success
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Failed
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        {result.error || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowResults(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 