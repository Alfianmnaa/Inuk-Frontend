// inuk-frontend/src/components/dashboard/ui/AddEditDonaturModal.tsx

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { X } from "lucide-react";
import { createDonatur, updateDonatur, type Donatur } from "../../../services/DonaturService";

interface AddEditDonaturModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Jika ada donatur, berarti mode EDIT
  initialData?: Donatur | null;
  // Data Region yang disuntikkan dari halaman utama
  region: { kecamatan: string; desa: string; rw: string };
}

const AddEditDonaturModal: React.FC<AddEditDonaturModalProps> = ({ isOpen, onClose, onSuccess, initialData, region }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noKaleng, setNoKaleng] = useState("");
  const [namaDonatur, setNamaDonatur] = useState("");
  const [rt, setRt] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNoKaleng(initialData.noKaleng);
        setNamaDonatur(initialData.namaDonatur);
        setRt(initialData.rt);
      } else {
        // Reset state untuk mode tambah
        setNoKaleng("");
        setNamaDonatur("");
        setRt("");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noKaleng || !namaDonatur || !rt) {
      toast.error("Semua field (No Kaleng, Donatur, RT) wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const basePayload = {
        noKaleng,
        namaDonatur,
        rt,
      };

      if (isEditMode && initialData) {
        // FIX: Menambahkan 'id' ke payload untuk memenuhi persyaratan tipe Omit<Donatur, ...>
        await updateDonatur(initialData.id, {
          id: initialData.id,
          ...basePayload,
        });
        toast.success("Data Donatur berhasil diperbarui!");
      } else {
        // Create
        await createDonatur(basePayload, region.kecamatan, region.desa, region.rw);
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
          <h3 className="text-xl font-bold text-gray-800">{isEditMode ? "Edit Data Donatur" : "Tambah Donatur Baru"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Info Region (Read-only) */}
          <div className="mb-4 bg-gray-50 p-3 rounded text-sm border border-gray-200">
            <p className="font-semibold text-gray-700">Region Donatur</p>
            <p>
              Kecamatan/Desa: {region.kecamatan} / {region.desa}
            </p>
            <p>RW: {region.rw}</p>
          </div>

          {/* Input No Kaleng */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">No Kaleng</label>
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

          {/* Input Nama Donatur */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Donatur</label>
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

          {/* Input RT */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">RT</label>
            <input
              type="text"
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              placeholder="Contoh: 005"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !noKaleng || !namaDonatur || !rt}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {isEditMode ? "Simpan Perubahan" : "Tambah Donatur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditDonaturModal;
