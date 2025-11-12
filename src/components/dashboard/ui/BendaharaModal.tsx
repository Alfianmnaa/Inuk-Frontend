// inuk-frontend/src/components/dashboard/ui/BendaharaModal.tsx

import React, { useState, useEffect } from "react";
import { FaUser, FaWhatsapp, FaCheck, FaSpinner, FaTrash, FaPen } from "react-icons/fa";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { updateTreasurer } from "../../../services/UserService";

// Menghapus interface BendaharaData karena sudah tidak dipakai (Fix error 6196)

interface BendaharaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

const BendaharaModal: React.FC<BendaharaModalProps> = ({ isOpen, onClose, onSuccess, onDelete }) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataExist, setIsDataExist] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mengambil data dari local storage (sebagai cache lokal)
      const storedName = localStorage.getItem("bendahara_name") || "";
      const storedPhone = localStorage.getItem("bendahara_phone") || "";
      setName(storedName);
      setPhone(storedPhone);

      const exist = !!(storedName && storedPhone);
      setIsDataExist(exist);
      // Jika data sudah ada, langsung mode view (tidak mengedit)
      setIsEditing(!exist);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Fungsi handleSave sekarang adalah async dan menerima event (Fix error 2554)
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
    // Jika sudah +62 atau +8, biarkan (asumsi sudah benar)

    if (finalPhone.length < 9) {
      toast.error("Nomor WhatsApp terlalu pendek.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Panggil API untuk menyimpan ke Backend
      await updateTreasurer(token, {
        treasurer_name: name,
        treasurer_phone: finalPhone,
      });

      // 2. Jika API sukses, simpan data yang sudah divalidasi dan diformat ke Local Storage (sebagai cache lokal)
      localStorage.setItem("bendahara_name", name);
      localStorage.setItem("bendahara_phone", finalPhone);

      toast.success("Data Bendahara berhasil disimpan & disinkronkan ke server!");
      setIsDataExist(true);
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

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Bendahara? Catatan: Aksi ini hanya menghapus data di perangkat ini.")) {
      // NOTE: Tidak ada endpoint DELETE untuk treasurer, jadi hanya hapus lokal.

      localStorage.removeItem("bendahara_name");
      localStorage.removeItem("bendahara_phone");

      toast.success("Data Bendahara berhasil dihapus dari cache lokal!");
      setIsDataExist(false);
      setIsEditing(true);
      setName("");
      setPhone("");
      onDelete(); // Memicu refresh di TransaksiDonasi.tsx
    }
  };

  const handleSendWA = () => {
    const storedName = localStorage.getItem("bendahara_name") || "";
    const storedPhone = localStorage.getItem("bendahara_phone") || "";

    if (!storedName || !storedPhone) {
      toast.error("Data Bendahara tidak lengkap.");
      return;
    }

    // Hapus tanda '+' di awal jika ada, karena format wa.me menggunakan kode negara tanpa + (ex: 628xxx)
    const cleanPhone = storedPhone.replace("+", "");

    // Ganti dengan domain yang sebenarnya jika sudah live.
    const websiteLink = encodeURIComponent("https://lazisnukudus.id");
    const textMessage = encodeURIComponent(`Data donasi telah diperbarui oleh inputer. Silakan cek di dashboard: ${websiteLink}`);

    const waLink = `https://wa.me/${cleanPhone}?text=${textMessage}`;

    window.open(waLink, "_blank");
    toast.success("Notifikasi WhatsApp berhasil dibuka!");
    onClose();
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
                <button type="button" onClick={handleSendWA} className="py-2 px-4 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center">
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
                  <button type="button" onClick={handleDelete} className="w-full py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                    <FaTrash className="mr-2" size={12} /> Hapus Data
                  </button>
                </div>
              </>
            )}

            {/* Tombol Batal saat mode Edit */}
            {isEditing && isDataExist && (
              <button type="button" onClick={() => setIsEditing(false)} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BendaharaModal;
