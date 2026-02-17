import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import logo from "../../assets/landing/layout/logo2.png";

// Data Type Pengurus
interface PengurusItem {
  jabatan: string;
  nama: string | string[];
  isSectionHeader?: boolean;
}

const PENGURUS_DATA: PengurusItem[] = [
  { jabatan: "Ketua", nama: "Fiza Akbar, S.STP., M.Si" },
  { jabatan: "Wakil Ketua", nama: "H. Hasan Junaidi, S.Pd" },
  { jabatan: "Wakil Ketua", nama: "Sih Karyadi" },
  { jabatan: "Wakil Ketua", nama: "H. Suparno, SHI., MH" },
  { jabatan: "Sekretaris", nama: "Arif Mustaqiim, M.Pd.I" },
  { jabatan: "Wakil Sekretaris", nama: "Vera Fitri Apriliani, SE" },
  { jabatan: "Bendahara", nama: "Arum Nugroho, SE, MM" },
  // { jabatan: "Wakil Bendahara", nama: "Arum Nugroho, SE., MM" },
  { jabatan: "Bidang-bidang", nama: "", isSectionHeader: true },
  { jabatan: "Divisi Penghimpunan", nama: ["Mukhsin, S.Pd.I", "Saifuddin Nawawi, S.Pd.I"] },
  { jabatan: "Divisi Pendistribusian", nama: ["Muhammad Jamiludin, M.Pd", "Moh. Arifin, S.Pd.I, M.Pd.I"] },
  { jabatan: "Divisi Keuangan dan Pelaporan", nama: ["Zaenal Afifi, S.E., M.Si, Ak, CGAA", "Muhammad Ulin Niam, S.Pd"] },
  { jabatan: "Divisi Humas dan Publikasi", nama: ["Wahyu Huda, M.Pd", "Zamira Anwar, M.Pd"] },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const, when: "beforeChildren", staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TimKami: React.FC = () => {
  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-white" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <p className="text-primary font-semibold text-lg mb-2">Tim Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Kenali Sosok di Balik INUK</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">Tim INUK terdiri dari pengurus profesional dan relawan yang berkomitmen tinggi dalam mengelola dan menyalurkan infaq secara amanah, transparan, dan tepat sasaran.</p>
        </motion.div>

        {/* Info Kontak & Logo */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-start mb-4 md:mb-0">
            <img src={logo} alt="LAZISNU Kudus Logo" className="h-24 w-auto mr-4" />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-800">PENGURUS CABANG LEMBAGA AMIL ZAKAT INFAQ DAN SHADAQAH NAHDLATUL ULAMA KABUPATEN KUDUS</h3>
              <p className="text-sm text-gray-600 mt-1">Jl. Pramuka No. 20 Wungu Wetan Kudus</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-left md:text-right space-y-1">
            <p>0291 430201 - 439448</p>
            <p className="text-primary font-semibold">pcnukudusjateng@gmail.com</p>
            <p>www.nukudus.or.id</p>
          </div>
        </motion.div>

        {/* Lampiran SK dan Susunan Pengurus */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-sm text-gray-800 mb-10">
            <h4 className="font-bold text-base mb-4">Lampiran SK Pengurus Cabang Nahdlatul Ulama Kudus</h4>
            <div className="grid grid-cols-5 md:grid-cols-7 gap-y-1">
              <p className="col-span-2 md:col-span-1">Nomor</p>
              <p className="col-span-3 md:col-span-6">: 0129/PB.20/A.II.01.25/25/08/2025</p>

              <p className="col-span-2 md:col-span-1">Tanggal</p>
              <p className="col-span-3 md:col-span-6">: 1 Rabi'ul Awal 1447 H / 25 Agustus 2025 M</p>

              <p className="col-span-2 md:col-span-1">Tentang</p>
              <p className="col-span-3 md:col-span-6">:</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h4 className="text-base font-bold text-gray-800">SUSUNAN PENGURUS</h4>
            <p className="text-sm text-gray-600">LEMBAGA AMIL ZAKAT, INFAQ DAN SHADAQAH NAHDLATUL ULAMA (LAZISNU)</p>
            <p className="text-sm font-semibold text-gray-600">PCNU KABUPATEN KUDUS</p>
            <p className="text-sm font-bold text-gray-800 mt-1">MASA KHIDMAT 2025 - 2027 M</p>
          </div>
        </motion.div>

        {/* Tabel Susunan Pengurus*/}
        <motion.div variants={itemVariants} className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
          <div className="p-0">
            {PENGURUS_DATA.map((item, index) => (
              <div
                key={index}
                className={`flex text-sm transition-colors 
                                    ${item.isSectionHeader ? "bg-gray-50 font-bold text-gray-800" : "hover:bg-green-50/50 text-gray-700"}
                                    ${index === PENGURUS_DATA.length - 1 ? "" : "border-b border-gray-200"}
                                `}
              >
                {/* Jabatan (Kolom Kiri) */}
                <div
                  className={`w-1/3 md:w-1/4 p-3 pr-2 
                                        ${item.isSectionHeader ? "text-gray-800" : "text-gray-700"}
                                    `}
                >
                  {item.jabatan}
                </div>

                <div className="w-2/3 md:w-3/4 p-3 pl-2">
                  {item.isSectionHeader ? (
                    item.nama
                  ) : Array.isArray(item.nama) ? (
                    <ul className="list-none space-y-1">
                      {item.nama.map((nama, i) => (
                        <li key={i}>{i === 0 ? `: ${nama}` : nama}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.nama ? `: ${item.nama}` : ""}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TimKami;
