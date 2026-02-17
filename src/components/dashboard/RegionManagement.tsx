import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaSpinner, FaMapMarkedAlt, FaUserPlus, FaUsers, FaTrash, FaEdit, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddressSelector from "./AddressSelector";
import { getRegions, deleteRegion, type RegionDetail } from "../../services/RegionService";
import { useAuth } from "../../context/AuthContext";

// Modals
import CreateRegionModal from "./ui/CreateRegionModal";
import AssignUsersModal from "./ui/AssignUsersModal";
import ViewUsersModal from "./ui/ViewUsersModal";
import DeleteRegionModal from "./ui/DeleteRegionModal";
import EditRegionModal from "./ui/EditRegionModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const RegionManagement: React.FC = () => {
  const { token } = useAuth();
  const [regions, setRegions] = useState<RegionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- PERBAIKAN STATE FILTER (Disatukan dalam Object) ---
  // Ini menggantikan state terpisah (selectedProvince, etc) agar kompatibel dengan AddressSelector
  const [filterLocation, setFilterLocation] = useState({
    province: "",
    city: "",
    subdistrict: "",
    village: "",
  });

  // Search Text Manual
  const [searchText, setSearchText] = useState("");

  // --- MODAL STATES ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState<RegionDetail | null>(null);

  const fetchRegions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // 1. Siapkan Filter Dasar (Lokasi)
      const baseFilters = {
        province: filterLocation.province,
        city: filterLocation.city,
        subdistrict: filterLocation.subdistrict,
        village: filterLocation.village,
      };

      // Bersihkan filter kosong
      const cleanFilters = Object.fromEntries(Object.entries(baseFilters).filter(([_, v]) => v !== ""));

      // 2. STRATEGI DUAL FETCH: Panggil API 2x secara paralel
      // Request 1: Ambil region yang SUDAH punya PJT (is_active = true)
      // Request 2: Ambil region yang BELUM punya PJT (is_active = false)
      const [activeRegionsData, inactiveRegionsData] = await Promise.all([getRegions({ ...cleanFilters, is_active: true }), getRegions({ ...cleanFilters, is_active: false })]);

      // 3. Gabungkan Hasil
      // Kita gabungkan kedua array hasil response
      const combinedRegions = [...activeRegionsData, ...inactiveRegionsData];

      // 4. (Opsional) Sorting Client-Side agar rapi
      // Urutkan berdasarkan Kecamatan lalu Desa
      combinedRegions.sort((a, b) => {
        const compareKecamatan = a.kecamatan.localeCompare(b.kecamatan);
        if (compareKecamatan !== 0) return compareKecamatan;
        return a.desa_kelurahan.localeCompare(b.desa_kelurahan);
      });

      // 5. Set State
      setRegions(combinedRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Gagal memuat data region.");
    } finally {
      setIsLoading(false);
    }
  }, [token, filterLocation]); // Dependency tetap

  // Trigger fetch saat filter berubah
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // --- HANDLERS ---
  const handleOpenAssign = (region: RegionDetail) => {
    setSelectedRegion(region);
    setIsAssignModalOpen(true);
  };

  const handleOpenViewUsers = (region: RegionDetail) => {
    setSelectedRegion(region);
    setIsViewUsersModalOpen(true);
  };

  const handleDeleteClick = (region: RegionDetail) => {
    setSelectedRegion(region);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (region: RegionDetail) => {
    setSelectedRegion(region);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteRegion(id, token);
      toast.success("Region berhasil dihapus.");
      fetchRegions();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error("Gagal menghapus region. Pastikan tidak ada data donasi terkait.");
    }
  };

  // Filter Client-Side tambahan (Search Text)
  const filteredRegions = regions.filter((r) => r.kecamatan.toLowerCase().includes(searchText.toLowerCase()) || r.desa_kelurahan.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <DashboardLayout activeLink="/dashboard/region-management" pageTitle="Manajemen Region">
      {/* --- MODALS --- */}
      <CreateRegionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchRegions} />

      <EditRegionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchRegions} region={selectedRegion} />

      <AssignUsersModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} onSuccess={fetchRegions} targetRegion={selectedRegion} />

      <ViewUsersModal isOpen={isViewUsersModalOpen} onClose={() => setIsViewUsersModalOpen(false)} region={selectedRegion} onUpdate={fetchRegions} />

      {selectedRegion && <DeleteRegionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} region={selectedRegion} onConfirmDelete={handleConfirmDelete} />}

      {/* --- MAIN CONTENT --- */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* FILTER SECTION */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Data
            </h3>
            <motion.button onClick={() => setIsCreateModalOpen(true)} whileHover={{ scale: 1.05 }} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-700 transition-colors shadow-md">
              <FaPlus className="mr-2" /> Buat Region Baru
            </motion.button>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Daerah (Kecamatan / Desa)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
            {/* PERBAIKAN: Address Selector Component */}

            <div className="md:col-span-3 mt-2">
              <AddressSelector value={filterLocation} onChange={setFilterLocation} levels={["subdistrict"]} />
            </div>
          </div>
        </motion.div>

        {/* TABLE SECTION */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaMapMarkedAlt className="mr-2 text-primary" /> Daftar Semua Region ({filteredRegions.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin inline text-primary text-2xl" /> Memuat data...
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="py-3 px-4 text-left">Provinsi / Kab</th>
                  <th className="py-3 px-4 text-left">Kecamatan</th>
                  <th className="py-3 px-4 text-left">Desa / Kelurahan</th>
                  <th className="py-3 px-4 text-center">Penanggung Jawab</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => {
                    const hasUsers = region.user && region.user.length > 0;
                    return (
                      <tr key={region.id} className="border-b hover:bg-green-50/30 transition">
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {region.provinsi}
                          <br />
                          {region.kabupaten_kota}
                        </td>
                        <td className="py-3 px-4 font-medium">{region.kecamatan}</td>
                        <td className="py-3 px-4 font-medium">{region.desa_kelurahan}</td>

                        {/* Kolom Penanggung Jawab */}
                        <td className="py-3 px-4 text-center">
                          {hasUsers ? (
                            <button
                              onClick={() => handleOpenViewUsers(region)}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center mx-auto hover:bg-green-200 transition tooltip"
                              title="Klik untuk melihat/hapus penanggung jawab"
                            >
                              <FaUsers className="mr-1" /> Lihat {region.user.length} Penanggung Jawab
                            </button>
                          ) : (
                            <span className="text-red-400 text-xs italic bg-red-50 px-2 py-1 rounded">Belum Ada Penanggung Jawab</span>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => handleOpenAssign(region)} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 tooltip" title="Tambah Penanggung Jawab">
                              <FaUserPlus size={16} />
                            </button>

                            <button onClick={() => handleEditClick(region)} className="text-yellow-500 hover:text-yellow-700 p-2 rounded hover:bg-yellow-50 tooltip" title="Edit Nama Wilayah">
                              <FaEdit size={16} />
                            </button>

                            <button onClick={() => handleDeleteClick(region)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 tooltip" title="Hapus Region">
                              <FaTrash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      Tidak ada data region sesuai filter.
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

export default RegionManagement;
