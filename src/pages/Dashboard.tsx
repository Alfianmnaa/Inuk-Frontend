import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Visualisasi from "../components/dashboard/Visualisasi";
import TransaksiDonasi from "../components/dashboard/TransaksiDonasi";
import PenyaluranDana from "../components/dashboard/PenyaluranDana";
import DonaturPenerima from "../components/dashboard/DonaturPenerima";
import CMSBerita from "../components/dashboard/CMSBerita";

// Halaman Dummy Dashboard Utama
const DashboardUtama = () => (
  <DashboardLayout activeLink="/dashboard" pageTitle="Dashboard Utama">
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800">Selamat Datang di Admin INUK!</h3>
      <p className="mt-2 text-gray-600">Gunakan menu di samping untuk mengelola data donasi, penyaluran, dan konten website.</p>
    </div>
  </DashboardLayout>
);

const DashboardRoutes: React.FC = () => {
  // const { isAuthenticated } = useAuth();

  // Jika user belum login
  // if (!isAuthenticated) {
  //     return <Navigate to="/login" replace />;
  // }

  return (
    <Routes>
      <Route index element={<DashboardUtama />} />

      <Route path="/visualisasi" element={<Visualisasi />} />
      <Route path="/transaksi" element={<TransaksiDonasi />} />
      <Route path="/penyaluran" element={<PenyaluranDana />} />
      <Route path="/donatur-penerima" element={<DonaturPenerima />} />
      <Route path="/cms-berita" element={<CMSBerita />} />

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
