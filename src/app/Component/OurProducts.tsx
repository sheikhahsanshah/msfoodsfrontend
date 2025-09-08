"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

interface PriceOption {
    type: "packet" | "weight-based";
    weight: number;
    price: number;
    salePrice?: number | null;
    calculatedSalePrice?: number | null;
    originalPrice?: number | null;
    globalSalePercentage?: number | null;
}

interface Product {
    _id: string;
    name: string;
    priceOptions: PriceOption[];
    calculatedPriceOptions?: PriceOption[];
    images: { public_id: string; url: string }[];
    slug: string;
    sale?: number | null;
    hasActiveSales?: boolean;
    stock?: boolean; // Add stock property
}

export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMobile = typeof window !== 'undefined'
        ? window.innerWidth < 768
        : false;

    // In your state:
    const [visibleCount, setVisibleCount] = useState(isMobile ? 6 : 8);
    // const bgColors = [
    //     'bg-indigo-100',
    //     'bg-yellow-100',
    //     'bg-lime-100',
    //     'bg-amber-100',
    //     'bg-orange-100',
    //     'bg-emerald-100',
    //     'bg-rose-100',
    //     'bg-pink-100',
    //     'bg-purple-100',
    //     'bg-sky-100',
    // ];


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch products");
            }

            setProducts(data.data.products);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse group flex flex-col overflow-hidden h-full bg-gray-100 rounded-lg"
                        >
                            <div className="aspect-square bg-gray-300"></div>
                            <div className="p-3 md:p-5 flex flex-col flex-grow">
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                            <div className="p-3 md:p-5 pt-0 mt-auto">
                                <div className="h-10 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
                <p className="text-black">Check back later for more products!</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Top picks for you</h2>
                <Link href="/products" className="text-sm underline">
                    View all products
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, visibleCount).map((product) => {
                    // Use calculated price options from backend if available
                    const priceOptionsToUse = product.calculatedPriceOptions || product.priceOptions
                    const sortedPrices = priceOptionsToUse.sort((a, b) => a.price - b.price);
                    const lowestPriceOption = sortedPrices[0];

                    const displayPrice = lowestPriceOption?.calculatedSalePrice || lowestPriceOption?.salePrice || lowestPriceOption?.price;

                    // Check if product is on sale (global sale or individual sale prices)
                    const isOnSale = (() => {
                        if (product.hasActiveSales) return true;
                        if (product.sale && product.sale > 0) {
                            const hasMeaningfulGlobalSale = priceOptionsToUse.some(option => {
                                if (!option.price || option.price <= 0) return false;
                                if (option.salePrice !== null && option.salePrice !== undefined) return false;
                                const discountMultiplier = (100 - (product.sale ?? 0)) / 100;
                                const calculatedSalePrice = Math.round(option.price * discountMultiplier * 100) / 100;
                                const actualDiscount = option.price - calculatedSalePrice;
                                const discountPercentage = (actualDiscount / option.price) * 100;
                                return discountPercentage >= 1;
                            });
                            if (hasMeaningfulGlobalSale) return true;
                        }
                        const hasIndividualSale = priceOptionsToUse.some(option =>
                            option.salePrice !== null &&
                            option.salePrice !== undefined &&
                            option.salePrice > 0 &&
                            option.salePrice < option.price
                        );
                        if (hasIndividualSale) return true;
                        return false;
                    })();

                    // Out of stock logic: show badge and disable buy button
                    const isOutOfStock = product.stock === 0;
                    console.log(`Product: ${product.name}, In Stock: ${product.stock}, isOutOfStock: ${isOutOfStock}`);

                    return (
                        <Card key={product._id} className="group flex flex-col overflow-hidden h-full">
                            <Link href={`/user/product/${product._id}`} className="flex flex-col flex-grow h-full">
                                <CardHeader className={`bg-white p-0 relative aspect-square  overflow-hidden h-58`}>
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.name}
                                        width={900}
                                        height={900}
                                        className="w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                                    />
                                    {isOnSale && (
                                        <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold z-10">
                                            SALE
                                        </div>
                                    )}
                                    {isOutOfStock && (
                                        <div className="absolute t  op-2 right-2 bg-gray-700 text-white px-3 py-1 text-xs font-bold z-20 shadow-lg rounded">
                                            Sold Out
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="p-5 flex flex-col flex-grow">
                                    <div className="text-sm text-[#1D1D1D]">
                                        {product.priceOptions.length > 1 ? "From " : ""}
                                        {(() => {
                                            if (isOnSale) {
                                                if (lowestPriceOption?.calculatedSalePrice && lowestPriceOption?.calculatedSalePrice < lowestPriceOption?.price) {
                                                    return (
                                                        <span>
                                                            <span className="line-through text-gray-500 mr-2">
                                                                {formatPrice(lowestPriceOption.originalPrice || lowestPriceOption.price)}
                                                            </span>
                                                            <span className="text-red-500">
                                                                {formatPrice(lowestPriceOption.calculatedSalePrice)}
                                                            </span>
                                                        </span>
                                                    );
                                                }
                                                else if (lowestPriceOption?.salePrice && lowestPriceOption?.salePrice < lowestPriceOption?.price) {
                                                    return (
                                                        <span>
                                                            <span className="line-through text-gray-500 mr-2">
                                                                {formatPrice(lowestPriceOption.price)}
                                                            </span>
                                                            <span className="text-red-500">
                                                                {formatPrice(lowestPriceOption.salePrice)}
                                                            </span>
                                                        </span>
                                                    );
                                                }
                                                else if (product.sale && product.sale > 0) {
                                                    const originalPrice = lowestPriceOption?.price || 0;
                                                    const discountMultiplier = (100 - product.sale) / 100;
                                                    const calculatedSalePrice = Math.round(originalPrice * discountMultiplier * 100) / 100;
                                                    if (calculatedSalePrice < originalPrice) {
                                                        return (
                                                            <span>
                                                                <span className="line-through text-gray-500 mr-2">
                                                                    {formatPrice(originalPrice)}
                                                                </span>
                                                                <span className="text-red-500">
                                                                    {formatPrice(calculatedSalePrice)}
                                                                </span>
                                                            </span>
                                                        );
                                                    }
                                                }
                                            }
                                            return displayPrice ? formatPrice(displayPrice) : "Price not available";
                                        })()}
                                    </div>
                                    <h3 className="font-semibold text-[17px] md:text-2xl md:font-bold mt-1 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-black after:scale-x-0 after:transition-transform after:duration-300 after:origin-left group-hover:after:scale-x-100">
                                        {product.name}
                                    </h3>
                                </CardContent>
                            </Link>
                            <CardFooter className="p-5 pt-0 mt-auto">
                                <Link href={`/user/product/${product._id}`} className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-black hover:bg-black hover:text-white text-sm md:text-base"
                                        disabled={isOutOfStock}
                                    >
                                        {isOutOfStock ? "Out of Stock" : "Buy now"}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {visibleCount < products.length && (
                <div className="mt-6 text-center">
                    <Button
                        onClick={() => setVisibleCount(prev => prev + (isMobile ? 6 : 8))}
                        className="rounded-full border-black hover:bg-black hover:text-white"
                        variant="outline"
                    >
                        Show More
                    </Button>
                </div>
            )}
        </div>
    );
}
