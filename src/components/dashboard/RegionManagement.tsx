import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaFilter, FaSpinner, FaMapMarkedAlt, FaTimes } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import AddressSelector, { type AddressSelection } from "./AddressSelector";
import { getRegions, deleteRegion, type RegionDetail, type RegionFilterBody } from "../../services/RegionService";
import { useAuth } from "../../context/AuthContext";
import AddRegionModal from "./ui/AddRegionModal";

// Component Utama Halaman
const RegionManagement: React.FC = () => {
  const { token } = useAuth();
  const [regions, setRegions] = useState<RegionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Filter
  const [addressFilters, setAddressFilters] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });

  // State untuk Delete Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedRegionToDelete, setSelectedRegionToDelete] = useState<RegionDetail | null>(null);

  // --- Data Fetching Function ---
  const fetchRegions = async () => {
    if (!token) return;

    setIsLoading(true);

    const filters: RegionFilterBody = {
      province: addressFilters.province || undefined,
      city: addressFilters.city || undefined,
      subdistrict: addressFilters.subdistrict || undefined,
      village: addressFilters.village || undefined,
    };

    try {
      // Menggunakan getRegions dari service
      const data = await getRegions(filters);
      setRegions(data);
    } catch (error: any) {
      toast.error("Gagal memuat data region.");
      console.error("Fetch Regions Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers Aksi ---

  const handleDeleteClick = (region: RegionDetail) => {
    setSelectedRegionToDelete(region);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !selectedRegionToDelete) return;

    setIsLoading(true);
    try {
      await deleteRegion(selectedRegionToDelete.id, token);
      toast.success("Region berhasil dihapus.");
      fetchRegions(); // Refresh data
      setIsDeleteConfirmOpen(false);
    } catch (error: any) {
      toast.error("Gagal menghapus region.");
      console.error("Delete Region Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  // Trigger fetch saat filter alamat berubah atau saat token tersedia pertama kali
  useEffect(() => {
    fetchRegions();
  }, [token, addressFilters]);

  // --- UI Logic ---
  const isFiltered = addressFilters.subdistrict;

  const clearFilters = () => {
    setAddressFilters({ province: "", city: "", subdistrict: "", village: "" });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Komponen Modal Konfirmasi Hapus (Ditempatkan di sini untuk kemudahan)
  const DeleteConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; region: RegionDetail; onConfirm: () => void }> = ({ isOpen, onClose, region, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100]">
        <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-red-600">Konfirmasi Hapus</h3>
          <p className="mb-4">
            Apakah Anda yakin ingin menghapus region RW **{region.rw}** di **{region.desa_kelurahan}** yang dikelola oleh **{region.user_name}**?
          </p>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              Batal
            </button>
            <button type="button" onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-1" />}
              Hapus Permanen
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeLink="/dashboard/region" pageTitle="Manajemen Region">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Modal Tambah Region */}
        <AddRegionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchRegions} />

        {/* Modal Konfirmasi Hapus */}
        {selectedRegionToDelete && <DeleteConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} region={selectedRegionToDelete} onConfirm={handleConfirmDelete} />}

        {/* Filter dan Aksi */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-primary" /> Filter Region
            </h3>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center hover:bg-green-600 transition-colors"
            >
              <FaPlus className="mr-2" /> Tambah Region
            </motion.button>
          </div>

          {/* Row 1: Address Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Filter Berdasarkan Lokasi</label>
            <AddressSelector value={addressFilters} onChange={setAddressFilters} levels={["province", "city", "subdistrict", "village"]} kecamatanName="Kecamatan" />
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
                    {/* Urutan Kolom Sesuai Permintaan */}
                    <th className="py-3 px-4 text-left">No</th>
                    <th className="py-3 px-4 text-left">Penanggung Jawab</th>
                    <th className="py-3 px-4 text-left">RW</th>
                    <th className="py-3 px-4 text-left">Desa/Kelurahan</th>
                    <th className="py-3 px-4 text-left">Kecamatan</th>
                    <th className="py-3 px-4 text-left">Kabupaten/Kota</th>
                    <th className="py-3 px-4 text-left">Provinsi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.length > 0 ? (
                    regions.map(
                      (
                        r,
                        index // BARU: Tambahkan index untuk kolom No
                      ) => (
                        <tr key={r.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                          <td className="py-3 px-4">{index + 1}</td> {/* Kolom No urut */}
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900">{r.user_name}</p>
                            <p className="text-xs text-gray-500">ID: {r.user_id.substring(0, 8)}...</p>
                          </td>
                          <td className="py-3 px-4 font-semibold">{r.rw}</td>
                          <td className="py-3 px-4">{r.desa_kelurahan}</td>
                          <td className="py-3 px-4">{r.kecamatan}</td>
                          <td className="py-3 px-4">{r.kabupaten_kota}</td>
                          <td className="py-3 px-4">{r.provinsi}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Tombol Edit jika endpoint sudah ada */}
                              <button
                                // onClick={() => handleEditClick(r)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                title="Edit Region"
                                disabled // Sementara dinonaktifkan
                              >
                                <Edit size={18} />
                              </button>
                              {/* Tombol Delete */}
                              <button onClick={() => handleDeleteClick(r)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus Region">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 italic">
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
