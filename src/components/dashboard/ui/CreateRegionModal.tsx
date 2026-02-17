import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FaSave, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { createRegion } from "../../../services/RegionService";

interface CreateRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRegionModal: React.FC<CreateRegionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kecamatan, setKecamatan] = useState("");
  const [desa, setDesa] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await createRegion(
        {
          provinsi: "Jawa Tengah",
          kabupaten_kota: "Kudus",
          kecamatan: kecamatan,
          desa_kelurahan: desa,
        },
        token
      );

      toast.success("Region berhasil dibuat!");
      setKecamatan("");
      setDesa("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat region");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-1050">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">Buat Region Baru</h3>
            <button onClick={onClose}>
              <X className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-800 mb-4">
              Lokasi Tetap: <b>Jawa Tengah / Kudus</b>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
              <input type="text" required value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: Kaliwungu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desa / Kelurahan</label>
              <input type="text" required value={desa} onChange={(e) => setDesa(e.target.value)} className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: Garung Lor" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                Batal
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 flex items-center">
                {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Simpan
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateRegionModal;
