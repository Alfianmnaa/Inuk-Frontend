import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FaSave, FaSpinner, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { createInfaq, updateInfaq, type Infaq } from "../../../services/InfaqService";
import { getMasjids, type MasjidResponse } from "../../../services/MasjidService";
import {
  getAllFridayPons,
  formatDateToLocalDateInput,
  formatFridayPonDisplay,
} from "../../../utils/dateUtils";

interface AddEditInfaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  infaq?: Infaq | null;
}

const currentYear = new Date().getFullYear();
const START_YEAR = 2025;

function defaultFridayPon(year: number): string {
  const pons = getAllFridayPons(year, year);
  if (pons.length === 0) return "";
  const now = new Date();
  const past = pons.filter((d) => d <= now);
  const pick = past.length > 0 ? past[past.length - 1] : pons[0];
  return formatDateToLocalDateInput(pick);
}

const AddEditInfaqModal: React.FC<AddEditInfaqModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  infaq,
}) => {
  const { token } = useAuth();
  const isEditMode = !!infaq;

  const [masjidId, setMasjidId] = useState("");
  const [total, setTotal] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState(() => defaultFridayPon(currentYear));
  const [masjids, setMasjids] = useState<MasjidResponse[]>([]);
  const [isLoadingMasjids, setIsLoadingMasjids] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = START_YEAR; y <= currentYear; y++) arr.push(y);
    return arr;
  }, []);

  const fridayPons = useMemo(
    () => getAllFridayPons(selectedYear, selectedYear),
    [selectedYear]
  );

  useEffect(() => {
    if (!isOpen || !token || isEditMode) return;
    setIsLoadingMasjids(true);
    getMasjids(token)
      .then(setMasjids)
      .catch(() => toast.error("Gagal memuat daftar masjid."))
      .finally(() => setIsLoadingMasjids(false));
  }, [isOpen, token, isEditMode]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && infaq) {
      setTotal(infaq.Total);
      const d = new Date(infaq.DateTime);
      const year = d.getFullYear();
      const safeYear = year >= START_YEAR ? year : currentYear;
      setSelectedYear(safeYear);
      setSelectedDate(formatDateToLocalDateInput(d));
    } else {
      setMasjidId("");
      setTotal("");
      setSelectedYear(currentYear);
      setSelectedDate(defaultFridayPon(currentYear));
    }
  }, [isOpen, infaq, isEditMode]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedDate(defaultFridayPon(year));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!total || Number(total) <= 0) {
      toast.error("Nominal infaq harus lebih dari 0.");
      return;
    }
    if (!selectedDate) {
      toast.error("Pilih tanggal Jum'at Pon terlebih dahulu.");
      return;
    }
    if (!isEditMode && !masjidId) {
      toast.error("Pilih masjid terlebih dahulu.");
      return;
    }


    setIsSubmitting(true);
    try {
      if (isEditMode && infaq) {
        await updateInfaq(token, infaq.id, {
          Total: Number(total),
          DateTime: selectedDate,
        });
        toast.success("Catatan infaq berhasil diperbarui!");
      } else {
        await createInfaq(token, {
          MasjidID: masjidId,
          Total: Number(total),
          DateTime: selectedDate,
        });
        toast.success("Catatan infaq berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1050]"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl mx-4"
        >
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-primary" />
              {isEditMode ? "Edit Catatan Infaq" : "Tambah Catatan Infaq"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Masjid — create mode only */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Masjid <span className="text-red-500">*</span>
                </label>
                {isLoadingMasjids ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <FaSpinner className="animate-spin" /> Memuat masjid...
                  </div>
                ) : (
                  <select
                    required
                    value={masjidId}
                    onChange={(e) => setMasjidId(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white transition"
                  >
                    <option value="">-- Pilih Masjid --</option>
                    {masjids.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
                {masjids.length === 0 && !isLoadingMasjids && (
                  <p className="text-xs text-amber-600 mt-1">
                    Belum ada masjid. Tambahkan masjid terlebih dahulu di Manajemen Masjid.
                  </p>
                )}
              </div>
            )}

            {/* Nominal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominal Infaq (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={total}
                  onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                />
              </div>
            </div>

            {/* Tanggal Jum'at Pon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Jum'at Pon <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tahun</p>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Jum'at Pon</p>
                  <select
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition"
                  >
                    <option value="">-- Pilih --</option>
                    {fridayPons.map((d) => {
                      const value = formatDateToLocalDateInput(d);
                      return (
                        <option key={value} value={value}>
                          {formatFridayPonDisplay(d)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {isEditMode ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEditInfaqModal;