import React, { useState, useEffect } from "react";
import { FaUser, FaWhatsapp, FaCheck, FaSpinner, FaTrash, FaPen } from "react-icons/fa";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
// import { useAuth } from "../../../context/AuthContext";

interface BendaharaData {
  name: string;
  phone: string;
}

interface BendaharaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: BendaharaData) => void;
  onDelete: () => void;
}

const BendaharaModal: React.FC<BendaharaModalProps> = ({ isOpen, onClose, onSuccess, onDelete }) => {
  // const { userName } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataExist, setIsDataExist] = useState(false);

  useEffect(() => {
    if (isOpen) {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !phone) {
      toast.error("Nama dan Nomor WhatsApp harus diisi.");
      setIsSubmitting(false);
      return;
    }

    const cleanedPhone = phone.trim().replace(/ /g, "").replace(/-/g, "");
    const finalPhone = cleanedPhone.startsWith("+") ? cleanedPhone.substring(1) : cleanedPhone.startsWith("0") ? "62" + cleanedPhone.substring(1) : cleanedPhone;

    if (finalPhone.length < 9) {
      toast.error("Nomor WhatsApp terlalu pendek.");
      setIsSubmitting(false);
      return;
    }

    try {
      localStorage.setItem("bendahara_name", name);
      localStorage.setItem("bendahara_phone", finalPhone);

      toast.success("Data Bendahara berhasil disimpan!");
      setIsDataExist(true);
      setIsEditing(false);
      onSuccess({ name, phone: finalPhone });
    } catch (error) {
      toast.error("Gagal menyimpan data Bendahara.");
      console.error("Save Bendahara Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Bendahara?")) {
      localStorage.removeItem("bendahara_name");
      localStorage.removeItem("bendahara_phone");

      toast.success("Data Bendahara berhasil dihapus!");
      setIsDataExist(false);
      setIsEditing(true);
      setName("");
      setPhone("");
      onDelete();
    }
  };

  const handleSendWA = () => {
    if (!name || !phone) {
      toast.error("Data Bendahara tidak lengkap.");
      return;
    }

    // const encodedUserName = encodeURIComponent(userName || "Inputer");
    // Ganti dengan domain yang sebenarnya jika sudah live.
    const websiteLink = encodeURIComponent("https://lazisnukudus.id");
    const textMessage = encodeURIComponent(`Data donasi telah diperbarui oleh inputer. Silakan cek di dashboard: ${websiteLink}`);

    // Hapus tanda '+' atau 0 di awal jika ada, karena format wa.me menggunakan kode negara tanpa +
    const cleanPhone = phone.startsWith("+") ? phone.substring(1) : phone.startsWith("0") ? "62" + phone.substring(1) : phone;
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (628xxx)</label>
            <FaWhatsapp className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 628123456789"
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
                {isDataExist ? "Update Data" : "Simpan Data"}
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
