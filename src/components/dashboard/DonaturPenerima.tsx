import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaUsers, FaHandHoldingHeart, FaSortUp, FaSortDown, FaHeart, FaUserCheck, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaPhoneAlt, FaFilter } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";

// Data Type Donatur
interface Donatur {
  id: number;
  nama: string;
  tipe: "Individu" | "Lembaga";
  kecamatan: string;
  telepon: string;
  email: string;
  totalDonasi: number; // Rupiah
  terakhirDonasi: string; // YYYY-MM-DD
}

const ALL_DONATUR: Donatur[] = [
  { id: 1, nama: "H. Rawrr, SH., MH", tipe: "Individu", kecamatan: "KOTA KUDUS", telepon: "0812xxxx5678", email: "suparno@mail.com", totalDonasi: 15000000, terakhirDonasi: "2025-09-10" },
  { id: 2, nama: "PT. Berkah Jaya", tipe: "Lembaga", kecamatan: "JEKULO", telepon: "0291xxxx1111", email: "berkahjaya@mail.com", totalDonasi: 5000000, terakhirDonasi: "2025-08-01" },
  { id: 3, nama: "Arif Mustaqiim, M.Pd.I", tipe: "Individu", kecamatan: "DAWE", telepon: "0857xxxx4444", email: "arif@mail.com", totalDonasi: 2500000, terakhirDonasi: "2025-07-25" },
  { id: 4, nama: "Ali Bajo, S.Pd.I", tipe: "Individu", kecamatan: "JEKULO", telepon: "0813xxxx9090", email: "ali@mail.com", totalDonasi: 750000, terakhirDonasi: "2025-06-15" },
];

// Data Type Penerima Manfaat
interface Penerima {
  id: number;
  nama: string;
  kategori: "Yatim" | "Dhuafa" | "UMKM" | "Pelajar";
  kecamatan: string;
  desa: string;
  programBantuan: string;
  tanggalBantuan: string; // YYYY-MM-DD
}

const ALL_PENERIMA: Penerima[] = [
  { id: 101, nama: "Ibu Siti Aisyah", kategori: "Dhuafa", kecamatan: "KOTA KUDUS", desa: "DEMAAN", programBantuan: "Santunan Kemanusiaan", tanggalBantuan: "2025-09-20" },
  { id: 102, nama: "Bapak Rahmat", kategori: "UMKM", kecamatan: "JEKULO", desa: "HADIPOLO", programBantuan: "Pemberdayaan Ekonomi", tanggalBantuan: "2025-08-15" },
  { id: 103, nama: "Adik Bima", kategori: "Pelajar", kecamatan: "DAWE", desa: "CENDONO", programBantuan: "Beasiswa Pendidikan", tanggalBantuan: "2025-07-10" },
  { id: 104, nama: "Anak Yatim Panti NU", kategori: "Yatim", kecamatan: "KOTA KUDUS", desa: "BARONGAN", programBantuan: "Santunan Yatim", tanggalBantuan: "2025-06-01" },
];

const KECAMATAN_LIST = Array.from(new Set([...ALL_DONATUR.map((d) => d.kecamatan), ...ALL_PENERIMA.map((p) => p.kecamatan)]));
const DONATUR_TIPES = ["Individu", "Lembaga"];
const PENERIMA_KATEGORI = ["Yatim", "Dhuafa", "UMKM", "Pelajar"];

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

// Komponen Pembantu untuk Sorting Header
interface SortHeaderProps<T> {
  label: string;
  sortKey: keyof T;
  sortConfig: { key: keyof T | null; direction: "ascending" | "descending" };
  requestSort: (key: keyof T) => void;
  align?: "left" | "right" | "center";
}

