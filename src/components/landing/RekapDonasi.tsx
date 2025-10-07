import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChartBar, FaTable, FaSearch, FaTimes, FaLeaf, FaCheckCircle } from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import DonationChart from "../../utils/DonationChart";

// Data Type Donation Data
interface DonationData {
  desa: string;
  jumlahDonatur: number;
  totalDonasi: number;
}

interface KecamatanData {
  nama: string;
  data: DonationData[];
}

const KECAMATAN_DATA: KecamatanData[] = [
  {
    nama: "JEKULO",
    data: [
      { desa: "BULUNG CANGKRING", jumlahDonatur: 15, totalDonasi: 4500000 },
      { desa: "HADIPOLO", jumlahDonatur: 30, totalDonasi: 8000000 },
      { desa: "SIDOMULYO", jumlahDonatur: 10, totalDonasi: 2500000 },
      { desa: "GONDOSARI", jumlahDonatur: 5, totalDonasi: 1500000 },
      { desa: "KANDANGMAS", jumlahDonatur: 25, totalDonasi: 7000000 },
    ],
  },
  {
    nama: "KOTA KUDUS",
    data: [
      { desa: "DEMAAN", jumlahDonatur: 50, totalDonasi: 15000000 },
      { desa: "BARONGAN", jumlahDonatur: 40, totalDonasi: 12000000 },
      { desa: "JANGGALAN", jumlahDonatur: 20, totalDonasi: 6500000 },
      { desa: "KRANDON", jumlahDonatur: 15, totalDonasi: 4000000 },
    ],
  },
  {
    nama: "DAWE",
    data: [
      { desa: "PUDAK", jumlahDonatur: 12, totalDonasi: 3200000 },
      { desa: "CENDONO", jumlahDonatur: 18, totalDonasi: 5500000 },
      { desa: "KIRIG", jumlahDonatur: 22, totalDonasi: 6000000 },
    ],
  },
];

