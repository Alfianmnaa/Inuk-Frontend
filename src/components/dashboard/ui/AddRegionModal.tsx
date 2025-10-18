// src/components/dashboard/ui/AddRegionModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { FaUser, FaSearch, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import AddressSelector, { type AddressSelection } from "../AddressSelector";
import { createRegion } from "../../../services/RegionService";
import { useAuth } from "../../../context/AuthContext";
import { X } from "lucide-react";

// --- Data Dummy Pengguna ---
// Ganti dengan endpoint API sebenarnya (getUsersWithoutRegion) jika sudah ada.
interface DummyUser {
  id: string;
  name: string;
  phone: string;
}

const dummyUsers: DummyUser[] = [
  { id: "uuid-123-alice", name: "Alice Smith", phone: "+62812111222" },
  { id: "uuid-456-bob", name: "Bob Budi", phone: "+62812333444" },
  { id: "uuid-789-charlie", name: "Charlie Candra", phone: "+62813555666" },
  { id: "uuid-101-diana", name: "Diana Dewi", phone: "+62815777888" },
  { id: "uuid-202-evan", name: "Evan", phone: "+62878999000" },
];
// -----------------------------

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddRegionModal: React.FC<AddRegionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rw, setRw] = useState<number | "">("");
  const [address, setAddress] = useState<AddressSelection>({ province: "", city: "", subdistrict: "", village: "" });

  // State untuk pencarian pengguna
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<DummyUser | null>(null);

  // Filter pengguna dummy berdasarkan search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();

    return dummyUsers.filter((user) => user.name.toLowerCase().includes(lowerCaseSearch) || user.phone.includes(lowerCaseSearch));
  }, [searchTerm]);

  const handleSelectUser = (user: DummyUser) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name} (${user.phone})`); // Tampilkan nama dan phone di input
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Autentikasi diperlukan.");
      return;
    }
    if (!selectedUser) {
      toast.error("Pilih pengguna yang bertanggung jawab atas region ini.");
      return;
    }
    if (rw === "" || rw === 0) {
      toast.error("RW harus diisi.");
      return;
    }
    if (!address.village) {
      toast.error("Pilih alamat hingga tingkat Desa/Kelurahan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userID: selectedUser.id,
        rw: rw as number,
        province: address.province,
        city: address.city,
        subdistrict: address.subdistrict,
        village: address.village,
      };

      await createRegion(payload, token);
      toast.success("Region baru berhasil dibuat!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || "Gagal membuat region.";
      toast.error(errorMessage);
      console.error("Create Region Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setRw("");
      setAddress({ province: "", city: "", subdistrict: "", village: "" });
      setSearchTerm("");
      setSelectedUser(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <div className="bg-white p-6 m-4 rounded-xl  w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">Tambah Region Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Pemilihan Pengguna (Dummy Search) */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pengguna Penanggung Jawab</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama atau Nomor HP..."
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-10 focus:ring-primary focus:border-primary"
                required
              />
              {selectedUser && (
                <button type="button" onClick={handleClearUser} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700">
                  <FaTimes size={16} />
                </button>
              )}
            </div>

            {/* Hasil Pencarian */}
            {searchTerm && !selectedUser && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-3 cursor-pointer hover:bg-green-50 flex justify-between items-center transition-colors" onClick={() => handleSelectUser(user)}>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <p className="mt-2 text-sm font-medium text-primary flex items-center">
                <FaCheck className="mr-1" /> Pengguna terpilih: {selectedUser.name} (ID: {selectedUser.id.substring(0, 8)}...)
              </p>
            )}
            {/* Tampilkan pesan jika tidak ada hasil pencarian dan sedang mencari */}
            {searchTerm && !selectedUser && filteredUsers.length === 0 && <p className="mt-2 text-sm text-gray-500">Tidak ada pengguna yang cocok ditemukan.</p>}
          </div>

          {/* 2. Pemilihan Alamat */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Region</label>
            <AddressSelector value={address} onChange={setAddress} levels={["province", "city", "subdistrict", "village"]} kecamatanName="Kecamatan" />
          </div>

          {/* 3. Input RW */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor RW</label>
            <input
              type="number"
              value={rw}
              onChange={(e) => setRw(parseInt(e.target.value) || "")}
              placeholder="Masukkan Nomor RW (misal: 001)"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary"
              required
              min="1"
            />
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || !rw || !address.village}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
              Buat Region
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRegionModal;
