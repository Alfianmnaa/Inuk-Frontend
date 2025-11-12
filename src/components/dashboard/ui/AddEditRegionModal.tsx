// inuk-frontend/src/components/dashboard/ui/AddEditRegionModal.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FaUser, FaCheck, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import { X } from "lucide-react";
import AddressSelector, { type AddressSelection } from "../AddressSelector";
import { createRegion, updateRegion, type RegionDetail, type UpdateRegionPayload, type CreateRegionPayload } from "../../../services/RegionService";
import { getUsers, type GetUsersResponse } from "../../../services/UserService";
import { useAuth } from "../../../context/AuthContext";

const FIXED_PROVINCE = "Jawa Tengah";
const FIXED_CITY = "Kudus";

interface UserOption {
  id: string;
  name: string;
  phone: string;
  hasRegion: boolean;
}

interface AddEditRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RegionDetail | null; // Data region saat ini (jika mode Edit)
}

const AddEditRegionModal: React.FC<AddEditRegionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<AddressSelection>({
    province: FIXED_PROVINCE,
    city: FIXED_CITY,
    subdistrict: "",
    village: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const isEditMode = !!initialData;
  const isAddressLocked = isEditMode;

  // --- Data Fetching: Get all users (Admin only) ---
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsUserLoading(true);
    try {
      // Mengambil semua user (user.name, user.phone, user.id, region_id)
      const usersData: GetUsersResponse[] = await getUsers(token);

      // Filter hanya user yang BELUM memiliki region_id (region_id === null) atau user yang sedang diedit
      const availableUsers: UserOption[] = usersData
        .filter((user) => user.region_id === null || user.id === initialData?.user_id)
        .map((user) => ({
          id: user.id,
          name: user.name,
          phone: user.phone,
          hasRegion: !!user.region_id, // Tandai apakah user ini sudah punya region
        }));

      setAllUsers(availableUsers);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat daftar pengguna dari backend. Pastikan Anda login sebagai Admin.");
      setAllUsers([]);
      console.error("Fetch Users Error:", error);
    } finally {
      setIsUserLoading(false);
    }
  }, [token, initialData?.user_id]);

  // --- Efek Inisialisasi ---
  useEffect(() => {
    if (isOpen && token) {
      fetchUsers();
      if (initialData) {
        // Mode Edit: Inisialisasi Address (Locked)
        setAddress({
          province: initialData.provinsi,
          city: initialData.kabupaten_kota,
          subdistrict: initialData.kecamatan,
          village: initialData.desa_kelurahan,
        });

        // Inisialisasi User
        setSelectedUser({
          id: initialData.user_id,
          name: initialData.user_name,
          phone: "Memuat...",
          hasRegion: true,
        });
        setSearchTerm(`${initialData.user_name}`);
      } else {
        // Mode Add: Reset state
        setAddress({ province: FIXED_PROVINCE, city: FIXED_CITY, subdistrict: "", village: "" });
        setSelectedUser(null);
        setSearchTerm("");
      }
    }
  }, [isOpen, token, initialData, fetchUsers]);

  // Filter pengguna berdasarkan search term
  const filteredUsers = useMemo(() => {
    if (isUserLoading) return [];

    // Di mode Edit, kita hanya menampilkan 1 user (yang sedang diedit) + user yang belum punya region.
    let searchSource = allUsers;
    if (isEditMode) {
      // Filter agar di mode edit, kita bisa melihat user yang sedang diedit dan semua user yang belum memiliki region
      const editableUser = allUsers.find((u) => u.id === initialData?.user_id);
      const freeUsers = allUsers.filter((u) => !u.hasRegion);

      searchSource = [...(editableUser ? [editableUser] : []), ...freeUsers];
      // Hapus duplikat
      searchSource = Array.from(new Map(searchSource.map((item) => [item.id, item])).values());
    }

    if (!searchTerm) {
      // Jika tidak ada search term, tampilkan semua yang tersedia (yang belum punya region)
      return searchSource.filter((u) => !u.hasRegion || u.id === initialData?.user_id);
    }

    const lowerCaseSearch = searchTerm.toLowerCase();

    return searchSource.filter((user) => user.name.toLowerCase().includes(lowerCaseSearch) || user.phone.includes(lowerCaseSearch));
  }, [searchTerm, isEditMode, allUsers, isUserLoading, initialData?.user_id]);

  const handleSelectUser = (user: UserOption) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name} (HP: ${user.phone})`);
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

    // Validasi alamat hanya untuk mode Add
    if (!isEditMode && (!address.subdistrict || !address.village)) {
      toast.error("Pilih alamat hingga tingkat Desa/Kelurahan.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        // Mode Edit: Hanya kirim user_id
        const payload: UpdateRegionPayload = {
          user_id: selectedUser.id,
        };
        await updateRegion(initialData.id, payload, token);
        toast.success("Region berhasil diperbarui (Penanggung Jawab diubah)!");
      } else {
        // Mode Create: Menggunakan CreateRegionPayload
        const payload: CreateRegionPayload = {
          user_id: selectedUser.id,
          desa_kelurahan: address.village,
          kecamatan: address.subdistrict,
          kabupaten_kota: FIXED_CITY,
          provinsi: FIXED_PROVINCE,
        };
        await createRegion(payload, token);
        toast.success("Region baru berhasil dibuat!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || "Gagal menyimpan region.";
      toast.error(errorMessage);
      console.error("Save Region Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <div className="bg-white p-6 m-4 rounded-xl  w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{isEditMode ? "Edit Region" : "Tambah Region Baru"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Alamat Region (Locked saat Edit) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Region (Kecamatan/Desa)</label>
            <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
              {isEditMode ? (
                <p className="font-bold text-gray-800">
                  {initialData?.provinsi} / {initialData?.kabupaten_kota} / {initialData?.kecamatan} / {initialData?.desa_kelurahan}
                </p>
              ) : (
                <AddressSelector value={address} onChange={setAddress} levels={["subdistrict", "village"]} kecamatanName="Kecamatan" disabled={isAddressLocked} />
              )}
            </div>
            {isEditMode && <p className="mt-2 text-xs text-red-500">*Lokasi (Kec/Desa) tidak dapat diubah setelah dibuat.</p>}
          </div>

          {/* 2. Pemilihan Pengguna Penanggung Jawab */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pengguna Penanggung Jawab</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  if (!isEditMode) {
                    setSearchTerm(e.target.value);
                    setSelectedUser(null);
                  }
                }}
                placeholder={isUserLoading ? "Memuat daftar pengguna..." : "Cari Nama atau Nomor HP..."}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-10 focus:ring-primary focus:border-primary"
                required
                disabled={isSubmitting || isUserLoading}
              />
              {selectedUser && (
                <button type="button" onClick={handleClearUser} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700">
                  <FaTimes size={16} />
                </button>
              )}
            </div>

            {/* Hasil Pencarian */}
            {searchTerm && !selectedUser && !isUserLoading && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-3 cursor-pointer hover:bg-green-50 flex justify-between items-center transition-colors" onClick={() => handleSelectUser(user)}>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.phone} {user.hasRegion ? "(Sedang Edit)" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <p className="mt-2 text-sm font-medium text-primary flex items-center">
                <FaCheck className="mr-1" /> Penanggung Jawab: {selectedUser.name} (HP: {selectedUser.phone === "Memuat..." ? "..." : selectedUser.phone})
              </p>
            )}
            {/* Tampilkan pesan jika tidak ada hasil pencarian dan sedang mencari */}
            {searchTerm && !selectedUser && !isUserLoading && filteredUsers.length === 0 && <p className="mt-2 text-sm text-gray-500">Tidak ada pengguna yang cocok ditemukan.</p>}
            {isUserLoading && (
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <FaSpinner className="animate-spin mr-1" /> Memuat daftar pengguna...
              </p>
            )}
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || (!isEditMode && !address.village)}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
              {isEditMode ? "Simpan Perubahan" : "Buat Region"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditRegionModal;
