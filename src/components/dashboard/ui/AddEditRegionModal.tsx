// inuk-frontend/src/components/dashboard/ui/AddEditRegionModal.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaSpinner, FaSearch, FaUser } from "react-icons/fa";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import AddressSelector, { type AddressSelection } from "../AddressSelector";
import { createRegionWithUsers, type RegionDetail, type CreateRegionWithUsersPayload, type RegionUser } from "../../../services/RegionService";
import { getUsers, type GetUsersResponse } from "../../../services/UserService";
import { useAuth } from "../../../context/AuthContext";
import { updateUser, type UpdateUserPayload, getUsers as getUsersDetail } from "../../../services/UserService"; // Import updateUser dan getUsersDetail

const FIXED_PROVINCE = "Jawa Tengah";
const FIXED_CITY = "Kudus";
const NULL_UUID = "00000000-0000-0000-0000-000000000000"; // UUID nol untuk melepas ikatan

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
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [allAvailableUsers, setAllAvailableUsers] = useState<UserOption[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const isEditMode = !!initialData;
  const isAddressLocked = isEditMode;

  // State untuk menyimpan data PJT Lama (untuk keperluan unassign)
  const [oldPjt, setOldPjt] = useState<UserOption | null>(null);

  // --- Data Fetching: Get all users (Admin only) ---
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsUserLoading(true);
    try {
      // Mengambil semua user (termasuk yang sudah terikat)
      const usersData: GetUsersResponse[] = await getUsers(token);

      const availableUsers: UserOption[] = usersData
        .filter((user) => user.region_id === NULL_UUID || user.region_id === null)
        .map((user) => ({
          id: user.id,
          name: user.name,
          phone: user.phone,
          hasRegion: !!user.region_id && user.region_id !== NULL_UUID,
        }));

      setAllAvailableUsers(availableUsers);

      // Mode Edit: Inisialisasi selectedUsers
      if (isEditMode && initialData && initialData.user_id && initialData.user_id !== NULL_UUID) {
        // Fetch detail user PJT saat ini (untuk mendapatkan nomor telepon/nama lengkap)
        const pjtDetail = usersData.find((u) => u.id === initialData.user_id);

        if (pjtDetail) {
          const currentUser: UserOption = {
            id: initialData.user_id,
            name: pjtDetail.name,
            phone: pjtDetail.phone,
            hasRegion: true,
          };
          setSelectedUsers([currentUser]);
          setOldPjt(currentUser);
        }
      } else if (!isEditMode) {
        setSelectedUsers([]);
        setOldPjt(null);
      }
    } catch (error: any) {
      toast.error("Gagal memuat daftar pengguna.");
      setAllAvailableUsers([]);
      console.error("Fetch Users Error:", error);
    } finally {
      setIsUserLoading(false);
    }
  }, [token, isEditMode, initialData]);

  // --- Efek Inisialisasi ---
  useEffect(() => {
    if (isOpen && token) {
      fetchUsers();
      if (initialData) {
        setAddress({
          province: initialData.provinsi,
          city: initialData.kabupaten_kota,
          subdistrict: initialData.kecamatan,
          village: initialData.desa_kelurahan,
        });
        setSearchTerm("");
      } else {
        setAddress({ province: FIXED_PROVINCE, city: FIXED_CITY, subdistrict: "", village: "" });
        setSelectedUsers([]);
        setSearchTerm("");
      }
    }
  }, [isOpen, token, initialData, fetchUsers]);

  // Filter pengguna berdasarkan search term dari daftar available users
  const filteredUsers = useMemo(() => {
    if (isUserLoading || !searchTerm) return [];

    const lowerCaseSearch = searchTerm.toLowerCase();

    // Saring user yang sudah dipilih, lalu saring sisanya berdasarkan search term
    const usersToFilter = allAvailableUsers.filter((u) => !selectedUsers.some((su) => su.id === u.id));

    return usersToFilter.filter((user) => user.name.toLowerCase().includes(lowerCaseSearch) || user.phone.includes(lowerCaseSearch));
  }, [searchTerm, allAvailableUsers, isUserLoading, selectedUsers]);

  const handleSelectUser = (user: UserOption) => {
    // Mode Edit hanya boleh 1 PJT
    if (isEditMode && selectedUsers.length >= 1) {
      toast.error("Di mode Edit, Region hanya dapat memiliki satu Penanggung Jawab.");
      return;
    }

    // Tambahkan user ke selectedUsers
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Autentikasi diperlukan.");
      return;
    }

    if (!address.subdistrict || !address.village) {
      toast.error("Pilih alamat hingga tingkat Desa/Kelurahan.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        // --- MODE EDIT: Assign/Re-assign Single User (Workaround PATCH /admin/user/:id) ---

        const oldUserId = oldPjt?.id || NULL_UUID;
        const newUsersToAssign = selectedUsers;
        const newUserId = newUsersToAssign[0]?.id || NULL_UUID;

        // Cek jika tidak ada perubahan
        if (newUserId === oldUserId) {
          toast.success("Tidak ada perubahan Penanggung Jawab.");
          onClose();
          return;
        }

        // 1. Lepas ikatan PJT lama (jika ada dan berbeda dengan PJT baru)
        if (oldUserId !== NULL_UUID) {
          // NOTE: Kita harus mendapatkan nama dan telepon PJT lama untuk memenuhi validasi required di PATCH /admin/user/:id
          if (oldPjt) {
            const unassignPayload: UpdateUserPayload = { name: oldPjt.name, phone: oldPjt.phone, region_id: NULL_UUID };
            await updateUser(token, oldUserId, unassignPayload);
          }
        }

        // 2. Assign user baru ke region yang sudah ada (Jika ada user baru yang dipilih)
        if (newUserId !== NULL_UUID) {
          const newUser = newUsersToAssign[0];
          const assignPayload: UpdateUserPayload = { name: newUser.name, phone: newUser.phone, region_id: initialData.id };
          await updateUser(token, newUserId, assignPayload);
          toast.success("Penanggung Jawab Region berhasil diperbarui!");
        } else {
          // Jika selectedUsers kosong dan oldPjt dilepas
          toast.success("Region berhasil diperbarui (PJT dihapus)!");
        }
      } else {
        // --- MODE CREATE: Create Region + Assign Users (BULK) ---
        if (selectedUsers.length === 0) {
          toast.error("Pilih minimal satu Pengguna Penanggung Jawab.");
          setIsSubmitting(false);
          return;
        }

        const regionUsers: RegionUser[] = selectedUsers.map((u) => ({ user_id: u.id }));
        const payload: CreateRegionWithUsersPayload = {
          users: regionUsers,
          provinsi: FIXED_PROVINCE,
          kabupaten_kota: FIXED_CITY,
          kecamatan: address.subdistrict,
          desa_kelurahan: address.village,
        };

        const result = await createRegionWithUsers(payload, token);
        toast.success(`Region baru berhasil dibuat dan ${result.added_user_count} pengguna terikat!`);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.message || "Gagal menyimpan region.";
      toast.error(errorMsg);
      console.error("Save Region Error:", error.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white p-6 m-4 rounded-xl  w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{isEditMode ? "Ubah Penanggung Jawab Region" : "Tambah Penanggungjawab"}</h3>
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
            {isEditMode && <p className="mt-2 text-xs text-red-500">*Lokasi tidak dapat diubah di mode edit. Hanya PJT yang dapat diubah.</p>}
          </div>

          {/* 2. Pemilihan Pengguna Penanggung Jawab (Search & Multi-select) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pengguna Penanggung Jawab ({isEditMode ? "Max 1" : "Multi-select"})</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                placeholder={isUserLoading ? "Memuat daftar pengguna..." : "Cari Nama atau Nomor HP yang Belum Terikat..."}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-10 focus:ring-primary focus:border-primary"
                disabled={isSubmitting || isUserLoading || (isEditMode && selectedUsers.length >= 1)}
              />
            </div>

            {/* Hasil Pencarian (Dropdown) */}
            {searchTerm &&
              !isUserLoading &&
              filteredUsers.length > 0 &&
              selectedUsers.length < (isEditMode ? 1 : 100) && ( // Limit di edit mode
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-3 cursor-pointer hover:bg-green-50 flex justify-between items-center transition-colors" onClick={() => handleSelectUser(user)}>
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center">
                          {user.name} <FaUser className="ml-2 w-3 h-3 text-gray-500" />
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.phone} ({user.hasRegion ? "Terikat" : "Tersedia"})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {/* Pesan No Result */}
            {searchTerm && !isUserLoading && filteredUsers.length === 0 && <p className="mt-2 text-sm text-gray-500">Tidak ada pengguna tersedia yang cocok.</p>}

            {/* User yang Sudah Dipilih (Tags) */}
            <div className="mt-3 flex flex-wrap gap-2 min-h-[40px] bg-white p-2 rounded-lg border border-gray-200">
              {selectedUsers.length > 0 ? (
                selectedUsers.map((user) => (
                  <span key={user.id} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary text-white rounded-full">
                    {user.name}
                    <button type="button" onClick={() => handleRemoveUser(user.id)} className="ml-2 text-white/80 hover:text-white">
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-1">Pilih pengguna yang belum terikat region.</p>
              )}
            </div>

            {isUserLoading && (
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <FaSpinner className="animate-spin mr-1" /> Memuat daftar pengguna...
              </p>
            )}
            {isEditMode && selectedUsers.length >= 1 && <p className="mt-2 text-xs text-blue-500">Mode Edit: Region hanya dapat memiliki satu PJT aktif.</p>}
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isEditMode && selectedUsers.length > 1) || (!isEditMode && (!address.village || selectedUsers.length === 0))}
              className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
              {isEditMode ? "Simpan PJT" : "Buat Region & Ikat PJT"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddEditRegionModal;
