// inuk-frontend/src/components/dashboard/TransaksiDonasi.tsx

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaFilter, FaFileExcel, FaSortDown as FaSortDesc, FaSortUp as FaSortAsc, FaWhatsapp, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
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
import { getTreasurer, type GetTreasurerResponse } from "../../services/UserService";

import EditDonationModal from "./ui/EditDonationModal";
import DeleteConfirmationModal from "./ui/DeleteConfirmationModal";

// --- KONSTANTA FONNTE DARI USER ---
// const FONNTE_BOT_NUMBER = "6281252245886";
const FONNTE_TOKEN = import.meta.env.FONNTE_TOKEN;
console.log(FONNTE_TOKEN);

// Data Type Transaksi LOKAL
interface Transaction extends TransactionAPI {
  tanggalFormatted: string;
  methodDisplay: string;
}

// Data Bendahara DEFAULT
const INITIAL_TREASURER_DATA: GetTreasurerResponse = {
  treasurer_name: "Belum Ditetapkan",
  treasurer_phone: "",
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

  // State Filter Waktu BARU
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // State Bendahara (DARI API)
  const [treasurerData, setTreasurerData] = useState<GetTreasurerResponse>(INITIAL_TREASURER_DATA);
  const [isTreasurerLoading, setIsTreasurerLoading] = useState(false);

  // State untuk Enforced Filtering (Frontend-Only Restriction)
  const [userRegionFilter, setUserRegionFilter] = useState<DonationsFilter>({});
  const [isRegionEnforcementLoading, setIsRegionEnforcementLoading] = useState(true);

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

  // FUNGSI: Fetch Data Bendahara (TETAP SAMA)
  const fetchTreasurer = useCallback(async () => {
    if (!token || userRole !== "user") return;
    setIsTreasurerLoading(true);
    try {
      const data = await getTreasurer(token);
      setTreasurerData(data);
    } catch (error) {
      setTreasurerData(INITIAL_TREASURER_DATA);
      console.error("Fetch Treasurer Error:", error);
    } finally {
      setIsTreasurerLoading(false);
    }
  }, [token, userRole]);

  // Logika Cek Data Bendahara
  const isTreasurerValid = useMemo(() => {
    return !!(treasurerData.treasurer_name && treasurerData.treasurer_phone);
  }, [treasurerData]);

  const handleAddTransactionClick = () => {
    if (isTreasurerValid) {
      setIsModalOpen(true);
    } else {
      toast.error("Data Bendahara belum lengkap. Mohon atur data Bendahara terlebih dahulu.");
      setIsBendaharaModalOpen(true);
    }
  };

  const totalDonationAmount = useMemo(() => {
    return transactionsData.result.reduce((sum, t) => sum + t.total, 0);
  }, [transactionsData.result]);

  // FUNGSI: Fetch Region User untuk Enforcement (TETAP SAMA)
  const fetchUserRegionForEnforcement = useCallback(async () => {
    if (userRole !== "user" || !token) {
      setUserRegionFilter({});
      setIsRegionEnforcementLoading(false);
      return;
    }

    setIsRegionEnforcementLoading(true);
    try {
      const allRegions = await getRegions({});
      allRegions.find((r: RegionDetail) => r.user_id === localStorage.getItem("user_id_temp_hack"));
      const userVillageFromStorage = localStorage.getItem("user_village");
      const userRegionByVillage = allRegions.find((r: RegionDetail) => r.desa_kelurahan === userVillageFromStorage);

      if (userRegionByVillage) {
        setUserRegionFilter({
          province: userRegionByVillage.provinsi,
          city: userRegionByVillage.kabupaten_kota,
          subdistrict: userRegionByVillage.kecamatan,
          village: userRegionByVillage.desa_kelurahan,
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

  // Data Fetching Utama (TETAP SAMA)
  const fetchTransactions = async (page: number) => {
    if (!token) return;

    if (userRole === "user" && isRegionEnforcementLoading) return;
    if (userRole === "user" && userRegionFilter.province === "NONE") {
      setTransactionsData({ total_page: 0, current_page: 1, has_next_page: false, result: [] });
      return;
    }

    setIsLoading(true);
    setCurrentPage(page);

    const getRfc3339 = (dateStr: string, isEnd: boolean) => {
      if (!dateStr) return undefined;
      const time = isEnd ? "T23:59:59Z" : "T00:00:00Z";
      return `${dateStr}${time}`;
    };

    const startDateTime = getRfc3339(startDateFilter, false);
    const endDateTime = getRfc3339(endDateFilter, true);

    let enforcedFilters: DonationsFilter;

    if (userRole === "user") {
      enforcedFilters = {
        ...userRegionFilter,
        page: page,
        method: filterMethod || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        sortBy: sortConfig.key === "date_time" ? (sortConfig.direction === "desc" ? "newest" : "oldest") : undefined,
      };
    } else {
      enforcedFilters = {
        page: page,
        method: filterMethod || undefined,
        province: addressFilters.province || undefined,
        city: addressFilters.city || undefined,
        subdistrict: addressFilters.subdistrict || undefined,
        village: addressFilters.village || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
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

  // Handler CRUD (TETAP SAMA)
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

  // Fetch Methods List & Initial Load (TETAP SAMA)
  useEffect(() => {
    if (token) {
      getDonationMethods(token)
        .then(setMethodsList)
        .catch(() => toast.error("Gagal memuat daftar metode pembayaran."));
    }
  }, [token]);

  // Effect 1: Ambil region user saat mount/login
  useEffect(() => {
    fetchUserRegionForEnforcement();
  }, [fetchUserRegionForEnforcement]);

  // Effect 2: Ambil data Bendahara saat mount/login (hanya untuk user)
  useEffect(() => {
    fetchTreasurer();
  }, [fetchTreasurer]);

  // Effect 3: Trigger fetch saat filter, sorting, atau role/region enforcement berubah
  useEffect(() => {
    if (userRole === "admin" || !isRegionEnforcementLoading) {
      fetchTransactions(1);
    }
  }, [filterMethod, addressFilters.subdistrict, addressFilters.village, startDateFilter, endDateFilter, sortConfig.key, sortConfig.direction, token, userRole, isRegionEnforcementLoading]);

  // Handle Search Bar (TETAP SAMA)
  const filteredBySearch = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) return transactionsData.result as Transaction[];

    return transactionsData.result.filter((t) => t.name.toLowerCase().includes(lowerCaseSearch) || t.id.includes(lowerCaseSearch)) as Transaction[];
  }, [searchTerm, transactionsData.result]);

  // Logika Sorting Lokal (Hanya untuk Total) (TETAP SAMA)
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

  // --- FUNGSI EXCEL & Fonnte ---
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

  // FUNGSI UTAMA UNTUK KIRIM EXCEL MENGGUNAKAN FORMDATA
  const handleSendExcelToWa = async () => {
    if (sortedTransactions.length === 0) {
      toast("Tidak ada data untuk dikirim.", { icon: "⚠️" });
      return;
    }

    if (!isTreasurerValid) {
      toast.error("Data Bendahara belum lengkap. Mohon atur data Bendahara terlebih dahulu.");
      setIsBendaharaModalOpen(true);
      return;
    }

    const dataToExport = createExportData();
    // Generate Blob file Excel
    const excelBlob = generateExcelBlob(dataToExport, "Transaksi");

    if (!excelBlob) {
      toast.error("Gagal membuat file Excel.");
      return;
    }

    // --- MEMBANGUN FORMDATA UNTUK PENGIRIMAN FILE ---
    const formData = new FormData();
    const fileName = `Laporan_Donasi_INUK_${new Date().toISOString().substring(0, 10)}.xlsx`;
    const waNumber = treasurerData.treasurer_phone.replace("+", "");
    const captionText = `Halo Bpk/Ibu ${treasurerData.treasurer_name},\n\nTerlampir Laporan Donasi INUK dari *${userRegionFilter.village || userRegionFilter.subdistrict || "Region"}* periode ${startDateFilter || "Awal"} s/d ${
      endDateFilter || "Sekarang"
    }.`;

    formData.append("target", waNumber);
    formData.append("file", excelBlob, fileName);

    // --- PERBAIKAN: Tambahkan 'message' sebagai field teks utama
    formData.append("message", captionText);

    formData.append("caption", captionText);
    formData.append("delay", "2");
    formData.append("schedule", "0");
    formData.append("prioritize", "true");
    formData.append("notif", "false");

    // --- AKHIR FORMDATA ---

    const sendToast = toast.loading("Mengirim file Excel via Fonnte...");

    try {
      // Panggil API Fonnte menggunakan FormData
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: FONNTE_TOKEN,
          // Content-Type DIHILANGKAN
        },
        body: formData, // Mengirim objek FormData
      });

      // Cek respons
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText.substring(0, 100)}...`);
      }

      const result = await response.json();

      if (result.status === true) {
        toast.success("File Excel berhasil dikirim ke WhatsApp Bendahara!", { id: sendToast });
      } else {
        const errMsg = result.reason || `Gagal mengirim: ${result.detail || "Periksa status akun Fonnte Anda."}`;
        toast.error(errMsg, { id: sendToast });
        console.error("Fonnte API Error:", result);
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan saat mengirim file (Cek Konsol).", { id: sendToast });
      console.error("Fonnte Send Error:", error.message || error);
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

  // --- UI LOGIC ---
  const isFiltered = addressFilters.subdistrict || filterMethod || searchTerm || startDateFilter || endDateFilter;
  const clearFilters = () => {
    setSearchTerm("");
    setFilterMethod("");
    setStartDateFilter("");
    setEndDateFilter("");
    setAddressFilters({ province: "", city: "", subdistrict: "", village: "" });
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const finalLoading = isLoading || isRegionEnforcementLoading || isTreasurerLoading;
  const isUserBlocked = userRole === "user" && userRegionFilter.province === "NONE";

  return (
    <DashboardLayout activeLink="/dashboard/transaksi" pageTitle="Pencatatan Donasi (INFAQ/ZIS)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah Transaksi */}
        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchTransactions(1)} />

        {/* Modal Bendahara (DENGAN PROPS BARU) */}
        <BendaharaModal isOpen={isBendaharaModalOpen} onClose={() => setIsBendaharaModalOpen(false)} onSuccess={fetchTreasurer} currentTreasurer={treasurerData} />

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
                  {isTreasurerLoading ? (
                    <p className="text-gray-700 flex items-center">Memuat...</p>
                  ) : (
                    <p className="text-gray-700">
                      {treasurerData.treasurer_phone} ({treasurerData.treasurer_name})
                    </p>
                  )}
                </div>

                {/* Tombol Konfirmasi Bendahara */}
                <motion.button
                  onClick={() => setIsBendaharaModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors mb-2"
                  title={`Atur data Bendahara saat ini: ${treasurerData.treasurer_name}`}
                >
                  <FaWhatsapp className="mr-2" /> Konfirmasi Bendahara
                </motion.button>

                {/* Tombol KIRIM FILE EXCEL VIA FONNTE (Menggantikan Buat Link Download) */}
                <motion.button
                  onClick={handleSendExcelToWa}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-red-600 transition-colors mb-2"
                  disabled={!isTreasurerValid || sortedTransactions.length === 0}
                  title={!isTreasurerValid ? "Lengkapi Data Bendahara untuk mengirim" : "Kirim file Excel langsung ke Bendahara"}
                >
                  <FaFileExcel className="mr-2" /> Kirim Excel via WA
                </motion.button>

                {/* Tombol Download Instan (TETAP ADA sebagai fallback) */}
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

          {/* Input Filter Grid */}
          <div className="space-y-4">
            {/* Row 1: Search, Metode, SortBy */}
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

              {/* SortBy */}
              <select
                value={sortConfig.key === "date_time" && sortConfig.direction === "desc" ? "newest" : sortConfig.key === "date_time" && sortConfig.direction === "asc" ? "oldest" : "newest"}
                onChange={(e) => setSortConfig({ key: "date_time", direction: e.target.value === "newest" ? "desc" : "asc" })}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="newest">Tanggal Terbaru</option>
                <option value="oldest">Tanggal Terlama</option>
              </select>
            </div>

            {/* Row 2: Filter Rentang Waktu BARU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors bg-white"
                />
              </div>
              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors bg-white" />
              </div>
            </div>

            {/* Row 3: Address Selector (Akses Kontrol) */}
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
                    {userRole == "user" && <th className="py-3 px-4 text-center">Aksi</th>}
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
                        {userRole == "user" && (
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
                        )}
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

// Komponen Pembantu untuk Sorting Header (TETAP SAMA)
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