const TableSortHeader = <T extends {}>({ label, sortKey, sortConfig, requestSort, align = "left" }: SortHeaderProps<T>) => {
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

// Component Utama Halaman
const DonaturPenerima: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"donatur" | "penerima">("donatur");

  // State & Logic Donatur
  const [donaturSearch, setDonaturSearch] = useState("");
  const [donaturFilterTipe, setDonaturFilterTipe] = useState("");
  const [donaturFilterKecamatan, setDonaturFilterKecamatan] = useState("");
  const [donaturSortConfig, setDonaturSortConfig] = useState<{ key: keyof Donatur | null; direction: "ascending" | "descending" }>({
    key: "totalDonasi",
    direction: "descending",
  });

  const filteredDonatur = useMemo(() => {
    let filtered = ALL_DONATUR;
    if (donaturSearch) {
      filtered = filtered.filter((d) => d.nama.toLowerCase().includes(donaturSearch.toLowerCase()));
    }
    if (donaturFilterTipe) {
      filtered = filtered.filter((d) => d.tipe === donaturFilterTipe);
    }
    if (donaturFilterKecamatan) {
      filtered = filtered.filter((d) => d.kecamatan === donaturFilterKecamatan);
    }

    let sortableItems = [...filtered];
    if (donaturSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[donaturSortConfig.key!];
        const bValue = b[donaturSortConfig.key!];
        if (aValue < bValue) return donaturSortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return donaturSortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [donaturSearch, donaturFilterTipe, donaturFilterKecamatan, donaturSortConfig]);

  const requestDonaturSort = (key: keyof Donatur) => {
    let direction: "ascending" | "descending" = "ascending";
    if (donaturSortConfig.key === key && donaturSortConfig.direction === "ascending") {
      direction = "descending";
    }
    setDonaturSortConfig({ key, direction });
  };

  const clearDonaturFilters = () => {
    setDonaturSearch("");
    setDonaturFilterTipe("");
    setDonaturFilterKecamatan("");
  };

  // State & Logic Penerima
  const [penerimaSearch, setPenerimaSearch] = useState("");
  const [penerimaFilterKategori, setPenerimaFilterKategori] = useState("");
  const [penerimaFilterKecamatan, setPenerimaFilterKecamatan] = useState("");
  const [penerimaSortConfig, setPenerimaSortConfig] = useState<{ key: keyof Penerima | null; direction: "ascending" | "descending" }>({
    key: "tanggalBantuan",
    direction: "descending",
  });

  const filteredPenerima = useMemo(() => {
    let filtered = ALL_PENERIMA;
    if (penerimaSearch) {
      filtered = filtered.filter((p) => p.nama.toLowerCase().includes(penerimaSearch.toLowerCase()));
    }
    if (penerimaFilterKategori) {
      filtered = filtered.filter((p) => p.kategori === penerimaFilterKategori);
    }
    if (penerimaFilterKecamatan) {
      filtered = filtered.filter((p) => p.kecamatan === penerimaFilterKecamatan);
    }

    let sortableItems = [...filtered];
    if (penerimaSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[penerimaSortConfig.key!];
        const bValue = b[penerimaSortConfig.key!];
        if (aValue < bValue) return penerimaSortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return penerimaSortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [penerimaSearch, penerimaFilterKategori, penerimaFilterKecamatan, penerimaSortConfig]);

  const requestPenerimaSort = (key: keyof Penerima) => {
    let direction: "ascending" | "descending" = "ascending";
    if (penerimaSortConfig.key === key && penerimaSortConfig.direction === "ascending") {
      direction = "descending";
    }
    setPenerimaSortConfig({ key, direction });
  };

  const clearPenerimaFilters = () => {
    setPenerimaSearch("");
    setPenerimaFilterKategori("");
    setPenerimaFilterKecamatan("");
  };

  //  Komponen Tab Content Donatur
  const DonaturContent = (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      {/* Filter Donatur */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaFilter className="mr-2 text-primary" /> Filter Donatur
          </h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
            <FaPlus className="mr-2" /> Tambah Donatur
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama Donatur..."
              value={donaturSearch}
              onChange={(e) => setDonaturSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <select value={donaturFilterTipe} onChange={(e) => setDonaturFilterTipe(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
            <option value="">Semua Tipe</option>
            {DONATUR_TIPES.map((tipe) => (
              <option key={tipe} value={tipe}>
                {tipe}
              </option>
            ))}
          </select>
          <select value={donaturFilterKecamatan} onChange={(e) => setDonaturFilterKecamatan(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
            <option value="">Semua Kecamatan</option>
            {KECAMATAN_LIST.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>
        {(donaturSearch || donaturFilterTipe || donaturFilterKecamatan) && (
          <motion.button onClick={clearDonaturFilters} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
            <FaTimes className="mr-1" /> Bersihkan Filter
          </motion.button>
        )}
      </motion.div>

      {/* Tabel Donatur */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaUserCheck className="mr-2 text-primary" /> Daftar Donatur Aktif
        </h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="py-3 px-4 text-left">Nama & Kontak</th>
              <th className="py-3 px-4 text-left">Tipe</th>
              <th className="py-3 px-4 text-left">Lokasi</th>
              <TableSortHeader<Donatur> label="Total Donasi" sortKey="totalDonasi" sortConfig={donaturSortConfig as any} requestSort={requestDonaturSort as any} align="right" />
              <TableSortHeader<Donatur> label="Terakhir Donasi" sortKey="terakhirDonasi" sortConfig={donaturSortConfig as any} requestSort={requestDonaturSort as any} align="left" />
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonatur.length > 0 ? (
              filteredDonatur.map((d) => (
                <tr key={d.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    <p className="font-bold text-gray-900">{d.nama}</p>
                    <span className="flex items-center text-xs text-gray-500 mt-1">
                      <FaPhoneAlt className="w-3 h-3 mr-1" /> {d.telepon}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <FaEnvelope className="w-3 h-3 mr-1" /> {d.email}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${d.tipe === "Individu" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{d.tipe}</span>
                  </td>
                  <td className="py-3 px-4 flex items-center mt-3">
                    <FaMapMarkerAlt className="w-3 h-3 mr-1 text-red-500" /> {d.kecamatan}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-primary">{formatRupiah(d.totalDonasi)}</td>
                  <td className="py-3 px-4">{new Date(d.terakhirDonasi).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:text-blue-700 font-semibold text-xs mr-2">Lihat Riwayat</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                  Tidak ada data donatur yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );

  // Komponen Tab Content Penerima
  const PenerimaContent = (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      {/* Filter Penerima */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaFilter className="mr-2 text-primary" /> Filter Penerima
          </h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
            <FaPlus className="mr-2" /> Tambah Penerima
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama Penerima..."
              value={penerimaSearch}
              onChange={(e) => setPenerimaSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <select value={penerimaFilterKategori} onChange={(e) => setPenerimaFilterKategori(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
            <option value="">Semua Kategori</option>
            {PENERIMA_KATEGORI.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          <select value={penerimaFilterKecamatan} onChange={(e) => setPenerimaFilterKecamatan(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
            <option value="">Semua Kecamatan</option>
            {KECAMATAN_LIST.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>
        {(penerimaSearch || penerimaFilterKategori || penerimaFilterKecamatan) && (
          <motion.button onClick={clearPenerimaFilters} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
            <FaTimes className="mr-1" /> Bersihkan Filter
          </motion.button>
        )}
      </motion.div>

      {/* Tabel Penerima Manfaat */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaHandHoldingHeart className="mr-2 text-primary" /> Daftar Penerima Bantuan
        </h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="py-3 px-4 text-left">Nama</th>
              <th className="py-3 px-4 text-left">Kategori</th>
              <th className="py-3 px-4 text-left">Program Bantuan</th>
              <th className="py-3 px-4 text-left">Lokasi</th>
              <TableSortHeader<Penerima> label="Tgl. Bantuan" sortKey="tanggalBantuan" sortConfig={penerimaSortConfig as any} requestSort={requestPenerimaSort as any} align="left" />
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPenerima.length > 0 ? (
              filteredPenerima.map((p) => (
                <tr key={p.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{p.nama}</td>
                  <td className="py-3 px-4">{p.kategori}</td>
                  <td className="py-3 px-4 font-medium text-primary">{p.programBantuan}</td>
                  <td className="py-3 px-4">
                    {p.kecamatan} / {p.desa}
                  </td>
                  <td className="py-3 px-4 flex items-center mt-1">
                    <FaCalendarAlt className="w-3 h-3 mr-1 text-red-500" /> {new Date(p.tanggalBantuan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:text-blue-700 font-semibold text-xs mr-2">Detail</button>
                    <button className="text-red-500 hover:text-red-700 font-semibold text-xs">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                  Tidak ada data penerima manfaat yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );

  return (
    <DashboardLayout activeLink="/dashboard/donatur-penerima" pageTitle="Manajemen Donatur & Penerima Manfaat">
      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex border-b border-gray-200 mb-6 bg-white rounded-xl shadow-lg p-2">
        <button
          onClick={() => setActiveTab("donatur")}
          className={`flex-1 flex justify-center items-center py-3 px-4 text-lg font-semibold transition-colors rounded-lg ${activeTab === "donatur" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <FaHeart className="mr-2 w-5 h-5" /> Donatur ({ALL_DONATUR.length})
        </button>
        <button
          onClick={() => setActiveTab("penerima")}
          className={`flex-1 flex justify-center items-center py-3 px-4 text-lg font-semibold transition-colors rounded-lg ${activeTab === "penerima" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <FaUsers className="mr-2 w-5 h-5" /> Penerima Manfaat ({ALL_PENERIMA.length})
        </button>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "donatur" ? DonaturContent : PenerimaContent}
    </DashboardLayout>
  );
};

export default DonaturPenerima;
