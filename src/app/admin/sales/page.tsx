import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader, RefreshCw } from "lucide-react"

interface SalesStats {
    totalOrders: number
    couponsUsed: number
    totalSales: number
    totalShipping: number
    totalDiscount: number
    totalCodFee: number
    totalRevenue: number
    totalProfit: number
    totalSaleDiscounts?: number
    totalCouponDiscounts?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function Sales() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [salesStats, setSalesStats] = useState<SalesStats | null>(null)
    const [timeRange, setTimeRange] = useState("week")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const showToast = (title: string, description: string, variant: "destructive" | "default" = "default") => {
        console.log(`${variant === "destructive" ? "ERROR" : "INFO"}: ${title} - ${description}`)
    }

    const fetchSalesStats = useCallback(async () => {
        console.log("Fetching sales stats with:", { timeRange, startDate, endDate })
        
        setIsLoading(true)
        setError(null)
        
        try {
            const queryParams = new URLSearchParams()

            if (timeRange === "custom") {
                if (!startDate || !endDate) {
                    throw new Error("Both start date and end date are required for custom range")
                }
                
                // Validate dates
                const start = new Date(startDate)
                const end = new Date(endDate)
                
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error("Invalid date format")
                }
                
                if (start > end) {
                    throw new Error("Start date cannot be after end date")
                }
                
                queryParams.append("startDate", startDate)
                queryParams.append("endDate", endDate)
                queryParams.append("period", "custom")
            } else {
                queryParams.append("period", timeRange)
            }

            const token = localStorage.getItem("accessToken")
            
            if (!token) {
                throw new Error("No access token found. Please log in again.")
            }

            console.log("Making request to:", `${API_URL}/api/orders/sales?${queryParams}`)
            
            const response = await fetch(`${API_URL}/api/orders/sales?${queryParams}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log("Response status:", response.status)
            console.log("Response headers:", Object.fromEntries(response.headers.entries()))

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.message || errorData.error || errorMessage
                } catch (jsonError) {
                    console.error("Failed to parse error response as JSON:", jsonError)
                    const textResponse = await response.text()
                    console.log("Error response text:", textResponse)
                    errorMessage = textResponse || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            const data = await response.json()
            console.log("Response data:", data)
            
            if (!data.data) {
                throw new Error("Invalid response format: missing data field")
            }
            
            // Ensure all numeric values are properly handled
            const statsData = data.data
            const sanitizedStats: SalesStats = {
                totalOrders: Number(statsData.totalOrders) || 0,
                couponsUsed: Number(statsData.couponsUsed) || 0,
                totalSales: Number(statsData.totalSales) || 0,
                totalShipping: Number(statsData.totalShipping) || 0,
                totalDiscount: Number(statsData.totalDiscount) || 0,
                totalCodFee: Number(statsData.totalCodFee) || 0,
                totalRevenue: Number(statsData.totalRevenue) || 0,
                totalProfit: Number(statsData.totalProfit) || 0,
                totalSaleDiscounts: Number(statsData.totalSaleDiscounts) || 0,
                totalCouponDiscounts: Number(statsData.totalCouponDiscounts) || 0,
            }
            
            setSalesStats(sanitizedStats)
            showToast("Success", "Sales data loaded successfully")
            
        } catch (fetchError) {
            console.error("Fetch error:", fetchError)
            const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error occurred"
            setError(errorMessage)
            showToast("Error", errorMessage, "destructive")
        } finally {
            setIsLoading(false)
        }
    }, [timeRange, startDate, endDate])

    useEffect(() => {
        if (timeRange !== "custom" || (timeRange === "custom" && startDate && endDate)) {
            fetchSalesStats()
        } else if (timeRange === "custom" && (!startDate || !endDate)) {
            setIsLoading(false)
            setSalesStats(null)
        }
    }, [fetchSalesStats, timeRange, startDate, endDate])

    const chartData = [
        { name: "Gross Sales", value: salesStats?.totalSales || 0, fill: "#82ca9d" },
        { name: "Shipping Fees", value: salesStats?.totalShipping || 0, fill: "#8884d8" },
        { name: "COD Fees", value: salesStats?.totalCodFee || 0, fill: "#ff7300" },
        { name: "Total Discounts", value: salesStats?.totalDiscount || 0, fill: "#ffc658" },
    ]

    // Separate chart for discount breakdown if we have the data
    const discountChartData = [
        { 
            name: "Coupon Discounts", 
            value: (salesStats?.totalCouponDiscounts || 0), 
            fill: "#ff6b6b" 
        },
        { 
            name: "Sale Discounts", 
            value: salesStats?.totalSaleDiscounts || 0, 
            fill: "#4ecdc4" 
        },
    ]

    const handleRetry = () => {
        fetchSalesStats()
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex flex-col items-center justify-center">
                <Loader className="animate-spin h-8 w-8 mb-4" />
                <p>Loading sales data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-10 flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p className="text-center mb-4">{error}</p>
                <button 
                    onClick={handleRetry}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Sales Overview</h1>
            <div className="mb-5 flex items-center gap-4 flex-wrap">
                <Select onValueChange={(value) => setTimeRange(value)} defaultValue={timeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>
                {timeRange === "custom" && (
                    <>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded p-2"
                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded p-2"
                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                            min={startDate} // Prevent end date before start date
                        />
                        <button 
                            onClick={fetchSalesStats} 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                            disabled={!startDate || !endDate}
                        >
                            Apply
                        </button>
                    </>
                )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {salesStats?.totalRevenue?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Sales + Shipping + COD - Discounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {salesStats?.totalSales?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Gross product revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {salesStats?.totalProfit?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Revenue - COGS (TBD)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats?.totalOrders || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Extra Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="flex justify-between"><span>Shipping Fees:</span> <span>Rs {salesStats?.totalShipping?.toFixed(2) || "0.00"}</span></div>
                        <div className="flex justify-between"><span>COD Fees:</span> <span>Rs {salesStats?.totalCodFee?.toFixed(2) || "0.00"}</span></div>
                        <div className="flex justify-between"><span>Total Discounts:</span> <span className="text-red-500">-Rs {salesStats?.totalDiscount?.toFixed(2) || "0.00"}</span></div>
                        {salesStats?.totalSaleDiscounts && salesStats.totalSaleDiscounts > 0 && (
                            <div className="flex justify-between text-xs text-gray-600 pl-2">
                                <span>• Sale Discounts:</span> <span className="text-red-500">-Rs {salesStats.totalSaleDiscounts.toFixed(2)}</span>
                            </div>
                        )}
                        {salesStats?.totalCouponDiscounts && salesStats.totalCouponDiscounts > 0 && (
                            <div className="flex justify-between text-xs text-gray-600 pl-2">
                                <span>• Coupon Discounts:</span> <span className="text-red-500">-Rs {salesStats.totalCouponDiscounts.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between"><span>Coupons Used:</span> <span>{salesStats?.couponsUsed || 0}</span></div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Sales Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `Rs ${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="value" name="Amount (Rs)">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Discount Breakdown Chart */}
            {((salesStats?.totalSaleDiscounts || 0) > 0 || (salesStats?.totalCouponDiscounts || 0) > 0) && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Discount Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={discountChartData.filter(item => item.value > 0)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `Rs ${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="value" name="Discount Amount (Rs)">
                                    {discountChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}