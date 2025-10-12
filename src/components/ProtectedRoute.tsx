// src/components/ProtectedRoute.tsx
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Sesuaikan path jika berbeda

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  // Memeriksa token dan status autentikasi
  if (!isAuthenticated || !token) {
    // Mengarahkan ke halaman login jika belum terautentikasi
    return <Navigate to="/login" replace />;
  }

  // Menambahkan token ke header Axios secara global (opsional, tapi disarankan)
  // Anda bisa melakukan ini di file config Axios, tapi di sini kita cukup diabaikan untuk kesederhanaan.

  // Tampilkan konten jika terautentikasi
  return <>{children}</>;
};

export default ProtectedRoute;
