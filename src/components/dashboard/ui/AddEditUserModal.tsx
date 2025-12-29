import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner, FaUser, FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
// [BARU] Import fungsi API
import { adminRegisterUser, updateUser, type RegisterUserPayload, type UpdateUserPayload } from "../../../services/UserService";

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
  const { token } = useAuth();
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
        // Tampilkan ke format 08xxx (Menghapus +62 jika ada)
        setPhone(initialData.phone.startsWith("+62") ? initialData.phone.replace("+62", "0") : initialData.phone);
        // Reset Password di mode edit
        setPassword("");
        setRole("user"); // Default role
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token Admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    // --- Validasi Dasar ---
    if (!name || !phone) {
      toast.error("Nama dan Nomor HP wajib diisi.");
      return;
    }
    if (!isEditMode && !password) {
      toast.error("Kata Sandi wajib diisi saat menambahkan pengguna baru.");
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

      if (isEditMode && initialData) {
        // --- MODE EDIT (PATCH /admin/user/:id) ---
        const updatePayload: UpdateUserPayload = {
          name: name,
          phone: finalPhone,
          // region_id TIDAK disertakan, sehingga backend akan menggunakan nilai yang ada (atau null)
          // Payload HANYA berisi field yang diubah (name, phone)
        };
        await updateUser(token, initialData.id, updatePayload);
        toast.success(`Pengguna ${name} berhasil diperbarui!`);
      } else {
        // --- MODE CREATE (POST /register atau /admin/register) ---
        const registerPayload: RegisterUserPayload = {
          name: name,
          phone: finalPhone,
          password: password,
        };
        await adminRegisterUser(token, registerPayload, role); // Menggunakan fungsi register
        toast.success(`Pengguna ${name} berhasil ditambahkan sebagai ${role.toUpperCase()}!`);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "Gagal menyimpan data Pengguna. Cek konsol.";
      toast.error(errorMsg);
      console.error("User Save Error:", errorData || error);
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
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 hover:text-gray-700">
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
          {/* Info Tambahan di Mode Edit */}
          {isEditMode && initialData?.isPJT && <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">*Pengguna ini terikat sebagai PJT Region. Perubahan PJT dilakukan di halaman Manajemen Wilayah.</div>}

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
