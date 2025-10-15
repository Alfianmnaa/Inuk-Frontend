// src/components/dashboard/RegionManagement.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaMapMarkerAlt, FaEdit, FaTimes, FaSpinner, FaUsers, FaMapPin } from "react-icons/fa";
import { toast } from "react-hot-toast";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { getRegions, createRegion, deleteRegion } from "../../services/RegionService";
import type { RegionDetail } from "../../services/RegionService";
import AddressSelector, { type AddressSelection } from "./AddressSelector";

// Data model untuk tampilan daftar (Admin)
interface RegionData extends RegionDetail {}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Komponen Tambah Region Baru
interface CreateRegionFormProps {
  onCreate: () => void;
  onCancel: () => void;
}

const CreateRegionForm: React.FC<CreateRegionFormProps> = ({ onCreate, onCancel }) => {
  const authContext = useAuth(); // Ambil seluruh context
  const { token, userRole } = authContext || {}; // Destructure aman

  // Asumsi ID admin diambil dari token jika login sebagai admin,
  // jika tidak ada, gunakan ID dummy yang ada di seeds untuk simulasi
  const dummyAdminId = "85234567-8930-4234-5678-932345678943";
  const currentAdminId = authContext?.userRole === "admin" ? authContext.token?.substring(0, 36) : dummyAdminId;

  const [selection, setSelection] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });
  const [rw, setRW] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || userRole !== "admin") {
      toast.error("Akses ditolak: Anda harus Login sebagai Admin.");
      return;
    }

    if (!selection.village || rw === "") {
      toast.error("Semua field alamat dan RW wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRegion(
        {
          ...selection,
          userID: currentAdminId || dummyAdminId, // Gunakan ID admin yang valid
          rw: rw as number,
          // Name mapping di Go Service sudah disesuaikan
          // provinsi: selection.province,
          // kabupaten_kota: selection.city,
          // kecamatan: selection.subdistrict,
          // desa_kelurahan: selection.village,
        },
        token
      );

      toast.success("Region baru berhasil ditambahkan!");
      onCreate(); // Panggil fungsi refresh
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Gagal membuat region. Periksa koneksi/data.";
      toast.error(msg);
      console.error("Create Region Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-6 bg-yellow-50 rounded-xl shadow-inner border border-yellow-200 mb-6 overflow-hidden">
      <h4 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
        <FaMapPin className="mr-2" /> Tambah Detail Wilayah (Desa/RW)
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AddressSelector value={selection} onChange={setSelection} levels={["province", "city", "subdistrict", "village"]} disabled={isSubmitting} />
        <div className="flex space-x-4">
          <div className="w-1/4">
            <label className="block text-gray-700 font-semibold mb-1 text-sm">RW</label>
            <input
              type="number"
              value={rw}
              min="1"
              onChange={(e) => setRW(parseInt(e.target.value) || "")}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <div className="w-3/4 flex items-end space-x-2">
            <motion.button
              type="submit"
              disabled={isSubmitting || rw === ""}
              whileHover={{ scale: isSubmitting || rw === "" ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting || rw === "" ? 1 : 0.98 }}
              className={`flex-1 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors 
                                ${isSubmitting || rw === "" ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-green-600"}
                            `}
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />} Simpan
            </motion.button>
            <motion.button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <FaTimes className="mr-2" /> Batal
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

const RegionManagement: React.FC = () => {
  const { token, userRole } = useAuth();
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      // Menggunakan GET /regions untuk daftar admin
      const data = await getRegions({});
      setRegions(data as RegionData[]);
    } catch (err: any) {
      toast.error("Gagal memuat data region.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      fetchRegions();
    } else if (userRole === "user") {
      toast.error("Akses ditolak. Hanya Admin yang dapat mengelola Wilayah.");
    }
  }, [userRole]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus wilayah ini?")) return;
    if (!token || userRole !== "admin") {
      toast.error("Akses ditolak.");
      return;
    }

    try {
      await deleteRegion(id, token);
      toast.success("Wilayah berhasil dihapus.");
      fetchRegions();
    } catch (err: any) {
      toast.error("Gagal menghapus wilayah.");
      console.error(err);
    }
  };

  return (
    <DashboardLayout activeLink="/dashboard/region-management" pageTitle="Manajemen Wilayah & Region">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
        {/* Header dan Tombol Aksi */}
        <motion.div variants={itemVariants} className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaMapMarkerAlt className="mr-3 text-primary" /> Daftar Region Aktif
          </h3>
          {userRole === "admin" && (
            <motion.button
              onClick={() => setShowCreateForm(!showCreateForm)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-bold py-2 px-4 rounded-lg text-sm flex items-center transition-colors 
                                ${showCreateForm ? "bg-gray-500 text-white" : "bg-primary text-white hover:bg-green-600"}
                            `}
            >
              {showCreateForm ? <FaTimes className="mr-2" /> : <FaPlus className="mr-2" />}
              {showCreateForm ? "Tutup Form" : "Tambah Region Baru"}
            </motion.button>
          )}
        </motion.div>

        {/* Form Tambah Region */}
        <AnimatePresence>
          {showCreateForm && userRole === "admin" && (
            <CreateRegionForm
              onCreate={() => {
                fetchRegions();
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Tabel Data Region */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Memuat data wilayah...
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="py-3 px-4 text-left">Provinsi / Kota</th>
                  <th className="py-3 px-4 text-left">Kecamatan / Desa</th>
                  <th className="py-3 px-4 text-center">RW</th>
                  <th className="py-3 px-4 text-left">Penanggung Jawab (Admin)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {regions.length > 0 ? (
                  regions.map((r) => (
                    <tr key={r.id} className="text-sm text-gray-700 border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {r.provinsi} / {r.kabupaten_kota}
                      </td>
                      <td className="py-3 px-4">
                        {r.kecamatan} / {r.desa_kelurahan}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">RW {r.rw}</td>
                      <td className="py-3 px-4 flex items-center">
                        <FaUsers className="w-3 h-3 mr-1 text-blue-500" /> {r.user_name}
                        <p className="text-xs text-gray-500 ml-2">({r.user_id.substring(0, 8)}...)</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-blue-500 hover:text-blue-700 font-semibold text-xs mr-2">
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">
                          <FaTrash className="mr-1" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                      Tidak ada data wilayah yang ditemukan.
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
