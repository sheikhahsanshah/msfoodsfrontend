import Image from "next/image";

interface HeroSectionProps {
    desktopImageSrc?: string;
    mobileImageSrc?: string;
    imageAlt?: string;
}

const HeroSection = ({
    // desktopImageSrc = "/hero.webp",
    desktopImageSrc = "/msd.png",
    mobileImageSrc = "/msm.png",
    imageAlt = "Premium Spices and Dry Foods",
}: HeroSectionProps) => {
    return (
        <section className="w-full h-[500px] relative mb-10   ">
            {/* Desktop Image */}
            <div className="hidden sm:block w-full">
                <Image
                    src={desktopImageSrc}
                    alt={imageAlt}
                    width={1000}
                    height={1000}
                    className="absolute inset-0 w-full h-full "
                />
            </div>

            {/* Mobile Image */}
            <div className="block sm:hidden w-full ">
                <Image
                    src={mobileImageSrc}
                    alt={imageAlt}
                    width={600}
                    height={600}
                    className="absolute inset-0 w-full h-full "
                />
            </div>
        </section>
    );
};

export default HeroSection;
