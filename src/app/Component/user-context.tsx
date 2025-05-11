"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

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
    login: (user: User, tokens?: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    loading: boolean;
    register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://msfoodsbackend.vercel.app/";

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const logout = useCallback(async (shouldCallServer = true) => {
        if (shouldCallServer) {
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                });
            } catch {
                console.warn("Server logout failed");
            }
        }

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        Cookies.remove("accessToken", { path: "/", domain: "msfoods.pk" });
        setUser(null);

        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
            duration: 1000,
        });

        router.push("/auth/login");
    }, [router, toast]);

    useEffect(() => {
        const checkAndRestoreSession = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!accessToken || !refreshToken) {
                setLoading(false);
                return;
            }

            try {
                const meRes = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: "include",
                });

                if (meRes.ok) {
                    const meData = await meRes.json();
                    setUser(meData.data);
                    localStorage.setItem("user", JSON.stringify(meData.data));
                    return;
                }

                const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                    credentials: "include",
                });

                if (!refreshRes.ok) throw new Error("Refresh failed");

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshRes.json();
                localStorage.setItem("accessToken", newAccessToken);
                localStorage.setItem("refreshToken", newRefreshToken);
                Cookies.set("accessToken", newAccessToken, {
                    expires: 7,
                    path: "/",
                    domain: "msfoods.pk",
                    secure: true,
                    sameSite: "Lax",
                });

                const newMeRes = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${newAccessToken}` },
                    credentials: "include",
                });

                if (newMeRes.ok) {
                    const meData = await newMeRes.json();
                    setUser(meData.data);
                    localStorage.setItem("user", JSON.stringify(meData.data));
                } else {
                    throw new Error("Failed to fetch user after token refresh");
                }
            } catch (error) {
                console.error("Session restore failed:", error);
                logout(false);
            } finally {
                setLoading(false);
            }
        };

        checkAndRestoreSession();
    }, [logout]);

    const login = (user: User, tokens?: { accessToken: string; refreshToken: string }) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        if (tokens) {
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);
            Cookies.set("accessToken", tokens.accessToken, {
                expires: 7,
                path: "/",
                domain: "msfoods.pk",
                secure: true,
                sameSite: "Lax",
            });
        }
    };

    const register = async (name: string, email: string, password: string, phone?: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            localStorage.setItem("user", JSON.stringify(data.data.user));
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            Cookies.set("accessToken", data.data.accessToken, {
                expires: 7,
                path: "/",
                domain: "msfoods.pk",
                secure: true,
                sameSite: "Lax",
            });

            setUser(data.data.user);

            toast({
                title: "Registration successful",
                description: "Your account has been created!",
                duration: 1000,
            });

            router.push("/");
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "An error occurred during registration",
                variant: "destructive",
                duration: 1000,
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
                register,
                logout,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
