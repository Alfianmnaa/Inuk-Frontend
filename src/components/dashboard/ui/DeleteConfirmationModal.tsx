// src/components/dashboard/ui/DeleteConfirmationModal.tsx

import React, { useState } from "react";
import { type TransactionAPI } from "../../../services/DonationService";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionAPI;
  onConfirmDelete: (id: string) => Promise<void>;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, transaction, onConfirmDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(transaction.id);
    } catch (error) {
      // Error ditangani di TransaksiDonasi.tsx
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050]">
      <div className="bg-white p-8 rounded-xl w-full max-w-sm shadow-2xl transform transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <Trash2 className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-bold text-red-700 mt-4">Hapus Transaksi?</h3>
        </div>

        <p className="mt-4 text-base text-gray-700 text-center">
          Anda akan menghapus transaksi dari <span className="font-semibold">{transaction.name} </span>
          senilai <span className="font-bold text-red-600">{formatRupiah(transaction.total)}</span>.
        </p>
        <p className="text-sm text-center text-gray-500 mt-1">Aksi ini **tidak dapat dibatalkan**.</p>

        <div className="mt-8 flex justify-between space-x-3">
          <button type="button" onClick={onClose} disabled={isDeleting} className="w-full justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full justify-center py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isDeleting ? (
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Trash2 size={16} className="mr-1" />
            )}
            Ya, Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
