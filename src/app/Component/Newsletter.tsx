const Newsletter = () => {
    return (
        <div className="flex justify-center">
            <div className="newsletter-block md:py-16 sm:py-12 py-10 sm:px-8 px-6 sm:rounded-[24px] rounded-3xl flex flex-col items-center bg-[#E6F2E2] border border-black/20 w-full max-w-5xl shadow-sm">
                {/* Heading */}
                <h2 className="text-black text-center font-bold text-4xl sm:text-4xl">Sign Up And Get 10% Off</h2>
                {/* Subheading */}
                <p className="text-[#333333] text-center mt-3 text-xl">
                    Sign up for early sale access, new in, promotions and more
                </p>
                {/* Input + Button */}
                <div className="input-block lg:w-1/2 sm:w-3/5 w-full h-[52px] sm:mt-8 mt-6">
                    <form className="w-full h-full relative">
                        <input
                            type="email"
                            placeholder="Enter your e-mail"
                            className="w-full h-full pl-4 pr-32 rounded-xl border border-black/30 text-black outline-none bg-[#FAF9F6] focus:ring-2 focus:ring-black/20"
                            required
                        />
                        <button className="absolute top-1 bottom-1 right-1 px-5 bg-black hover:bg-[#333333] transition-colors text-white rounded-xl flex items-center justify-center text-sm font-semibold">
                            SUBSCRIBE
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    )
}

export default Newsletter

