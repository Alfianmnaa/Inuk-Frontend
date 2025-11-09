import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Visualisasi from "../components/dashboard/Visualisasi";
import PenyaluranDana from "../components/dashboard/PenyaluranDana";
// import DonaturPenerima from "../components/dashboard/DonaturPenerima";
import CMSBerita from "../components/dashboard/CMSBerita";
import ProtectedRoute from "../components/ProtectedRoute";
import RegionManagement from "../components/dashboard/RegionManagement";
import TransaksiDonasi from "../components/dashboard/TransaksiDonasi";
import DonaturManagement from "../components/dashboard/DonaturManagement";

// Halaman Dummy Dashboard Utama
const DashboardUtama = () => (
  <ProtectedRoute>
    <DashboardLayout activeLink="/dashboard" pageTitle="Dashboard Utama">
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800">Selamat Datang di Admin INUK!</h3>
        <p className="mt-2 text-gray-600">Gunakan menu di samping untuk mengelola data donasi, penyaluran, dan konten website.</p>
      </div>
    </DashboardLayout>
  </ProtectedRoute>
);

const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<DashboardUtama />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardUtama />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visualisasi"
        element={
          <ProtectedRoute>
            <Visualisasi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaksi"
        element={
          <ProtectedRoute>
            <TransaksiDonasi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/penyaluran"
        element={
          <ProtectedRoute>
            <PenyaluranDana />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donatur-management"
        element={
          <ProtectedRoute>
            <DonaturManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cms-berita"
        element={
          <ProtectedRoute>
            <CMSBerita />
          </ProtectedRoute>
        }
      />

      <Route
        path="/region-management"
        element={
          <ProtectedRoute>
            <RegionManagement />
          </ProtectedRoute>
        }
      />

      {/* Rute 404 Dashboard */}
      <Route
        path="*"
        element={
          <DashboardLayout activeLink="" pageTitle="404 Not Found">
            <p className="text-center text-red-500">Halaman Dashboard tidak ditemukan.</p>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default DashboardRoutes;
