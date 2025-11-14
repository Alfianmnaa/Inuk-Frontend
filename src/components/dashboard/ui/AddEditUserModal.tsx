// inuk-frontend/src/components/dashboard/ui/AddEditUserModal.tsx

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner, FaUser, FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { X } from "lucide-react";
import { motion } from "framer-motion";

// Interface UserDisplay harus konsisten dengan yang di UserManagement.tsx
export interface UserDisplay {
  id: string;
  name: string;
  phone: string;
  isPJT: boolean;
  regionName: string;
}

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: UserDisplay | null;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode Edit: Inisialisasi Name dan Phone
        setName(initialData.name);
        // Tampilkan ke format 08xxx
        setPhone(initialData.phone.startsWith("+62") ? initialData.phone.replace("+62", "0") : initialData.phone);
        // Reset Password di mode edit
        setPassword("");
      } else {
        // Mode Create: Reset state
        setName("");
        setPhone("");
        setPassword("");
        setRole("user");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && (!name || !phone)) {
      toast.error("Nama dan Nomor HP wajib diisi.");
      return;
    }

    if (!isEditMode && (!name || !phone || !password)) {
      toast.error("Semua field (Nama, Nomor HP, Kata Sandi) wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Placeholder for API Call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let finalPhone = phone.trim().replace(/ /g, "").replace(/^0/, "+62");
      if (!finalPhone.startsWith("+")) finalPhone = `+${finalPhone}`;

      if (isEditMode) {
        toast.success(`Pengguna ${name} (ID: ${initialData?.id.substring(0, 8)}...) berhasil diperbarui! (DUMMY)`);
      } else {
        toast.success(`Pengguna ${name} berhasil ditambahkan sebagai ${role}! (DUMMY)`);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Gagal menyimpan data Pengguna. (DUMMY ERROR)");
      console.error("User Save Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white p-6 m-4 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{isEditMode ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Input Nama */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap Pengguna"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Input Nomor HP */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Handphone (08xxx)</label>
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

          {/* Input Password (Hanya untuk mode Add) */}
          {!isEditMode && (
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Awal (Min. 8 karakter)</label>
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                minLength={8}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-12 focus:ring-primary focus:border-primary"
                required={!isEditMode}
                disabled={isSubmitting}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          )}

          {/* Pemilihan Role (Hanya untuk mode Add) */}
          {!isEditMode && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Peran (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary bg-white"
                required
                disabled={isSubmitting}
              >
                <option value="user">User (Inputer Lapangan)</option>
                <option value="admin">Admin (Pengelola)</option>
              </select>
            </div>
          )}

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !phone || (!isEditMode && !password)}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {isEditMode ? "Simpan Perubahan" : "Tambah Pengguna"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddEditUserModal;
