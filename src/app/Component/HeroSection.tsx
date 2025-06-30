
"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast"; // adjust if your toast import differs
import { authFetch } from "@/app/utils/auth-helpers"

interface HeroImageType {
    desktopImage: { url: string };
    mobileImage: { url: string };
}
const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

const HeroSection = () => {
    const [heroImages, setHeroImages] = useState<HeroImageType[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isHeroLoading, setIsHeroLoading] = useState(false);

    const fetchHeroImages = useCallback(async () => {
        try {
            setIsHeroLoading(true);
            const response = await authFetch(`${API_URL}/api/hero`);
            const data = await response.json();

            if (!response.ok) throw new Error("Failed to fetch hero images");

            setHeroImages(data.success ? [data.data] : []);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch hero images",
            });
        } finally {
            setIsHeroLoading(false);
        }
    }, []);
   
    
    useEffect(() => {
        fetchHeroImages();
    }, [fetchHeroImages]);

    const desktopImageSrc = heroImages[0]?.desktopImage?.url || "/Banner.jpg";
    const mobileImageSrc = heroImages[0]?.mobileImage?.url || "/Banner.jpg";

    return (
        <section className="w-full h-[500px] relative mb-10">
            {/* Desktop Image */}
            <div className="hidden sm:block w-full">
                <Image
                    src={desktopImageSrc}
                    alt="Premium Spices and Dry Foods"
                    width={1000}
                    height={1000}
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            {/* Mobile Image */}
            <div className="block sm:hidden w-full">
                <Image
                    src={mobileImageSrc}
                    alt="Premium Spices and Dry Foods"
                    width={600}
                    height={600}
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        </section>
    );
};

export default HeroSection;
