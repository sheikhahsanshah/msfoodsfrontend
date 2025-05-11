// components/SessionWrapper.tsx

"use client";
import { useUser } from "@/app/Component/user-context";

export function SessionWrapper({ children }: { children: React.ReactNode }) {
    const { loading } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-lg font-medium">
                Checking session...
            </div>
        );
    }

    return <>{children}</>;
}
