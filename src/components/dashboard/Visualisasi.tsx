import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaChartBar, FaGlobe, FaWallet, FaHandsHelping, FaFilter, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";

// Data Dummy untuk simulasi
const TOTAL_DONASI_LUNAS = 5150000;
const TOTAL_PENYALURAN = 42500000;
const DONATUR_UNIK = 8;
const PENERIMA_MANFAAT = 172;

const ALL_PERIODS = ["06/2025", "07/2025", "08/2025", "09/2025", "10/2025"];

// Helper function
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// Varian Framer Motion untuk item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Komponen Utama Halaman
const Visualisasi: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState(ALL_PERIODS[ALL_PERIODS.length - 1]); // Bulan terbaru

  // Simulasi data untuk Goal Tracking (Target vs Realisasi)
  const TARGET_BULANAN = 10000000;
  const REALISASI_BULANAN = 5150000; // Menggunakan data simulasi
  const PERSENTASE_GOAL = Math.min(100, (REALISASI_BULANAN / TARGET_BULANAN) * 100).toFixed(1);

  return (
    <DashboardLayout activeLink="/dashboard/visualisasi" pageTitle="Visualisasi & Analisis Data">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-8">
        {/* 1. Header dan Goal Tracking */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaChartBar className="mr-2 text-primary" /> Laporan Kinerja Finansial
            </h3>

            {/* Filter Periode Global */}
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-500 w-4 h-4" />
              <select value={activePeriod} onChange={(e) => setActivePeriod(e.target.value)} className="border border-gray-300 rounded-lg py-1 px-3 text-sm focus:ring-primary focus:border-primary">
                {ALL_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Total Donasi */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 flex items-center">
                <FaWallet className="mr-2" /> Donasi Lunas (Global)
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(TOTAL_DONASI_LUNAS)}</p>
            </div>
            {/* Card 2: Total Penyaluran */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 flex items-center">
                <FaHandsHelping className="mr-2" /> Dana Disalurkan (Global)
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(TOTAL_PENYALURAN)}</p>
            </div>
            {/* Card 3: Donatur & Penerima */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-700 flex items-center">
                <FaGlobe className="mr-2" /> Kontribusi Umat
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {DONATUR_UNIK} Donatur / {PENERIMA_MANFAAT} Penerima
              </p>
            </div>
            {/* Card 4: Goal Tracking */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-700">Target Bulan Ini ({activePeriod})</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{PERSENTASE_GOAL}% Tercapai</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${PERSENTASE_GOAL}%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. ANALISIS DONASI (HULU) */}
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center">
          <FaChartLine className="mr-2 text-primary" /> Analisis Dana Masuk (Donasi)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik 1: Tren Donasi Bulanan (Garis) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Donasi ({activePeriod})</h3>
            <div className="h-80 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 italic">Placeholder: Line Chart Tren Donasi Kumulatif</p>
            </div>
          </motion.div>

          {/* Grafik 2: Donasi Berdasarkan Metode (Pie) */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran Populer</h3>
            <div className="h-80 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 italic">Placeholder: Pie Chart Metode (QRIS, Transfer, Tunai)</p>
            </div>
          </motion.div>
        </div>

        {/* 3. ANALISIS PENYALURAN (HILIR) */}
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 pt-4 flex items-center">
          <FaHandsHelping className="mr-2 text-primary" /> Analisis Dana Keluar (Penyaluran)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik 3: Penyaluran Berdasarkan Program (Bar) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Alokasi Dana Berdasarkan Program Utama</h3>
            <div className="h-80 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 italic">Placeholder: Bar Chart Alokasi (INUK, MLU, Beasiswa, Diklat Tani)</p>
            </div>
          </motion.div>

          {/* Grafik 4: Penyaluran Berdasarkan Wilayah (Map/Bar) */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Penyaluran (Top 5 Kec.)</h3>
            <div className="h-80 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 italic">Placeholder: Bar/Doughnut Chart Wilayah Penyaluran</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Visualisasi;
