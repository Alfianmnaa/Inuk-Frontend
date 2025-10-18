import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaSpinner, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { createDonation, getDonationMethods } from "../../../services/DonationService";
import { useAuth } from "../../../context/AuthContext";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(angka);
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [methods, setMethods] = useState<string[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    total: 0,
    method: "",
    date_time: new Date().toISOString().substring(0, 16),
  };

  const [formData, setFormData] = useState(initialForm);

  const resetForm = () => {
    setFormData({
      total: 0,
      method: methods.length > 0 ? methods[0] : "",
      date_time: new Date().toISOString().substring(0, 16),
    });
  };
  // FIX 1: Fetch metode pembayaran saat modal dibuka
  useEffect(() => {
    if (isOpen && token) {
      setIsLoadingMethods(true);
      getDonationMethods(token)
        .then((data) => {
          setMethods(data);
          // Set default method ke yang pertama, hanya jika belum ada yang terpilih
          if (data.length > 0 && !formData.method) {
            setFormData((prev) => ({ ...prev, method: data[0] }));
          }
        })
        .catch(() => toast.error("Gagal memuat metode pembayaran."))
        .finally(() => setIsLoadingMethods(false));
    }
    if (!isOpen) resetForm();
  }, [isOpen, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "total") {
      const cleanedValue = value.replace(/\D/g, "");
      setFormData({ ...formData, total: parseInt(cleanedValue) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.total <= 0 || !formData.method || !formData.date_time) {
      toast.error("Mohon lengkapi semua data donasi.");
      return;
    }

    setIsSubmitting(true);
    try {
      // FIX 2: Konversi ke format RFC3339 yang diminta Go, menghilangkan milisekon
      const localDate = new Date(formData.date_time);
      const rfc3339String = localDate.toISOString().replace(/\.\d{3}Z$/, "Z");

      await createDonation(token, {
        total: formData.total,
        method: formData.method,
        date_time: rfc3339String, // Mengirim string yang sudah diformat
      });

      toast.success("Transaksi Donasi berhasil dicatat!");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      let msg = error.response?.data?.message || "Gagal mencatat transaksi. (Pastikan Anda Login sebagai Admin)";

      if (errors && errors.length > 0) {
        msg = errors.map((err: any) => `${err.field}: ${err.message}`).join(", ");
      }
      toast.error(msg);
      console.error("Create Donation Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 backdrop-blur z-50 flex items-center justify-center p-4 h-full">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <header className="p-5 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaPlus className="mr-2 text-primary" /> Tambah Transaksi Donasi
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500">
              <FaTimes size={20} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Jumlah Donasi (Rp)</label>
              <FaDollarSign className="absolute left-3 top-1/2 mt-2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="total"
                value={formatRupiah(formData.total)}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 leading-tight focus:ring-primary focus:border-primary transition-colors font-bold text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                disabled={isSubmitting || isLoadingMethods}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-primary focus:border-primary transition-colors bg-white"
                required
              >
                <option value="" disabled>
                  Pilih Metode
                </option>
                {isLoadingMethods ? (
                  <option>Memuat...</option>
                ) : methods.length > 0 ? (
                  methods.map((method) => (
                    <option key={method} value={method}>
                      {method.toUpperCase().replace(/_/g, " ")}
                    </option>
                  ))
                ) : (
                  <option disabled>Metode tidak tersedia</option>
                )}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Tanggal & Waktu Transaksi</label>
              <FaCalendarAlt className="absolute left-3 top-1/2 mt-2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 leading-tight focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md
                                ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-green-600"}
                            `}
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              <span>{isSubmitting ? "Mencatat..." : "Catat Transaksi"}</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddTransactionModal;
