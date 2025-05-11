"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface User {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    role: string;
    accessToken?: string;
}

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (
        user: User,
        tokens?: { accessToken: string; refreshToken: string }
    ) => void;
    logout: () => void;
    loading: boolean;
    register: (
        name: string,
        email: string,
        password: string,
        phone?: string
    ) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://msfoodsbackend.vercel.app";

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const logout = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
        setUser(null);
        toast({ title: "Logged out", description: "Session ended." });
        router.push("/auth/login");
    }, [router, toast]);

    useEffect(() => {
        const checkAndRestoreSession = async () => {
            if (typeof window === "undefined") return;

            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!accessToken || !refreshToken) {
                setLoading(false);
                return;
            }

            try {
                const meRes = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (meRes.ok) {
                    const meData = await meRes.json();
                    const fullUser = { ...meData.data, accessToken };
                    setUser(fullUser);
                    localStorage.setItem("user", JSON.stringify(fullUser));
                    return;
                }

                // Refresh token if access token fails
                const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!refreshRes.ok) throw new Error("Refresh failed");

                const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                } = await refreshRes.json();

                localStorage.setItem("accessToken", newAccessToken);
                localStorage.setItem("refreshToken", newRefreshToken);

                const newMeRes = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${newAccessToken}` },
                });

                if (newMeRes.ok) {
                    const meData = await newMeRes.json();
                    const updatedUser = { ...meData.data, accessToken: newAccessToken };
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                } else {
                    throw new Error("Failed to fetch user after token refresh");
                }
            } catch (error) {
                console.error("Session restore failed:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkAndRestoreSession();
    }, [logout]);

    const login = (
        user: User,
        tokens?: { accessToken: string; refreshToken: string }
    ) => {
        const fullUser = {
            ...user,
            accessToken: tokens?.accessToken || user.accessToken,
        };
        setUser(fullUser);

        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(fullUser));
            if (tokens) {
                localStorage.setItem("accessToken", tokens.accessToken);
                localStorage.setItem("refreshToken", tokens.refreshToken);
            }
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        phone?: string
    ) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Registration failed");

            const newUser = {
                ...data.data.user,
                accessToken: data.data.accessToken,
            };

            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(newUser));
                localStorage.setItem("accessToken", data.data.accessToken);
                localStorage.setItem("refreshToken", data.data.refreshToken);
            }

            setUser(newUser);
            toast({ title: "Registration successful" });
            router.push("/");
        } catch (err: unknown) {
            toast({
                title: "Registration failed",
                description: err instanceof Error ? err.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                register,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
