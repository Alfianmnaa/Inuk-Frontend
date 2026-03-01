import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaSpinner, FaMosque, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import DashboardLayout from "./DashboardLayout";
import { getMasjids, type MasjidResponse } from "../../services/MasjidService";
import { useAuth } from "../../context/AuthContext";

import AddEditMasjidModal from "./ui/AddEditMasjidModal";
import DeleteMasjidModal from "./ui/DeleteMasjidModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const MasjidManagement: React.FC = () => {
  const { token } = useAuth();

  const [masjids, setMasjids] = useState<MasjidResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMasjid, setSelectedMasjid] = useState<MasjidResponse | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getMasjids(token);
      setMasjids(data);
    } catch {
      toast.error("Gagal memuat data masjid.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMasjids = masjids.filter((m) =>
    m.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <DashboardLayout activeLink="/dashboard/masjid-management" pageTitle="Manajemen Masjid">
      <AddEditMasjidModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={fetchData}
        masjid={selectedMasjid}
      />
      <DeleteMasjidModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchData}
        masjid={selectedMasjid}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FaMosque className="text-primary" /> Daftar Masjid
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Kelola data masjid yang berada dalam wilayah Anda.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedMasjid(null); setIsAddEditOpen(true); }}
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md shrink-0"
            >
              <FaPlus /> Tambah Masjid
            </motion.button>
          </div>

          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama masjid..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary transition-colors text-sm outline-none"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaMosque className="text-primary" />
            Total: {filteredMasjids.length} Masjid
          </h3>

          {isLoading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin inline text-primary text-3xl mb-2" />
              <p className="text-gray-500 text-sm">Memuat data...</p>
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-left font-semibold">No</th>
                  <th className="py-3 px-4 text-left font-semibold">Nama Masjid</th>
                  <th className="py-3 px-4 text-left font-semibold">Desa / Kelurahan</th>
                  <th className="py-3 px-4 text-left font-semibold">Kecamatan</th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {filteredMasjids.length > 0 ? (
                  filteredMasjids.map((masjid, idx) => (
                    <tr key={masjid.id} className="hover:bg-green-50/40 transition-colors">
                      <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{masjid.name}</td>
                      <td className="py-3 px-4 text-gray-600">{masjid.desa_kelurahan}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {masjid.kecamatan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => { setSelectedMasjid(masjid); setIsAddEditOpen(true); }}
                            title="Edit Masjid"
                            className="text-yellow-500 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => { setSelectedMasjid(masjid); setIsDeleteOpen(true); }}
                            title="Hapus Masjid"
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <FaMosque className="text-gray-300 text-4xl mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchText
                          ? "Tidak ada masjid sesuai pencarian."
                          : 'Belum ada masjid. Klik "Tambah Masjid" untuk memulai.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MasjidManagement;