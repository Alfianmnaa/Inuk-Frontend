import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { type RegionDetail } from "../../../services/RegionService";

interface DeleteRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: RegionDetail;
  onConfirmDelete: (id: string) => Promise<void>;
}

const DeleteRegionModal: React.FC<DeleteRegionModalProps> = ({ isOpen, onClose, region, onConfirmDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(region.id);
      // Success is handled by parent, which will close the modal
    } catch (error) {
      // Error is handled by the parent component (RegionManagement)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-1050">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white p-8 m-4 rounded-xl w-full max-w-sm shadow-2xl transform transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <Trash2 className="h-8 w-8 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-red-700 mt-4">Hapus Region?</h3>
            </div>

            <p className="mt-4 text-base text-gray-700 text-center">
              Anda akan menghapus region <b>{region.desa_kelurahan}</b>, Kecamatan <b>{region.kecamatan}</b>.
            </p>

            <p className="text-sm text-center text-red-500 mt-1">
              Aksi ini <b>tidak dapat dibatalkan</b> dan mungkin akan gagal jika Donasi/Donatur masih terikat dengan region ini di backend.
            </p>

            <div className="mt-8 flex justify-between space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="w-full justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="w-full  py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? <FaSpinner className="animate-spin h-5 w-5 text-white mr-2" /> : <Trash2 size={16} className="mr-1" />}
                Ya, Hapus Permanen
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteRegionModal;
