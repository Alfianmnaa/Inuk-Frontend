import React, { useState, useEffect } from "react";
import { FaUser, FaWhatsapp, FaCheck, FaSpinner, FaPen, FaInfoCircle } from "react-icons/fa";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import {
  updateAdminTreasurer,
  type GetAdminTreasurerResponse,
} from "../../../services/AdminService";
import { exportInfaqs, type ExportInfaqsQuery } from "../../../services/InfaqService";

interface AdminBendaharaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentTreasurer: GetAdminTreasurerResponse;
  /** Filter yang aktif di InfaqManagement saat modal dibuka */
  exportQuery: ExportInfaqsQuery;
}

const AdminBendaharaModal: React.FC<AdminBendaharaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentTreasurer,
  exportQuery,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState(currentTreasurer.treasurer_name || "");
  const [phone, setPhone] = useState(currentTreasurer.treasurer_phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (currentTreasurer) {
      setName(currentTreasurer.treasurer_name || "");
      setPhone(currentTreasurer.treasurer_phone || "");
      const exist = !!(currentTreasurer.treasurer_name && currentTreasurer.treasurer_phone);
      setIsEditing(!exist);
    }
  }, [currentTreasurer]);

  if (!isOpen) return null;

  const isDataExist = !!(currentTreasurer.treasurer_name && currentTreasurer.treasurer_phone);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Anda tidak terautentikasi.");
      return;
    }
    if (!name || !phone) {
      toast.error("Nama dan Nomor WhatsApp harus diisi.");
      return;
    }

    setIsSubmitting(true);

    const cleanedPhone = phone.trim().replace(/ /g, "").replace(/-/g, "");
    let finalPhone = cleanedPhone;
    if (cleanedPhone.startsWith("0")) {
      finalPhone = "+62" + cleanedPhone.substring(1);
    } else if (cleanedPhone.startsWith("62")) {
      finalPhone = "+" + cleanedPhone;
    }

    if (finalPhone.length < 9) {
      toast.error("Nomor WhatsApp terlalu pendek/tidak valid.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateAdminTreasurer(token, {
        treasurer_name: name,
        treasurer_phone: finalPhone,
      });
      toast.success("Data Bendahara berhasil disimpan!");
      setIsEditing(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan data Bendahara.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWA = async () => {
    if (!isDataExist) {
      toast.error("Data Bendahara belum lengkap. Mohon simpan data terlebih dahulu.");
      return;
    }
    if (!token) {
      toast.error("Anda tidak terautentikasi.");
      return;
    }

    setIsSending(true);
    const sendToast = toast.loading("Memproses laporan infaq...");

    try {
      const resp = await exportInfaqs(token, exportQuery);

      if (resp && (resp.status === "processing" || resp.job_id || resp.status === "queued")) {
        const successMessage =
          resp.message || "Permintaan ekspor berhasil. Bendahara akan menerima notifikasi.";
        toast.success(successMessage, { id: sendToast });
        onClose();
      } else {
        throw new Error(resp?.message || "Gagal memproses permintaan ekspor.");
      }
    } catch (error: any) {
      toast.error(`Gagal: ${error.message || "Terjadi kesalahan sistem."}`, { id: sendToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <div className="bg-white p-6 m-4 rounded-xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Data Bendahara" : "Kirim Laporan ke Bendahara"}
          </h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp (+628xxx)
            </label>
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

          {/* Info banner saat mode view */}
          {!isEditing && isDataExist && (
            <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm border border-blue-200 flex items-start">
              <FaInfoCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-500 shrink-0" />
              <p className="text-blue-800">
                Klik tombol di bawah untuk membuat file Excel laporan infaq dan mengirimkan link
                downloadnya langsung ke WhatsApp Bendahara.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            {/* Tombol Simpan — hanya saat mode edit */}
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

            {/* Tombol Kirim WA — hanya saat mode view */}
            {!isEditing && isDataExist && (
              <>
                <button
                  type="button"
                  onClick={handleSendWA}
                  disabled={isSending}
                  className="py-2.5 px-4 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center shadow-md disabled:opacity-70"
                >
                  {isSending ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaWhatsapp className="mr-2" size={18} />
                  )}
                  {isSending ? "Mengirim Laporan..." : "Kirim Notifikasi WhatsApp"}
                </button>

                <div
                  className="flex justify-center mt-2 border border-gray-300 py-2.5 rounded-lg px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-indigo-600 flex items-center transition-colors"
                  >
                    <FaPen className="mr-1" size={10} /> Ubah Data Bendahara
                  </button>
                </div>
              </>
            )}

            {/* Tombol Batal saat mode edit (jika data sudah ada) */}
            {isEditing && isDataExist && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBendaharaModal;