import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaNewspaper, FaEdit, FaTrash, FaSortUp, FaSortDown, FaCheckCircle, FaHourglassHalf, FaFilter, FaArchive, FaThumbtack } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";
import { useNavigate } from "react-router-dom";
import { getArticles, deleteArticle, updateArticleStatus, type GetArticlesResponse } from "../../services/CMSService";
import { useAuth } from "../../context/AuthContext";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = "";
  let icon = FaCheckCircle;
  
  switch (status.toLowerCase()) {
    case "published":
      colorClass = "bg-green-100 text-green-700";
      icon = FaCheckCircle;
      break;
    case "drafted":
      colorClass = "bg-yellow-100 text-yellow-700";
      icon = FaHourglassHalf;
      break;
    case "archived":
      colorClass = "bg-gray-100 text-gray-700";
      icon = FaArchive;
      break;
    case "pinned":
      colorClass = "bg-blue-100 text-blue-700";
      icon = FaThumbtack;
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CMSBerita: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<GetArticlesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof GetArticlesResponse | null; direction: "ascending" | "descending" }>({
    key: "updated_at",
    direction: "descending",
  });
  
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; article: GetArticlesResponse | null }>({
    show: false,
    article: null,
  });
  const [statusModal, setStatusModal] = useState<{ show: boolean; article: GetArticlesResponse | null }>({
    show: false,
    article: null,
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchArticles = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      // Pass token to get all articles for admin
      const data = await getArticles(undefined, token);
      setArticles(data);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_LIST = ["drafted", "published", "archived", "pinned"];
  
  const MONTHS = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    articles.forEach(article => {
      if (article.published_at) {
        const year = new Date(article.published_at).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [articles]);

  const filteredPosts = useMemo(() => {
    let filtered = articles;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(lowerCaseSearch));
    }
    
    if (filterStatus.length > 0) {
      filtered = filtered.filter((p) => 
        filterStatus.some(status => p.status.toLowerCase() === status.toLowerCase())
      );
    }
    
    if (filterMonth && filterYear) {
      filtered = filtered.filter((p) => {
        if (!p.published_at) return false;
        const date = new Date(p.published_at);
        return date.getMonth() + 1 === parseInt(filterMonth) && date.getFullYear() === parseInt(filterYear);
      });
    } else if (filterYear) {
      filtered = filtered.filter((p) => {
        if (!p.published_at) return false;
        const date = new Date(p.published_at);
        return date.getFullYear() === parseInt(filterYear);
      });
    }

    return filtered;
  }, [searchTerm, filterStatus, filterMonth, filterYear, articles]);

  const sortedPosts = useMemo(() => {
    let sortableItems = [...filteredPosts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Handle null values - put them at the end
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

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

  const requestSort = (key: keyof GetArticlesResponse) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const isFiltered = filterStatus.length > 0 || filterMonth || filterYear || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus([]);
    setFilterMonth("");
    setFilterYear("");
  };

  const handleDeleteClick = (article: GetArticlesResponse) => {
    setDeleteModal({ show: true, article });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.article || !token) return;

    try {
      await deleteArticle(token, deleteModal.article.id);
      setDeleteModal({ show: false, article: null });
      fetchArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
      alert("Gagal menghapus artikel. Silakan coba lagi.");
    }
  };

  const handleStatusClick = (article: GetArticlesResponse) => {
    setStatusModal({ show: true, article });
    setSelectedStatus(article.status);
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.article || !token || !selectedStatus) return;

    try {
      await updateArticleStatus(token, statusModal.article.id, { status: selectedStatus as any });
      setStatusModal({ show: false, article: null });
      fetchArticles();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal mengubah status artikel. Silakan coba lagi.");
    }
  };

  const totalPublishedViews = useMemo(() => {
    return articles
      .filter((p) => p.status.toLowerCase() === "published")
      .length;
  }, [articles]);

  const totalDrafts = useMemo(() => {
    return articles.filter((p) => p.status.toLowerCase() === "drafted").length;
  }, [articles]);

  return (
    <DashboardLayout activeLink="/dashboard/cms-berita" pageTitle="Manajemen Berita & Blog">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Statistics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Total Postingan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{articles.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total Publish</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalPublishedViews}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Postingan Draft</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalDrafts}</p>
          </div>
        </motion.div>

        {/* Filter and Actions */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter & Aksi Cepat
            </h3>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
              onClick={() => navigate("editor")}
            >
              <FaPlus className="mr-2" /> Buat Postingan Baru
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari Judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Multi-select Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <div 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 bg-white min-h-9.5 cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex flex-wrap gap-1">
                  {filterStatus.length === 0 ? (
                    <span className="text-gray-500 text-sm">Semua Status</span>
                  ) : (
                    filterStatus.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center bg-primary text-white px-2 py-0.5 rounded-full text-xs"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterStatus(filterStatus.filter(s => s !== status));
                          }}
                          className="ml-1 hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {STATUS_LIST.map((status) => (
                    <label
                      key={status}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filterStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterStatus([...filterStatus, status]);
                          } else {
                            setFilterStatus(filterStatus.filter(s => s !== status));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors" disabled={!filterYear}>
              <option value="">Semua Bulan</option>
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <motion.button onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
              <FaTimes className="mr-1" /> Bersihkan Filter
            </motion.button>
          )}
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaNewspaper className="mr-2 text-primary" /> Tabel Postingan Blog
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-4">Memuat data...</p>
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="py-3 px-4 text-left">Judul Postingan</th>
                  <TableSortHeader label="Tanggal Publish" sortKey="published_at" sortConfig={sortConfig} requestSort={requestSort} />
                  <th className="py-3 px-4 text-center">Status</th>
                  <TableSortHeader label="Terakhir Diubah" sortKey="updated_at" sortConfig={sortConfig} requestSort={requestSort} />
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.length > 0 ? (
                  sortedPosts.map((p) => (
                    <tr key={p.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">{p.title}</td>
                      <td className="py-3 px-4">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleStatusClick(p)} className="hover:opacity-80 transition-opacity">
                          <StatusBadge status={p.status} />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(p.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate(`editor/${p.slug}`)}
                            className="text-blue-500 hover:text-blue-700 font-semibold text-xs flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(p)}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs flex items-center"
                          >
                            <FaTrash className="mr-1" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                      Tidak ada postingan blog yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus artikel <strong>"{deleteModal.article?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, article: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ubah Status Artikel</h3>
            <p className="text-gray-700 mb-4">
              Artikel: <strong>"{statusModal.article?.title}"</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Baru:</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
              >
                {STATUS_LIST.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStatusModal({ show: false, article: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CMSBerita;

interface SortHeaderProps {
  label: string;
  sortKey: keyof GetArticlesResponse;
  sortConfig: { key: keyof GetArticlesResponse | null; direction: "ascending" | "descending" };
  requestSort: (key: keyof GetArticlesResponse) => void;
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