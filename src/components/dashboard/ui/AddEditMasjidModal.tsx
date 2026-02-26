import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FaSave, FaSpinner, FaMosque } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { createMasjid, updateMasjid, type MasjidResponse } from "../../../services/MasjidService";
import { getRegions, type RegionDetail } from "../../../services/RegionService";
import { getAdminProfile } from "../../../services/AdminService";
import { getAdmins, type GetAdminsResponse } from "../../../services/AdminService";

interface AddEditMasjidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masjid?: MasjidResponse | null; // null/undefined = create mode
}

const AddEditMasjidModal: React.FC<AddEditMasjidModalProps> = ({ isOpen, onClose, onSuccess, masjid }) => {
  const { token, userRole } = useAuth();
  const isEditMode = !!masjid;

  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState("");
  const [adminId, setAdminId] = useState(""); // superadmin only
  const [regions, setRegions] = useState<RegionDetail[]>([]);
  const [admins, setAdmins] = useState<GetAdminsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!isOpen || !token) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch regions based on role
        let fetchedRegions: RegionDetail[] = [];
        if (userRole === "superadmin") {
          fetchedRegions = await getRegions({ province: "Jawa Tengah", city: "Kudus" });
        } else {
          // For regular admin, filter by their kecamatan
          const profile = await getAdminProfile(token);
          fetchedRegions = await getRegions({
            province: profile.provinsi,
            city: profile.kabupaten_kota,
            subdistrict: profile.kecamatan,
          });
        }
        setRegions(fetchedRegions);

        // Fetch admins list for superadmin
        if (userRole === "superadmin") {
          const [verified, unverified] = await Promise.all([
            getAdmins(token, undefined, undefined, true),
            getAdmins(token, undefined, undefined, false),
          ]);
          setAdmins([...verified, ...unverified]);
        }
      } catch (err) {
        toast.error("Gagal memuat data wilayah.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, token, userRole]);

  // Populate form on edit mode
  useEffect(() => {
    if (isEditMode && masjid) {
      setName(masjid.name);
      setRegionId(masjid.region_id);
      setAdminId(""); // admin_id not returned in list; leave empty unless superadmin fills it
    } else {
      setName("");
      setRegionId("");
      setAdminId("");
    }
  }, [masjid, isEditMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      toast.error("Nama masjid tidak boleh kosong.");
      return;
    }
    if (!regionId) {
      toast.error("Pilih wilayah terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && masjid) {
        const payload: any = { name, region_id: regionId };
        if (userRole === "superadmin" && adminId) {
          payload.admin_id = adminId;
        }
        await updateMasjid(token, masjid.id, payload);
        toast.success("Masjid berhasil diperbarui!");
      } else {
        const payload: any = { name, region_id: regionId };
        if (userRole === "superadmin" && adminId) {
          payload.admin_id = adminId;
        }
        await createMasjid(token, payload);
        toast.success("Masjid berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1050]"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMosque className="text-primary" />
              {isEditMode ? "Edit Masjid" : "Tambah Masjid Baru"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-primary text-2xl mr-2" />
              <span className="text-gray-500">Memuat data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Masjid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Masjid <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Masjid Al-Ikhlas"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                />
              </div>

              {/* Pilih Wilayah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wilayah (Desa/Kelurahan) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                >
                  <option value="">-- Pilih Wilayah --</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.desa_kelurahan} — {r.kecamatan}
                    </option>
                  ))}
                </select>
                {regions.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Tidak ada wilayah tersedia. Buat region terlebih dahulu.
                  </p>
                )}
              </div>

              {/* Admin ID — hanya superadmin */}
              {userRole === "superadmin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign ke Admin{!isEditMode && <span className="text-red-500"> *</span>}
                  </label>
                  <select
                    required={!isEditMode}
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                  >
                    <option value="">-- Pilih Admin --</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.phone})
                      </option>
                    ))}
                  </select>
                  {isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah admin pemilik.</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {isEditMode ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEditMasjidModal;
