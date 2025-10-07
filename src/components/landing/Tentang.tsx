import React from "react";
import { motion } from "framer-motion";
import { FaHeart, FaChartLine, FaPhoneAlt } from "react-icons/fa";
import laziznu from "../../assets/landing/tentang/laziznu.jpg";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.15,
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const hoverScale = { scale: 1.03 };

const Tentang: React.FC = () => {
  return (
    <motion.section className="py-16 md:py-24 bg-white px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <div className="container  mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          <div className="order-2 lg:order-1">
            <motion.p variants={itemVariants} className="text-primary font-semibold text-lg mb-2">
              Tentang Kami
            </motion.p>

            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
              Bersama LAZISNU, Wujudkan Kepedulian Lewat
              <span className="text-primary"> INUK</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-gray-500 md:text-base text-[15px] mb-8 ">
              INUK (Infaq untuk Umat dan Kesejahteraan) adalah program unggulan dari LAZISNU yang hadir untuk menjembatani kebaikan Anda kepada mereka yang membutuhkan. Dengan semangat gotong royong dan kepedulian, kami mendorong masyarakat
              untuk berinfaq secara mudah, transparan, dan berdampak nyata.
            </motion.p>

            {/* Keunggulan (Grid 2 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-10">
              <motion.div variants={itemVariants} whileHover={hoverScale} className="flex flex-col p-4 rounded-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-2">
                  <FaHeart className="text-primary w-6 h-6" />
                  <h4 className="text-xl font-bold text-gray-900">Infaq yang Amanah</h4>
                </div>
                <p className="text-gray-600 text-sm">Setiap donasi dikelola secara profesional dan disalurkan tepat sasaran.</p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={hoverScale} className="flex flex-col p-4 rounded-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-2">
                  <FaChartLine className="text-primary w-6 h-6" />
                  <h4 className="text-xl font-bold text-gray-900">Transparan dan Terpercaya</h4>
                </div>
                <p className="text-gray-600 text-sm">Pelaporan berkala untuk memastikan kepercayaan dan keberlanjutan program.</p>
              </motion.div>
            </div>

            {/* Call to Action & Kontak */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <motion.button variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-green-600 transition-colors duration-300">
                Gabung Sekarang
              </motion.button>

              <motion.div variants={itemVariants} className="flex items-center space-x-2">
                <FaPhoneAlt className="text-primary w-5 h-5" />
                <p className="text-gray-800 font-semibold">
                  Hubungi Kami <br /> +6281326022762
                </p>
              </motion.div>
            </div>
          </div>

          <motion.div variants={itemVariants} className="order-1 lg:order-2 flex justify-center lg:justify-end" whileHover={{ scale: 1.01 }}>
            <div className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
              <img src={laziznu} alt="Kampanye NU CARE LAZISNU" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Tentang;
