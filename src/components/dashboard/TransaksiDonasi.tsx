import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaFilter, FaFileExcel, FaSpinner, FaSortDown as FaSortDesc, FaSortUp as FaSortAsc } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import Pagination from "./ui/Pagination";
import AddressSelector, { type AddressSelection } from "./AddressSelector";
import AddTransactionModal from "./ui/AddTransactionModal";
import { getDonations, type TransactionAPI, type DonationsResponse, type DonationsFilter, getDonationMethods, updateDonation, deleteDonation, type UpdateDonationRequest } from "../../services/DonationService";
import { useAuth } from "../../context/AuthContext";
import { exportToExcel } from "../../utils/ExportToExcel";

import EditDonationModal from "./ui/EditDonationModal";
import DeleteConfirmationModal from "./ui/DeleteConfirmationModal";

// Data Type Transaksi LOKAL
interface Transaction extends TransactionAPI {
  tanggalFormatted: string;
  methodDisplay: string;
}

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
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  // State API
  const [methodsList, setMethodsList] = useState<string[]>([]);
  const [transactionsData, setTransactionsData] = useState<DonationsResponse>({ total_page: 1, current_page: 1, has_next_page: false, result: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State BARU untuk Update/Delete
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // State Filter & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [addressFilters, setAddressFilters] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });

  const [sortConfig, setSortConfig] = useState<{ key: keyof TransactionAPI | "total" | null; direction: "asc" | "desc" }>({
    key: "date_time",
    direction: "desc",
  });

  // --- Statistik yang Diperhitungkan ---
  const totalDonationAmount = useMemo(() => {
    return transactionsData.result.reduce((sum, t) => sum + t.total, 0);
  }, [transactionsData.result]);

  // --- Data Fetching Effect ---
  const fetchTransactions = async (page: number) => {
    if (!token) return;

    setIsLoading(true);
    setCurrentPage(page);

    // Mempersiapkan parameter filter untuk API
    const filters: DonationsFilter = {
      page: page,
      method: filterMethod || undefined,
      province: addressFilters.province || undefined,
      city: addressFilters.city || undefined,
      subdistrict: addressFilters.subdistrict || undefined,
      village: addressFilters.village || undefined,
      sortBy: sortConfig.key === "date_time" ? (sortConfig.direction === "desc" ? "newest" : "oldest") : undefined,
    };

    try {
      const data = await getDonations(token, filters);

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

  // --- Handler Update/Delete BARU ---
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

  // --- Fetch Methods List ---
  useEffect(() => {
    if (token) {
      getDonationMethods(token)
        .then(setMethodsList)
        .catch(() => toast.error("Gagal memuat daftar metode pembayaran."));
    }
  }, [token]);

  // Trigger fetch saat filter atau sorting berubah
  useEffect(() => {
    fetchTransactions(1);
  }, [filterMethod, addressFilters, sortConfig.key, sortConfig.direction]);

  // Handle Search Bar
  const filteredBySearch = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) return transactionsData.result as Transaction[];

    return transactionsData.result.filter((t) => t.name.toLowerCase().includes(lowerCaseSearch) || t.phone.includes(lowerCaseSearch) || t.id.includes(lowerCaseSearch)) as Transaction[];
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

  // --- Fungsi Export Excel ---
  const handleExportExcel = () => {
    if (sortedTransactions.length === 0) {
      toast("Tidak ada data untuk diexport.", { icon: "⚠️" });
      return;
    }

    // Map data ke format yang lebih rapi untuk Excel (menghilangkan ID internal, dll.)
    const dataToExport = sortedTransactions.map((t) => ({
      ID_Transaksi: t.id,
      Tanggal: t.tanggalFormatted,
      Donatur: t.name,
      Nomor_HP: t.phone,
      Provinsi: t.provinsi,
      Kota: t.kabupaten_kota,
      Kecamatan: t.kecamatan,
      Desa: t.desa_kelurahan,
      RW: t.rw,
      Total_Donasi: t.total,
      Metode: t.methodDisplay,
    }));

    exportToExcel(dataToExport, "Laporan_Donasi_INUK", "Transaksi");
    toast.success("Data berhasil dieksport!");
  };

  // --- UI Logic ---
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

  return (
    <DashboardLayout activeLink="/dashboard/transaksi" pageTitle="Pencatatan Donasi (INFAQ/ZIS)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah Transaksi */}
        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchTransactions(1)} />

        {/* Ringkasan Statistik */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STAT 1: Total Jumlah Donasi */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Total Jumlah Donasi (Halaman Ini)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalDonationAmount)}</p>
          </div>
          {/* STAT 2: Jumlah Transaksi Ditemukan */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Jumlah Transaksi (Ditemukan)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{transactionsData.result.length}</p>
          </div>
          {/* STAT 3: Total Halaman */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Total Halaman</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{transactionsData.total_page}</p>
          </div>
        </motion.div>

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Data
            </h3>
            <div className="flex space-x-2">
              <motion.button
                onClick={handleExportExcel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-blue-600 transition-colors"
              >
                <FaFileExcel className="mr-2" /> Export Excel
              </motion.button>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" /> Tambah Transaksi
              </motion.button>
            </div>
          </div>

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

            {/* Row 2: Address Selector */}
            <div className="grid grid-cols-1 gap-4">
              {/* Address Selector (Filter Lokasi) */}
              <AddressSelector value={addressFilters} onChange={setAddressFilters} levels={["province", "city", "subdistrict", "village"]} kecamatanName="Kecamatan Donatur" />
            </div>
          </div>

          {/* Clear Filter Button */}
          {isFiltered && (
            <motion.button onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
              <FaTimes className="mr-1" /> Bersihkan Filter
            </motion.button>
          )}
        </motion.div>

        {/* Tabel Data Transaksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tabel Detail Transaksi</h3>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data transaksi...
            </div>
          ) : (
            <>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="py-3 px-4 text-left">ID</th>
                    <TableSortHeader label="Tanggal" sortKey="date_time" sortConfig={sortConfig} requestSort={requestSort} />
                    <th className="py-3 px-4 text-left">Donatur (Nama/HP)</th>
                    <th className="py-3 px-4 text-left">Lokasi (Kec/Des)</th>
                    <th className="py-3 px-4 text-left">RW</th>
                    <TableSortHeader label="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} align="right" />
                    <th className="py-3 px-4 text-left">Metode</th>
                    <th className="py-3 px-4 text-center">Aksi</th> {/* Header Aksi */}
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
                          <p className="text-xs text-gray-500">{t.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          {t.kecamatan} / {t.desa_kelurahan}
                        </td>
                        <td className="py-3 px-4">{t.rw}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">{formatRupiah(t.total)}</td>
                        <td className="py-3 px-4">{t.methodDisplay}</td>
                        {/* KOLOM AKSI BARU */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Tombol Update */}
                            <button onClick={() => handleOpenEditModal(t)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Edit Transaksi">
                              <Edit size={18} />
                            </button>
                            {/* Tombol Delete */}
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

        {/* BARU: Modal Edit */}
        {selectedTransaction && isEditModalOpen && <EditDonationModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={selectedTransaction} onUpdate={handleUpdate} />}

        {/* BARU: Modal Hapus */}
        {selectedTransaction && isDeleteModalOpen && <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} transaction={selectedTransaction} onConfirmDelete={handleDelete} />}
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
