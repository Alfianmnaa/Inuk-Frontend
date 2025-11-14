// inuk-frontend/src/components/dashboard/UserManagement.tsx

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaUsers, FaSpinner, FaSortUp, FaSortDown, FaMapMarkerAlt, FaSave } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddEditUserModal from "./ui/AddEditUserModal";
import DeleteUserModal from "./ui/DeleteUserModal";

// --- Data Dummy & Interfaces ---

// Interface UserDisplay harus konsisten dengan modal
export interface UserDisplay {
  id: string;
  name: string;
  phone: string;
  isPJT: boolean; // Penanggung Jawab Terikat (RegionID !== null)
  regionName: string; // Nama desa/kelurahan jika ada
}

const DUMMY_USERS: UserDisplay[] = [
  { id: "uuid-101", name: "Inputer Bakalankrapyak", phone: "+6281234567101", isPJT: true, regionName: "Bakalankrapyak" },
  { id: "uuid-102", name: "Inputer Banget", phone: "+6281234567102", isPJT: true, regionName: "Banget" },
  { id: "uuid-103", name: "Inputer Blimbing Kidul", phone: "+6281234567103", isPJT: true, regionName: "Blimbing Kidul" },
  { id: "uuid-201", name: "Admin Kecamatan Kaliwungu", phone: "+6281234567002", isPJT: false, regionName: "Admin" },
  { id: "uuid-202", name: "Pengguna Baru Belum Terikat", phone: "+6281234567999", isPJT: false, regionName: "-" },
];

// Helper function untuk Sorting
type SortKeys = keyof UserDisplay | null;
interface SortConfig {
  key: SortKeys;
  direction: "ascending" | "descending";
}

const TableSortHeader: React.FC<{ label: string; sortKey: keyof UserDisplay; sortConfig: SortConfig; requestSort: (key: keyof UserDisplay) => void }> = ({ label, sortKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === sortKey;
  const direction = sortConfig.direction;

  return (
    <th className="py-3 px-4 text-left cursor-pointer select-none hover:text-gray-900 transition-colors" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">
        {label}
        {isSorted && <span className="ml-2">{direction === "ascending" ? <FaSortUp className="w-3 h-3 text-primary" /> : <FaSortDown className="w-3 h-3 text-primary" />}</span>}
        {!isSorted && <FaSortUp className="w-3 h-3 ml-2 text-gray-400 opacity-50" />}
      </div>
    </th>
  );
};

// Varian Framer Motion untuk item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" });
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);

  // Placeholder sukses fetch/action
  const handleSuccess = () => {
    // Dalam implementasi nyata, ini akan memicu fetch data ulang dari API
    toast.success("Aksi berhasil! (DUMMY REFRESH)");
  };

  // 1. Logika Filtering & Searching
  const filteredUsers = useMemo(() => {
    let filtered = DUMMY_USERS;
    const lowerCaseSearch = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(lowerCaseSearch) || u.phone.includes(lowerCaseSearch) || u.regionName.toLowerCase().includes(lowerCaseSearch));
    }

    // 2. Logika Sorting
    let sortableItems = [...filtered];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, sortConfig]);

  const requestSort = (key: keyof UserDisplay) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handlers Modal
  const handleAddClick = () => {
    setSelectedUser(null); // Mode Add
    setIsAddEditModalOpen(true);
  };

  const handleEditClick = (user: UserDisplay) => {
    setSelectedUser(user); // Mode Edit
    setIsAddEditModalOpen(true);
  };

  const handleDeleteClick = (user: UserDisplay) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    // Placeholder API call
    console.log(`DUMMY: Menghapus pengguna dengan ID: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Pengguna ID ${id.substring(0, 8)}... berhasil dihapus. (DUMMY)`);
    setIsDeleteModalOpen(false);
    handleSuccess(); // Trigger dummy refresh
  };

  return (
    <DashboardLayout activeLink="/dashboard/user-management" pageTitle="Manajemen Pengguna (Inputer/Admin)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah/Edit */}
        <AddEditUserModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} onSuccess={handleSuccess} initialData={selectedUser} />

        {/* Modal Hapus */}
        {selectedUser && <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} user={selectedUser} onConfirmDelete={handleConfirmDelete} />}

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaUsers className="mr-2 text-primary" /> Kelola Daftar Pengguna ({filteredUsers.length})
            </h3>
            <motion.button onClick={handleAddClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
              <FaPlus className="mr-2" /> Tambah Pengguna
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama, Telepon, atau Region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {searchTerm && (
            <motion.button onClick={() => setSearchTerm("")} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
              <FaTimes className="mr-1" /> Bersihkan Pencarian
            </motion.button>
          )}
        </motion.div>

        {/* Tabel Data Pengguna */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaUsers className="mr-2 text-primary" /> Daftar Pengguna (Total: {DUMMY_USERS.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data pengguna...
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="py-3 px-4 text-left">ID</th>
                  <TableSortHeader label="Nama" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                  <th className="py-3 px-4 text-left">Telepon</th>
                  <th className="py-3 px-4 text-left">Status Region</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs max-w-[100px] truncate">{u.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                      <td className="py-3 px-4">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${u.isPJT ? "bg-primary/20 text-primary" : "bg-red-100 text-red-700"}`}>
                          <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                          {u.isPJT ? `Terikat: ${u.regionName}` : "Belum Terikat"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleEditClick(u)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Edit Pengguna">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(u)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus Pengguna">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                      Tidak ada data pengguna yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserManagement;
