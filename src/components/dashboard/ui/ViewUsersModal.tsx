import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaUserShield, FaTrash, FaSpinner } from "react-icons/fa";
import { type RegionDetail, setRegionUsers } from "../../../services/RegionService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";

interface ViewUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: RegionDetail | null;
  onUpdate: () => void; // Callback untuk refresh data parent
}

const ViewUsersModal: React.FC<ViewUsersModalProps> = ({ isOpen, onClose, region, onUpdate }) => {
  const { token } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen || !region) return null;

  // Fungsi untuk menghapus user (Unassign)
  const handleRemoveUser = async (userIdToRemove: string, userName: string) => {
    if (!confirm(`Yakin ingin menghapus "${userName}" dari penanggung jawab wilayah ini?`)) return;
    if (!token) return;

    setLoadingId(userIdToRemove);
    try {
      // Logic: Ambil semua user yg ada sekarang, filter yang mau dihapus, lalu set ulang
      const currentUsers = region.user || [];
      const newUserIds = currentUsers.filter((u) => u.user_id !== userIdToRemove).map((u) => u.user_id);

      await setRegionUsers(region.id, newUserIds, token);
      toast.success("User berhasil dihapus dari region.");
      onUpdate(); // Refresh data region di parent
      onClose(); // Tutup modal (opsional, atau biarkan terbuka dan fetch ulang region detail)
    } catch (error) {
      toast.error("Gagal menghapus user.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1050]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <FaUserShield className="mr-2 text-primary" /> Penanggung Jawab
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Wilayah:</p>
          <p className="font-bold text-lg text-gray-800">
            {region.kecamatan} / {region.desa_kelurahan}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
          {region.user && region.user.length > 0 ? (
            <ul className="space-y-3">
              {region.user.map((u, idx) => (
                <li key={idx} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs mr-3">{u.user_name.charAt(0)}</div>
                    <p className="font-semibold text-gray-800 text-sm">{u.user_name}</p>
                  </div>

                  {/* Tombol Hapus User */}
                  <button onClick={() => handleRemoveUser(u.user_id, u.user_name)} disabled={loadingId === u.user_id} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition" title="Hapus PJT ini">
                    {loadingId === u.user_id ? <FaSpinner className="animate-spin" /> : <FaTrash size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic py-4">Belum ada penanggung jawab.</p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm">
            Tutup
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewUsersModal;
