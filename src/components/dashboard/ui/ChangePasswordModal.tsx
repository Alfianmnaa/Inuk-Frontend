import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { FaSave, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { changeOwnPassword } from "../../../services/AuthService";
import { useAuth } from "../../../context/AuthContext";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Called after a successful password change so the parent can log the user out.
  onPasswordChanged: () => void;
}

const MAX_PASSWORD_LENGTH = 30;
const MIN_PASSWORD_LENGTH = 8;

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordChanged,
}) => {
  const { token, userRole } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !userRole) return;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changeOwnPassword(token, userRole, currentPassword, newPassword);
      toast.success("Kata sandi berhasil diubah. Silakan login ulang.");
      handleClose();
      // Small delay so the toast is visible before forced logout.
      setTimeout(() => onPasswordChanged(), 1200);
    } catch (error: any) {
      const msg: string = error.message ?? "";
      if (msg.toLowerCase().includes("current") || msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("invalid")) {
        toast.error("Kata sandi saat ini salah.");
      } else if (msg.toLowerCase().includes("same")) {
        toast.error("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      } else {
        toast.error(msg || "Gagal mengubah kata sandi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const passwordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Ganti Kata Sandi</h3>
                  <p className="text-xs text-gray-500">Anda akan diminta login ulang setelah berhasil.</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    required
                    className="w-full border border-gray-300 rounded-xl py-2.5 px-3 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.slice(0, MAX_PASSWORD_LENGTH))}
                    placeholder={`${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} karakter`}
                    required
                    className="w-full border border-gray-300 rounded-xl py-2.5 px-3 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {passwordTooShort && (
                  <p className="text-xs text-red-500 mt-1">Minimal {MIN_PASSWORD_LENGTH} karakter.</p>
                )}
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {newPassword.length}/{MAX_PASSWORD_LENGTH}
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.slice(0, MAX_PASSWORD_LENGTH))}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className={`w-full border rounded-xl py-2.5 px-3 pr-10 text-sm outline-none transition focus:ring-2 ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-green-400 focus:ring-green-300"
                          : "border-red-400 focus:ring-red-300"
                        : "border-gray-300 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Kata sandi tidak cocok.</p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-green-600 mt-1">✓ Kata sandi cocok.</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !passwordsMatch ||
                    newPassword.length < MIN_PASSWORD_LENGTH ||
                    currentPassword.length === 0
                  }
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" size={14} />
                  ) : (
                    <FaSave size={14} />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;