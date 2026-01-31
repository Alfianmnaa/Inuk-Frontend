import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import layanan1 from "../../assets/landing/layanan/layanan1.jpg";
import layanan2 from "../../assets/landing/layanan/layanan2.jpg";
import layanan3 from "../../assets/landing/layanan/layanan3.jpg";
import layanan4 from "../../assets/landing/layanan/layanan4.jpg";
import layanan5 from "../../assets/landing/layanan/layanan5.jpg";
import layanan6 from "../../assets/landing/layanan/layanan6.jpg";

// Data Type Layanan
interface LayananItem {
  image: string;
  title: string;
  description: string;
}

const services: LayananItem[] = [
  {
    image: layanan1,
    title: "Santunan Kemanusiaan",
    description: "Menyalurkan infaq kepada anak yatim, dhuafa, dan keluarga kurang mampu untuk kebutuhan pokok dan kesejahteraan hidup.",
  },
  {
    image: layanan2,
    title: "Program Pendidikan",
    description: "Bantuan biaya pendidikan bagi siswa berprestasi namun kurang mampu, serta penyediaan alat belajar dan beasiswa.",
  },
  {
    image: layanan3,
    title: "Pemberdayaan Ekonomi",
    description: "Mendukung usaha mikro melalui pelatihan, bantuan modal, dan pembinaan UMKM agar lebih mandiri dan berdaya.",
  },
  {
    image: layanan4,
    title: "Pelayanan Kesehatan",
    description: "Memberikan layanan kesehatan gratis, pengobatan massal, dan bantuan obat-obatan untuk masyarakat pelosok.",
  },
  {
    image: layanan5,
    title: "Bantuan Bencana",
    description: "Respon cepat dalam penyaluran logistik, kebutuhan darurat, dan trauma healing bagi korban bencana alam.",
  },
  {
    image: layanan6,
    title: "Dakwah & Keagamaan",
    description: "Mendukung kegiatan dakwah, pembangunan sarana ibadah, dan peningkatan kualitas guru ngaji serta ustadz.",
  },
];

// Varian Container
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

// Varian Kartu
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const buttonHover = { scale: 1.05 };
const cardHover = { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" };

const Layanan: React.FC = () => {
  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-white" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div variants={cardVariants} className="text-center mb-16">
          <p className="text-primary font-semibold text-lg mb-2">Layanan Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Infaq untuk Umat & Kesejahteraan</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            Melalui INUK dari LAZISNU, kami menghadirkan berbagai layanan sosial dan pemberdayaan untuk menjangkau masyarakat yang membutuhkan secara langsung, transparan, dan penuh keberkahan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div key={index} variants={cardVariants} whileHover={cardHover} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col cursor-pointer transition-shadow duration-300">
              <div className="h-56 w-full overflow-hidden">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>

              <div className="p-6 flex flex-col grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm grow mb-4">{service.description}</p>

                <motion.a href="#" whileHover={buttonHover} whileTap={{ scale: 0.95 }} className="inline-block self-start mt-auto bg-primary text-white font-semibold py-2 px-6 rounded-full text-sm hover:bg-green-600 transition-colors">
                  Selengkapnya
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Layanan;
