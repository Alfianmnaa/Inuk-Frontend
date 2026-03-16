import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaUsers, FaSpinner, FaSortUp, FaSortDown, FaMapMarkerAlt, FaUserShield, FaUnlink } from "react-icons/fa";
import { Edit, Trash2, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddEditAdminModal from "./ui/AddEditAdminModal";
import DeleteAdminModal from "./ui/DeleteAdminModal";
import AssignAdminRegionModal from "./ui/AssignAdminRegionModal";
import ResetPasswordModal from "./ui/ResetPasswordModal";

import { getAdmins, deleteAdmin, updateDeleteAdminRegion, type GetAdminsResponse } from "../../services/AdminService";
import { resetAdminPassword } from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";

export interface AdminDisplay {
  id: string;
  name: string;
  phone: string;
  isPJT: boolean;
  regionId: string;
  kecamatan: string;
  village: string;
}

type SortKeys = keyof AdminDisplay | null;
interface SortConfig {
  key: SortKeys;
  direction: "ascending" | "descending";
}

const TableSortHeader: React.FC<{
  label: string;
  sortKey: keyof AdminDisplay;
  sortConfig: SortConfig;
  requestSort: (key: keyof AdminDisplay) => void;
}> = ({ label, sortKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === sortKey;
  return (
    <th
      className="py-3 px-4 text-left cursor-pointer select-none hover:text-gray-900 transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        {isSorted ? (
          <span className="ml-2">
            {sortConfig.direction === "ascending" ? (
              <FaSortUp className="w-3 h-3 text-primary" />
            ) : (
              <FaSortDown className="w-3 h-3 text-primary" />
            )}
          </span>
        ) : (
          <FaSortUp className="w-3 h-3 ml-2 text-gray-400 opacity-50" />
        )}
      </div>
    </th>
  );
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AdminManagement: React.FC = () => {
  const { token } = useAuth();
  const [adminsList, setAdminsList] = useState<AdminDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" });
  const [isLoading, setIsLoading] = useState(true);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignRegionModalOpen, setIsAssignRegionModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDisplay | null>(null);

  const fetchAdmins = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [verifiedAdmins, unverifiedAdmins] = await Promise.all([
        getAdmins(token, searchTerm, undefined, true),
        getAdmins(token, searchTerm, undefined, false),
      ]);
      const combinedMap = new Map<string, GetAdminsResponse>();
      verifiedAdmins?.forEach((a) => combinedMap.set(a.id, a));
      unverifiedAdmins?.forEach((a) => { if (!combinedMap.has(a.id)) combinedMap.set(a.id, a); });
      const mapped: AdminDisplay[] = Array.from(combinedMap.values()).map((a) => {
        const isBound = !!a.region_id && a.region_id !== "00000000-0000-0000-0000-000000000000";
        return {
          id: a.id,
          name: a.name,
          phone: a.phone,
          isPJT: isBound,
          regionId: isBound ? a.region_id! : "",
          kecamatan: a.kecamatan || "",
          village: a.desa_kelurahan || "",
        };
      });
      setAdminsList(mapped);
    } catch (error: any) {
      setAdminsList([]);
      toast.error(error.message || "Gagal memuat data admin.");
    } finally {
      setIsLoading(false);
    }
  }, [token, searchTerm]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    let sortable = [...adminsList];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [adminsList, sortConfig]);

  const requestSort = (key: keyof AdminDisplay) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const handleSuccess = () => fetchAdmins();
  const handleAddClick = () => { setSelectedAdmin(null); setIsAddEditModalOpen(true); };
  const handleEditClick = (a: AdminDisplay) => { setSelectedAdmin(a); setIsAddEditModalOpen(true); };
  const handleDeleteClick = (a: AdminDisplay) => { setSelectedAdmin(a); setIsDeleteModalOpen(true); };
  const handleAssignRegionClick = (a: AdminDisplay) => { setSelectedAdmin(a); setIsAssignRegionModalOpen(true); };
  const handleResetPasswordClick = (a: AdminDisplay) => { setSelectedAdmin(a); setIsResetPasswordModalOpen(true); };

  const handleConfirmDelete = async (id: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await deleteAdmin(token, id);
      toast.success("Admin berhasil dihapus!");
      handleSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus admin. Mungkin terikat Region.");
      console.error("Delete Error:", error);
    }
  };

  const handleRemoveRegion = async (a: AdminDisplay) => {
    if (!token) return;
    try {
      await updateDeleteAdminRegion(token, a.id, { region_id: "" });
      toast.success(`Region admin ${a.name} berhasil dilepas.`);
      handleSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal melepas region.");
    }
  };

  return (
    <DashboardLayout activeLink="/dashboard/admin-management" pageTitle="Manajemen Admin">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Modals */}
        <AddEditAdminModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          onSuccess={handleSuccess}
          initialData={selectedAdmin}
        />
        {selectedAdmin && (
          <DeleteAdminModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            admin={selectedAdmin}
            onConfirmDelete={handleConfirmDelete}
          />
        )}
        <AssignAdminRegionModal
          isOpen={isAssignRegionModalOpen}
          onClose={() => setIsAssignRegionModalOpen(false)}
          onSuccess={handleSuccess}
          admin={selectedAdmin}
        />
        {selectedAdmin && (
          <ResetPasswordModal
            isOpen={isResetPasswordModalOpen}
            onClose={() => setIsResetPasswordModalOpen(false)}
            onSuccess={handleSuccess}
            targetName={selectedAdmin.name}
            onConfirmReset={async (newPassword) => {
              if (!token) throw new Error("Token tidak ditemukan.");
              await resetAdminPassword(token, selectedAdmin.id, newPassword);
            }}
          />
        )}

        {/* Filter & toolbar */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaUsers className="mr-2 text-primary" /> Kelola Daftar Admin ({adminsList.length})
            </h3>
            <motion.button
              onClick={handleAddClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
            >
              <FaPlus className="mr-2" /> Tambah Admin
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
            <motion.button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              <FaTimes className="mr-1" /> Bersihkan Pencarian
            </motion.button>
          )}
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaUsers className="mr-2 text-primary" /> Daftar Admin (Total: {adminsList.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data admin...
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
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((a) => (
                    <tr key={a.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs max-w-25 truncate">{a.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{a.name}</td>
                      <td className="py-3 px-4">{a.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center max-w-[7.5rem] px-2.5 py-1 text-xs font-semibold rounded-full overflow-hidden ${
                              a.isPJT ? "bg-primary/20 text-primary" : "bg-red-100 text-red-700"
                            }`}
                          >
                            <FaMapMarkerAlt className="w-3 h-3 mr-1 shrink-0" />
                            <span className="truncate">{a.isPJT ? a.kecamatan : "Belum Terikat"}</span>
                          </span>
                          <button
                            onClick={() => handleAssignRegionClick(a)}
                            title="Tetapkan Wilayah"
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                          >
                            <FaUserShield size={14} />
                          </button>
                          {a.isPJT && (
                            <button
                              onClick={() => handleRemoveRegion(a)}
                              title="Lepas Wilayah"
                              className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            >
                              <FaUnlink size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Edit */}
                          <button
                            onClick={() => handleEditClick(a)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                            title="Edit Admin"
                          >
                            <Edit size={16} />
                          </button>
                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPasswordClick(a)}
                            className="text-amber-500 hover:text-amber-700 p-1.5 rounded hover:bg-amber-50 transition-colors"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound size={16} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(a)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Hapus Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                      Tidak ada data admin yang ditemukan.
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

export default AdminManagement;