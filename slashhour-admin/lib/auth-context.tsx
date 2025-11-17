"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminAuthAPI } from "./api-client";

interface Admin {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("admin_token");
    const savedAdmin = localStorage.getItem("admin_user");

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error("Error parsing saved admin:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', emailOrUsername);
      const data = await adminAuthAPI.login(emailOrUsername, password);
      console.log('✅ Login successful!', data.admin);

      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));

      setAdmin(data.admin);
      router.push("/dashboard");
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
