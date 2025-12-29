import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaPhoneAlt, FaSpinner } from "react-icons/fa";
import { X } from "lucide-react";
import {
  createDonatur,
  updateDonatur,
  type Donatur,
  type CreateDonaturPayload,
  type UpdateDonaturPayload,
} from "../../../services/DonaturService";
import { useAuth } from "../../../context/AuthContext";

interface AddEditDonaturModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Jika ada donatur, berarti mode EDIT
  initialData?: Donatur | null;
  // Data Region yang disuntikkan dari halaman utama (Hanya untuk display KEC/DES)
  region: { kecamatan: string; desa: string };
}

const AddEditDonaturModal: React.FC<AddEditDonaturModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  region,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noKaleng, setNoKaleng] = useState("");
  const [phone, setPhone] = useState("");
  const [namaDonatur, setNamaDonatur] = useState("");
  const [rw, setRw] = useState<number | "">(""); // BARU: State untuk input RW
  const [rt, setRt] = useState<number | "">("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNoKaleng(initialData.noKaleng);
        setPhone(
          initialData.phone.startsWith("+62")
            ? initialData.phone.replace("+62", "0")
            : initialData.phone,
        );
        setNamaDonatur(initialData.namaDonatur);
        // Inisialisasi RW dari data donatur
        setRw(parseInt(initialData.rw) || "");
        // Inisialisasi RT dari data donatur
        setRt(parseInt(initialData.rt) || "");
      } else {
        // Reset state untuk mode tambah
        setNoKaleng("");
        setPhone("");
        setNamaDonatur("");
        setRw(""); // Reset RW
        setRt("");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Autentikasi diperlukan. Silakan login kembali.");
      return;
    }

    const rwNum = parseInt(String(rw)) || 0; // Ambil nilai RW dari input
    const rtNum = parseInt(String(rt)) || 0;

    // VALIDASI DIPERBARUI: Cek semua input dan pastikan region konteks dimuat.
    if (
      !noKaleng ||
      !phone ||
      !namaDonatur ||
      rwNum <= 0 || // RW harus > 0
      rtNum <= 0 || // RT harus > 0
      region.desa === "Memuat..." // Cek string placeholder region konteks
    ) {
      // Ubah pesan error agar mencakup RW
      toast.error(
        "Semua field (No Kaleng, Nama Donatur, RW, RT) dan data Region Petugas wajib diisi dengan benar.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // --- Formatting Nomor HP ke E.164 (+62xxxxxxxx) ---
      let finalPhone = phone.trim().replace(/ /g, "").replace(/^0/, "+62");
      if (!finalPhone.startsWith("+")) finalPhone = `+${finalPhone}`;

      // Validasi tambahan untuk +62
      if (finalPhone.length < 10 || !finalPhone.startsWith("+62")) {
        toast.error("Format Nomor HP tidak valid (harus 08xxx atau +628xxx).");
        setIsSubmitting(false);
        return;
      }

      const payload: CreateDonaturPayload = {
        kaleng: noKaleng,
        phone: finalPhone,
        name: namaDonatur,
        rw: rwNum, // Kirim RW dari input
        rt: rtNum, // Kirim RT dari input
      };

      if (isEditMode && initialData) {
        // Mode Edit
        const updatePayload: UpdateDonaturPayload = {
          kaleng: payload.kaleng,
          phone: payload.phone,
          name: payload.name,
          rw: payload.rw,
          rt: payload.rt,
        };
        await updateDonatur(token, initialData.id, updatePayload);
        toast.success("Data Donatur berhasil diperbarui!");
      } else {
        // Mode Create
        await createDonatur(token, payload);
        toast.success("Donatur baru berhasil ditambahkan!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || "Gagal menyimpan data Donatur.";
      toast.error(errorMessage);
      console.error("Donatur Save Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <div className="bg-white p-6 m-4 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Edit Data Donatur" : "Tambah Donatur Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Info Region (Konteks Petugas) */}
          <div className="mb-4 bg-gray-50 p-3 rounded text-sm border border-gray-200">
            <p className="font-semibold text-gray-700">
              Region Petugas (Konteks)
            </p>
            <p className="font-bold">
              Kec/Desa: {region.kecamatan} / {region.desa}
            </p>
            <p className="text-xs text-gray-500">
              *RW dan RT diinput terpisah, sesuai lokasi donatur.
            </p>
          </div>

          {/* Input No Kaleng */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No Kaleng
            </label>
            <input
              type="text"
              value={noKaleng}
              onChange={(e) => setNoKaleng(e.target.value)}
              placeholder="Contoh: KLD-004"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>

           {/*Input Nomor HP */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Handphone (08xxx)
            </label>
            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Input Nama Donatur */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Donatur
            </label>
            <input
              type="text"
              value={namaDonatur}
              onChange={(e) => setNamaDonatur(e.target.value)}
              placeholder="Nama Lengkap Donatur"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Input RW dan RT (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input RW Donatur (BARU) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW Donatur
              </label>
              <input
                type="number"
                value={rw}
                onChange={(e) => setRw(parseInt(e.target.value) || "")}
                placeholder="Contoh: 004"
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
                required
                min="1"
                disabled={isSubmitting}
              />
            </div>

            {/* Input RT Donatur (Lama) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT Donatur
              </label>
              <input
                type="number"
                value={rt}
                onChange={(e) => setRt(parseInt(e.target.value) || "")}
                placeholder="Contoh: 005"
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
                required
                min="1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !noKaleng || !namaDonatur || !rw || !rt}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {isEditMode ? "Simpan Perubahan" : "Tambah Donatur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditDonaturModal;
