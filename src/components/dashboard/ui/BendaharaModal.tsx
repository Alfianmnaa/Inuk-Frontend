// inuk-frontend/src/components/dashboard/ui/BendaharaModal.tsx

import React, { useState, useEffect, useCallback } from "react";
// Tambahkan FaFileExcel
import { FaUser, FaWhatsapp, FaCheck, FaSpinner, FaPen, FaFileExcel, FaInfoCircle } from "react-icons/fa";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
// Mengimpor getTreasurer BARU dan updateTreasurer
import { updateTreasurer, getTreasurer, type GetTreasurerResponse } from "../../../services/UserService";

interface BendaharaModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Ganti onSuccess dengan fetchTreasurer untuk me-refresh data di parent
  onSuccess: () => void;
  // BARU: Membutuhkan data Bendahara saat ini (dari state parent)
  currentTreasurer: GetTreasurerResponse;
  // BARU: Props untuk link download Excel
  excelLink: string | null;
  linkExpiry: Date | null;
}

const BendaharaModal: React.FC<BendaharaModalProps> = ({ isOpen, onClose, onSuccess, currentTreasurer, excelLink, linkExpiry }) => {
  const { token } = useAuth();
  // State diinisialisasi dari props currentTreasurer
  const [name, setName] = useState(currentTreasurer.treasurer_name || "");
  const [phone, setPhone] = useState(currentTreasurer.treasurer_phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Efek untuk menyinkronkan state lokal saat props berubah (setelah fetch di parent)
  useEffect(() => {
    setName(currentTreasurer.treasurer_name || "");
    setPhone(currentTreasurer.treasurer_phone || "");
    const exist = !!(currentTreasurer.treasurer_name && currentTreasurer.treasurer_phone);
    // Masuk mode edit jika data tidak ada, atau mode view jika data ada
    setIsEditing(!exist);
  }, [currentTreasurer]);

  if (!isOpen) return null;

  const isDataExist = !!(currentTreasurer.treasurer_name && currentTreasurer.treasurer_phone);

  // Fungsi handleSave sekarang adalah async dan menerima event
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Anda tidak terautentikasi. Login sebagai User diperlukan.");
      return;
    }
    setIsSubmitting(true);

    if (!name || !phone) {
      toast.error("Nama dan Nomor WhatsApp harus diisi.");
      setIsSubmitting(false);
      return;
    }

    const cleanedPhone = phone.trim().replace(/ /g, "").replace(/-/g, "");

    // Memformat nomor telepon ke format E.164 (+62xxxxxxxx) untuk backend
    let finalPhone = cleanedPhone;

    // Jika dimulai dengan 0, ganti dengan +62
    if (cleanedPhone.startsWith("0")) {
      finalPhone = "+62" + cleanedPhone.substring(1);
    }
    // Jika dimulai dengan 62 (tanpa +), tambahkan +
    else if (cleanedPhone.startsWith("62")) {
      finalPhone = "+" + cleanedPhone;
    }
    // Jika finalPhone tidak valid setelah pemformatan (e.g. terlalu pendek), berikan error
    if (finalPhone.length < 9) {
      toast.error("Nomor WhatsApp terlalu pendek/tidak valid.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Panggil API untuk menyimpan ke Backend
      await updateTreasurer(token, {
        treasurer_name: name,
        treasurer_phone: finalPhone,
      });

      toast.success("Data Bendahara berhasil disimpan & disinkronkan ke server!");
      setIsEditing(false);
      onSuccess(); // Memicu refresh di TransaksiDonasi.tsx
    } catch (error: any) {
      const errMsg = error.message || "Gagal menyimpan data Bendahara dari API.";
      toast.error(errMsg);
      console.error("Save Bendahara Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI HAPUS DIHILANGKAN karena backend tidak support penghapusan via PATCH.
  // const handleDelete = ...

  const handleSendWA = () => {
    const currentName = currentTreasurer.treasurer_name || name;
    const currentPhone = currentTreasurer.treasurer_phone || phone;

    if (!currentName || !currentPhone || !isDataExist) {
      toast.error("Data Bendahara belum lengkap. Mohon simpan data terlebih dahulu.");
      return;
    }

    // Hapus tanda '+' di awal jika ada, karena format wa.me menggunakan kode negara tanpa + (ex: 628xxx)
    const cleanPhone = currentPhone.replace("+", "");

    let textMessage = "";

    if (excelLink && linkExpiry) {
      const expiryTime = linkExpiry.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      // Pesan dengan link Excel yang tersedia
      textMessage = encodeURIComponent(
        `Halo Bpk/Ibu ${currentName},\n\nSaya sudah selesai mencatat donasi. Laporan Excel sementara telah dibuat. Harap segera diunduh sebelum *${expiryTime}* karena link ini hanya berlaku sebentar.\n\n*Link Download Excel:*\n${excelLink}`
      );
    } else {
      // Pesan tanpa link Excel
      const dashboardLink = encodeURIComponent("http://localhost:5173/dashboard/transaksi"); // Ganti dengan domain yang sesuai jika sudah live.
      textMessage = encodeURIComponent(`Halo Bpk/Ibu ${currentName},\n\nData donasi telah diperbarui oleh inputer. Silakan login ke dashboard untuk membuat link download Excel atau lihat laporan terbaru: ${dashboardLink}`);
    }

    const waLink = `https://wa.me/${cleanPhone}?text=${textMessage}`;

    window.open(waLink, "_blank");
    toast.success("Notifikasi WhatsApp berhasil dibuka!");
    onClose();
  };

  // LOGIKA BARU: Tampilkan info link di modal
  const LinkInfo = () => {
    if (!excelLink || !linkExpiry)
      return (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200 flex items-center">
          <FaInfoCircle className="w-4 h-4 mr-2 text-gray-500" />
          <p className="text-gray-700">Buat Link Download Excel di halaman Transaksi Donasi.</p>
        </div>
      );

    const expiryTime = linkExpiry.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    return (
      <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm border border-blue-200">
        <p className="font-semibold text-blue-800 flex items-center">
          <FaFileExcel className="w-4 h-4 mr-2" /> Link Excel Siap Dibagikan
        </p>
        <p className="text-gray-700 mt-1">
          Link ini kadaluarsa pada pukul <b>{expiryTime}</b>.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <div className="bg-white p-6 m-4 rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Data Bendahara" : "Detail Bendahara"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Input Nama */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bendahara</label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap Bendahara"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting || !isEditing}
            />
          </div>

          {/* Input Nomor WA */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (+628xxx atau 08xxx)</label>
            <FaWhatsapp className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: +628123456789"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting || !isEditing}
            />
          </div>

          {/* Tampilkan Info Link Excel di mode View */}
          {!isEditing && isDataExist && <LinkInfo />}

          <div className="flex flex-col space-y-3">
            {/* Tombol Simpan/Update */}
            {isEditing && (
              <button
                type="submit"
                disabled={isSubmitting || !name || !phone}
                className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
                {isDataExist ? "Update Data (ke Server)" : "Simpan Data (ke Server)"}
              </button>
            )}

            {/* Tombol Aksi saat mode View */}
            {!isEditing && isDataExist && (
              <>
                {/* Tombol Kirim WA akan menggunakan link jika ada */}
                <button
                  type="button"
                  onClick={handleSendWA}
                  className="py-2 px-4 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
                  title={excelLink ? "Kirim notifikasi beserta link Excel sementara" : "Kirim notifikasi tanpa link Excel"}
                >
                  <FaWhatsapp className="mr-2" /> Kirim Notifikasi WhatsApp
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 px-4 border border-indigo-500 text-indigo-500 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center"
                  >
                    <FaPen className="mr-2" size={12} /> Edit Data
                  </button>
                  {/* HAPUS TOMBOL HAPUS LOKAL */}
                  {/* <button type="button" onClick={handleDelete} className="w-full py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                    <FaTrash className="mr-2" size={12} /> Hapus Data
                  </button> */}
                </div>
              </>
            )}

            {/* Tombol Batal saat mode Edit */}
            {isEditing && isDataExist && (
              <button type="button" onClick={() => setIsEditing(false)} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Batal
              </button>
            )}
            {/* Tombol Tutup saat data belum ada dan sedang mengedit */}
            {isEditing && !isDataExist && (
              <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Tutup
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BendaharaModal;
