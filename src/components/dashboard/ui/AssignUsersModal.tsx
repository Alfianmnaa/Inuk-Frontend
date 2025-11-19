// inuk-frontend/src/components/dashboard/ui/AssignUsersModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaSearch, FaUserPlus, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { getUsers } from "../../../services/UserService";
import { setRegionUsers, type RegionDetail } from "../../../services/RegionService";

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRegion: RegionDetail | null; // Region yang akan ditambahkan user
}

const AssignUsersModal: React.FC<AssignUsersModalProps> = ({ isOpen, onClose, onSuccess, targetRegion }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load users yang belum punya region (atau semua user user role)
  useEffect(() => {
    if (isOpen && token) {
      const fetchUsers = async () => {
        try {
          // Ambil user yang belum verified (belum punya region)
          // Jika backend mendukung, filter di API lebih baik.
          // Di sini kita ambil yang 'false' (unverified/no region)
          const data = await getUsers(token, "", "", false);
          setUsers(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUsers();
      setSelectedUserIds([]); // Reset selection
    }
  }, [isOpen, token]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm));
  }, [users, searchTerm]);

  const toggleUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds((prev) => prev.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds((prev) => [...prev, id]);
    }
  };

  const handleSubmit = async () => {
    if (!targetRegion || !token) return;
    if (selectedUserIds.length === 0) {
      toast.error("Pilih minimal satu user");
      return;
    }

    setIsLoading(true);
    try {
      await setRegionUsers(targetRegion.id, selectedUserIds, token);
      toast.success(`Berhasil menambahkan ${selectedUserIds.length} penanggung jawab.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Gagal menetapkan user.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !targetRegion) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1060]">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800">Tambah Penanggung Jawab</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Region:{" "}
          <span className="font-semibold text-primary">
            {targetRegion.kecamatan} / {targetRegion.desa_kelurahan}
          </span>
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Cari User (Nama/HP)..." className="w-full border pl-10 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* List Users */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Tidak ada user tersedia.</p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`p-3 rounded cursor-pointer border flex justify-between items-center transition-colors ${selectedUserIds.includes(user.id) ? "bg-green-50 border-primary" : "hover:bg-gray-50 border-gray-200"}`}
              >
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
                {selectedUserIds.includes(user.id) && <FaCheck className="text-primary" />}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">{selectedUserIds.length} user dipilih</span>
          <button onClick={handleSubmit} disabled={isLoading || selectedUserIds.length === 0} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
            {isLoading ? (
              "Menyimpan..."
            ) : (
              <>
                <FaUserPlus className="mr-2" /> Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AssignUsersModal;
