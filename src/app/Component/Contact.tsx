'use client';

import { useState } from "react";
import { Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-backend-api.com";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        // email: "",
        phone:"",
        subject: "",
        message: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage("");
        // Manual phone validation
        const phoneRegex = /^03[0-9]{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setIsLoading(false);
            setStatusMessage("❌ Phone number must be exactly 11 digits and start with 03");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatusMessage("✅ Message sent successfully!");
                setFormData({ name: "",phone:"", subject: "", message: "" });
            } else {
                setStatusMessage("❌ Error sending message. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            setStatusMessage("❌ Network error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-16 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between gap-16">
                {/* Left Section - Contact Form */}
                <div className="lg:w-2/3">
                    <h2 className="text-4xl font-bold text-black">Get In Touch</h2>
                    <p className="mt-3 text-black">Use the form below to contact the msFoods team</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your Name *"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            {/* <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Your Email *"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            /> */}
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Your Phone *"
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="03[0-9]{9}"
                                inputMode="numeric"
                                maxLength={11}
                                required
                            />
                        </div>
                       
                        <input
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Subject *"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                            id="message"
                            name="message"
                            rows={5}
                            placeholder="Your Message *"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "SENDING..." : "SEND MESSAGE"}
                                <Send size={18} />
                            </button>
                        </div>

                        {statusMessage && (
                            <p className="text-center font-medium mt-2">{statusMessage}</p>
                        )}
                    </form>
                </div>

                {/* Right Section - Contact Details */}
                <div className="lg:w-1/3 space-y-12">
                    <div>
                        
                        <p className="mt-3 text-gray-700">
                            Phone: <span className="whitespace-nowrap">+923085128136</span>
                        </p>
                        <p className="mt-1 text-gray-700">
                            Email: <span className="whitespace-nowrap">msfoodscontact@gmail.com</span>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-black">Business Hours</h3>
                        <p className="mt-3 text-gray-700">Mon - Fri: 9:00 AM – 6:00 PM</p>
                        <p className="mt-3 text-gray-700">Saturday: 10:00 AM – 4:00 PM</p>
                        <p className="mt-3 text-gray-700">Sunday: Closed</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-black">Delivery Hours</h3>
                        <p className="mt-3 text-gray-700">Mon - Sun: 10:00 AM – 8:00 PM</p>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
