import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaSearch, FaCheck, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { updateDeleteAdminRegion } from "../../../services/AdminService";
import { getRegions, type RegionDetail } from "../../../services/RegionService";
import type { AdminDisplay } from "../AdminManagement";

type RegionOption = Pick<RegionDetail, "id" | "kecamatan" | "desa_kelurahan">;

interface AssignAdminRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: AdminDisplay | null;
}

const AssignAdminRegionModal: React.FC<AssignAdminRegionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admin,
}) => {
  const { token } = useAuth();
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) return;
    setSelectedVillageId(null);
    setSearchTerm("");
    setIsLoadingVillages(true);
    Promise.all([
      getRegions({ is_active: true }),
      getRegions({ is_active: false }),
    ])
      .then(([active, inactive]) => {
        const combined = [...active, ...inactive];
        combined.sort(
          (a, b) =>
            a.kecamatan.localeCompare(b.kecamatan) ||
            a.desa_kelurahan.localeCompare(b.desa_kelurahan)
        );
        setVillages(
          combined.map((r) => ({
            id: r.id,
            desa_kelurahan: r.desa_kelurahan,
            kecamatan: r.kecamatan,
          }))
        );
      })
      .catch(() => toast.error("Gagal memuat daftar wilayah."))
      .finally(() => setIsLoadingVillages(false));
  }, [isOpen, token]);

  const filteredVillages = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return villages.filter(
      (v) =>
        v.desa_kelurahan.toLowerCase().includes(term) ||
        v.kecamatan.toLowerCase().includes(term)
    );
  }, [villages, searchTerm]);

  const handleSubmit = async () => {
    if (!admin || !token || !selectedVillageId) return;
    setIsSubmitting(true);
    try {
      await updateDeleteAdminRegion(token, admin.id, { region_id: selectedVillageId });
      toast.success(`Wilayah berhasil ditetapkan ke ${admin.name}.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Gagal menetapkan wilayah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1060]"
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl h-[520px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" /> Tetapkan Wilayah Admin
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Admin:{" "}
          <span className="font-semibold text-gray-800">{admin.name}</span>
          {admin.isPJT && (
            <span className="ml-2 text-xs text-amber-600">
              (saat ini: {admin.kecamatan} / {admin.village})
            </span>
          )}
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Desa / Kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border pl-10 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-1.5">
          {isLoadingVillages ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 mt-10 text-sm">
              <FaSpinner className="animate-spin" /> Memuat wilayah...
            </div>
          ) : filteredVillages.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">Tidak ada wilayah tersedia.</p>
          ) : (
            filteredVillages.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVillageId(v.id)}
                className={`p-3 rounded cursor-pointer border flex justify-between items-center transition-colors ${
                  selectedVillageId === v.id
                    ? "bg-green-50 border-primary"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{v.desa_kelurahan}</p>
                  <p className="text-xs text-gray-500">{v.kecamatan}</p>
                </div>
                {selectedVillageId === v.id && <FaCheck className="text-primary shrink-0" />}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {selectedVillageId
              ? `Dipilih: ${filteredVillages.find((v) => v.id === selectedVillageId)?.desa_kelurahan ?? ""}`
              : "Belum memilih wilayah"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedVillageId}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
              Tetapkan
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssignAdminRegionModal;