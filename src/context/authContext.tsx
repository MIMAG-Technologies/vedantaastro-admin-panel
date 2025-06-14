"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { checkAdmin, setOTP, verifyOTP } from "@/utils/auth";
import { useLoading } from "./loadingContext";

type Admin = {
    id: string;
    name: string;
    email: string;
};

// Safe localStorage access
const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("vedantaastro-admin-token");
    }
};

interface AuthContextType {
    admin: Admin | null;
    isAuthenticated: boolean;
    login: (email: string, otp: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    sendOTP: (email: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    logout: () => void;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const { setLoading } = useLoading();

    const sendOTP = async (email: string) => {
        setLoading(true);
        try {
            const result = await setOTP(email);
            return result;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, otp: number) => {
        setLoading(true);
        try {
            const result = await verifyOTP(email, otp);
            if (result.success) {
                await checkAuthStatus();
            }
            return result;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        removeToken();
        setAdmin(null);
        setIsAuthenticated(false);
    };

    const checkAuthStatus = async () => {
        setLoading(true);
        try {
            const result = await checkAdmin();
            if (result.success && result.admin) {
                setAdmin(result.admin);
                setIsAuthenticated(true);
            } else {
                setAdmin(null);
                setIsAuthenticated(false);
                // Clear invalid token
                removeToken();
            }
        } catch (error) {
            setAdmin(null);
            setIsAuthenticated(false);
            removeToken();
        } finally {
            setLoading(false);
        }
    };

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                admin,
                isAuthenticated,
                login,
                sendOTP,
                logout,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