// Fungsi format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

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
  const defaultKecamatan = KECAMATAN_DATA[0].nama;
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(defaultKecamatan);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Temukan data kecamatan yang dipilih
  const currentKecamatan = useMemo(() => {
    return KECAMATAN_DATA.find((k) => k.nama === selectedKecamatan) || { nama: "N/A", data: [] };
  }, [selectedKecamatan]);

  // Hitung total keseluruhan
  const totalDonasi = currentKecamatan.data.reduce((sum, item) => sum + item.totalDonasi, 0);
  const totalDonatur = currentKecamatan.data.reduce((sum, item) => sum + item.jumlahDonatur, 0);

  // Total donatur di semua kecamatan
  const totalGlobalDonatur = useMemo(() => {
    return KECAMATAN_DATA.reduce((sum, kec) => sum + kec.data.reduce((s, d) => s + d.jumlahDonatur, 0), 0);
  }, []);

  // Hitung persentase donatur
  const persentaseDonatur = totalGlobalDonatur > 0 ? ((totalDonatur / totalGlobalDonatur) * 100).toFixed(2) : 0;

  // Data yang sudah difilter
  const filteredData = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter desa berdasarkan searchTerm
    const filteredDesa = currentKecamatan.data.filter((item) => item.desa.toLowerCase().includes(lowerSearchTerm));

    if (!searchTerm || filteredDesa.length > 0) {
      return filteredDesa;
    }
    return [];
  }, [currentKecamatan, searchTerm]);

  // Logic untuk Autocomplete Dropdown
  const desaRekomendasi = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return currentKecamatan.data.filter((item) => item.desa.toLowerCase().includes(lowerSearchTerm)).map((item) => item.desa);
  }, [currentKecamatan, searchTerm]);

  // Handler untuk memilih desa dari rekomendasi
  const handleSelectDesa = (desa: string) => {
    setSearchTerm(desa);
    setShowDropdown(false);
  };

  // Sembunyikan dropdown saat klik di luar area pencarian
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 " variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <p className="text-primary font-bold text-lg">Rekap Donasi</p>
          <h2 className="text-4xl font-bold text-gray-800">Per Wilayah</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Pilih kecamatan untuk melihat rekap donasi dari masing-masing desa. Gunakan fitur pencarian untuk memfilter desa.</p>
        </motion.div>

        {/* Filter and Search Section */}
        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mb-10">
          <div className="max-w-xl mx-auto">
            <label className="block text-gray-700 font-semibold mb-2">Pilih Kecamatan</label>
            <div className="relative mb-4">
              <select
                className="block w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                value={selectedKecamatan}
                onChange={(e) => {
                  setSelectedKecamatan(e.target.value);
                  setSearchTerm("");
                }}
              >
                {KECAMATAN_DATA.map((kec) => (
                  <option key={kec.nama} value={kec.nama}>
                    {kec.nama}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <BiChevronDown className="w-5 h-5" />
              </div>
            </div>

            {/* Autocomplete Search Input */}
            <div className="flex space-x-2" ref={searchRef}>
              <div className="relative flex-grow">
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
                      <li key={desa} onClick={() => handleSelectDesa(desa)} className="px-4 py-2 cursor-pointer hover:bg-green-50 flex justify-between items-center text-gray-800">
                        {desa}
                        {searchTerm.toLowerCase() === desa.toLowerCase() && <FaCheckCircle className="text-primary w-4 h-4" />}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSearchTerm("")} className="flex items-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                <FaTimes className="mr-1 w-3 h-3" />
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
              <FaLeaf className="mr-2" /> Ringkasan Kecamatan
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-semibold">Kecamatan</span>
                <span className="font-bold text-gray-900">: {currentKecamatan.nama}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Total Donasi</span>
                <span className="font-bold text-gray-900">: {formatRupiah(totalDonasi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Jumlah Donatur</span>
                <span className="font-bold text-gray-900">: {totalDonatur}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Persentase Donatur</span>
                <span className="font-bold text-gray-900">: {persentaseDonatur}%</span>
              </div>
            </div>
          </motion.div>

          {/* Grafik Donasi */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-primary" /> Grafik Donasi
            </h3>
            <div className="flex-grow">
              {filteredData.length > 0 ? (
                <DonationChart data={filteredData} kecamatanName={currentKecamatan.nama} />
              ) : (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64 md:h-96">
                  <p className="text-gray-500 italic">Tidak ada data desa untuk ditampilkan di grafik.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabel Donasi */}
        <motion.div variants={itemVariants} className="mt-8 bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaTable className="mr-2 text-primary" /> Tabel Donasi
          </h3>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-yellow-50 text-gray-800 text-sm font-semibold">
                <th className="py-3 px-4 border border-yellow-200">No</th>
                <th className="py-3 px-4 border border-yellow-200 text-left">Desa</th>
                <th className="py-3 px-4 border border-yellow-200">Jumlah Donatur</th>
                <th className="py-3 px-4 border border-yellow-200">Total Donasi</th>
                <th className="py-3 px-4 border border-yellow-200">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const percentage = totalDonasi > 0 ? ((item.totalDonasi / totalDonasi) * 100).toFixed(2) : 0;
                  return (
                    <tr key={item.desa} className="text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border border-gray-200 text-center">{index + 1}</td>
                      <td className="py-3 px-4 border border-gray-200 font-medium">{item.desa}</td>
                      <td className="py-3 px-4 border border-gray-200 text-center">{item.jumlahDonatur}</td>
                      <td className="py-3 px-4 border border-gray-200 text-right font-semibold">{formatRupiah(item.totalDonasi)}</td>
                      <td className="py-3 px-4 border border-gray-200 text-center">{percentage}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    {searchTerm ? `Tidak ada desa yang cocok dengan "${searchTerm}" di ${currentKecamatan.nama}` : `Pilih desa untuk melihat rekap data.`}
                  </td>
                </tr>
              )}

              <tr className="bg-yellow-100 text-gray-800 font-bold text-base">
                <td colSpan={2} className="py-3 px-4 border border-gray-300 text-center">
                  Total Keseluruhan
                </td>
                <td className="py-3 px-4 border border-gray-300 text-center">{totalDonatur}</td>
                <td className="py-3 px-4 border border-gray-300 text-right">{formatRupiah(totalDonasi)}</td>
                <td className="py-3 px-4 border border-gray-300 text-center">100%</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RekapDonasi;
