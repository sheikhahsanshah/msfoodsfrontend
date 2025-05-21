import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import type React from "react";
import { UserProvider } from "./Component/user-context";
import { CartProvider } from "./Component/CartContext";
import { AdProvider } from "./Component/ad-context";
import { SessionWrapper } from "@/app/Component/SessionWrapper"; // ✅ new wrapper

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
    title: "msFoods | Authentic Spices & Herbs Online Store",
    description:
        "Shop premium quality spices and herbs online at msFoods. Discover flavorful ingredients sourced sustainably to elevate your cooking experience.",
    keywords: [
        "msFoods",
        "spices store",
        "herbs online",
        "buy spices online",
        "natural herbs",
        "organic spices",
        "Indian spices",
        "premium herbs",
        "cooking spices",
        "gourmet seasonings",
    ],
    openGraph: {
        title: "msFoods | Authentic Spices & Herbs Online",
        description:
            "Explore a wide range of high-quality spices and herbs with msFoods. Perfect for home chefs and food lovers.",
        url: "https://www.msfoods.com",
        siteName: "msFoods",
        images: [
            {
                url: "https://www.msfoods.com/msm.png", // Make sure to host a relevant OG image
                width: 1200,
                height: 630,
                alt: "msFoods spices and herbs",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "msFoods | Authentic Spices & Herbs Online Store",
        description:
            "Buy natural and organic spices and herbs online. Discover msFoods’ rich flavors and premium quality.",
        images: ["https://www.msfoods.com/og-image.jpg"], // Same image or a separate one for Twitter
    },
    metadataBase: new URL("https://www.msfoods.com"),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <link rel="canonical" href="https://www.msfoods.com" />
                {/* ✅ Google Site Verification Meta Tag */}
                <meta
                    name="google-site-verification"
                    content="UtDj9ilshFvt0b9C_aOhvWtjUFD01rn-1627aRfSvjw"
                />
            </head>
            <body className={dmSans.className}>
                <UserProvider>
                    <SessionWrapper>
                        <CartProvider>
                            <AdProvider>{children}</AdProvider>
                            <Toaster />
                        </CartProvider>
                    </SessionWrapper>
                </UserProvider>
            </body>
        </html>
    );
}
