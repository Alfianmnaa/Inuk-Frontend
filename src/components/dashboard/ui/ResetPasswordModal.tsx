import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound } from "lucide-react";
import { FaSave, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetName: string;
  onConfirmReset: (newPassword: string) => Promise<void>;
}

const MAX_LEN = 30;
const MIN_LEN = 8;

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetName,
  onConfirmReset,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_LEN) {
      toast.error(`Kata sandi minimal ${MIN_LEN} karakter.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirmReset(newPassword);
      toast.success(`Kata sandi ${targetName} berhasil direset.`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal mereset kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const match = newPassword === confirmPassword && confirmPassword !== "";
  const tooShort = newPassword.length > 0 && newPassword.length < MIN_LEN;

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
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Reset Kata Sandi</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[220px]">{targetName}</p>
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

            {/* Warning */}
            <div className="mx-6 mt-5 mb-1 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
              Sesi aktif akun ini akan{" "}
              <span className="font-semibold">langsung berakhir</span> setelah kata sandi direset.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.slice(0, MAX_LEN))}
                    placeholder={`${MIN_LEN}–${MAX_LEN} karakter`}
                    required
                    className="w-full border border-gray-300 rounded-xl py-2.5 px-3 pr-10 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {tooShort && <p className="text-xs text-red-500 mt-1">Minimal {MIN_LEN} karakter.</p>}
                <p className="text-xs text-gray-400 mt-1 text-right">{newPassword.length}/{MAX_LEN}</p>
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
                    onChange={(e) => setConfirmPassword(e.target.value.slice(0, MAX_LEN))}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className={`w-full border rounded-xl py-2.5 px-3 pr-10 text-sm outline-none transition focus:ring-2 ${
                      confirmPassword.length > 0
                        ? match
                          ? "border-green-400 focus:ring-green-300"
                          : "border-red-400 focus:ring-red-300"
                        : "border-gray-300 focus:ring-amber-400 focus:border-amber-400"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !match && <p className="text-xs text-red-500 mt-1">Kata sandi tidak cocok.</p>}
                {match && <p className="text-xs text-green-600 mt-1">✓ Kata sandi cocok.</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !match || newPassword.length < MIN_LEN}
                  className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
                  Reset Kata Sandi
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordModal;