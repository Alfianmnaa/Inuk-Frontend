import React, { useState, useEffect } from "react";
import { type TransactionAPI, type UpdateDonationRequest } from "../../../services/DonationService";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionAPI;
  onUpdate: (id: string, data: UpdateDonationRequest) => Promise<void>;
}

const EditDonationModal: React.FC<EditModalProps> = ({ isOpen, onClose, transaction, onUpdate }) => {
  // Helper untuk format ISO 8601 ke YYYY-MM-DDTHH:mm (sesuai input datetime-local)
  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<UpdateDonationRequest>({
    total: transaction.total,
    date_time: formatDateTimeLocal(transaction.date_time),
    // REMOVED: method: transaction.method,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state saat transaction berubah
  useEffect(() => {
    if (transaction) {
      setFormData({
        total: transaction.total,
        date_time: formatDateTimeLocal(transaction.date_time),
        // REMOVED: method: transaction.method,
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Konversi date_time kembali ke format ISO (RFC3339) untuk backend
    const updatedData: UpdateDonationRequest = {
      total: formData.total,
      date_time: new Date(formData.date_time).toISOString(),
      // REMOVED: method: formData.method,
    };

    try {
      await onUpdate(transaction.id, updatedData);
    } catch (error) {
      // Error ditangani di TransaksiDonasi.tsx, kita hanya perlu menonaktifkan loading
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-1050">
      <div className="bg-white p-6 m-4 rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Edit Transaksi</h3>

        <form onSubmit={handleSubmit}>
          {/* Detail Transaksi yang Tidak Bisa Diubah (Opsional) */}
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border">
            <p>
              Donatur: <span className="font-semibold text-gray-900">{transaction.name}</span>
            </p>
            <p>
              ID: <span className="font-mono text-xs bg-gray-200 p-1 rounded">{transaction.id.substring(0, 8)}...</span>
            </p>
          </div>

          {/* Input Total */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Total Donasi (Rp)</label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-primary focus:border-primary transition-colors"
              required
              min="1000"
            />
          </div>

          {/* Input Tanggal & Waktu */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tanggal & Waktu</label>
            <input
              type="datetime-local"
              name="date_time"
              value={formData.date_time}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          {/* REMOVED: Input Metode */}

          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50">
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDonationModal;
