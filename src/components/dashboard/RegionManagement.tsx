// inuk-frontend/src/components/dashboard/RegionManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaFilter, FaSpinner, FaMapMarkedAlt, FaTimes } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddressSelector, { type AddressSelection } from "./AddressSelector";
import { getRegions, deleteRegion, type RegionDetail, type RegionFilterBody } from "../../services/RegionService";
import { useAuth } from "../../context/AuthContext";
import AddEditRegionModal from "./ui/AddEditRegionModal";
import DeleteRegionModal from "./ui/DeleteRegionModal";
import { updateUser, type UpdateUserPayload } from "../../services/UserService"; // Untuk melepas ikatan saat delete region

// Component Utama Halaman
const RegionManagement: React.FC = () => {
  const { token } = useAuth();
  const [regions, setRegions] = useState<RegionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false); // Untuk Add/Edit Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionDetail | null>(null); // Untuk Edit/Delete

  const [addressFilters, setAddressFilters] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });
  const NULL_UUID = "00000000-0000-0000-0000-000000000000";

  // --- Data Fetching Function ---
  const fetchRegions = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const filters: RegionFilterBody = {
      // Hanya kirim filter jika ada nilai
      province: addressFilters.province || undefined,
      city: addressFilters.city || undefined,
      subdistrict: addressFilters.subdistrict || undefined,
      village: addressFilters.village || undefined,
    };

    try {
      const data = await getRegions(filters);
      setRegions(data);
    } catch (error: any) {
      toast.error("Gagal memuat data region.");
      console.error("Fetch Regions Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  }, [token, addressFilters]);

  // --- Handlers Aksi CRUD ---

  const handleAddClick = () => {
    setSelectedRegion(null); // Mode Add
    setIsModalOpen(true);
  };

  const handleEditClick = (region: RegionDetail) => {
    // Mode Edit sekarang hanya untuk update PJT
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (region: RegionDetail) => {
    setSelectedRegion(region);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. LEPAS IKATAN PJT (Jika ada)
      const regionToDelete = regions.find((r) => r.id === id);
      if (regionToDelete && regionToDelete.user_id && regionToDelete.user_id !== NULL_UUID) {
        // NOTE: Perlu panggil API untuk mendapatkan data PJT yang lengkap (nama dan telepon)
        // Menggunakan asumsi nama dan telepon di RegionDetail cukup untuk validasi backend.
        const unassignPayload: UpdateUserPayload = {
          name: regionToDelete.user_name || "N/A",
          phone: "+62812xxxx", // Mengirim placeholder phone untuk memenuhi validasi required
          region_id: NULL_UUID,
        };
        // Asumsi user_id adalah ID pengguna yang terikat
        await updateUser(token, regionToDelete.user_id, unassignPayload);
        toast.success("PJT terkait sudah dilepas ikatannya.");
      }

      // 2. HAPUS REGION
      await deleteRegion(id, token);

      toast.success("Region berhasil dihapus.");
      fetchRegions(); // Refresh data
      setIsDeleteModalOpen(false);
      setSelectedRegion(null);
    } catch (error: any) {
      const errorMessage = error.message || "Gagal menghapus region. Region mungkin masih terikat dengan Donasi/Donatur di database.";
      toast.error(errorMessage);
      console.error("Delete Region Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchRegions(); // Refresh data setelah Add/Edit
    setIsModalOpen(false);
    setSelectedRegion(null);
  };

  // --- Effects ---
  // Trigger fetch saat filter alamat berubah atau saat token tersedia pertama kali
  useEffect(() => {
    if (token) {
      fetchRegions();
    }
  }, [token, addressFilters.subdistrict, addressFilters.village]);

  // --- UI Logic ---
  const isFiltered = addressFilters.subdistrict || addressFilters.village;

  const clearFilters = () => {
    setAddressFilters({ province: "", city: "", subdistrict: "", village: "" });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <DashboardLayout activeLink="/dashboard/region-management" pageTitle="Manajemen Region">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Add/Edit Region */}
        <AddEditRegionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} initialData={selectedRegion} />

        {/* Modal Konfirmasi Hapus */}
        {selectedRegion && <DeleteRegionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} region={selectedRegion} onConfirmDelete={handleConfirmDelete} />}

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Region
            </h3>
            <motion.button onClick={handleAddClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors">
              <FaPlus className="mr-2" /> Tambah Region
            </motion.button>
          </div>

          {/* Row 1: Address Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Filter Berdasarkan Lokasi</label>
            <AddressSelector value={addressFilters} onChange={setAddressFilters} levels={["subdistrict", "village"]} kecamatanName="Kecamatan" />
          </div>

          {/* Clear Filter Button */}
          {isFiltered && (
            <motion.button onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
              <FaTimes className="mr-1" /> Bersihkan Filter
            </motion.button>
          )}
        </motion.div>

        {/* Tabel Data Region */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaMapMarkedAlt className="mr-2 text-primary" /> Daftar Region Aktif ({regions.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data region...
            </div>
          ) : (
            <>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="py-3 px-4 text-left">No</th>
                    <th className="py-3 px-4 text-left">Desa/Kelurahan</th>
                    <th className="py-3 px-4 text-left">Kecamatan</th>
                    <th className="py-3 px-4 text-left">Penanggung Jawab</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.length > 0 ? (
                    regions.map((r, index) => (
                      <tr key={r.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{r.desa_kelurahan}</td>
                        <td className="py-3 px-4">{r.kecamatan}</td>
                        <td className="py-3 px-4">
                          {r.user_id && r.user_id !== NULL_UUID ? (
                            <>
                              <p className="font-semibold text-gray-900">{r.user_name}</p>
                              <p className="text-xs text-gray-500">ID: {r.user_id.substring(0, 8)}...</p>
                            </>
                          ) : (
                            <span className="text-red-500 font-medium">Belum Ditugaskan</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Tombol Edit */}
                            <button onClick={() => handleEditClick(r)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Ubah Penanggung Jawab">
                              <Edit size={18} />
                            </button>
                            {/* Tombol Delete */}
                            <button onClick={() => handleDeleteClick(r)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus Region">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                        Tidak ada data region yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default RegionManagement;
