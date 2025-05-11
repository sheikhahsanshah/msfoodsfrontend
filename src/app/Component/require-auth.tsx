"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "./user-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useUser();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated || !user) {
                // If the user isn't authenticated or there's no user data, redirect to the login page
                router.push("/auth/login");
                return;
            }

            // If the user is authenticated and has the 'admin' role
            if (user.role !== "admin") {
                // Redirect to a restricted page or home if not an admin
                router.push("/");
                return;
            }

            // If everything is fine, stop checking and render the children
            setIsChecking(false);
        };

        checkAuth();
    }, [isAuthenticated, user, router]);

    // Show loading state while checking authentication
    if (loading || isChecking) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
