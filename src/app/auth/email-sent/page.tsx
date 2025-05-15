import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';



export default function PasswordResetSentPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="max-w-md w-full text-center p-8 bg-gray-50 rounded-2xl shadow-lg">
                <div className="flex justify-center mb-6">
                    <Mail className="w-16 h-16 text-black" />
                </div>
                <h1 className="text-3xl font-bold text-black mb-4">Check your email</h1>
                <p className="text-black mb-6">
                    We’ve sent a password reset link to 
                    Your email.<br />
                    Please open your inbox and spam and click the link to reset your password.
                </p>
                <Button
                    asChild
                    className="mt-4 w-full bg-black text-white hover:bg-gray-900"
                >
                    <a href="/auth/login">Back to Login</a>
                </Button>
            </div>
        </div>
    );
}
