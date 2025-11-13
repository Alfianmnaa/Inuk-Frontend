// inuk-frontend/src/components/dashboard/TransaksiDonasi.tsx

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaFilter, FaFileExcel, FaSpinner, FaSortDown as FaSortDesc, FaSortUp as FaSortAsc, FaWhatsapp, FaInfoCircle } from "react-icons/fa";
import { Edit, Trash2, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import Pagination from "./ui/Pagination";
import AddressSelector, { type AddressSelection } from "./AddressSelector";
import AddTransactionModal from "./ui/AddTransactionModal";
import BendaharaModal from "./ui/BendaharaModal";
import { getDonations, type TransactionAPI, type DonationsResponse, type DonationsFilter, getDonationMethods, updateDonation, deleteDonation, type UpdateDonationRequest } from "../../services/DonationService";
import { useAuth } from "../../context/AuthContext";
import { generateExcelBlob, downloadExcelFromBlob } from "../../utils/ExportToExcel";

import { getRegions, type RegionDetail } from "../../services/RegionService";

import EditDonationModal from "./ui/EditDonationModal";
import DeleteConfirmationModal from "./ui/DeleteConfirmationModal";

// Data Type Transaksi LOKAL
interface Transaction extends TransactionAPI {
  tanggalFormatted: string;
  methodDisplay: string;
}

// Interface untuk data Bendahara (untuk ditampilkan di component)
interface BendaharaDisplay {
  name: string;
  phone: string;
}

// Helper function untuk membaca data Bendahara dari Local Storage
const getBendaharaFromStorage = (): BendaharaDisplay => {
  // Ambil data yang tersimpan dari modal
  const name = localStorage.getItem("bendahara_name") || "Belum Ditetapkan";
  const phone = localStorage.getItem("bendahara_phone") || "N/A";
  return { name, phone };
};

// Helper function
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// Component Utama Halaman
const TransaksiDonasi: React.FC = () => {
  const { token, userRole } = useAuth();
  const isUserRole = userRole === "user";

  // --- State Link Download ---
  const [generatedDownloadLink, setGeneratedDownloadLink] = useState<string | null>(null);
  const [linkExpiryTime, setLinkExpiryTime] = useState<Date | null>(null);

  // --- State untuk Enforced Filtering (Frontend-Only Restriction) ---
  const [userRegionFilter, setUserRegionFilter] = useState<DonationsFilter>({});
  const [isRegionEnforcementLoading, setIsRegionEnforcementLoading] = useState(true);

  const [bendaharaDisplay, setBendaharaDisplay] = useState<BendaharaDisplay>(getBendaharaFromStorage());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [methodsList, setMethodsList] = useState<string[]>([]);
  const [transactionsData, setTransactionsData] = useState<DonationsResponse>({ total_page: 1, current_page: 1, has_next_page: false, result: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBendaharaModalOpen, setIsBendaharaModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addressFilters, setAddressFilters] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });
  const [sortConfig, setSortConfig] = useState<{ key: keyof TransactionAPI | "total" | null; direction: "asc" | "desc" }>({
    key: "date_time",
    direction: "desc",
  });

  // --- Cleanup Effect untuk Object URL ---
  useEffect(() => {
    return () => {
      if (generatedDownloadLink) {
        URL.revokeObjectURL(generatedDownloadLink);
      }
    };
  }, [generatedDownloadLink, token]);

  const refreshBendaharaDisplay = () => {
    setBendaharaDisplay(getBendaharaFromStorage());
  };

  const checkBendaharaData = () => {
    const { phone } = getBendaharaFromStorage();
    return phone !== "N/A" && phone.replace(/[^\d+]/g, "").length > 5;
  };

  const handleAddTransactionClick = () => {
    if (checkBendaharaData()) {
      setIsModalOpen(true);
    } else {
      toast.error("Data Bendahara belum lengkap. Mohon atur data Bendahara terlebih dahulu.");
      setIsBendaharaModalOpen(true);
    }
  };

  const totalDonationAmount = useMemo(() => {
    return transactionsData.result.reduce((sum, t) => sum + t.total, 0);
  }, [transactionsData.result]);

  // --- FUNGSI: Fetch Region User untuk Enforcement ---
  const fetchUserRegionForEnforcement = useCallback(async () => {
    if (userRole !== "user" || !token) {
      setUserRegionFilter({});
      setIsRegionEnforcementLoading(false);
      return;
    }

    setIsRegionEnforcementLoading(true);
    try {
      const allRegions = await getRegions({});
      const userRegion = allRegions.find((r: RegionDetail) => r.kabupaten_kota === "Kudus");

      if (userRegion) {
        setUserRegionFilter({
          province: userRegion.provinsi,
          city: userRegion.kabupaten_kota,
          subdistrict: userRegion.kecamatan,
          village: userRegion.desa_kelurahan,
        });
      } else {
        toast.error("Tidak ada Region yang terikat ke akun Anda. Akses dibatasi.");
        setUserRegionFilter({ province: "NONE", city: "NONE", subdistrict: "NONE", village: "NONE" });
      }
    } catch (error) {
      toast.error("Gagal memuat konteks Region. Akses dibatasi.");
      setUserRegionFilter({ province: "NONE", city: "NONE", subdistrict: "NONE", village: "NONE" });
    } finally {
      setIsRegionEnforcementLoading(false);
    }
  }, [token, userRole]);

  // --- Data Fetching Utama ---
  const fetchTransactions = async (page: number) => {
    if (!token) return;

    if (userRole === "user" && isRegionEnforcementLoading) return;
    if (userRole === "user" && userRegionFilter.province === "NONE") {
      setTransactionsData({ total_page: 0, current_page: 1, has_next_page: false, result: [] });
      return;
    }

    setIsLoading(true);
    setCurrentPage(page);

    // LOGIKA ENFORCEMENT FILTER BERDASARKAN ROLE
    let enforcedFilters: DonationsFilter;

    if (userRole === "user") {
      enforcedFilters = {
        ...userRegionFilter,
        page: page,
        method: filterMethod || undefined,
        sortBy: sortConfig.key === "date_time" ? (sortConfig.direction === "desc" ? "newest" : "oldest") : undefined,
      };
    } else {
      // ADMIN: Gunakan filter dari UI
      enforcedFilters = {
        page: page,
        method: filterMethod || undefined,
        province: addressFilters.province || undefined,
        city: addressFilters.city || undefined,
        subdistrict: addressFilters.subdistrict || undefined,
        village: addressFilters.village || undefined,
        sortBy: sortConfig.key === "date_time" ? (sortConfig.direction === "desc" ? "newest" : "oldest") : undefined,
      };
    }

    try {
      const data = await getDonations(token, enforcedFilters);

      const formattedResults: Transaction[] = data.result.map((t) => ({
        ...t,
        tanggalFormatted: new Date(t.date_time).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        methodDisplay: t.method.toUpperCase().replace(/_/g, " "),
      }));

      setTransactionsData({ ...data, result: formattedResults });
    } catch (error: any) {
      toast.error("Gagal memuat data transaksi.");
      console.error("Fetch Transactions Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handler CRUD ---
  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleUpdate = async (id: string, data: UpdateDonationRequest) => {
    if (!token) return;
    try {
      await updateDonation(token, id, data);
      toast.success("Transaksi berhasil diperbarui!");
      fetchTransactions(currentPage);
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(`Gagal memperbarui transaksi: ${error.response?.data?.message || error.message}`);
      console.error("Update Error:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteDonation(token, id);
      toast.success("Transaksi berhasil dihapus!");
      fetchTransactions(currentPage);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error(`Gagal menghapus transaksi: ${error.response?.data?.message || error.message}`);
      console.error("Delete Error:", error);
      throw error;
    }
  };

  // --- Fetch Methods List & Initial Load ---
  useEffect(() => {
    if (token) {
      getDonationMethods(token)
        .then(setMethodsList)
        .catch(() => toast.error("Gagal memuat daftar metode pembayaran."));
    }
    refreshBendaharaDisplay();
  }, [token]);

  // Effect 1: Ambil region user saat mount/login
  useEffect(() => {
    fetchUserRegionForEnforcement();
  }, [fetchUserRegionForEnforcement]);

  // Effect 2: Trigger fetch saat filter, sorting, atau role/region enforcement berubah
  useEffect(() => {
    if (userRole === "admin" || !isRegionEnforcementLoading) {
      fetchTransactions(1);
    }
  }, [filterMethod, addressFilters.subdistrict, addressFilters.village, sortConfig.key, sortConfig.direction, token, userRole, isRegionEnforcementLoading]);

  // Handle Search Bar
  const filteredBySearch = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) return transactionsData.result as Transaction[];

    return transactionsData.result.filter((t) => t.name.toLowerCase().includes(lowerCaseSearch) || t.id.includes(lowerCaseSearch)) as Transaction[];
  }, [searchTerm, transactionsData.result]);

  // --- Logika Sorting Lokal (Hanya untuk Total) ---
  const sortedTransactions = useMemo(() => {
    let items = [...filteredBySearch];
    if (sortConfig.key === "total") {
      items.sort((a, b) => {
        const comparison = a.total - b.total;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return items;
  }, [filteredBySearch, sortConfig.key, sortConfig.direction]);

  const requestSort = (key: keyof TransactionAPI | "total") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- FUNGSI EXCEL & LINK DOWNLOAD ---
  const createExportData = () => {
    return sortedTransactions.map((t) => ({
      ID_Transaksi: t.id,
      Tanggal: t.tanggalFormatted,
      Donatur: t.name,
      Provinsi: t.provinsi,
      Kota: t.kabupaten_kota,
      Kecamatan: t.kecamatan,
      Desa: t.desa_kelurahan,
      Total_Donasi: t.total,
      Metode: t.methodDisplay,
    }));
  };

  const handleCreateDownloadLink = () => {
    if (sortedTransactions.length === 0) {
      toast("Tidak ada data untuk diexport.", { icon: "⚠️" });
      return;
    }

    const dataToExport = createExportData();
    const excelBlob = generateExcelBlob(dataToExport, "Transaksi");

    if (excelBlob) {
      if (generatedDownloadLink) {
        URL.revokeObjectURL(generatedDownloadLink);
      }

      const newUrl = URL.createObjectURL(excelBlob);
      setGeneratedDownloadLink(newUrl);

      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      setLinkExpiryTime(expiry);

      toast.success("Link download berhasil dibuat! Salin link di bawah filter data.");
    } else {
      toast.error("Gagal membuat file Excel.");
    }
  };

  const handleInstantDownload = () => {
    if (sortedTransactions.length === 0) {
      toast("Tidak ada data untuk diunduh.", { icon: "⚠️" });
      return;
    }

    const dataToExport = createExportData();
    const filename = "Laporan_Donasi_INUK";

    const excelBlob = generateExcelBlob(dataToExport, "Transaksi");
    downloadExcelFromBlob(excelBlob, filename);
  };

  const handleCopyLink = () => {
    if (generatedDownloadLink) {
      navigator.clipboard.writeText(generatedDownloadLink);
      toast.success("Link berhasil disalin ke clipboard!");
    }
  };

  // --- UI LOGIC ---
  const isFiltered = addressFilters.subdistrict || filterMethod || searchTerm;
  const clearFilters = () => {
    setSearchTerm("");
    setAddressFilters({ province: "", city: "", subdistrict: "", village: "" });
    setFilterMethod("");
    fetchTransactions(1);
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const finalLoading = isLoading || isRegionEnforcementLoading;
  const isUserBlocked = userRole === "user" && userRegionFilter.province === "NONE";

  return (
    <DashboardLayout activeLink="/dashboard/transaksi" pageTitle="Pencatatan Donasi (INFAQ/ZIS)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah Transaksi */}
        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchTransactions(1)} />

        {/* Modal Bendahara (DENGAN PROPS LINK) */}
        <BendaharaModal isOpen={isBendaharaModalOpen} onClose={() => setIsBendaharaModalOpen(false)} onSuccess={refreshBendaharaDisplay} onDelete={refreshBendaharaDisplay} excelLink={generatedDownloadLink} linkExpiry={linkExpiryTime} />

        {/* Modal Edit */}
        {selectedTransaction && isEditModalOpen && <EditDonationModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={selectedTransaction} onUpdate={handleUpdate} />}

        {/* Modal Hapus */}
        {selectedTransaction && isDeleteModalOpen && <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} transaction={selectedTransaction} onConfirmDelete={handleDelete} />}

        {/* Ringkasan Statistik */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Total Jumlah Donasi (Halaman Ini)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalDonationAmount)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Jumlah Transaksi (Ditemukan)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{transactionsData.result.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Total Halaman</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{transactionsData.total_page}</p>
          </div>
        </motion.div>

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Data
            </h3>
            {isUserRole && (
              <div className="flex space-x-2 flex-wrap justify-end">
                {/* Tampilkan Data Bendahara yang Sedang Aktif */}
                <div className="bg-yellow-50 p-2 rounded-lg text-xs self-center border border-yellow-200 mr-4 hidden sm:block">
                  <p className="font-semibold text-yellow-800">Bendahara Aktif:</p>
                  <p className="text-gray-700">
                    {bendaharaDisplay.phone} ({bendaharaDisplay.name})
                  </p>
                </div>

                {/* Tombol Konfirmasi Bendahara */}
                <motion.button
                  onClick={() => setIsBendaharaModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors mb-2"
                  title={`Atur data Bendahara saat ini: ${bendaharaDisplay.name}`}
                >
                  <FaWhatsapp className="mr-2" /> Konfirmasi Bendahara
                </motion.button>

                {/* Tombol Buat Link Download */}
                <motion.button
                  onClick={handleCreateDownloadLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-blue-600 transition-colors mb-2"
                >
                  <FaFileExcel className="mr-2" /> Buat Link Download
                </motion.button>

                {/* Tombol Download Instan */}
                <motion.button
                  onClick={handleInstantDownload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-indigo-600 transition-colors mb-2"
                >
                  <FaFileExcel className="mr-2" /> Download Instan
                </motion.button>

                {/* Tombol Tambah Transaksi */}
                <motion.button
                  onClick={handleAddTransactionClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-700 transition-colors mb-2"
                >
                  <FaPlus className="mr-2" /> Tambah Transaksi
                </motion.button>
              </div>
            )}
          </div>

          {/* AREA LINK DOWNLOAD */}
          {generatedDownloadLink && linkExpiryTime && (
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg border border-yellow-300 text-sm break-words">
              <p className="font-bold text-yellow-800 mb-2 flex items-center">
                <FaFileExcel className="mr-2" /> Link Download Excel Sementara
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                {/* Link Teks */}
                <a
                  href={generatedDownloadLink}
                  download={`Laporan_Donasi_INUK_${new Date().toISOString().substring(0, 10)}.xlsx`}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer flex-1 min-w-0 break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Klik untuk mengunduh"
                >
                  {generatedDownloadLink}
                </a>

                {/* Tombol Aksi */}
                <div className="flex space-x-2">
                  <button onClick={handleCopyLink} className="flex items-center text-gray-700 bg-gray-200 hover:bg-gray-300 p-1 px-3 rounded-md transition-colors text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Salin
                  </button>

                  <button
                    onClick={() => setIsBendaharaModalOpen(true)} // Buka modal Bendahara untuk kirim WA
                    className="flex items-center text-white bg-green-500 hover:bg-green-600 p-1 px-3 rounded-md transition-colors text-xs"
                  >
                    <FaWhatsapp className="w-3 h-3 mr-1" /> Bagikan
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-yellow-700">
                *Link ini dibuat di *browser* Anda dan hanya berlaku **sementara** (hingga sekitar {linkExpiryTime.toLocaleTimeString("id-ID")} atau browser ditutup). Harap segera diunduh oleh Bendahara.
              </p>
            </div>
          )}

          {/* Input Filter Grid */}
          <div className="space-y-4">
            {/* Row 1: Search, Metode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar (Fungsi lokal) */}
              <div className="relative md:col-span-2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari Donatur atau ID Transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>

              {/* Filter Metode */}
              <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
                <option value="">Semua Metode</option>
                {methodsList.map((method) => (
                  <option key={method} value={method}>
                    {method.toUpperCase().replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Address Selector (Akses Kontrol) */}
            <div className="grid grid-cols-1 gap-4">
              {userRole === "admin" ? (
                <AddressSelector value={addressFilters} onChange={setAddressFilters} levels={["subdistrict", "village"]} kecamatanName="Kecamatan Donatur" />
              ) : (
                <div className="text-sm text-gray-600 flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {finalLoading ? <FaSpinner className="animate-spin mr-2" /> : isUserBlocked ? <FaInfoCircle className="mr-2 text-red-500" /> : <FaInfoCircle className="mr-2 text-blue-500" />}
                  {finalLoading ? "Memuat Region Konteks..." : isUserBlocked ? "Akses Dibatasi: Akun Anda tidak terikat pada Region manapun." : `Data dibatasi untuk Region: ${userRegionFilter.subdistrict} / ${userRegionFilter.village}`}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filter Button */}
          {isFiltered && !isUserRole && (
            <motion.button onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
              <FaTimes className="mr-1" /> Bersihkan Filter
            </motion.button>
          )}
        </motion.div>

        {/* Tabel Data Transaksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tabel Detail Transaksi</h3>
          {finalLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data transaksi...
            </div>
          ) : isUserBlocked ? (
            <div className="text-center py-10 text-red-500 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold">Akses Dibatasi!</p>
              <p>Akun Anda tidak terikat pada Region (Desa/Kelurahan) manapun. Silakan hubungi Administrator untuk penetapan wilayah kerja.</p>
            </div>
          ) : (
            <>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="py-3 px-4 text-left">ID</th>
                    <TableSortHeader label="Tanggal" sortKey="date_time" sortConfig={sortConfig} requestSort={requestSort} />
                    <th className="py-3 px-4 text-left">Donatur (Nama)</th>
                    <th className="py-3 px-4 text-left">Lokasi (Kec/Des)</th>

                    <TableSortHeader label="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} align="right" />
                    <th className="py-3 px-4 text-left">Metode</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((t) => (
                      <tr key={t.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium max-w-[100px] truncate">{t.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">{t.tanggalFormatted}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{t.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          {t.kecamatan} / {t.desa_kelurahan}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">{formatRupiah(t.total)}</td>
                        <td className="py-3 px-4">{t.methodDisplay}</td>
                        {/* KOLOM AKSI */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Tombol Update - menggunakan handleOpenEditModal */}
                            <button onClick={() => handleOpenEditModal(t)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Edit Transaksi">
                              <Edit size={18} />
                            </button>
                            {/* Tombol Delete - menggunakan handleOpenDeleteModal */}
                            <button onClick={() => handleOpenDeleteModal(t)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus Transaksi">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                        Tidak ada data transaksi yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <Pagination currentPage={transactionsData.current_page} totalPages={transactionsData.total_page} hasNextPage={transactionsData.has_next_page} onPageChange={(page) => fetchTransactions(page)} />
            </>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TransaksiDonasi;

// Komponen Pembantu untuk Sorting Header (TIDAK BERUBAH)
interface SortHeaderProps {
  label: string;
  sortKey: keyof TransactionAPI | "total";
  sortConfig: { key: keyof TransactionAPI | "total" | null; direction: "asc" | "desc" };
  requestSort: (key: keyof TransactionAPI | "total") => void;
  align?: "left" | "right" | "center";
}

const TableSortHeader: React.FC<SortHeaderProps> = ({ label, sortKey, sortConfig, requestSort, align = "left" }) => {
  const isSorted = sortConfig.key === sortKey;
  const direction = sortConfig.direction;

  const isDesc = direction === "desc";

  return (
    <th className={`py-3 px-4 text-${align} cursor-pointer select-none hover:text-gray-900 transition-colors`} onClick={() => requestSort(sortKey)}>
      <div className={`flex items-center ${align === "right" ? "justify-end" : "justify-start"}`}>
        {label}
        {isSorted && <span className="ml-2">{isDesc ? <FaSortDesc className="w-3 h-3 text-primary" /> : <FaSortAsc className="w-3 h-3 text-primary" />}</span>}
        {!isSorted && <FaSortAsc className="w-3 h-3 ml-2 text-gray-400 opacity-50" />}
      </div>
    </th>
  );
};
