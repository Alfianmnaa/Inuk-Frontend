import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaSpinner,
  FaMosque,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileExcel,
  FaWhatsapp,
  FaFilter,
  FaCalendarAlt,
  FaSortDown as FaSortDesc,
  FaSortUp as FaSortAsc,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getInfaqs,
  createInfaq,
  updateInfaq,
  deleteInfaq,
  type Infaq,
  type ExportInfaqsQuery,
} from "../../services/InfaqService";
import { getMasjids, type MasjidResponse } from "../../services/MasjidService";
import { getAdminProfile } from "../../services/AdminService";
import {
  getAdminTreasurer,
  type GetAdminTreasurerResponse,
} from "../../services/AdminService";
import { generateExcelBlob, downloadExcelFromBlob } from "../../utils/ExportToExcel";

import AdminBendaharaModal from "./ui/AdminBendaharaModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const INITIAL_TREASURER: GetAdminTreasurerResponse = {
  treasurer_name: "",
  treasurer_phone: "",
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Inline Add/Edit Modal ────────────────────────────────────────────────────

interface InfaqFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { MasjidID: string; Total: number; DateTime: string }) => Promise<void>;
  masjids: MasjidResponse[];
  initialData?: Infaq | null;
  isSubmitting: boolean;
}

const InfaqFormModal: React.FC<InfaqFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  masjids,
  initialData,
  isSubmitting,
}) => {
  const isEdit = !!initialData;
  const [masjidId, setMasjidId] = useState("");
  const [total, setTotal] = useState("");
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (isEdit && initialData) {
      setMasjidId(initialData.MasjidID);
      setTotal(String(initialData.Total));
      // Convert ISO to datetime-local format
      setDateTime(initialData.DateTime.substring(0, 16));
    } else {
      setMasjidId("");
      setTotal("");
      setDateTime("");
    }
  }, [initialData, isEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjidId) { toast.error("Pilih masjid terlebih dahulu."); return; }
    if (!total || isNaN(Number(total)) || Number(total) <= 0) {
      toast.error("Nominal harus berupa angka positif.");
      return;
    }
    if (!dateTime) { toast.error("Tanggal harus diisi."); return; }
    await onSubmit({
      MasjidID: masjidId,
      Total: Number(total),
      DateTime: new Date(dateTime).toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1050]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl mx-4"
      >
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaMosque className="text-primary" />
            {isEdit ? "Edit Data Infaq" : "Tambah Data Infaq"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih Masjid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masjid <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={masjidId}
              onChange={(e) => setMasjidId(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">-- Pilih Masjid --</option>
              {masjids.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nominal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Contoh: 250000"
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal &amp; Waktu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <FaSpinner className="animate-spin" />}
              {isEdit ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteInfaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  infaq: Infaq | null;
  isDeleting: boolean;
}

const DeleteInfaqModal: React.FC<DeleteInfaqModalProps> = ({ isOpen, onClose, onConfirm, infaq, isDeleting }) => {
  if (!isOpen || !infaq) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1050]">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Data Infaq?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Anda akan menghapus data infaq dari{" "}
          <span className="font-semibold">{infaq.Name}</span> senilai{" "}
          <span className="font-semibold text-red-600">{formatRupiah(infaq.Total)}</span>.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting && <FaSpinner className="animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const InfaqManagement: React.FC = () => {
  const { token } = useAuth();

  // Data
  const [infaqs, setInfaqs] = useState<Infaq[]>([]);
  const [masjids, setMasjids] = useState<MasjidResponse[]>([]);
  const [treasurerData, setTreasurerData] = useState<GetAdminTreasurerResponse>(INITIAL_TREASURER);

  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [pasaranFilter, setPasaranFilter] = useState(""); // "" | "YYYY" | "YYYY-MM-DD"
  const [sortDir, setSortDir] = useState<"newest" | "oldest">("newest");

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBendaharaOpen, setIsBendaharaOpen] = useState(false);
  const [selectedInfaq, setSelectedInfaq] = useState<Infaq | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTreasurer = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getAdminTreasurer(token);
      setTreasurerData(data);
    } catch {
      setTreasurerData(INITIAL_TREASURER);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Get admin profile to determine kecamatan scope
      const profile = await getAdminProfile(token);

      const [infaqData, masjidData] = await Promise.all([
        getInfaqs(token, {
          province: profile.provinsi,
          city: profile.kabupaten_kota,
          subdistrict: profile.kecamatan,
          date_time: pasaranFilter || undefined,
        }),
        getMasjids(token),
      ]);

      // Client-side sort
      const sorted = [...infaqData].sort((a, b) => {
        const diff = new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime();
        return sortDir === "newest" ? -diff : diff;
      });

      setInfaqs(sorted);
      setMasjids(masjidData);
    } catch (err) {
      toast.error("Gagal memuat data infaq.");
    } finally {
      setIsLoading(false);
    }
  }, [token, pasaranFilter, sortDir]);

  useEffect(() => { fetchTreasurer(); }, [fetchTreasurer]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleCreate = async (payload: { MasjidID: string; Total: number; DateTime: string }) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await createInfaq(token, payload);
      toast.success("Data infaq berhasil ditambahkan!");
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan data infaq.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload: { MasjidID: string; Total: number; DateTime: string }) => {
    if (!token || !selectedInfaq) return;
    setIsSubmitting(true);
    try {
      await updateInfaq(token, selectedInfaq.id, {
        Total: payload.Total,
        DateTime: payload.DateTime,
      });
      toast.success("Data infaq berhasil diperbarui!");
      setIsFormOpen(false);
      setSelectedInfaq(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui data infaq.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedInfaq) return;
    setIsDeleting(true);
    try {
      await deleteInfaq(token, selectedInfaq.id);
      toast.success("Data infaq berhasil dihapus!");
      setIsDeleteOpen(false);
      setSelectedInfaq(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data infaq.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Export Excel (instant download) ───────────────────────────────────────

  const handleInstantDownload = () => {
    if (filteredInfaqs.length === 0) {
      toast("Tidak ada data untuk diunduh.", { icon: "⚠️" });
      return;
    }

    const dataToExport = filteredInfaqs.map((inf, idx) => ({
      No: idx + 1,
      Nama_Masjid: inf.Name,
      Desa_Kelurahan: inf.Village,
      Kecamatan: inf.Subdistrict,
      Tanggal: formatDate(inf.DateTime),
      Nominal_Rp: inf.Total,
    }));

    const blob = generateExcelBlob(dataToExport, "Laporan Infaq");
    if (blob) {
      downloadExcelFromBlob(blob, "Laporan_Infaq_Masjid");
      toast.success("Excel berhasil diunduh!");
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredInfaqs = useMemo(() => {
    const lower = searchText.toLowerCase();
    if (!lower) return infaqs;
    return infaqs.filter(
      (inf) =>
        inf.Name.toLowerCase().includes(lower) ||
        inf.Village.toLowerCase().includes(lower) ||
        inf.Subdistrict.toLowerCase().includes(lower)
    );
  }, [infaqs, searchText]);

  const totalNominal = useMemo(
    () => filteredInfaqs.reduce((sum, inf) => sum + inf.Total, 0),
    [filteredInfaqs]
  );

  const isTreasurerValid = !!(treasurerData.treasurer_name && treasurerData.treasurer_phone);

  const exportQuery: ExportInfaqsQuery = {
    pasaran: pasaranFilter || undefined,
    sort_by: sortDir,
  };

  return (
    <DashboardLayout activeLink="/dashboard/infaq-management" pageTitle="Manajemen Infaq Masjid">

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      <InfaqFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedInfaq(null); }}
        onSubmit={selectedInfaq ? handleUpdate : handleCreate}
        masjids={masjids}
        initialData={selectedInfaq}
        isSubmitting={isSubmitting}
      />

      <DeleteInfaqModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedInfaq(null); }}
        onConfirm={handleDelete}
        infaq={selectedInfaq}
        isDeleting={isDeleting}
      />

      <AdminBendaharaModal
        isOpen={isBendaharaOpen}
        onClose={() => setIsBendaharaOpen(false)}
        onSuccess={fetchTreasurer}
        currentTreasurer={treasurerData}
        exportQuery={exportQuery}
      />

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">Total Nominal Infaq</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalNominal)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Jumlah Data</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredInfaqs.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-primary">
            <p className="text-sm font-medium text-gray-500">Jumlah Masjid</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{masjids.length}</p>
          </div>
        </motion.div>

        {/* Filter + Actions */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-primary" /> Filter &amp; Aksi
            </h3>

            <div className="flex flex-wrap gap-2">
              {/* Bendahara — kirim WA */}
              <div className="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg text-xs self-center hidden sm:block">
                <p className="font-semibold text-yellow-800">Bendahara:</p>
                <p className="text-gray-700">
                  {isTreasurerValid
                    ? `${treasurerData.treasurer_phone} (${treasurerData.treasurer_name})`
                    : "Belum diatur"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsBendaharaOpen(true)}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600 transition-colors shadow"
                title="Konfirmasi data bendahara dan kirim laporan via WhatsApp"
              >
                <FaWhatsapp /> Kirim Notifikasi WA
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInstantDownload}
                className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow"
              >
                <FaFileExcel /> Download Excel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectedInfaq(null); setIsFormOpen(true); }}
                className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors shadow"
              >
                <FaPlus /> Tambah Infaq
              </motion.button>
            </div>
          </div>

          {/* Filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama masjid / desa..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary text-sm outline-none"
              />
            </div>

            {/* Pasaran / date filter */}
            <div className="relative md:col-span-1">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder='Filter pasaran: "2026" atau "2026-01-02"'
                value={pasaranFilter}
                onChange={(e) => setPasaranFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-primary focus:border-primary text-sm outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "newest" | "oldest")}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary text-sm outline-none bg-white"
            >
              <option value="newest">Tanggal Terbaru</option>
              <option value="oldest">Tanggal Terlama</option>
            </select>
          </div>

          {/* Pasaran hint */}
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <FaInfoCircle className="mt-0.5 shrink-0 text-blue-400" />
            <span>
              Filter Pasaran: kosongkan untuk semua data · isi tahun (mis. <code>2026</code>) untuk
              seluruh tahun · isi tanggal Jumat Pon (mis. <code>2026-01-02</code>) untuk hari
              spesifik.
            </span>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaMosque className="text-primary" />
            Daftar Infaq Masjid ({filteredInfaqs.length} data)
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
                  <th className="py-3 px-4 text-left font-semibold">Desa / Kecamatan</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    <div className="flex items-center gap-1">
                      Tanggal
                      {sortDir === "newest" ? (
                        <FaSortDesc className="text-primary w-3 h-3" />
                      ) : (
                        <FaSortAsc className="text-primary w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right font-semibold">Nominal (Rp)</th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {filteredInfaqs.length > 0 ? (
                  filteredInfaqs.map((inf, idx) => (
                    <tr key={inf.id} className="hover:bg-green-50/40 transition-colors">
                      <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <FaMosque className="text-primary text-xs" />
                          </div>
                          <span className="font-medium text-gray-800">{inf.Name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {inf.Village}
                        <br />
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                          {inf.Subdistrict}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(inf.DateTime)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">
                        {formatRupiah(inf.Total)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => { setSelectedInfaq(inf); setIsFormOpen(true); }}
                            title="Edit Infaq"
                            className="text-yellow-500 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedInfaq(inf); setIsDeleteOpen(true); }}
                            title="Hapus Infaq"
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <FaMosque className="text-gray-300 text-4xl mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchText || pasaranFilter
                          ? "Tidak ada data infaq sesuai filter."
                          : 'Belum ada data infaq. Klik "Tambah Infaq" untuk memulai.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Subtotal row */}
              {filteredInfaqs.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 font-bold text-sm border-t-2 border-gray-200">
                    <td colSpan={4} className="py-3 px-4 text-right text-gray-600">
                      Total ({filteredInfaqs.length} data):
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