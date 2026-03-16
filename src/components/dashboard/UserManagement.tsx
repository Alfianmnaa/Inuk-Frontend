import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaUsers, FaSpinner, FaSortUp, FaSortDown, FaMapMarkerAlt } from "react-icons/fa";
import { Edit, Trash2, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddEditUserModal from "./ui/AddEditUserModal";
import DeleteUserModal from "./ui/DeleteUserModal";
import ResetPasswordModal from "./ui/ResetPasswordModal";

import { getUsers, deleteUser, type GetUsersResponse } from "../../services/UserService";
import { resetUserPassword } from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";

export interface UserDisplay {
  id: string;
  name: string;
  phone: string;
  isPJT: boolean;
  regionName: string;
}

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [usersList, setUsersList] = useState<UserDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" });
  const [isLoading, setIsLoading] = useState(true);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const verifiedUsersData: GetUsersResponse[] = await getUsers(token, searchTerm, undefined, true);
      const unverifiedUsersData: GetUsersResponse[] = await getUsers(token, searchTerm, undefined, false);

      const combinedUsersMap = new Map<string, GetUsersResponse>();
      verifiedUsersData?.forEach((user) => combinedUsersMap.set(user.id, user));
      unverifiedUsersData?.forEach((user) => {
        if (!combinedUsersMap.has(user.id)) {
          combinedUsersMap.set(user.id, user);
        }
      });

      const uniqueUsersData = Array.from(combinedUsersMap.values());

      // GetUsersResponse only returns region_id (no desa_kelurahan).
      // The list endpoint is intentionally lightweight — use the ID prefix as placeholder.
      const mappedData: UserDisplay[] = uniqueUsersData.map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        isPJT: u.region_id !== "00000000-0000-0000-0000-000000000000" && !!u.region_id,
        regionName: u.region_id && u.region_id !== "00000000-0000-0000-0000-000000000000"
          ? `Terikat (${u.region_id.substring(0, 8)}...)`
          : "-",
      }));
      setUsersList(mappedData);
    } catch (error: any) {
      setUsersList([]);
      toast.error(error.message || "Gagal memuat data pengguna.");
      console.error("Fetch Users Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  }, [token, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuccess = () => {
    fetchUsers();
    setIsAddEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = useMemo(() => {
    const filtered = usersList;
    const sortableItems = [...filtered];
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
  }, [usersList, sortConfig]);

  const requestSort = (key: keyof UserDisplay) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => { setSelectedUser(null); setIsAddEditModalOpen(true); };
  const handleEditClick = (user: UserDisplay) => { setSelectedUser(user); setIsAddEditModalOpen(true); };
  const handleDeleteClick = (user: UserDisplay) => { setSelectedUser(user); setIsDeleteModalOpen(true); };
  const handleResetPasswordClick = (user: UserDisplay) => { setSelectedUser(user); setIsResetPasswordModalOpen(true); };

  const handleConfirmDelete = async (id: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await deleteUser(token, id);
      toast.success(`Pengguna berhasil dihapus!`);
      handleSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pengguna. Mungkin terikat Region.");
      console.error("Delete Error:", error);
    }
  };

  return (
    <DashboardLayout activeLink="/dashboard/user-management" pageTitle="Manajemen Pengguna (Inputer/Admin)">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah/Edit */}
        <AddEditUserModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} onSuccess={handleSuccess} initialData={selectedUser} />

        {/* Modal Hapus */}
        {selectedUser && <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} user={selectedUser} onConfirmDelete={handleConfirmDelete} />}

        {/* Modal Reset Password */}
        {selectedUser && (
          <ResetPasswordModal
            isOpen={isResetPasswordModalOpen}
            onClose={() => setIsResetPasswordModalOpen(false)}
            onSuccess={handleSuccess}
            targetName={selectedUser.name}
            onConfirmReset={async (newPassword) => {
              if (!token) throw new Error("Token tidak ditemukan.");
              await resetUserPassword(token, selectedUser.id, newPassword);
            }}
          />
        )}

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaUsers className="mr-2 text-primary" /> Kelola Daftar Pengguna ({usersList.length})
            </h3>
            <motion.button onClick={handleAddClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
              <FaPlus className="mr-2" /> Tambah Pengguna
            </motion.button>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama atau Telepon..."
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
            <FaUsers className="mr-2 text-primary" /> Daftar Pengguna (Total: {usersList.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data pengguna...
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="py-3 px-4 text-left">ID (Awal)</th>
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
                      <td className="py-3 px-4 font-mono text-xs max-w-25 truncate">{u.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                      <td className="py-3 px-4">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${u.isPJT ? "bg-primary/20 text-primary" : "bg-red-100 text-red-700"}`}>
                          <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                          {u.isPJT ? u.regionName : "Belum Terikat"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleEditClick(u)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Edit Pengguna">
                            <Edit size={18} />
                          </button>
                          {/* NEW: Reset Password */}
                          <button onClick={() => handleResetPasswordClick(u)} className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50 transition-colors" title="Reset Kata Sandi">
                            <KeyRound size={18} />
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