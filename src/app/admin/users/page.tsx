"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
    Search,
    Filter,
    UserCog,
    Shield,
    UserX,
    Eye,
    Loader2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    // Users,
    CalendarDays,
    MapPin,
    ShoppingBag,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    MessageSquare,
    CheckCircle2,
    Clock,
    Send,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"

// Auth Fetch Utility
import { authFetch, createAuthHeaders } from "@/app/utils/auth-helpers"

// Types
interface User {
    _id: string
    name: string
    email?: string
    phone?: string
    role: "user" | "admin"
    isVerified: boolean
    isBlocked: boolean
    isDeleted: boolean
    createdAt: string
    updatedAt?: string
    blockedAt?: string
    suspendedUntil?: string
    deletedAt?: string
    signupMethod?: "email" | "phone" | "both"
    addresses?: Address[]
    orders?: Order[]
    orderCount?: number
    totalSpent?: number
    hasRepliedOnWhatsApp?: boolean
    lastWhatsAppReply?: string
}

interface Address {
    street: string
    city: string
    postalCode: string
    country: string
    isDefault: boolean
}

interface Order {
    _id: string
    totalAmount: number
    status: string
    createdAt: string
}

interface UserStats {
    totalUsers: { count: number }[]
    activeUsers: { count: number }[]
    userGrowth: { _id: { year: number; month: number }; count: number }[]
    roleDistribution: { _id: string; count: number }[]
}

interface Pagination {
    total: number
    pages: number
    page: number
    limit: number
}

