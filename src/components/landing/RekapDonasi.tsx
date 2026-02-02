import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaTable,
  FaSearch,
  FaTimes,
  FaLeaf,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import DonationChart from "../../utils/DonationChart";
import {
  getDonationRecap,
  getDonationRecapYears,
  getDonationRecapMonths,
  type DonationDataRecap,
} from "../../services/DonationService";

// Fungsi format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// PERBAIKAN: Mengembalikan opacity: 0 pada hidden untuk animasi fade-in yang benar
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const RekapDonasi: React.FC = () => {
  // State untuk menyimpan data hasil fetch
  const [recapData, setRecapData] = useState<DonationDataRecap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Kecamatan yang dipilih
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const months = [
    { name: "Semua Bulan", value: 0 }, // Optional: show all months
    { name: "Januari", value: 1 },
    { name: "Februari", value: 2 },
    { name: "Maret", value: 3 },
    { name: "April", value: 4 },
    { name: "Mei", value: 5 },
    { name: "Juni", value: 6 },
    { name: "Juli", value: 7 },
    { name: "Agustus", value: 8 },
    { name: "September", value: 9 },
    { name: "Oktober", value: 10 },
    { name: "November", value: 11 },
    { name: "Desember", value: 12 },
  ];

  // State untuk available years dan months dari database
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  // Set default to current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear()); // Current year

  // --- Fetch Available Years (Only Once on Mount) ---
  useEffect(() => {
    const fetchAvailableYears = async () => {
      // Check sessionStorage first (cache)
      const cachedYears = sessionStorage.getItem("inuk_recap_years");
      
      if (cachedYears) {
        // Use cached data - improves performance
        const years = JSON.parse(cachedYears) as number[];
        setAvailableYears(years);
        
        // Set default year to most recent available year
        if (years.length > 0 && !years.includes(currentDate.getFullYear())) {
          setSelectedYear(years[years.length - 1]);
        }
        
        setIsLoadingYears(false);
        return;
      }

      // No cache - fetch from API
      try {
        const years = await getDonationRecapYears();
        
        if (years.length === 0) {
          console.warn("No years available from API");
          setAvailableYears([currentDate.getFullYear()]);
        } else {
          setAvailableYears(years);
          // Cache in sessionStorage
          sessionStorage.setItem("inuk_recap_years", JSON.stringify(years));
          
          // Set default year to most recent available year
          if (!years.includes(currentDate.getFullYear())) {
            setSelectedYear(years[years.length - 1]);
          }
        }
      } catch (error) {
        console.error("Error fetching years:", error);
        // Fallback to current year
        setAvailableYears([currentDate.getFullYear()]);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchAvailableYears();
  }, []); // Only run once on mount

  // --- Fetch Available Months (When Year Changes) ---
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      if (!selectedYear) return;

      // Check sessionStorage first (cache per year)
      const cacheKey = `inuk_recap_months_${selectedYear}`;
      const cachedMonths = sessionStorage.getItem(cacheKey);
      
      if (cachedMonths) {
        // Use cached data
        const months = JSON.parse(cachedMonths) as number[];
        setAvailableMonths(months);
        
        // Reset month to "Semua Bulan" (0) if current month not available
        if (selectedMonth > 0 && !months.includes(selectedMonth)) {
          setSelectedMonth(0);
        }
        
        return;
      }

      // No cache - fetch from API
      setIsLoadingMonths(true);
      try {
        const months = await getDonationRecapMonths(selectedYear);
        
        if (months.length === 0) {
          console.warn(`No months available for year ${selectedYear}`);
          setAvailableMonths([]);
          setSelectedMonth(0); // Default to "Semua Bulan"
        } else {
          setAvailableMonths(months);
          // Cache in sessionStorage
          sessionStorage.setItem(cacheKey, JSON.stringify(months));
          
          // Reset month to "Semua Bulan" (0) if current month not available
          if (selectedMonth > 0 && !months.includes(selectedMonth)) {
            setSelectedMonth(0);
          }
        }
      } catch (error) {
        console.error(`Error fetching months for year ${selectedYear}:`, error);
        setAvailableMonths([]);
        setSelectedMonth(0); // Fallback to "Semua Bulan"
      } finally {
        setIsLoadingMonths(false);
      }
    };

    fetchAvailableMonths();
  }, [selectedYear]); // Run when year changes

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data: DonationDataRecap = await getDonationRecap(
          undefined,
          undefined,
          selectedYear,
          selectedMonth,
        );
        setRecapData(data);

        // Atur nilai selectedKecamatan ke item pertama segera setelah data berhasil diambil.
        // Add defensive checks for kecamatan array
        if (data && data.kecamatan && Array.isArray(data.kecamatan) && data.kecamatan.length > 0) {
          setSelectedKecamatan(data.kecamatan[0].name);
        } else {
          setSelectedKecamatan("");
        }
      } catch (error) {
        console.error("Failed to fetch donation recap data:", error);
        setRecapData(null);
        setSelectedKecamatan("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  // Temukan data kecamatan yang dipilih (Menggunakan selectedKecamatan)
  const currentKecamatan = useMemo(() => {
    if (!recapData || !recapData.kecamatan || !Array.isArray(recapData.kecamatan)) {
      return {
        name: selectedKecamatan || "Pilih Kecamatan",
        total_donor: 0,
        total_donation: 0,
        desa_kelurahan: [],
      };
    }
    const found = recapData.kecamatan.find(
      (kec) => kec.name === selectedKecamatan,
    );
    return (
      found || {
        name: selectedKecamatan || "Pilih Kecamatan",
        total_donor: 0,
        total_donation: 0,
        desa_kelurahan: [],
      }
    );
  }, [selectedKecamatan, recapData]);

  // Handler Perubahan Kecamatan
  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKecamatan(e.target.value);
    setSearchTerm("");
  };

  // Hitung total keseluruhan untuk kecamatan yang dipilih
  const totalDonasi = currentKecamatan.total_donation;
  const totalDonatur = currentKecamatan.total_donor;

  // Total donatur di semua kecamatan
  const totalGlobalDonatur = recapData?.total_donor || 0;

  // Hitung persentase donatur
  const persentaseDonatur =
    totalGlobalDonatur > 0
      ? ((totalDonatur / totalGlobalDonatur) * 100).toFixed(2)
      : "0";

  // Data yang sudah difilter
  const filteredData = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter desa berdasarkan searchTerm
    return currentKecamatan.desa_kelurahan.filter((item) =>
      item.name.toLowerCase().includes(lowerSearchTerm),
    );
  }, [currentKecamatan, searchTerm]);

  // Logic untuk Autocomplete Dropdown
  const desaRekomendasi = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return currentKecamatan.desa_kelurahan
      .filter((item) => item.name.toLowerCase().includes(lowerSearchTerm))
      .map((item) => item.name);
  }, [currentKecamatan, searchTerm]);

  // Handler untuk memilih desa dari rekomendasi
  const handleSelectDesa = (desa: string) => {
    setSearchTerm(desa);
    setShowDropdown(false);
  };

  // Sembunyikan dropdown saat klik di luar area pencarian
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  if (isLoading) {
    return (
      <motion.section
        className="py-24 px-4 flex justify-center items-center h-screen"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <FaSpinner className="animate-spin text-primary mr-3" size={32} />
        <span className="text-xl text-gray-700">
          Memuat data rekap donasi...
        </span>
      </motion.section>
    );
  }

  // Jangan return early jika recapData null, render UI di bawah dengan fallback

  // Render utama
  // fallback for kecamatan list if recapData is null
  const kecamatanList = recapData?.kecamatan ?? [];
  const isDataAvailable = kecamatanList.length > 0;

  return (
    <motion.section
      className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto max-w-7xl mt-20">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <p className="text-primary font-bold text-lg">Rekap Donasi</p>
          <h2 className="text-4xl font-bold text-gray-800">Per Wilayah</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Pilih kecamatan untuk melihat rekap donasi dari masing-masing desa.
            Gunakan fitur pencarian untuk memfilter desa.
          </p>
        </motion.div>

        {/* Filter and Search Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mb-10"
        >
          <div className="max-w-xl mx-auto">
            <label className="block text-gray-700 font-semibold mb-3">
              Pilih Data Wilayah
            </label>

            {/* Compact Month and Year Dropdowns - Side by Side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Month Dropdown */}
              <div className="relative">
                <select
                  className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  disabled={isLoadingMonths || isLoadingYears}
                >
                  {/* Always show "Semua Bulan" option */}
                  <option value={0}>Semua Bulan</option>
                  
                  {/* Only show months that are available in the database */}
                  {availableMonths.map((monthValue) => {
                    const monthObj = months.find(m => m.value === monthValue);
                    return monthObj && monthObj.value > 0 ? (
                      <option key={monthValue} value={monthValue}>
                        {monthObj.name}
                      </option>
                    ) : null;
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoadingMonths ? (
                    <FaSpinner className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <BiChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Year Dropdown */}
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
            </div>
            
            {/* Kecamatan Dropdown */}
            <div className="relative mb-4">
              <select
                className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                value={selectedKecamatan}
                onChange={handleKecamatanChange}
                disabled={isLoading || kecamatanList.length === 0}
              >
                {kecamatanList.length > 0 ? (
                  kecamatanList.map((kec) => (
                    <option key={kec.name} value={kec.name}>
                      {kec.name}
                    </option>
                  ))
                ) : (
                  <option value="">
                    {isLoading ? "Memuat data..." : "Tidak ada data kecamatan"}
                  </option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                {isLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <BiChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Autocomplete Search Input */}
            <div className="flex space-x-2" ref={searchRef}>
              <div className="relative grow">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama desa..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />

                {/* Autocomplete Dropdown */}
                {showDropdown && desaRekomendasi.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto"
                  >
                    {desaRekomendasi.map((desa) => (
                      <li
                        key={desa}
                        onClick={() => handleSelectDesa(desa)}
                        className="px-4 py-2 cursor-pointer hover:bg-green-50 flex justify-between items-center text-gray-800"
                      >
                        {desa}
                        {searchTerm.toLowerCase() === desa.toLowerCase() && (
                          <FaCheckCircle className="text-primary w-4 h-4" />
                        )}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchTerm("")}
                className="flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaTimes className="mr-1 w-3 h-3" />
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary"
          >
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
              <FaLeaf className="mr-2" /> Ringkasan Kecamatan
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-semibold">Kecamatan</span>
                <span className="font-bold text-gray-900">
                  : {currentKecamatan.name}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Total Donasi</span>
                <span className="font-bold text-gray-900">
                  : {formatRupiah(totalDonasi)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Jumlah Donatur</span>
                <span className="font-bold text-gray-900">
                  : {totalDonatur}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Persentase Donatur</span>
                <span className="font-bold text-gray-900">
                  : {persentaseDonatur}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Grafik Donasi */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-primary" /> Grafik Donasi
            </h3>
            <div className="grow">
              {isDataAvailable && filteredData.length > 0 ? (
                // Pass data in the same shape as before, but mapped from new API
                <DonationChart
                  data={filteredData.map((item) => ({
                    desa: item.name,
                    jumlahDonatur: item.total_donor,
                    totalDonasi: item.total_donation,
                  }))}
                  kecamatanName={currentKecamatan.name}
                />
              ) : isDataAvailable ? (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64 md:h-96">
                  <p className="text-gray-500 italic">
                    Tidak ada data desa untuk ditampilkan di grafik.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg h-64 md:h-96">
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Gagal Memuat Data Rekap Donasi
                  </h2>
                  <p className="text-gray-600 text-center px-4">
                    Terjadi kesalahan saat mengambil data. Silakan periksa koneksi internet Anda atau coba lagi nanti.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabel Donasi */}
        <motion.div
          variants={itemVariants}
          className="mt-8 bg-white p-6 rounded-xl shadow-lg overflow-x-auto"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaTable className="mr-2 text-primary" /> Tabel Donasi
          </h3>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-yellow-50 text-gray-800 text-sm font-semibold">
                <th className="py-3 px-4 border border-yellow-200">No</th>
                <th className="py-3 px-4 border border-yellow-200 text-left">
                  Desa
                </th>
                <th className="py-3 px-4 border border-yellow-200">
                  Jumlah Donatur
                </th>
                <th className="py-3 px-4 border border-yellow-200">
                  Total Donasi
                </th>
                <th className="py-3 px-4 border border-yellow-200">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const percentage =
                    totalDonasi > 0
                      ? ((item.total_donation / totalDonasi) * 100).toFixed(2)
                      : "0";
                  return (
                    <tr
                      key={item.name}
                      className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 border border-gray-200 text-center">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 text-center">
                        {item.total_donor}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 text-right font-semibold">
                        {formatRupiah(item.total_donation)}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 text-center">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    {searchTerm
                      ? `Tidak ada desa yang cocok dengan "${searchTerm}" di ${currentKecamatan.name}`
                      : `Pilih kecamatan untuk melihat rekap data.`}
                  </td>
                </tr>
              )}

              <tr className="bg-yellow-100 text-gray-800 font-bold text-base">
                <td
                  colSpan={2}
                  className="py-3 px-4 border border-gray-300 text-center"
                >
                  Total Keseluruhan
                </td>
                <td className="py-3 px-4 border border-gray-300 text-center">
                  {totalDonatur}
                </td>
                <td className="py-3 px-4 border border-gray-300 text-right">
                  {formatRupiah(totalDonasi)}
                </td>
                <td className="py-3 px-4 border border-gray-300 text-center">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RekapDonasi;