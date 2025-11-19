// inuk-frontend/src/components/dashboard/DonaturManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaUsers, FaMapMarkerAlt, FaSpinner, FaHandHoldingHeart, FaInfoCircle } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddEditDonaturModal from "./ui/AddEditDonaturModal";
import DeleteDonaturConfirmationModal from "./ui/DeleteDonaturConfirmationModal";
import { type Donatur, getDonaturList, deleteDonatur, type DonaturAPI } from "../../services/DonaturService";
import { useAuth } from "../../context/AuthContext";
// MENGHAPUS import getRegions dan getUserProfile
// import { getRegions } from "../../services/RegionService";

// --- Data Region Pengguna (Placeholder) ---
// RW DIHAPUS dari placeholder, karena diambil dari input Donatur
const INITIAL_USER_REGION = {
  kecamatan: "Memuat...",
  desa: "Memuat...",
};

// MENGHAPUS: Key untuk cache LocalStorage
// const REGION_CACHE_KEY = "user_region_context_cache";

// Varian Framer Motion untuk item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Component Utama Halaman
const DonaturManagement: React.FC = () => {
  const { token } = useAuth();

  // State Donatur (dari API)
  const [donaturListAPI, setDonaturListAPI] = useState<DonaturAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Region Petugas (Hanya KEC/DES untuk konteks)
  const [userRegionDisplay, setUserRegionDisplay] = useState(INITIAL_USER_REGION);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDonatur, setSelectedDonatur] = useState<Donatur | null>(null);

  // State untuk melacak loading region secara terpisah
  const [isRegionLoading, setIsRegionLoading] = useState(true);

  // --- Pemetaan Data API ke Tipe Frontend (Donatur) ---
  const mappedDonaturList: Donatur[] = donaturListAPI.map((d) => ({
    id: d.id,
    noKaleng: d.kaleng,
    namaDonatur: d.name,
    rw: d.rw.toString().padStart(3, "0"), // RW tetap diambil dari data Donatur (d.rw)
    rt: d.rt.toString().padStart(3, "0"),
    kecamatan: userRegionDisplay.kecamatan,
    desa: userRegionDisplay.desa,
  }));

  // 1. Load Region User dari LocalStorage (DIUBAH)
  const loadUserRegion = useCallback(() => {
    const village = localStorage.getItem("user_village");
    const subdistrict = localStorage.getItem("user_subdistrict");

    // Cek apakah DashboardLayout sudah menyimpan data di localStorage
    if (village && subdistrict) {
      if (village === "N/A" || subdistrict === "N/A" || village === "Gagal Memuat Region") {
        setUserRegionDisplay({ kecamatan: "N/A", desa: "N/A" });
      } else {
        setUserRegionDisplay({
          kecamatan: subdistrict,
          desa: village,
        });
      }
      setIsRegionLoading(false);
    } else {
      // Data belum dimuat (mungkin loading DashboardLayout)
      setUserRegionDisplay(INITIAL_USER_REGION);
      setIsRegionLoading(true);
    }
  }, []); // Tidak ada dependency eksternal

  // 2. Fetch Donatur List (Hanya berjalan setelah region dimuat)
  const fetchDonatur = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await getDonaturList(token, searchTerm);
      setDonaturListAPI(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data donatur.");
      console.error("Fetch Donatur Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers Aksi ---

  const handleAddClick = () => {
    // Memastikan region sudah dimuat dan valid sebelum membuka modal
    if (isRegionLoading || userRegionDisplay.desa === INITIAL_USER_REGION.desa || userRegionDisplay.desa === "N/A") {
      toast.error("Data Region Petugas (Konteks) belum dimuat. Mohon tunggu atau refresh halaman.");
      return;
    }
    setSelectedDonatur(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (donatur: Donatur) => {
    setSelectedDonatur(donatur);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (donatur: Donatur) => {
    setSelectedDonatur(donatur);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    fetchDonatur();
    setIsDeleteModalOpen(false);
    setIsModalOpen(false);
  };

  // Menghapus Donatur (Real API Call)
  const handleConfirmDelete = async (id: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await deleteDonatur(token, id);
      toast.success("Data Donatur berhasil dihapus!");
      handleSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus Donatur.");
      console.error("Delete Error:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  // 1. Load region saat mount
  useEffect(() => {
    if (token) {
      loadUserRegion(); // Load dari localStorage
    }
  }, [token, loadUserRegion]);

  // 2. Trigger fetch donatur saat search term berubah atau region selesai dimuat
  useEffect(() => {
    // Hanya fetch donatur jika region sudah selesai dimuat (isRegionLoading=false)
    if (token && !isRegionLoading) {
      fetchDonatur();
    }
  }, [searchTerm, token, isRegionLoading]);

  // --- UI Component (Daftar Donatur) ---
  const DonaturContent = (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      {/* Modal Add/Edit */}
      <AddEditDonaturModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={selectedDonatur}
        // Mengirim hanya KEC dan DES
        region={userRegionDisplay}
      />

      {/* Modal Delete */}
      {selectedDonatur && (
        <DeleteDonaturConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          donatur={selectedDonatur}
          // onSuccess sekarang hanya menerima callback tanpa argumen.
          // Kita memanggil handleConfirmDelete(id) di sini.
          onSuccess={() => handleConfirmDelete(selectedDonatur.id)}
        />
      )}
      {/* Filter & Aksi */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaHandHoldingHeart className="mr-2 text-primary" /> Daftar Donatur Kaleng (Region Konteks: {userRegionDisplay.desa})
          </h3>
          <motion.button
            onClick={handleAddClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
            disabled={isRegionLoading || userRegionDisplay.desa === "N/A" || isLoading}
          >
            <FaPlus className="mr-2" /> Tambah Donatur
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Donatur */}
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama Donatur atau No Kaleng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          {/* Info Region Statis */}
          <div className="md:col-span-2 text-sm text-gray-600 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-500" /> Konteks Petugas: {userRegionDisplay.kecamatan} / {userRegionDisplay.desa}
          </div>
        </div>
        {searchTerm && (
          <motion.button onClick={() => setSearchTerm("")} className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
            <FaTimes className="mr-1" /> Bersihkan Pencarian
          </motion.button>
        )}
      </motion.div>

      {/* Tabel Donatur */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaUsers className="mr-2 text-primary" /> Daftar Donatur Kaleng ({mappedDonaturList.length} Donatur)
        </h3>
        {isLoading || isRegionLoading ? (
          <div className="text-center py-10 text-gray-500 flex items-center justify-center">
            <FaSpinner className="animate-spin mr-3" /> Memuat data donatur...
          </div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                {/* Kolom Baru */}
                <th className="py-3 px-4 text-left">No Kaleng</th>
                <th className="py-3 px-4 text-left">Donatur</th>
                <th className="py-3 px-4 text-left">Kec/Desa</th>
                <th className="py-3 px-4 text-left">RW</th>
                <th className="py-3 px-4 text-left">RT</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mappedDonaturList.length > 0 ? (
                mappedDonaturList.map((d) => (
                  <tr key={d.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{d.noKaleng}</td>
                    <td className="py-3 px-4">{d.namaDonatur}</td>
                    <td className="py-3 px-4 flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1 text-red-500" /> {d.kecamatan} / {d.desa}
                    </td>
                    <td className="py-3 px-4">{d.rw}</td>
                    <td className="py-3 px-4">{d.rt}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEditClick(d)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" title="Edit Donatur">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(d)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus Donatur">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                    Tidak ada data donatur yang ditemukan di region ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <DashboardLayout activeLink="/dashboard/donatur-management" pageTitle="Manajemen Donatur Kaleng">
      {DonaturContent}
    </DashboardLayout>
  );
};

export default DonaturManagement;