interface WhatsAppMessageResult {
    success: boolean
    totalUsers: number
    results: { userId: string; status: string }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Main Component
export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
    })
    const [filters, setFilters] = useState({
        search: "",
        role: "",
        isVerified: "",
        isBlocked: "",
        signupMethod: "",
    })
    const [showFilters, setShowFilters] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showUserDetails, setShowUserDetails] = useState(false)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [showStatusDialog, setShowStatusDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [statusAction, setStatusAction] = useState<"block" | "unblock" | "suspend">("block")
    const [newRole, setNewRole] = useState<"user" | "admin">("user")
    const [activeTab, setActiveTab] = useState("users")
    // In the AdminUsersPage component, add a new state for sorting
    const [sortOption, setSortOption] = useState("-createdAt")

    // WhatsApp messaging states
    const [whatsAppUsers, setWhatsAppUsers] = useState<User[]>([])
    const [whatsAppLoading, setWhatsAppLoading] = useState(false)
    const [whatsAppFilters, setWhatsAppFilters] = useState({
        search: "",
        timeFrame: "all", // all, 24h, 48h, 7d
    })
    const [whatsAppSort, setWhatsAppSort] = useState("lastReply") // lastReply, name
    const [selectedWhatsAppUsers, setSelectedWhatsAppUsers] = useState<string[]>([])
    const [selectAllWhatsAppUsers, setSelectAllWhatsAppUsers] = useState(false)
    const [messageText, setMessageText] = useState("")
    const [sendingMessage, setSendingMessage] = useState(false)
    const [showMessageResult, setShowMessageResult] = useState(false)
    const [messageResult, setMessageResult] = useState<WhatsAppMessageResult | null>(null)
    const [whatsAppPagination, setWhatsAppPagination] = useState({
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
    })

    const { toast } = useToast()

    // Update the fetchUsers function to include the sort parameter
    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sort: sortOption,
            })

            if (filters.search) queryParams.append("search", filters.search)
            if (filters.role) queryParams.append("role", filters.role)
            if (filters.isVerified) queryParams.append("isVerified", filters.isVerified)
            if (filters.isBlocked) queryParams.append("isBlocked", filters.isBlocked)
            if (filters.signupMethod) queryParams.append("signupMethod", filters.signupMethod)

            const response = await authFetch(`${API_URL}/api/adminUser?${queryParams.toString()}`)

            if (!response.ok) {
                throw new Error("Failed to fetch users")
            }

            const data = await response.json()
            setUsers(data.data?.users || [])
            setPagination(
                data.data?.pagination || {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 10,
                },
            )
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch users",
            })
        } finally {
            setIsLoading(false)
        }
    }, [pagination.page, pagination.limit, filters, toast, sortOption])

    const fetchUserStats = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/adminUser/stats`)

            if (!response.ok) {
                throw new Error("Failed to fetch user statistics")
            }

            const data = await response.json()
            setUserStats(data.data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch user statistics",
            })
        }
    }, [toast])

    // Fetch WhatsApp users
    const fetchWhatsAppUsers = useCallback(async () => {
        setWhatsAppLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: whatsAppPagination.page.toString(),
                limit: whatsAppPagination.limit.toString(),
                sort:
                    whatsAppSort === "lastReply"
                        ? "lastWhatsAppReply"
                        : whatsAppSort === "-lastReply"
                            ? "-lastWhatsAppReply"
                            : whatsAppSort,
                hasRepliedOnWhatsApp: "true",
            })

            if (whatsAppFilters.search) queryParams.append("search", whatsAppFilters.search)

            // Add time frame filter
            if (whatsAppFilters.timeFrame !== "all") {
                const now = new Date()
                const timeAgo = new Date()

                switch (whatsAppFilters.timeFrame) {
                    case "24h":
                        timeAgo.setHours(now.getHours() - 24)
                        break
                    case "48h":
                        timeAgo.setHours(now.getHours() - 48)
                        break
                    case "7d":
                        timeAgo.setDate(now.getDate() - 7)
                        break
                }

                queryParams.append("lastReplyAfter", timeAgo.toISOString())
            }

            // Use the main endpoint instead of /whatsapp
            const response = await authFetch(`${API_URL}/api/adminUser?${queryParams.toString()}`)

            if (!response.ok) {
                throw new Error("Failed to fetch WhatsApp users")
            }

            const data = await response.json()

            // Filter out users without phone numbers
            const validUsers = (data.data?.users || []).filter((user: { phone: string }) => user.phone && user.phone.trim() !== "")

            setWhatsAppUsers(validUsers)
            setWhatsAppPagination(
                data.data?.pagination || {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 10,
                },
            )
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch WhatsApp users",
            })
        } finally {
            setWhatsAppLoading(false)
        }
    }, [whatsAppPagination.page, whatsAppPagination.limit, whatsAppFilters, whatsAppSort, toast])

    useEffect(() => {
        fetchUsers()
        if (activeTab === "statistics") {
            fetchUserStats()
        }
        if (activeTab === "whatsapp") {
            fetchWhatsAppUsers()
        }
    }, [fetchUsers, fetchUserStats, fetchWhatsAppUsers, activeTab])

    // Handle select all WhatsApp users
    useEffect(() => {
        if (selectAllWhatsAppUsers) {
            const validUserIds = whatsAppUsers
                .filter((user) => user.phone && user.phone.trim() !== "")
                .map((user) => user._id)
            setSelectedWhatsAppUsers(validUserIds)

            if (validUserIds.length < whatsAppUsers.length) {
                toast({
                    variant: "destructive",
                    title: "Warning",
                    description: `${whatsAppUsers.length - validUserIds.length} users were excluded because they don't have valid phone numbers`,
                })
            }
        } else {
            setSelectedWhatsAppUsers([])
        }
    }, [selectAllWhatsAppUsers, whatsAppUsers, toast])

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }))
    }

    const handleLimitChange = (newLimit: string) => {
        setPagination((prev) => ({ ...prev, limit: Number.parseInt(newLimit), page: 1 }))
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchUsers()
    }

    const handleViewUser = async (userId: string) => {
        setIsActionLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/adminUser/${userId}`)

            if (!response.ok) {
                throw new Error("Failed to fetch user details")
            }

            const userData = await response.json()
            setSelectedUser(userData.data)
            setShowUserDetails(true)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch user details",
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleUpdateRole = async () => {
        if (!selectedUser) return

        setIsActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/adminUser/${selectedUser._id}/role`, {
                method: "PATCH",
                headers: createAuthHeaders(),
                body: JSON.stringify({ role: newRole }),
            })

            if (!response.ok) {
                throw new Error("Failed to update user role")
            }

            toast({
                title: "Success",
                description: `User role updated to ${newRole}`,
            })

            setShowRoleDialog(false)
            fetchUsers()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user role",
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleUpdateStatus = async () => {
        if (!selectedUser) return

        setIsActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/adminUser/${selectedUser._id}/status`, {
                method: "PATCH",
                headers: createAuthHeaders(),
                body: JSON.stringify({ action: statusAction }),
            })

            if (!response.ok) {
                throw new Error("Failed to update user status")
            }

            toast({
                title: "Success",
                description: `User ${statusAction}ed successfully`,
            })

            setShowStatusDialog(false)
            fetchUsers()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user status",
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        setIsActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/adminUser/${selectedUser._id}`, {
                method: "DELETE",
                headers: createAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error("Failed to delete user")
            }

            toast({
                title: "Success",
                description: "User deleted successfully",
            })

            setShowDeleteDialog(false)
            fetchUsers()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete user",
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    // Update the resetFilters function to also reset the sort option
    const resetFilters = () => {
        setFilters({
            search: "",
            role: "",
            isVerified: "",
            isBlocked: "",
            signupMethod: "",
        })
        setSortOption("-createdAt")
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    // Add a function to handle sort changes
    const handleSortChange = (value: string) => {
        setSortOption(value)
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    // WhatsApp messaging handlers
    const handleWhatsAppFilterChange = (key: string, value: string) => {
        setWhatsAppFilters((prev) => ({ ...prev, [key]: value }))
        setWhatsAppPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleWhatsAppSortChange = (value: string) => {
        // Map frontend sort values to backend field names
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sortMapping: Record<string, string> = {
            lastReply: "lastWhatsAppReply",
            "-lastReply": "-lastWhatsAppReply",
        }

        setWhatsAppSort(value)
        setWhatsAppPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleWhatsAppSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchWhatsAppUsers()
    }

    const handleWhatsAppPageChange = (newPage: number) => {
        setWhatsAppPagination((prev) => ({ ...prev, page: newPage }))
    }

    const handleWhatsAppLimitChange = (newLimit: string) => {
        setWhatsAppPagination((prev) => ({ ...prev, limit: Number.parseInt(newLimit), page: 1 }))
    }

    // Update the toggleUserSelection function to validate phone number
    const toggleUserSelection = (userId: string) => {
        const user = whatsAppUsers.find((u) => u._id === userId)

        if (!user || !user.phone || user.phone.trim() === "") {
            toast({
                variant: "destructive",
                title: "Invalid Selection",
                description: "User must have a valid phone number to receive WhatsApp messages",
            })
            return
        }

        setSelectedWhatsAppUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId)
            } else {
                return [...prev, userId]
            }
        })
    }

    const resetWhatsAppFilters = () => {
        setWhatsAppFilters({
            search: "",
            timeFrame: "all",
        })
        setWhatsAppSort("lastReply")
        setWhatsAppPagination((prev) => ({ ...prev, page: 1 }))
    }

    // Update the sendWhatsAppMessage function with better validation
    const sendWhatsAppMessage = async () => {
        // Validate message text
        if (!messageText.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a message to send",
            })
            return
        }

        // Check message length
        if (messageText.length > 1000) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Message is too long. Please limit to 1000 characters.",
            })
            return
        }

        // Validate user selection
        if (selectedWhatsAppUsers.length === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select at least one user",
            })
            return
        }

        // Validate that all selected users have phone numbers
        const selectedUsers = whatsAppUsers.filter((user) => selectedWhatsAppUsers.includes(user._id))
        const invalidUsers = selectedUsers.filter((user) => !user.phone || user.phone.trim() === "")

        if (invalidUsers.length > 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `${invalidUsers.length} selected users don't have valid phone numbers`,
            })
            return
        }

        setSendingMessage(true)
        try {
            const response = await fetch(`${API_URL}/api/webhook/marketing`, {
                method: "POST",
                headers: {
                    ...createAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: messageText,
                    userIds: selectedWhatsAppUsers,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Failed to send WhatsApp message")
            }

            const result = await response.json()
            setMessageResult(result)
            setShowMessageResult(true)

            toast({
                title: "Success",
                description: `Message sent to ${result.totalUsers} users`,
            })

            // Reset form
            setMessageText("")
            setSelectedWhatsAppUsers([])
            setSelectAllWhatsAppUsers(false)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send WhatsApp message",
            })
        } finally {
            setSendingMessage(false)
        }
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="users">Users List</TabsTrigger>
                    <TabsTrigger value="statistics">User Statistics</TabsTrigger>
                    <TabsTrigger value="signup-methods">Signup Methods</TabsTrigger>
                    <TabsTrigger value="whatsapp">WhatsApp Messaging</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Users</CardTitle>
                                    <CardDescription>Manage your store users</CardDescription>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                                    <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                        <Filter className="h-4 w-4 mr-2" />
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            resetFilters()
                                            fetchUsers()
                                        }}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="ml-auto shrink-0">
                                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                                Sort by
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[220px]" align="end">
                                            <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                                                <DropdownMenuRadioItem value="-createdAt">Newest first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="createdAt">Oldest first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="-orderCount">Most orders first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="orderCount">Least orders first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="-totalSpent">Highest spenders first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="totalSpent">Lowest spenders first</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="name">Name (A-Z)</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by name, email or phone..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange("search", e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button type="submit">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>
                            </form>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Role</label>
                                        <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Roles" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Verification Status</label>
                                        <Select
                                            value={filters.isVerified}
                                            onValueChange={(value) => handleFilterChange("isVerified", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="true">Verified</SelectItem>
                                                <SelectItem value="false">Not Verified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Block Status</label>
                                        <Select value={filters.isBlocked} onValueChange={(value) => handleFilterChange("isBlocked", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="true">Blocked</SelectItem>
                                                <SelectItem value="false">Not Blocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Signup Method</label>
                                        <Select
                                            value={filters.signupMethod}
                                            onValueChange={(value) => handleFilterChange("signupMethod", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Methods" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Methods</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="phone">Phone</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Sorting */}
                            {/* <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Most Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-createdAt">Most Recent</SelectItem>
                    <SelectItem value="createdAt">Oldest</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="-name">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className={sortOption.includes("name") ? "text-primary" : ""}>
                                                Name {sortOption === "name" && <ChevronUp className="inline h-4 w-4" />}
                                            </TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Signup Method</TableHead>
                                            <TableHead className={sortOption.includes("createdAt") ? "text-primary" : ""}>
                                                Created {sortOption === "-createdAt" && <ChevronDown className="inline h-4 w-4" />}
                                                {sortOption === "createdAt" && <ChevronUp className="inline h-4 w-4" />}
                                            </TableHead>
                                            <TableHead
                                                className={
                                                    sortOption.includes("orderCount") || sortOption.includes("totalSpent") ? "text-primary" : ""
                                                }
                                            >
                                                Orders/Spent
                                                {sortOption === "-orderCount" && <ChevronDown className="inline h-4 w-4" />}
                                                {sortOption === "orderCount" && <ChevronUp className="inline h-4 w-4" />}
                                                {sortOption === "-totalSpent" && <ChevronDown className="inline h-4 w-4" />}
                                                {sortOption === "totalSpent" && <ChevronUp className="inline h-4 w-4" />}
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ) : users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>
                                                        {user.email && <div>{user.email}</div>}
                                                        {user.phone && <div className="text-muted-foreground">{user.phone}</div>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {user.isVerified ? (
                                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                    Unverified
                                                                </Badge>
                                                            )}
                                                            {user.isBlocked && (
                                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                                    Blocked
                                                                </Badge>
                                                            )}
                                                            {user.isDeleted && (
                                                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                                    Deleted
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.signupMethod === "both" ? (
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                Email & Phone
                                                            </Badge>
                                                        ) : user.signupMethod === "email" ? (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                Email
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                                Phone
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        {user.orderCount !== undefined && (
                                                            <div className="text-sm">
                                                                <span className={sortOption.includes("orderCount") ? "font-medium text-primary" : ""}>
                                                                    {user.orderCount} orders
                                                                </span>
                                                            </div>
                                                        )}
                                                        {user.totalSpent !== undefined && (
                                                            <div className="text-sm text-muted-foreground">
                                                                <span className={sortOption.includes("totalSpent") ? "font-medium text-primary" : ""}>
                                                                    Rs {user.totalSpent.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    Actions
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleViewUser(user._id)} disabled={isActionLoading}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedUser(user)
                                                                        setNewRole(user.role)
                                                                        setShowRoleDialog(true)
                                                                    }}
                                                                >
                                                                    <UserCog className="h-4 w-4 mr-2" />
                                                                    Change Role
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {user.isBlocked ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedUser(user)
                                                                            setStatusAction("unblock")
                                                                            setShowStatusDialog(true)
                                                                        }}
                                                                    >
                                                                        <Shield className="h-4 w-4 mr-2" />
                                                                        Unblock User
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedUser(user)
                                                                                setStatusAction("block")
                                                                                setShowStatusDialog(true)
                                                                            }}
                                                                        >
                                                                            <Shield className="h-4 w-4 mr-2" />
                                                                            Block User
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedUser(user)
                                                                                setStatusAction("suspend")
                                                                                setShowStatusDialog(true)
                                                                            }}
                                                                        >
                                                                            <Shield className="h-4 w-4 mr-2" />
                                                                            Suspend User
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedUser(user)
                                                                        setShowDeleteDialog(true)
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <UserX className="h-4 w-4 mr-2" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistics">
                    <UserStatistics stats={userStats} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="signup-methods">
                    <SignupMethodStats stats={userStats} />
                </TabsContent>

                {/* WhatsApp Messaging Tab */}
                <TabsContent value="whatsapp">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>WhatsApp Messaging</CardTitle>
                                    <CardDescription>Send messages to users who have replied on WhatsApp</CardDescription>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            resetWhatsAppFilters()
                                            fetchWhatsAppUsers()
                                        }}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset Filters
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="ml-auto shrink-0">
                                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                                Sort by
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[220px]" align="end">
                                            <DropdownMenuRadioGroup value={whatsAppSort} onValueChange={handleWhatsAppSortChange}>
                                                <DropdownMenuRadioItem value="lastReply">Most Recent Reply</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="-lastReply">Oldest Reply</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="name">Name (A-Z)</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="-name">Name (Z-A)</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <form onSubmit={handleWhatsAppSearch} className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search by name, email or phone..."
                                                value={whatsAppFilters.search}
                                                onChange={(e) => handleWhatsAppFilterChange("search", e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <Button type="submit">
                                            <Search className="h-4 w-4 mr-2" />
                                            Search
                                        </Button>
                                    </form>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Time Frame</label>
                                    <Select
                                        value={whatsAppFilters.timeFrame}
                                        onValueChange={(value) => handleWhatsAppFilterChange("timeFrame", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                                            <SelectItem value="48h">Last 48 Hours</SelectItem>
                                            <SelectItem value="7d">Last 7 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Alert for users without WhatsApp replies */}
                            {!whatsAppLoading && whatsAppUsers.length === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium">No WhatsApp users found</h3>
                                            <div className="mt-2 text-sm">
                                                <p>
                                                    No users have replied to WhatsApp messages yet. Users will appear here once they reply to a
                                                    WhatsApp message.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={selectAllWhatsAppUsers}
                                                    onCheckedChange={(checked) => {
                                                        setSelectAllWhatsAppUsers(!!checked)
                                                    }}
                                                    aria-label="Select all users"
                                                    disabled={whatsAppUsers.length === 0}
                                                />
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>WhatsApp Status</TableHead>
                                            <TableHead>Last Reply</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {whatsAppLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ) : whatsAppUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    No WhatsApp users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            whatsAppUsers.map((user) => (
                                                <TableRow key={user._id} className={!user.phone || user.phone.trim() === "" ? "bg-red-50" : ""}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedWhatsAppUsers.includes(user._id)}
                                                            onCheckedChange={() => toggleUserSelection(user._id)}
                                                            aria-label={`Select ${user.name}`}
                                                            disabled={!user.phone || user.phone.trim() === ""}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>
                                                        {user.phone ? (
                                                            <div className="font-medium">{user.phone}</div>
                                                        ) : (
                                                            <div className="text-red-500 text-xs font-medium">No phone number</div>
                                                        )}
                                                        {user.email && <div className="text-muted-foreground text-xs">{user.email}</div>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.hasRepliedOnWhatsApp ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Replied
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Not Replied</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.lastWhatsAppReply ? (
                                                            <div className="flex items-center">
                                                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                                                {new Date(user.lastWhatsAppReply).toLocaleString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">Never</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user._id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Showing {whatsAppUsers.length} of {whatsAppPagination.total} users
                                    </span>
                                    <Select value={whatsAppPagination.limit.toString()} onValueChange={handleWhatsAppLimitChange}>
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
                                        onClick={() => handleWhatsAppPageChange(whatsAppPagination.page - 1)}
                                        disabled={whatsAppPagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm">
                                        Page {whatsAppPagination.page} of {whatsAppPagination.pages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleWhatsAppPageChange(whatsAppPagination.page + 1)}
                                        disabled={whatsAppPagination.page >= whatsAppPagination.pages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Message Composer */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Send WhatsApp Message</CardTitle>
                                    <CardDescription>
                                        Compose a message to send to selected users ({selectedWhatsAppUsers.length} selected)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Type your message here..."
                                        className="min-h-[120px]"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                    />
                                    {messageText.length > 0 && (
                                        <div className="flex justify-between mt-2 text-sm">
                                            <span className={messageText.length > 1000 ? "text-red-500" : "text-muted-foreground"}>
                                                {messageText.length}/1000 characters
                                            </span>
                                            {messageText.length > 1000 && <span className="text-red-500">Message is too long</span>}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setMessageText("")
                                            setSelectedWhatsAppUsers([])
                                            setSelectAllWhatsAppUsers(false)
                                        }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        onClick={sendWhatsAppMessage}
                                        disabled={
                                            sendingMessage ||
                                            selectedWhatsAppUsers.length === 0 ||
                                            !messageText.trim() ||
                                            messageText.length > 1000
                                        }
                                    >
                                        {sendingMessage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" /> Send Message
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Details Dialog */}
            <Dialog
                open={showUserDetails}
                onOpenChange={(open) => {
                    setShowUserDetails(open)
                    if (!open) setSelectedUser(null)
                }}
            >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <UserDetails user={selectedUser} />}
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog
                open={showRoleDialog}
                onOpenChange={(open) => {
                    setShowRoleDialog(open)
                    if (!open) setSelectedUser(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>Update the role for {selectedUser?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={(value: "user" | "admin") => setNewRole(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={isActionLoading}>
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                </>
                            ) : (
                                "Update Role"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog
                open={showStatusDialog}
                onOpenChange={(open) => {
                    setShowStatusDialog(open)
                    if (!open) setSelectedUser(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {statusAction === "block" ? "Block User" : statusAction === "unblock" ? "Unblock User" : "Suspend User"}
                        </DialogTitle>
                        <DialogDescription>
                            {statusAction === "block"
                                ? "This will prevent the user from accessing their account."
                                : statusAction === "unblock"
                                    ? "This will restore the user's access to their account."
                                    : "This will temporarily suspend the user's account for 7 days."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Are you sure you want to {statusAction} {selectedUser?.name}?
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isActionLoading}
                            variant={statusAction === "unblock" ? "default" : "destructive"}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                </>
                            ) : statusAction === "block" ? (
                                "Block User"
                            ) : statusAction === "unblock" ? (
                                "Unblock User"
                            ) : (
                                "Suspend User"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    setShowDeleteDialog(open)
                    if (!open) setSelectedUser(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The user will be soft-deleted and their personal information will be
                            anonymized.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete {selectedUser?.name}?</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteUser} disabled={isActionLoading} variant="destructive">
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                </>
                            ) : (
                                "Delete User"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Message Result Dialog */}
            <Dialog
                open={showMessageResult}
                onOpenChange={(open) => {
                    setShowMessageResult(open)
                    if (!open) setMessageResult(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Message Sent</DialogTitle>
                        <DialogDescription>Your message has been sent to the selected users</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {messageResult && (
                            <div>
                                <p className="mb-2">
                                    <span className="font-medium">Total Recipients:</span> {messageResult.totalUsers}
                                </p>
                                <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {messageResult.results.map((result, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{result.userId}</TableCell>
                                                    <TableCell>
                                                        {result.status === "success" ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                Success
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                                Failed
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowMessageResult(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// UserStatistics Component
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function UserStatistics({ stats, isLoading }: { stats: UserStats | null; isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!stats) {
        return <div className="text-center py-10 text-muted-foreground">No statistics available</div>
    }

    const totalUsers = stats.totalUsers[0]?.count || 0
    const activeUsers = stats.activeUsers[0]?.count || 0
    const inactiveUsers = totalUsers - activeUsers

    // Format growth data for chart
    const growthData = stats.userGrowth
        .map((item) => ({
            name: `${MONTHS[item._id.month - 1]} ${item._id.year}`,
            users: item.count,
        }))
        .slice(-12) // Last 12 months

    // Format role data for pie chart
    const roleData = stats.roleDistribution.map((item) => ({
        name: item._id,
        value: item.count,
    }))

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Overview</CardTitle>
                    <CardDescription>Summary of user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                            <p className="text-3xl font-bold">{totalUsers}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
                            <p className="text-3xl font-bold">{activeUsers}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Inactive Users</h3>
                            <p className="text-3xl font-bold">{inactiveUsers}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Role Distribution</CardTitle>
                    <CardDescription>Users by role type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New users over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="users" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// UserDetails Component
function UserDetails({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                                <p className="text-lg">{user.name}</p>
                            </div>

                            {user.email && (
                                <div className="flex items-start gap-2">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                        <p>{user.email}</p>
                                    </div>
                                </div>
                            )}

                            {user.phone && (
                                <div className="flex items-start gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                        <p>{user.phone}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {user.hasRepliedOnWhatsApp !== undefined && (
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">WhatsApp Status</h3>
                                        {user.hasRepliedOnWhatsApp ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                                Has Replied
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="mt-1">
                                                No Reply
                                            </Badge>
                                        )}
                                        {user.lastWhatsAppReply && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Last reply: {new Date(user.lastWhatsAppReply).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                                <Badge variant={user.role === "admin" ? "default" : "outline"} className="mt-1">
                                    {user.role}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Signup Method</h3>
                                {user.email && user.phone ? (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mt-1">
                                        Email & Phone
                                    </Badge>
                                ) : user.email ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                                        Email
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-1">
                                        Phone
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Verification Status</h3>
                                {user.isVerified ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-1">
                                        Not Verified
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Block Status</h3>
                                {user.isBlocked ? (
                                    <div>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                                            Blocked
                                        </Badge>
                                        {user.blockedAt && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Blocked on: {new Date(user.blockedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                        Active
                                    </Badge>
                                )}
                            </div>

                            {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Suspension</h3>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-1">
                                        Suspended
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Until: {new Date(user.suspendedUntil).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {user.isDeleted && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Deletion Status</h3>
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 mt-1">
                                        Deleted
                                    </Badge>
                                    {user.deletedAt && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Deleted on: {new Date(user.deletedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="addresses">
                <Card>
                    <CardHeader>
                        <CardTitle>Addresses</CardTitle>
                        <CardDescription>Users saved addresses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!user.addresses || user.addresses.length === 0 ? (
                            <p className="text-muted-foreground">No addresses found</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.addresses.map((address, index) => (
                                    <div key={index} className="border rounded-lg p-4 relative">
                                        {address.isDefault && <Badge className="absolute top-2 right-2">Default</Badge>}
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p>{address.street}</p>
                                                <p>
                                                    {address.city}, {address.postalCode}
                                                </p>
                                                <p>{address.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="orders">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Users order history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!user.orders || user.orders.length === 0 ? (
                            <p className="text-muted-foreground">No orders found</p>
                        ) : (
                            <div className="space-y-4">
                                {user.orders.map((order) => (
                                    <div key={order._id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-2">
                                                <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Order #{order._id.substring(order._id.length - 8)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">Rs {order.totalAmount.toFixed(2)}</p>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        order.status === "completed"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : order.status === "processing"
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : order.status === "cancelled"
                                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

// SignupMethodStats Component
function SignupMethodStats({  }: { stats: UserStats | null }) {
    const [activeTab, setActiveTab] = useState<"email" | "phone">("email")
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1,
    })
    const { toast } = useToast()

    const fetchUsersByMethod = useCallback(
        async (method: "email" | "phone") => {
            setIsLoading(true)
            try {
                const response = await authFetch(
                    `${API_URL}/api/adminUser/signup-method/${method}?page=${pagination.page}&limit=10`,
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch ${method} users`)
                }

                const data = await response.json()
                setUsers(data.data?.users || [])
                setPagination({
                    total: data.data?.pagination?.total || 0,
                    pages: data.data?.pagination?.pages || 0,
                    page: data.data?.pagination?.page || 1,
                })
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error instanceof Error ? error.message : `Failed to fetch ${method} users`,
                })
            } finally {
                setIsLoading(false)
            }
        },
        [pagination.page, toast],
    )

    useEffect(() => {
        fetchUsersByMethod(activeTab)
    }, [activeTab, fetchUsersByMethod])

    // Calculate counts from stats if available
    // const emailCount = stats?.totalUsers?.[0]?.count || 0
    // const phoneCount = stats?.totalUsers?.[0]?.count || 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users by Signup Method</CardTitle>
                <CardDescription>View users based on their registration method</CardDescription>
            </CardHeader>
            <CardContent>
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-medium">Email Users</h3>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {emailCount}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-orange-500" />
                                    <h3 className="text-lg font-medium">Phone Users</h3>
                                </div>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    {phoneCount}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    <h3 className="text-lg font-medium">Both Methods</h3>
                                </div>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                   -
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div> */}

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "email" | "phone")}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="email">Email Users</TabsTrigger>
                        <TabsTrigger value="phone">Phone Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No email users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone || "-"}</TableCell>
                                                <TableCell>
                                                    {user.isVerified ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {pagination.pages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                                    disabled={pagination.page <= 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, prev.pages) }))}
                                    disabled={pagination.page >= pagination.pages || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="phone">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No phone users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>{user.email || "-"}</TableCell>
                                                <TableCell>
                                                    {user.isVerified ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {pagination.pages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                                    disabled={pagination.page <= 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, prev.pages) }))}
                                    disabled={pagination.page >= pagination.pages || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
