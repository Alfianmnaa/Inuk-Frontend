import React from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { type Donatur } from "../../../services/DonaturService";
// NOTE: Tidak perlu import deleteDonatur di sini, karena penghapusan dilakukan di parent

interface DeleteDonaturConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donatur: Donatur;
  // Perhatikan: onSuccess tidak menerima argumen, karena ID dikirim dari parent.
  onSuccess: () => void;
}

const DeleteDonaturConfirmationModal: React.FC<DeleteDonaturConfirmationModalProps> = ({ isOpen, onClose, donatur, onSuccess }) => {
  if (!isOpen) return null;

  // Handler ini sekarang hanya memanggil onSuccess tanpa argumen,
  // membiarkan komponen parent (DonaturManagement.tsx) yang menangani logika API DELETE.
  const handleConfirmDelete = () => {
    // Memanggil onSuccess yang telah disuntikkan dari parent
    onSuccess();
    // Tutup modal setelah action dipicu
    onClose();
  };

  // Tampilan dikembalikan ke versi yang lebih sederhana (mirip versi lama)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur z-1050 flex justify-center items-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="text-center">
              {/* Menggunakan ikon yang lebih sederhana */}
              {/* <FaWarning className="text-red-500 w-12 h-12 mx-auto mb-4" /> */}

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Konfirmasi Hapus Donatur</h3>

              <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus donatur ini secara permanen?</p>

              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 font-medium border border-red-200">
                <p>
                  No Kaleng: <span className="font-bold">{donatur.noKaleng}</span>
                </p>
                <p>
                  Nama: <span className="font-bold">{donatur.namaDonatur}</span>
                </p>
                <p className="mt-2 text-xs">Aksi ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center">
                <FaTimes className="inline mr-1" /> Batal
              </button>
              <button onClick={handleConfirmDelete} className="py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
                <FaTrash className="inline mr-1" /> Ya, Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteDonaturConfirmationModal;
