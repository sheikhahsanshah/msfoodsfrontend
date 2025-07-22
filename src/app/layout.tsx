import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import type React from "react";
import { UserProvider } from "./Component/user-context";
import { CartProvider } from "./Component/CartContext";
import { AdProvider } from "./Component/ad-context";
import { SessionWrapper } from "@/app/Component/SessionWrapper";

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
                url: "https://www.msfoods.com/msm.png",
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
            "Buy natural and organic spices and herbs online. Discover msFoods' rich flavors and premium quality.",
        images: ["https://www.msfoods.com/og-image.jpg"],
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
                <meta name="google-site-verification" content="em5HlzcZER9QnGqyqO5Z7b6sbyVyVDVVa0ByJOqCBa0" />
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

                {/* ✅ WhatsApp Floating Button */}
                <a
                    href="https://wa.me/+923140740608"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed w-16 h-16 bottom-4 right-4 z-50 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48">
                        <path
                            fill="#fff"
                            d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5
                            c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98
                            c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"
                        />
                        <path
                            fill="#40c351"
                            d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774
                            c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199
                            h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"
                        />
                        <path
                            fill="#fff"
                            d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011
                            c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906
                            c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255
                            c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543
                            c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119
                            c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968
                            c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831
                            C20.612,19.329,19.69,16.983,19.268,16.045z"
                        />
                    </svg>
                </a>
            </body>
        </html>
    );
}
