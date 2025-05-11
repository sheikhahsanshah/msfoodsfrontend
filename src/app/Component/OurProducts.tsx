"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { toast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com";

interface PriceOption {
    type: "packet" | "weight-based";
    weight: number;
    price: number;
    salePrice?: number | null;
}

interface Product {
    _id: string;
    name: string;
    priceOptions: PriceOption[];
    images: { public_id: string; url: string }[];
    slug: string;
}

export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                            {/* Skeleton for Image */}
                            <div className="aspect-square bg-gray-300"></div>

                            {/* Skeleton for Content */}
                            <div className="p-3 md:p-5 flex flex-col flex-grow">
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>

                            {/* Skeleton for Button */}
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
                {products.map((product) => {
                    const sortedPrices = product.priceOptions.sort((a, b) => a.price - b.price);
                    const lowestPriceOption = sortedPrices[0];
                    const displayPrice = lowestPriceOption?.salePrice || lowestPriceOption?.price;

                    return (
                        <Card key={product._id} className="group flex flex-col overflow-hidden h-full">
                            <Link href={`/user/product/${product._id}`} className="flex flex-col flex-grow h-full">

                                {/* Product Image */}
                                <CardHeader className="p-0 relative aspect-square bg-white overflow-hidden h-58">
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.name}
                                        width={900}
                                        height={900}
                                        className=" w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                                    />
                                </CardHeader>

                                {/* Product Info */}
                                <CardContent className="p-5 flex flex-col flex-grow">
                                    <div className="text-sm text-[#1D1D1D]">
                                        {product.priceOptions.length > 1 ? "From " : ""}
                                        {displayPrice ? `Rs. ${displayPrice.toFixed(2)}` : "Price not available"}
                                    </div>

                                    <h3 className="font-semibold text-[17px] md:text-2xl md:font-bold mt-1 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-black after:scale-x-0 after:transition-transform after:duration-300 after:origin-left group-hover:after:scale-x-100">
                                        {product.name}
                                    </h3>
                                </CardContent>
                            </Link>

                            {/* Buy Now Button */}
                            <CardFooter className="p-5 pt-0 mt-auto">
                                <Link href={`/user/product/${product._id}`} className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-black hover:bg-black hover:text-white text-sm md:text-base"
                                    >
                                        Buy now
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

        </div>
    );
}
