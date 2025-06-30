const Newsletter = () => {
    return (
        <div className="flex justify-center px-4 py-12">
            <div className="w-full max-w-3xl bg-white border border-black rounded-xl p-8 text-center shadow-sm">
                {/* Heading */}
                <h2 className="text-black font-semibold text-3xl sm:text-4xl">
                    Get 10% Off Your First Order <br /> use code: newuser
                </h2>

                {/* Subheading */}
                <p className="text-black/70 mt-2 text-base sm:text-lg">
                    Join our mailing list for updates and exclusive offers.
                </p>

                {/* Input + Button */}
                <form className="mt-6 relative w-full">
                    <input
                        type="email"
                        placeholder="Your email address"
                        className="w-full h-12 px-4 pr-32 border border-black rounded-lg bg-white text-black placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-black"
                        required
                    />
                    <button
                        type="submit"
                        className="absolute top-1 right-1 bottom-1 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80 transition"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Newsletter;
