import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaFilter, FaFileExcel, FaSortUp, FaSortDown, FaWallet, FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";

// Data Type Transaksi
interface Transaction {
  id: number;
  tanggal: string; // YYYY-MM-DD
  bulanTahun: string; // MM/YYYY
  donatur: string;
  kecamatan: string;
  desa: string;
  jumlah: number;
  metode: "Transfer Bank" | "QRIS" | "Tunai";
  status: "Lunas" | "Pending" | "Gagal";
}

const ALL_TRANSACTIONS: Transaction[] = [
  { id: 1001, tanggal: "2025-06-25", bulanTahun: "06/2025", donatur: "Ahmad Fauzi", kecamatan: "JEKULO", desa: "HADIPOLO", jumlah: 500000, metode: "QRIS", status: "Lunas" },
  { id: 1002, tanggal: "2025-07-01", bulanTahun: "07/2025", donatur: "Siti Aisyah", kecamatan: "KOTA KUDUS", desa: "DEMAAN", jumlah: 1500000, metode: "Transfer Bank", status: "Lunas" },
  { id: 1003, tanggal: "2025-07-05", bulanTahun: "07/2025", donatur: "Budi Santoso", kecamatan: "DAWE", desa: "CENDONO", jumlah: 250000, metode: "QRIS", status: "Lunas" },
  { id: 1004, tanggal: "2025-07-10", bulanTahun: "07/2025", donatur: "Pak Rahmat", kecamatan: "JEKULO", desa: "BULUNG CANGKRING", jumlah: 50000, metode: "Tunai", status: "Pending" },
  { id: 1005, tanggal: "2025-08-01", bulanTahun: "08/2025", donatur: "Fizsa Akbar", kecamatan: "KOTA KUDUS", desa: "BARONGAN", jumlah: 750000, metode: "Transfer Bank", status: "Lunas" },
  { id: 1006, tanggal: "2025-08-15", bulanTahun: "08/2025", donatur: "Zulkarnain Nawawi", kecamatan: "DAWE", desa: "KIRIG", jumlah: 100000, metode: "QRIS", status: "Lunas" },
  { id: 1007, tanggal: "2025-08-20", bulanTahun: "08/2025", donatur: "H. Hasan Junaidi", kecamatan: "KOTA KUDUS", desa: "JANGGALAN", jumlah: 2000000, metode: "Transfer Bank", status: "Lunas" },
  { id: 1008, tanggal: "2025-09-01", bulanTahun: "09/2025", donatur: "Mukhsin", kecamatan: "JEKULO", desa: "KANDANGMAS", jumlah: 150000, metode: "Tunai", status: "Lunas" },
];

const KECAMATAN_LIST = Array.from(new Set(ALL_TRANSACTIONS.map((t) => t.kecamatan)));
const METODE_LIST = ["Transfer Bank", "QRIS", "Tunai"];
const STATUS_LIST = ["Lunas", "Pending", "Gagal"];
// Data Dummy

