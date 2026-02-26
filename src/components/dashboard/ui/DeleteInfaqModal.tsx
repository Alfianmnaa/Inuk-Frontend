import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { deleteInfaq, type Infaq } from "../../../services/InfaqService";
import { toast } from "react-hot-toast";

interface DeleteInfaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  infaq: Infaq | null;
}

const DeleteInfaqModal: React.FC<DeleteInfaqModalProps> = ({ isOpen, onClose, onSuccess, infaq }) => {
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !infaq) return null;

  const handleConfirm = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await deleteInfaq(token, infaq.id);
      toast.success("Catatan infaq berhasil dihapus.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus catatan infaq.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(infaq.DateTime).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(infaq.Total);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[1050]"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white p-8 m-4 rounded-xl w-full max-w-sm shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-700">Hapus Catatan Infaq?</h3>
              <div className="mt-3 text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
                <p><span className="font-medium">Masjid:</span> {infaq.Name}</p>
                <p><span className="font-medium">Nominal:</span> {formattedTotal}</p>
                <p><span className="font-medium">Tanggal:</span> {formattedDate}</p>
              </div>
              <p className="text-sm text-red-500 mt-3">
                Aksi ini <b>tidak dapat dibatalkan</b>.
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <FaSpinner className="animate-spin" /> : <Trash2 size={15} />}
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteInfaqModal;
