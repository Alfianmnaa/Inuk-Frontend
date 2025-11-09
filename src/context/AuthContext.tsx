import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

// Tipe data untuk Context
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userRole: "user" | "admin" | null;
  login: (token: string, role: "user" | "admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const storedRole = localStorage.getItem("userRole");
  const initialRole = storedRole === "user" || storedRole === "admin" ? storedRole : null;
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(initialRole);

  const isAuthenticated = !!token;

  const login = (newToken: string, role: "user" | "admin") => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userRole", role);
    setToken(newToken);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserRole(null);
  };

  return <AuthContext.Provider value={{ token, isAuthenticated, userRole, login, logout }}>{children}</AuthContext.Provider>;
};

// Hook kustom untuk mempermudah penggunaan
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
  }
  return context!;
};
