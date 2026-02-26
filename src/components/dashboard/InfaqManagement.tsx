import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaSpinner,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaFilter,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import DashboardLayout from "./DashboardLayout";
import { getInfaqs, type Infaq } from "../../services/InfaqService";
import { getAdminProfile } from "../../services/AdminService";
import { getSubdistricts } from "../../services/RegionService";
import { useAuth } from "../../context/AuthContext";
import { getAllFridayPons, formatFridayPonDisplay } from "../../utils/dateUtils";

// Modals
import AddEditInfaqModal from "./ui/AddEditInfaqModal";
import DeleteInfaqModal from "./ui/DeleteInfaqModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const currentYear = new Date().getFullYear();
const START_YEAR = 2025;

// Helper: format currency
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const InfaqManagement: React.FC = () => {
  const { token, userRole } = useAuth();
  const isSuperAdmin = userRole === "superadmin";

  const [infaqs, setInfaqs] = useState<Infaq[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin profile (for locking kecamatan on regular admin)
  const [adminKecamatan, setAdminKecamatan] = useState("");
  const [adminProvince, setAdminProvince] = useState("");
  const [adminCity, setAdminCity] = useState("");

  // Filter state
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterDateISO, setFilterDateISO] = useState(""); // "" means start of year
  const [filterKecamatan, setFilterKecamatan] = useState(""); // superadmin only
  const [availableKecamatans, setAvailableKecamatans] = useState<string[]>([]);

  // Modal state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInfaq, setSelectedInfaq] = useState<Infaq | null>(null);

  // Generate year list
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = START_YEAR; y <= currentYear; y++) arr.push(y);
    return arr;
  }, []);

  // Generate Jumat Pon list for selected filter year
  const fridayPons = useMemo(() => getAllFridayPons(filterYear, filterYear), [filterYear]);

  // Load admin profile to get kecamatan
  useEffect(() => {
    if (!token) return;
    if (!isSuperAdmin) {
      getAdminProfile(token)
        .then((profile) => {
          setAdminKecamatan(profile.kecamatan);
          setAdminProvince(profile.provinsi);
          setAdminCity(profile.kabupaten_kota);
        })
        .catch(() => toast.error("Gagal memuat profil admin."));
    } else {
      // Superadmin: load all kecamatans for filter
      getSubdistricts("Jawa Tengah", "Kudus")
        .then(setAvailableKecamatans)
        .catch(() => {});
    }
  }, [token, isSuperAdmin]);

  // Calculate effective date filter: start of year if no specific Jumat Pon chosen
  const effectiveDateFilter = useMemo(() => {
    if (filterDateISO) {
      return new Date(filterDateISO).toISOString();
    }
    // Start of selected year, UTC midnight
    return new Date(filterYear, 0, 1, 0, 0, 0).toISOString();
  }, [filterDateISO, filterYear]);

  const fetchInfaqs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const effectiveKecamatan = isSuperAdmin ? filterKecamatan : adminKecamatan;
      const data = await getInfaqs(token, {
        province: adminProvince || (isSuperAdmin ? "Jawa Tengah" : ""),
        city: adminCity || (isSuperAdmin ? "Kudus" : ""),
        subdistrict: effectiveKecamatan,
        date_time: effectiveDateFilter,
      });
      setInfaqs(data || []);
    } catch (err) {
      toast.error("Gagal memuat data infaq.");
    } finally {
      setIsLoading(false);
    }
  }, [token, isSuperAdmin, filterKecamatan, adminKecamatan, adminProvince, adminCity, effectiveDateFilter]);

  useEffect(() => {
    // Only fetch once we have admin data (for non-superadmin)
    if (!isSuperAdmin && !adminKecamatan) return;
    fetchInfaqs();
  }, [fetchInfaqs, isSuperAdmin, adminKecamatan]);

  const handleYearChange = (year: number) => {
    setFilterYear(year);
    setFilterDateISO(""); // reset Jumat Pon selection → show all of that year
  };

  const handleEditClick = (infaq: Infaq) => {
    setSelectedInfaq(infaq);
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (infaq: Infaq) => {
    setSelectedInfaq(infaq);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedInfaq(null);
    setIsAddEditOpen(true);
  };

  // Summary stats
  const totalNominal = useMemo(() => infaqs.reduce((sum, i) => sum + i.Total, 0), [infaqs]);
  const uniqueMasjids = useMemo(() => new Set(infaqs.map((i) => i.MasjidID)).size, [infaqs]);

  return (
    <DashboardLayout activeLink="/dashboard/infaq-management" pageTitle="Pencatatan Infaq">
      {/* Modals */}
      <AddEditInfaqModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={fetchInfaqs}
        infaq={selectedInfaq}
      />
      <DeleteInfaqModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchInfaqs}
        infaq={selectedInfaq}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <FaMoneyBillWave className="text-primary text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Infaq</p>
              <p className="text-lg font-bold text-gray-800">{formatRupiah(totalNominal)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <FaFilter className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Catatan Ditampilkan</p>
              <p className="text-lg font-bold text-gray-800">{infaqs.length} Catatan</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <FaMapMarkerAlt className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Masjid Aktif</p>
              <p className="text-lg font-bold text-gray-800">{uniqueMasjids} Masjid</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-primary" /> Filter Data Infaq
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddNew}
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md shrink-0"
            >
              <FaPlus /> Tambah Catatan Infaq
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tahun */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Tahun
              </label>
              <select
                value={filterYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Jum'at Pon Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Dari Jum'at Pon
              </label>
              <select
                value={filterDateISO}
                onChange={(e) => setFilterDateISO(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition"
              >
                <option value="">Semua Jum'at Pon {filterYear}</option>
                {fridayPons.map((d) => (
                  <option key={d.toISOString()} value={d.toISOString()}>
                    {formatFridayPonDisplay(d)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Menampilkan data dari tanggal yang dipilih ke depan.
              </p>
            </div>

            {/* Kecamatan Filter — superadmin only */}
            {isSuperAdmin ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Kecamatan
                </label>
                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition"
                >
                  <option value="">Semua Kecamatan</option>
                  {availableKecamatans.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Kecamatan
                </label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  {adminKecamatan || "Memuat..."}
                  <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Terkunci</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Filter otomatis berdasarkan wilayah admin Anda.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchInfaqs}
              className="bg-primary text-white py-2 px-5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaFilter />}
              Terapkan Filter
            </motion.button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-primary" />
            Catatan Infaq ({infaqs.length})
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
                  <th className="py-3 px-4 text-left font-semibold">Masjid</th>
                  <th className="py-3 px-4 text-left font-semibold">Wilayah</th>
                  <th className="py-3 px-4 text-left font-semibold">Tanggal (Jum'at Pon)</th>
                  <th className="py-3 px-4 text-right font-semibold">Nominal</th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {infaqs.length > 0 ? (
                  infaqs.map((infaq, idx) => {
                    const dateObj = new Date(infaq.DateTime);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                    return (
                      <tr key={infaq.id} className="hover:bg-green-50/40 transition-colors">
                        <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800">{infaq.Name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <p className="font-medium text-gray-700">{infaq.Subdistrict}</p>
                            <p>{infaq.Village}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                            {formattedDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-800">{formatRupiah(infaq.Total)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(infaq)}
                              title="Edit Catatan"
                              className="text-yellow-500 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(infaq)}
                              title="Hapus Catatan"
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-14">
                      <FaMoneyBillWave className="text-gray-300 text-4xl mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Belum ada catatan infaq untuk filter yang dipilih.</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Klik "Tambah Catatan Infaq" untuk mulai mencatat.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
              {infaqs.length > 0 && (
                <tfoot>
                  <tr className="bg-green-50 font-semibold text-gray-700">
                    <td colSpan={4} className="py-3 px-4 text-right text-sm">
                      Total Keseluruhan:
                    </td>
                    <td className="py-3 px-4 text-right text-primary">
                      {formatRupiah(totalNominal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default InfaqManagement;