// Helper function
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// Component Status Badge
const StatusBadge: React.FC<{ status: Transaction["status"] }> = ({ status }) => {
  let colorClass = "";
  let icon = FaCheckCircle;
  switch (status) {
    case "Lunas":
      colorClass = "bg-green-100 text-green-700";
      icon = FaCheckCircle;
      break;
    case "Pending":
      colorClass = "bg-yellow-100 text-yellow-700";
      icon = FaMinusCircle;
      break;
    case "Gagal":
      colorClass = "bg-red-100 text-red-700";
      icon = FaTimes;
      break;
    default:
      colorClass = "bg-gray-100 text-gray-700";
  }

  const Icon = icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

// Component Utama Halaman
const TransaksiDonasi: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulanTahun, setFilterBulanTahun] = useState(""); // Format MM/YYYY
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterMetode, setFilterMetode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: "ascending" | "descending" }>({
    key: "tanggal",
    direction: "descending",
  });

  // 1. Logika Filtering
  const filteredTransactions = useMemo(() => {
    let filtered = ALL_TRANSACTIONS;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => t.donatur.toLowerCase().includes(lowerCaseSearch) || String(t.id).includes(lowerCaseSearch));
    }
    if (filterBulanTahun) {
      filtered = filtered.filter((t) => t.bulanTahun === filterBulanTahun);
    }
    if (filterKecamatan) {
      filtered = filtered.filter((t) => t.kecamatan === filterKecamatan);
    }
    //  Filter Desa
    if (filterMetode) {
      filtered = filtered.filter((t) => t.metode === filterMetode);
    }
    if (filterStatus) {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    return filtered;
  }, [searchTerm, filterBulanTahun, filterKecamatan, filterMetode, filterStatus]);

  // 2. Logika Sorting
  const sortedTransactions = useMemo(() => {
    let sortableItems = [...filteredTransactions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTransactions, sortConfig]);

  const requestSort = (key: keyof Transaction) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const totalFilteredDonasi = filteredTransactions.reduce((sum, t) => (t.status === "Lunas" ? sum + t.jumlah : sum), 0);

  const isFiltered = filterBulanTahun || filterKecamatan || filterMetode || filterStatus || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBulanTahun("");
    setFilterKecamatan("");
    setFilterMetode("");
    setFilterStatus("");
  };

  // Varian Framer Motion untuk item
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <DashboardLayout activeLink="/dashboard/transaksi" pageTitle="Pencatatan Donasi (INFAQ/ZIS)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Ringkasan Statistik */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Total Transaksi ({filteredTransactions.length})</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalFilteredDonasi)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Donatur Unik</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{new Set(filteredTransactions.map((t) => t.donatur)).size}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Transaksi Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredTransactions.filter((t) => t.status === "Pending").length}</p>
          </div>
        </motion.div>

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Data
            </h3>
            <div className="flex space-x-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-blue-600 transition-colors">
                <FaFileExcel className="mr-2" /> Export Excel
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
                <FaPlus className="mr-2" /> Tambah Transaksi
              </motion.button>
            </div>
          </div>

          {/* Input Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari Donatur atau ID Transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Bulan/Tahun (Sangat Penting) */}
            <select value={filterBulanTahun} onChange={(e) => setFilterBulanTahun(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Periode</option>
              {/* Ambil list bulan/tahun unik dari data */}
              {Array.from(new Set(ALL_TRANSACTIONS.map((t) => t.bulanTahun)))
                .sort()
                .map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
            </select>

            {/* Filter Kecamatan */}
            <select value={filterKecamatan} onChange={(e) => setFilterKecamatan(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Kecamatan</option>
              {KECAMATAN_LIST.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>

            {/* Filter Metode */}
            <select value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Metode</option>
              {METODE_LIST.map((metode) => (
                <option key={metode} value={metode}>
                  {metode}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Status</option>
              {STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="py-3 px-4 text-left">ID</th>
                <TableSortHeader label="Tanggal" sortKey="tanggal" sortConfig={sortConfig} requestSort={requestSort} />
                <th className="py-3 px-4 text-left">Donatur</th>
                <TableSortHeader label="Jumlah" sortKey="jumlah" sortConfig={sortConfig} requestSort={requestSort} align="right" />
                <th className="py-3 px-4 text-left">Metode</th>
                <th className="py-3 px-4 text-left">Kecamatan</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((t) => (
                  <tr key={t.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{t.id}</td>
                    <td className="py-3 px-4">{new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-3 px-4">{t.donatur}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">{formatRupiah(t.jumlah)}</td>
                    <td className="py-3 px-4">{t.metode}</td>
                    <td className="py-3 px-4">
                      {t.kecamatan} / {t.desa}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-500 hover:text-blue-700 font-semibold text-xs mr-2">Detail</button>
                      <button className="text-red-500 hover:text-red-700 font-semibold text-xs">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                    Tidak ada data transaksi yang ditemukan dengan kriteria filter saat ini.
                  </td>
                </tr>
              )}

              {/* Total Baris di Bawah */}
              {filteredTransactions.length > 0 && (
                <tr className="bg-green-50 text-gray-800 font-bold text-base border-t-2 border-primary">
                  <td colSpan={3} className="py-3 px-4 text-right">
                    TOTAL LUNAS
                  </td>
                  <td className="py-3 px-4 text-right">{formatRupiah(totalFilteredDonasi)}</td>
                  <td colSpan={4} className="py-3 px-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TransaksiDonasi;

// Komponen Pembantu untuk Sorting Header
interface SortHeaderProps {
  label: string;
  sortKey: keyof Transaction;
  sortConfig: { key: keyof Transaction | null; direction: "ascending" | "descending" };
  requestSort: (key: keyof Transaction) => void;
  align?: "left" | "right" | "center";
}

const TableSortHeader: React.FC<SortHeaderProps> = ({ label, sortKey, sortConfig, requestSort, align = "left" }) => {
  const isSorted = sortConfig.key === sortKey;
  const direction = sortConfig.direction;

  return (
    <th className={`py-3 px-4 text-${align} cursor-pointer select-none hover:text-gray-900 transition-colors`} onClick={() => requestSort(sortKey)}>
      <div className={`flex items-center ${align === "right" ? "justify-end" : "justify-start"}`}>
        {label}
        {isSorted && <span className="ml-2">{direction === "ascending" ? <FaSortUp className="w-3 h-3 text-primary" /> : <FaSortDown className="w-3 h-3 text-primary" />}</span>}
        {!isSorted && <FaSortUp className="w-3 h-3 ml-2 text-gray-400 opacity-50" />}
      </div>
    </th>
  );
};
