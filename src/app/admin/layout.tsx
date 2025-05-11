"use client";

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "../Component/AdminSidebar";
import AdminTopBar from "../Component/AdminTopBar";
import { useUser } from "../Component/user-context";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useUser();

    // Redirect if not authenticated or not admin
    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== "admin")) {
            toast({
                title: "Unauthorized",
                description: "Please login as an admin to access this page.",
                variant: "destructive",
            });
            router.push("/auth/login");
        }
    }, [loading, isAuthenticated, user, router]);

    // ✅ Prevent rendering until auth is checked
    if (loading || !isAuthenticated || user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AdminSidebar />
                <div className="flex flex-col w-full max-w-8xl border overflow-auto">
                    <AdminTopBar />
                    <main className="flex-1 p-4 md:p-6 bg-gray-50/50 overflow-auto">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
