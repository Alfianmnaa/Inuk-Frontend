import React from "react";
import { motion } from "framer-motion";

import program1 from "../../assets/landing/program/program1.jpg";
import program2 from "../../assets/landing/program/program2.png";
import program3 from "../../assets/landing/program/program3.jpg";
import program4 from "../../assets/landing/program/program4.jpg";

// Data Type Program
interface ProgramItem {
  image: string;
  title: string;
  description: string;
}

const programs: ProgramItem[] = [
  {
    image: program1,
    title: "INUK",
    description: "Program donasi infaq yang dikelola oleh NU Kudus untuk mendukung pendidikan, kesehatan, dan kegiatan sosial keumatan.",
  },
  {
    image: program2,
    title: "Mobil Layanan Ummat (MLU)",
    description: "Layanan mobil gratis untuk masyarakat yang membutuhkan, mulai dari kesehatan, edukasi, hingga berbagai bantuan darurat langsung ke lokasi.",
  },
  {
    image: program3,
    title: "Diklat Tani",
    description: "Program pelatihan dan pendampingan bagi petani lokal untuk meningkatkan kualitas hasil panen, efisiensi, dan kesejahteraan ekonomi.",
  },
  {
    image: program4,
    title: "Beasiswa Pendidikan",
    description: "Bantuan beasiswa bagi pelajar dan mahasiswa dari keluarga kurang mampu untuk memastikan akses pendidikan yang merata dan berkualitas.",
  },
];

// Varian Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.15,
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Program: React.FC = () => {
  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-white" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <p className="text-primary font-semibold text-lg mb-2">Program Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Program Unggulan INUK - LAZISNU</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            INUK (Infaq untuk Umat dan Kesejahteraan) adalah program dari LAZISNU yang berkomitmen untuk menyalurkan infaq secara amanah, transparan, dan tepat sasaran guna mendukung kesejahteraan umat.
          </p>
        </motion.div>

        {/* Program Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              className="flex flex-col cursor-pointer transition-shadow duration-300 group"
            >
              <div className="relative w-full overflow-hidden rounded-lg shadow-xl">
                <img src={program.image} alt={program.title} className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105" />
              </div>

              <div className="pt-6 py-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 px-4">{program.title}</h3>
                <p className="text-gray-600 px-4">{program.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Program;
