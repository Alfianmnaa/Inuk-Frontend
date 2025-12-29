import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaNewspaper, FaEdit, FaTrash, FaSortUp, FaSortDown, FaCheckCircle, FaHourglassHalf, FaFilter } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";
import { useNavigate } from "react-router-dom";

// type data
interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: "Kisah Nyata" | "Infaq & Kesehatan" | "Literasi ZIS" | "Pendidikan" | "Lainnya";
  date: string; // YYYY-MM-DD
  status: "Publish" | "Draft";
  views: number;
}

const ALL_BLOG_POSTS: BlogPost[] = [
  { id: 1, title: "Dari Infaq ke Harapan: Kisah Ibu Siti", author: "Admin", category: "Kisah Nyata", date: "2025-06-26", status: "Publish", views: 1540 },
  { id: 2, title: "Layanan Kesehatan Gratis Lewat Infaq", author: "Admin", category: "Infaq & Kesehatan", date: "2025-06-19", status: "Publish", views: 890 },
  { id: 3, title: "Apa Perbedaan Infaq, Zakat, dan Sedekah?", author: "Wahyu Huda, M.Pd", category: "Literasi ZIS", date: "2025-06-10", status: "Publish", views: 2100 },
  { id: 4, title: "Infaq Beasiswa: Mewujudkan Mimpi Anak Bangsa", author: "Admin", category: "Pendidikan", date: "2025-06-01", status: "Publish", views: 1250 },
  { id: 5, title: "Rapat Koordinasi Divisi Pendistribusian", author: "Zamira Anwar, M.Pd", category: "Lainnya", date: "2025-07-05", status: "Draft", views: 10 },
];

const CATEGORY_LIST = Array.from(new Set(ALL_BLOG_POSTS.map((p) => p.category)));
const STATUS_LIST = ["Publish", "Draft"];

// Component Status Badge
const StatusBadge: React.FC<{ status: BlogPost["status"] }> = ({ status }) => {
  let colorClass = "";
  let icon = FaCheckCircle;
  switch (status) {
    case "Publish":
      colorClass = "bg-green-100 text-green-700";
      icon = FaCheckCircle;
      break;
    case "Draft":
      colorClass = "bg-yellow-100 text-yellow-700";
      icon = FaHourglassHalf;
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

// Varian Framer Motion untuk item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Component Utama Halaman
const CMSBerita: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof BlogPost | null; direction: "ascending" | "descending" }>({
    key: "date",
    direction: "descending",
  });

  // 1. Logika Filtering
  const filteredPosts = useMemo(() => {
    let filtered = ALL_BLOG_POSTS;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(lowerCaseSearch) || p.author.toLowerCase().includes(lowerCaseSearch));
    }
    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }
    if (filterStatus) {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    return filtered;
  }, [searchTerm, filterCategory, filterStatus]);

  // 2. Logika Sorting
  const sortedPosts = useMemo(() => {
    let sortableItems = [...filteredPosts];
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
  }, [filteredPosts, sortConfig]);

  const requestSort = (key: keyof BlogPost) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const isFiltered = filterCategory || filterStatus || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterStatus("");
  };
  
  const navigate = useNavigate();
  
  return (
    <DashboardLayout activeLink="/dashboard/cms-berita" pageTitle="Manajemen Berita & Blog">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Ringkasan Statistik */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Total Postingan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{ALL_BLOG_POSTS.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total Dilihat (Publish)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {ALL_BLOG_POSTS.filter((p) => p.status === "Publish")
                .reduce((sum, p) => sum + p.views, 0)
                .toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Postingan Draft</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{ALL_BLOG_POSTS.filter((p) => p.status === "Draft").length}</p>
          </div>
        </motion.div>

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter & Aksi Cepat
            </h3>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
              onClick={() => navigate("cms-berita/article")}
            >
              <FaPlus className="mr-2" /> Buat Postingan Baru
            </motion.button>
          </div>

          {/* Input Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari Judul atau Penulis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Kategori */}
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Kategori</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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

        {/* Tabel Data Berita/Blog */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaNewspaper className="mr-2 text-primary" /> Tabel Postingan Blog
          </h3>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="py-3 px-4 text-left">Judul Postingan</th>
                <th className="py-3 px-4 text-left">Kategori</th>
                <th className="py-3 px-4 text-left">Penulis</th>
                <TableSortHeader label="Tanggal" sortKey="date" sortConfig={sortConfig} requestSort={requestSort} />
                <th className="py-3 px-4 text-center">Status</th>
                <TableSortHeader label="Dilihat" sortKey="views" sortConfig={sortConfig} requestSort={requestSort} align="right" />
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.length > 0 ? (
                sortedPosts.map((p) => (
                  <tr key={p.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 max-w-xs">{p.title}</td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4">{p.author}</td>
                    <td className="py-3 px-4">{new Date(p.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{p.views.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-500 hover:text-blue-700 font-semibold text-xs mr-2 flex items-center justify-center mx-auto">
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700 font-semibold text-xs mt-1 flex items-center justify-center mx-auto">
                        <FaTrash className="mr-1" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    Tidak ada postingan blog yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CMSBerita;

// --- Komponen Pembantu untuk Sorting Header (Re-use) ---
interface SortHeaderProps {
  label: string;
  sortKey: keyof BlogPost;
  sortConfig: { key: keyof BlogPost | null; direction: "ascending" | "descending" };
  requestSort: (key: keyof BlogPost) => void;
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
