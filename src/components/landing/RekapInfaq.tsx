import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaTable,
  FaLeaf,
  FaSpinner,
  FaFilter,
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
  // "YYYY" format → show as full year label
  if (/^\d{4}$/.test(dateStr)) return `Seluruh Tahun ${dateStr}`;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ── Flat row type for the masjid table ───────────────────────────────────────

interface MasjidRow {
  masjidName: string;
  kecamatan: string;
  desa: string;
  totalInfaq: number;
}

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
  // Default to full-year view ("YYYY" format)
  const [selectedPasaran, setSelectedPasaran] = useState<string>(
    String(currentDate.getFullYear())
  );
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("");

  // ── Fetch available years (once on mount) ────────────────────────────────────
  useEffect(() => {
    const fetchYears = async () => {
      const cacheKey = "inuk_infaq_recap_years";
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const years = JSON.parse(cached) as number[];
        setAvailableYears(years);
        if (years.length > 0 && !years.includes(currentDate.getFullYear())) {
          setSelectedYear(years[0]);
          setSelectedPasaran(String(years[0]));
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
            setSelectedYear(years[0]);
            setSelectedPasaran(String(years[0]));
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
  // NOTE: do NOT set selectedPasaran here — that belongs in the year onChange
  // handler. Setting state synchronously inside a useEffect body causes React 18
  // Strict Mode to overwrite user selections on the second effect invocation.
  useEffect(() => {
    if (!selectedYear) return;

    const fetchPasarans = async () => {
      const cacheKey = `inuk_infaq_recap_pasarans_${selectedYear}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        setAvailablePasarans(JSON.parse(cached) as string[]);
        return;
      }

      setIsLoadingPasarans(true);
      try {
        const dates = await getInfaqsRecapPasarans(selectedYear);
        setAvailablePasarans(dates);
        if (dates.length > 0) {
          sessionStorage.setItem(cacheKey, JSON.stringify(dates));
        }
      } catch (error) {
        console.error(`Error fetching pasarans for year ${selectedYear}:`, error);
        setAvailablePasarans([]);
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

    // AbortController cancels the in-flight request if pasaran changes again
    // before the previous fetch completes, preventing stale data from
    // overwriting a newer selection's result.
    const controller = new AbortController();

    setIsLoading(true);
    setSelectedKecamatan(""); // reset filter before fetch, not inside async callback

    const fetchData = async () => {
      try {
        const data = await getInfaqsRecap(selectedPasaran);
        if (!controller.signal.aborted) {
          setRecapData(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch infaq recap data:", error);
          setRecapData(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();

  }, [selectedPasaran]);

  // ── Derived values ────────────────────────────────────────────────────────────

  const kecamatanList = recapData?.kecamatan ?? [];
  const isDataAvailable = kecamatanList.length > 0;

  // Unique kecamatan names for the filter dropdown
  const kecamatanOptions = useMemo(
    () => kecamatanList.map((kec) => kec.name),
    [kecamatanList]
  );

  // Flatten nested structure → one row per masjid, filtered by kecamatan
  const masjidRows = useMemo<MasjidRow[]>(() => {
    const rows: MasjidRow[] = [];
    for (const kec of kecamatanList) {
      if (selectedKecamatan && kec.name !== selectedKecamatan) continue;
      for (const desa of kec.desa_kelurahan) {
        for (const masjid of desa.masjid) {
          rows.push({
            masjidName: masjid.name,
            kecamatan: kec.name,
            desa: desa.name,
            totalInfaq: masjid.total_infaq,
          });
        }
      }
    }
    return rows;
  }, [kecamatanList, selectedKecamatan]);

  const filteredTotalInfaq = useMemo(
    () => masjidRows.reduce((sum, row) => sum + row.totalInfaq, 0),
    [masjidRows]
  );

  const grandTotalInfaq = recapData?.total_infaq ?? 0;

  // Chart data always shows all kecamatan regardless of table filter
  const chartData = useMemo(
    () =>
      kecamatanList.map((kec) => ({
        desa: kec.name,
        jumlahDonatur: kec.total_masjid,
        totalDonasi: kec.total_infaq,
      })),
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
            Pilih tahun dan periode Jum'at Pon untuk melihat rekap infaq masjid
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
                  onChange={(e) => {
                    const newYear = Number(e.target.value);
                    setSelectedYear(newYear);
                    setSelectedPasaran(String(newYear)); // explicit reset to full-year view
                    setSelectedKecamatan("");
                  }}
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

              {/* Pasaran (date) dropdown — includes "Semua" option */}
              <div className="relative">
                <select
                  className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedPasaran}
                  onChange={(e) => setSelectedPasaran(e.target.value)}
                  disabled={isLoadingPasarans}
                >
                  {/* Full-year option always present */}
                  <option value={String(selectedYear)}>
                    Semua Jum'at Pon
                  </option>
                  {availablePasarans.length > 0 ? (
                    availablePasarans.map((dateStr) => (
                      <option key={dateStr} value={dateStr}>
                        {formatPasaranLabel(dateStr)}
                      </option>
                    ))
                  ) : (
                    !isLoadingPasarans && (
                      <option disabled value="">
                        Tidak ada data
                      </option>
                    )
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
              {/* Ringkasan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">Total Infaq</span>
                      <span className="font-bold text-gray-900">
                        : {formatRupiah(grandTotalInfaq)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Jumlah Masjid</span>
                      <span className="font-bold text-gray-900">
                        : {recapData?.total_masjid ?? 0}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-primary" /> Grafik Infaq per Kecamatan
                </h3>
                <div className="grow">
                  {isDataAvailable ? (
                    <DonationChart
                      data={chartData}
                      areaName={recapData?.name ?? "Kabupaten/Kota"}
                      dataLevel="Kecamatan"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg h-64 md:h-80">
                      <h2 className="text-lg font-bold text-gray-500 mb-1">
                        Tidak Ada Data
                      </h2>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Belum ada infaq yang tercatat pada periode ini.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── Tabel Masjid ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 bg-white p-6 rounded-xl shadow-lg overflow-x-auto"
            >
              {/* Table header + kecamatan filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FaTable className="mr-2 text-primary" /> Tabel Infaq per Masjid
                </h3>

                {isDataAvailable && (
                  <div className="relative w-full sm:w-56">
                    <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                    <select
                      className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-8 pr-8 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      value={selectedKecamatan}
                      onChange={(e) => setSelectedKecamatan(e.target.value)}
                    >
                      <option value="">Semua Kecamatan</option>
                      {kecamatanOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <BiChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-yellow-50 text-gray-800 text-sm font-semibold">
                    <th className="py-3 px-4 border border-yellow-200 text-center">No</th>
                    <th className="py-3 px-4 border border-yellow-200 text-left">Nama Masjid</th>
                    <th className="py-3 px-4 border border-yellow-200 text-left">Kecamatan / Desa</th>
                    <th className="py-3 px-4 border border-yellow-200 text-right">Total Infaq</th>
                    <th className="py-3 px-4 border border-yellow-200 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {isDataAvailable && masjidRows.length > 0 ? (
                    masjidRows.map((row, index) => {
                      const percentage =
                        grandTotalInfaq > 0
                          ? ((row.totalInfaq / grandTotalInfaq) * 100).toFixed(2)
                          : "0";
                      return (
                        <tr
                          key={`${row.masjidName}-${row.desa}-${index}`}
                          className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 border border-gray-200 text-center">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 font-medium">
                            {row.masjidName}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-gray-600">
                            <span className="font-medium text-gray-800">{row.kecamatan}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            {row.desa}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-right font-semibold">
                            {formatRupiah(row.totalInfaq)}
                          </td>
                          <td className="py-3 px-4 border border-gray-200 text-center">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                        {isDataAvailable
                          ? `Tidak ada masjid di kecamatan ${selectedKecamatan}.`
                          : "Tidak ada data infaq untuk periode ini."}
                      </td>
                    </tr>
                  )}

                  {/* Total row */}
                  {isDataAvailable && masjidRows.length > 0 && (
                    <tr className="bg-yellow-100 text-gray-800 font-bold text-sm">
                      <td
                        colSpan={3}
                        className="py-3 px-4 border border-gray-300 text-center"
                      >
                        {selectedKecamatan
                          ? `Total Kecamatan ${selectedKecamatan}`
                          : "Total Keseluruhan"}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-right">
                        {formatRupiah(filteredTotalInfaq)}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-center">
                        {grandTotalInfaq > 0
                          ? ((filteredTotalInfaq / grandTotalInfaq) * 100).toFixed(1)
                          : "0"}
                        %
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