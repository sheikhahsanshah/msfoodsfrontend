"use client";

import Image from "next/image";

export default function ImageComponent() {
    return (
        <div className="relative w-full h-[300px] md:h-[500px]">
            <Image
                src="/news.png"
                alt="Reviews hero"
                fill
                sizes="100vw"
                className="object-"
                priority
            />
        </div>
    );
}
