import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaSpinner, FaCalendarAlt, FaDollarSign, FaUser, FaChevronDown } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { createDonation } from "../../../services/DonationService";
import { useAuth } from "../../../context/AuthContext";
// Import DonaturService
import { getDonaturList, type DonaturAPI } from "../../../services/DonaturService";

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
  // REMOVED: const [methods, setMethods] = useState<string[]>([]);
  const [donors, setDonors] = useState<DonaturAPI[]>([]); // State untuk donatur
  // REMOVED: const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false); // State loading donatur
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    donor_id: "", // State untuk ID Donatur
    total: 0,
    // REMOVED: method: "",
    date_time: new Date().toISOString().substring(0, 16),
  };

  const [formData, setFormData] = useState(initialForm);

  const resetForm = () => {
    setFormData({
      donor_id: donors.length > 0 ? donors[0].id : "",
      total: 0,
      // REMOVED: method: "",
      date_time: new Date().toISOString().substring(0, 16),
    });
  };

  // --- NEW: Fetch Donor list ---
  useEffect(() => {
    if (isOpen && token) {
      setIsLoadingDonors(true);
      // Mengambil semua donatur yang terdaftar oleh petugas ini (tanpa searchTerm)
      getDonaturList(token, "")
        .then((data) => {
          setDonors(data);
          // Set default donor_id ke yang pertama, hanya jika belum ada yang terpilih
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, donor_id: data[0].id }));
          }
        })
        .catch(() => toast.error("Gagal memuat daftar Donatur."))
        .finally(() => setIsLoadingDonors(false));
    }
  }, [isOpen, token]);

  // REMOVED: Fetch payment methods (Logika lama, tidak diperlukan lagi)
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

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

    // VALIDASI DIUBAH: Menghapus pengecekan formData.method
    if (formData.total <= 0 || !formData.date_time || !formData.donor_id) {
      // Validasi Donatur
      toast.error("Mohon lengkapi semua data donasi dan pilih Donatur.");
      return;
    }

    setIsSubmitting(true);
    try {
      const localDate = new Date(formData.date_time);
      const rfc3339String = localDate.toISOString().replace(/\.\d{3}Z$/, "Z");

      await createDonation(token, {
        donor_id: formData.donor_id, // <-- Dikirimkan ke backend
        total: formData.total,
        date_time: rfc3339String,
        // REMOVED: method: formData.method,
      });

      toast.success("Transaksi Donasi berhasil dicatat!");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      let msg = error.response?.data?.message || "Gagal mencatat transaksi.";

      if (errors && errors.length > 0) {
        msg = errors.map((err: any) => `${err.field}: ${err.message}`).join(", ");
      }
      toast.error(msg);
      console.error("Create Donation Error:", error.response?.data || error);
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
            {/* Input Pemilihan Donatur (NEW) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Donatur Kaleng</label>
              <div className="relative">
                {/* Ikon Donatur di kiri */}
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />

                <select
                  name="donor_id"
                  value={formData.donor_id}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDonors || donors.length === 0}
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-10 focus:ring-primary focus:border-primary transition-colors bg-white appearance-none"
                  required
                >
                  <option value="" disabled>
                    {isLoadingDonors ? "Memuat Donatur..." : donors.length === 0 ? "Tidak ada Donatur yang terdaftar" : "Pilih Donatur"}
                  </option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.id}>
                      {`${donor.name} (Kaleng: ${donor.kaleng}, RW: ${donor.rw.toString().padStart(3, "0")})`}
                    </option>
                  ))}
                </select>

                {/* Ikon Panah Dropdown di kanan */}
                <FaChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none ${isSubmitting || isLoadingDonors || donors.length === 0 ? "opacity-50" : ""}`} size={16} />

                {/* Spinner ketika loading */}
                {isLoadingDonors && <FaSpinner className="animate-spin absolute right-10 top-1/2 transform -translate-y-1/2 text-primary" size={16} />}
              </div>
            </div>

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

            {/* REMOVED: Input Metode Pembayaran */}

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
              disabled={isSubmitting || !formData.donor_id}
              whileHover={{ scale: isSubmitting || !formData.donor_id ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting || !formData.donor_id ? 1 : 0.98 }}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md
                                ${isSubmitting || !formData.donor_id ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-green-600"}
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
