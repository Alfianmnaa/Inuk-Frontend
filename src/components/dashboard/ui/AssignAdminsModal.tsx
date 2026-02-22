import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaSearch, FaUserPlus, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { getAdmins, updateDeleteAdminRegion, type GetAdminsResponse } from "../../../services/AdminService";
import { type RegionDetail } from "../../../services/RegionService";

interface AssignAdminsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRegion: RegionDetail | null;
}

const AssignAdminsModal: React.FC<AssignAdminsModalProps> = ({ isOpen, onClose, onSuccess, targetRegion }) => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<GetAdminsResponse[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      const fetchAdmins = async () => {
        try {
          const data = await getAdmins(token, "", "", undefined);
          setAdmins(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchAdmins();
      setSelectedAdminId(null);
    }
  }, [isOpen, token]);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm)
    );
  }, [admins, searchTerm]);

  const toggleAdmin = (id: string) => {
    setSelectedAdminId((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async () => {
    if (!targetRegion || !token || !selectedAdminId) return;

    setIsLoading(true);
    try {
      await updateDeleteAdminRegion(token, selectedAdminId, { region_id: targetRegion.id });
      toast.success("Berhasil menetapkan admin.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Gagal menetapkan admin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !targetRegion) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-1060"
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800">Tambah Admin Wilayah</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Region:{" "}
          <span className="font-semibold text-primary">
            {targetRegion?.kecamatan ?? "-"} / {targetRegion?.desa_kelurahan ?? "-"}
          </span>
        </p>

        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Admin (Nama/HP)..."
            className="w-full border pl-10 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2">
          {filteredAdmins.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Tidak ada admin tersedia.</p>
          ) : (
            filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => toggleAdmin(admin.id)}
                className={`p-3 rounded cursor-pointer border flex justify-between items-center transition-colors ${
                  selectedAdminId === admin.id
                    ? "bg-green-50 border-primary"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.phone}</p>
                </div>
                {selectedAdminId === admin.id && <FaCheck className="text-primary" />}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-2 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">{selectedAdminId ? "1 admin dipilih" : "Belum memilih"}</span>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedAdminId}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
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

export default AssignAdminsModal;
