import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaTable,
  FaLeaf,
  FaSpinner,
  FaMosque,
} from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import DonationChart from "../../utils/DonationChart";
import {
  getInfaqsRecapYears,
  getInfaqsRecapPasarans,
  getInfaqsRecap,
  type InfaqsRecapResponse,
} from "../../services/InfaqService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

/**
 * Format "YYYY-MM-DD" → "DD MMMM YYYY" (id-ID locale)
 * e.g. "2026-01-02" → "2 Januari 2026"
 */
const formatPasaranLabel = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, when: "beforeChildren", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

const RekapInfaq: React.FC = () => {
  const currentDate = new Date();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [recapData, setRecapData] = useState<InfaqsRecapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availablePasarans, setAvailablePasarans] = useState<string[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [isLoadingPasarans, setIsLoadingPasarans] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedPasaran, setSelectedPasaran] = useState<string>("");

  // ── Fetch available years (once on mount) ────────────────────────────────────
  useEffect(() => {
    const fetchYears = async () => {
      const cacheKey = "inuk_infaq_recap_years";
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const years = JSON.parse(cached) as number[];
        setAvailableYears(years);
        if (years.length > 0 && !years.includes(currentDate.getFullYear())) {
          setSelectedYear(years[0]); // most recent first (DESC)
        }
        setIsLoadingYears(false);
        return;
      }

      try {
        const years = await getInfaqsRecapYears();
        if (years.length === 0) {
          setAvailableYears([currentDate.getFullYear()]);
        } else {
          setAvailableYears(years);
          sessionStorage.setItem(cacheKey, JSON.stringify(years));
          if (!years.includes(currentDate.getFullYear())) {
            setSelectedYear(years[0]); // most recent
          }
        }
      } catch (error) {
        console.error("Error fetching infaq recap years:", error);
        setAvailableYears([currentDate.getFullYear()]);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchYears();
  }, []);

  // ── Fetch available pasarans (when year changes) ──────────────────────────────
  useEffect(() => {
    if (!selectedYear) return;

    const fetchPasarans = async () => {
      const cacheKey = `inuk_infaq_recap_pasarans_${selectedYear}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const dates = JSON.parse(cached) as string[];
        setAvailablePasarans(dates);
        // Auto-select the most recent pasaran if current selection not in list
        if (dates.length > 0 && !dates.includes(selectedPasaran)) {
          setSelectedPasaran(dates[0]); // DESC order, so [0] is most recent
        }
        return;
      }

      setIsLoadingPasarans(true);
      try {
        const dates = await getInfaqsRecapPasarans(selectedYear);
        if (dates.length === 0) {
          setAvailablePasarans([]);
          setSelectedPasaran("");
        } else {
          setAvailablePasarans(dates);
          sessionStorage.setItem(cacheKey, JSON.stringify(dates));
          setSelectedPasaran(dates[0]); // most recent
        }
      } catch (error) {
        console.error(`Error fetching pasarans for year ${selectedYear}:`, error);
        setAvailablePasarans([]);
        setSelectedPasaran("");
      } finally {
        setIsLoadingPasarans(false);
      }
    };

    fetchPasarans();
  }, [selectedYear]);

  // ── Fetch recap data (when pasaran changes) ──────────────────────────────────
  useEffect(() => {
    if (!selectedPasaran) {
      setRecapData(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getInfaqsRecap(selectedPasaran);
        setRecapData(data);
      } catch (error) {
        console.error("Failed to fetch infaq recap data:", error);
        setRecapData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPasaran]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const kecamatanList = recapData?.kecamatan ?? [];
  const isDataAvailable = kecamatanList.length > 0;

  const totalInfaq = useMemo(
    () => kecamatanList.reduce((sum, kec) => sum + kec.total_infaq, 0),
    [kecamatanList]
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (isLoadingYears) {
    return (
      <motion.section
        className="py-24 px-4 flex justify-center items-center h-96"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <FaSpinner className="animate-spin text-primary mr-3" size={32} />
        <span className="text-xl text-gray-700">Memuat data rekap infaq...</span>
      </motion.section>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <motion.section
      className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <p className="text-primary font-bold text-lg">Rekap Infaq</p>
          <h2 className="text-4xl font-bold text-gray-800">Per Jum'at Pon</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Pilih tahun dan tanggal Jum'at Pon untuk melihat rekap infaq masjid
            per kecamatan di Kabupaten Kudus.
          </p>
        </motion.div>

        {/* ── Filter ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mb-10"
        >
          <div className="max-w-xl mx-auto">
            <label className="block text-gray-700 font-semibold mb-3">
              Pilih Periode Jum'at Pon
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Year dropdown */}
              <div className="relative">
                <select
                  className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  disabled={isLoadingYears}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))
                  ) : (
                    <option value={currentDate.getFullYear()}>
                      {currentDate.getFullYear()}
                    </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoadingYears ? (
                    <FaSpinner className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <BiChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Pasaran (date) dropdown */}
              <div className="relative">
                <select
                  className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedPasaran}
                  onChange={(e) => setSelectedPasaran(e.target.value)}
                  disabled={isLoadingPasarans || availablePasarans.length === 0}
                >
                  {availablePasarans.length > 0 ? (
                    availablePasarans.map((dateStr) => (
                      <option key={dateStr} value={dateStr}>
                        {formatPasaranLabel(dateStr)}
                      </option>
                    ))
                  ) : (
                    <option value="">
                      {isLoadingPasarans
                        ? "Memuat..."
                        : "Tidak ada data"}
                    </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoadingPasarans ? (
                    <FaSpinner className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <BiChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main grid: summary + chart ── */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-primary mr-3" size={28} />
            <span className="text-gray-600">Memuat rekap...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ringkasan kecamatan */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary"
              >
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                  <FaLeaf className="mr-2" /> Ringkasan
                </h3>

                {isDataAvailable ? (
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Kabupaten/Kota</span>
                      <span className="font-bold text-gray-900">
                        : {recapData?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Tanggal</span>
                      <span className="font-bold text-gray-900">
                        : {selectedPasaran ? formatPasaranLabel(selectedPasaran) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">Total Infaq</span>
                      <span className="font-bold text-gray-900">
                        : {formatRupiah(recapData?.total_infaq ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Masjid</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        : <FaMosque className="inline text-primary" />{" "}
                        {recapData?.total_masjid ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Jumlah Kecamatan</span>
                      <span className="font-bold text-gray-900">
                        : {kecamatanList.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    Tidak ada data untuk periode ini.
                  </p>
                )}
              </motion.div>

              {/* Grafik per kecamatan */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-primary" /> Grafik Infaq per Kecamatan
                </h3>
                <div className="grow">
                  {isDataAvailable ? (
                    <DonationChart
                      data={kecamatanList.map((kec) => ({
                        desa: kec.name,
                        jumlahDonatur: kec.total_masjid,
                        totalDonasi: kec.total_infaq,
                      }))}
                      areaName={recapData?.name ?? "Kabupaten/Kota"}
                      dataLevel="Kecamatan"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg h-64 md:h-80">
                      {selectedPasaran ? (
                        <>
                          <h2 className="text-lg font-bold text-gray-500 mb-1">
                            Tidak Ada Data
                          </h2>
                          <p className="text-gray-400 text-sm text-center px-4">
                            Belum ada infaq yang tercatat pada{" "}
                            {formatPasaranLabel(selectedPasaran)}.
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-400 italic text-sm">
                          Pilih tanggal Jum'at Pon untuk melihat grafik.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── Tabel Kecamatan ── */}
            <motion.div
              variants={itemVariants}
              className="mt-8 bg-white p-6 rounded-xl shadow-lg overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaTable className="mr-2 text-primary" /> Tabel Infaq per Kecamatan
              </h3>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-yellow-50 text-gray-800 text-sm font-semibold">
                    <th className="py-3 px-4 border border-yellow-200">No</th>
                    <th className="py-3 px-4 border border-yellow-200 text-left">
                      Kecamatan
                    </th>
                    <th className="py-3 px-4 border border-yellow-200">
                      Jumlah Masjid
                    </th>
                    <th className="py-3 px-4 border border-yellow-200">
                      Total Infaq
                    </th>
                    <th className="py-3 px-4 border border-yellow-200">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isDataAvailable ? (
                    kecamatanList.map((kec, index) => {
                      const percentage =
                        totalInfaq > 0
                          ? ((kec.total_infaq / totalInfaq) * 100).toFixed(2)
                          : "0";
                      return (
                        <tr
                          key={kec.name}
                          className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 border border-gray-200 text-center">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 font-medium">
                            {kec.name}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-center">
                            <span className="inline-flex items-center gap-1">
                              <FaMosque className="text-primary w-3 h-3" />
                              {kec.total_masjid}
                            </span>
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-right font-semibold">
                            {formatRupiah(kec.total_infaq)}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-center">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 italic"
                      >
                        {selectedPasaran
                          ? `Tidak ada data infaq pada ${formatPasaranLabel(selectedPasaran)}.`
                          : "Pilih tanggal Jum'at Pon untuk melihat data."}
                      </td>
                    </tr>
                  )}

                  {/* Total row */}
                  {isDataAvailable && (
                    <tr className="bg-yellow-100 text-gray-800 font-bold text-base">
                      <td
                        colSpan={2}
                        className="py-3 px-4 border border-gray-300 text-center"
                      >
                        Total Keseluruhan
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-center">
                        <span className="inline-flex items-center gap-1">
                          <FaMosque className="text-primary w-3 h-3" />
                          {recapData?.total_masjid ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-right">
                        {formatRupiah(totalInfaq)}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-center">
                        100%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default RekapInfaq;