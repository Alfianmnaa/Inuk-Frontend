import React, { useState } from "react";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { X } from "lucide-react";
import { type Donatur, deleteDonatur } from "../../../services/DonaturService";
import { toast } from "react-hot-toast";

interface DeleteDonaturConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donatur: Donatur;
  onSuccess: () => void;
}

const DeleteDonaturConfirmationModal: React.FC<DeleteDonaturConfirmationModalProps> = ({ isOpen, onClose, donatur, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Panggil dummy delete service
      await deleteDonatur(donatur.id);
      toast.success("Data Donatur berhasil dihapus!");
      onSuccess();
    } catch (error: any) {
      toast.error("Gagal menghapus Donatur.");
      console.error("Delete Error:", error.message || error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1100] h-full">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-red-600">Konfirmasi Hapus</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="mb-4">
          Apakah Anda yakin ingin menghapus Donatur <b>{donatur.namaDonatur}</b> (No Kaleng: <b>{donatur.noKaleng}</b>)?
        </p>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            Batal
          </button>
          <button type="button" onClick={handleDelete} className="py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center" disabled={isDeleting}>
            {isDeleting ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash size={16} className="mr-1" />}
            Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDonaturConfirmationModal;
