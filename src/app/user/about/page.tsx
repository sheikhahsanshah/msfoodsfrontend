import Image from "next/image";
import {  Check, History, Leaf, Globe, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Newsletter from "@/app/Component/Newsletter";

export default function AboutUs() {
    return (
        <div className="bg-white">
            {/* Header */}
            <section className="container py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">About msFoods</h1>
                <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                    Your trusted source for premium spices, dry fruits, and natural ingredients since 2015.
                </p>
                <Separator className="my-8 max-w-md mx-auto bg-blue-100" />
            </section>

            {/* Overview */}
            <section>
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">A Legacy of Purity and Taste</h2>
                            <p className="text-gray-700 mb-4">
                                At msFoods, our journey began with a vision to bring pure, authentic, and high-quality ingredients into every kitchen.
                                We&apos;ve remained committed to the belief that great meals start with great ingredients.
                            </p>
                            <p className="text-gray-700">
                                Our philosophy is simple—&quot;Pure Ingredients, Pure Taste.&quot; That’s why every product we offer is carefully selected to deliver unmatched flavor and nutrition.
                            </p>
                        </div>
                        <div className="relative h-[300px] rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src="/mb1.jpeg"
                                alt="msFoods premium products"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Commitment</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-center">
                                <div className="p-3 rounded-full bg-green-50">
                                    <Check className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Premium Quality</h3>
                            <p className="text-gray-700 text-center">
                                Our ingredients are responsibly sourced from top-tier farms, ensuring freshness, purity, and long-lasting flavor.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-center">
                                <div className="p-3 rounded-full bg-purple-50">
                                    <Leaf className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Natural Ingredients</h3>
                            <p className="text-gray-700 text-center">
                                All our products are free from artificial preservatives and additives—just nature’s goodness in every pack.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-center">
                                <div className="p-3 rounded-full bg-amber-50">
                                    <Heart className="h-8 w-8 text-amber-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">Authentic Taste</h3>
                            <p className="text-gray-700 text-center">
                                We believe in preserving traditional flavors that reflect the cultural richness of our food heritage.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* History */}
            <section className="bg-amber-50 py-16">
                <div className="container">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 flex justify-center">
                            <div className="p-4 rounded-full bg-white shadow-md inline-flex">
                                <History className="h-16 w-16 text-amber-700" />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">How It All Began</h2>
                            <p className="text-gray-700 mb-4">
                                Founded in 2015, msFoods began with a mission to serve quality products that make cooking a joy. From humble beginnings,
                                we’ve expanded with love and support from our community and loyal customers.
                            </p>
                            <p className="text-gray-700">
                                Our promise to deliver authentic, quality products has made msFoods a trusted name in homes across the region.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="container py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Looking to the Future</h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-blue-50 p-8 rounded-lg hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center mb-6">
                            <Globe className="h-8 w-8 text-blue-600 mr-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Sustainability</h3>
                        </div>
                        <p className="text-gray-700">
                            We are committed to sustainability—from our sourcing practices to our packaging—and proudly support eco-conscious initiatives.
                        </p>
                    </div>

                    <div className="bg-green-50 p-8 rounded-lg hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center mb-6">
                            <Leaf className="h-8 w-8 text-green-600 mr-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Innovation</h3>
                        </div>
                        <p className="text-gray-700">
                            We’re always exploring new flavors, blends, and offerings to meet the evolving tastes of our customers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <Newsletter />
        </div>
    );
}
