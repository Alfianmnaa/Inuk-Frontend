import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import gambar unggulan
import unggul1 from "../../assets/landing/keunggulan/unggul-1.jpg";
import unggul2 from "../../assets/landing/keunggulan/unggul-2.jpg";
import unggul3 from "../../assets/landing/keunggulan/unggul-3.jpg";
import unggul4 from "../../assets/landing/keunggulan/unggul-4.jpg";

// --- Data Keunggulan ---
interface KeunggulanItem {
  id: number;
  label: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
}

const KEUNGGULAN_DATA: KeunggulanItem[] = [
  {
    id: 1,
    label: "Amanah dan Transparan",
    title: "Kami Menjaga Amanah Anda",
    description: "Setiap dana infaq dikelola secara profesional dan disalurkan dengan penuh tanggung jawab melalui sistem pelaporan yang terbuka dan dapat diakses publik.",
    image: unggul1,
    buttonText: "Selengkapnya",
  },
  {
    id: 2,
    label: "Penyaluran Cepat dan Tepat Sasaran",
    title: "Tepat Sasaran dan Responsif",
    description: "INUK memiliki jaringan distribusi langsung ke masyarakat yang membutuhkan, baik melalui bantuan kemanusiaan, pendidikan, kesehatan, maupun ekonomi.",
    image: unggul2,
    buttonText: "Selengkapnya",
  },
  {
    id: 3,
    label: "Kemudahan Donasi Digital",
    title: "Infaq Kini Lebih Mudah",
    description: "Melalui QRIS, transfer bank, dan platform online, kini berdonasi tak perlu repot. Anda bisa menyalurkan kebaikan hanya dengan beberapa klik saja.",
    image: unggul3,
    buttonText: "Donasi Sekarang",
  },
  {
    id: 4,
    label: "Laporan dan Dokumentasi Rutin",
    title: "Laporan Berkala & Dokumentasi",
    description: "Kami menyediakan laporan bulanan, dokumentasi penyaluran, serta pelaporan real-time agar para donatur merasa yakin dan puas.",
    image: unggul4,
    buttonText: "Lihat Laporan",
  },
];

// --- Varian Framer Motion ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Varian untuk transisi konten (fade-in dan scale)
const contentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

// Varian untuk animasi scroll reveal (header)
const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Keunggulan: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const currentItem = KEUNGGULAN_DATA.find((item) => item.id === activeIndex) || KEUNGGULAN_DATA[0];

  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div variants={headerVariants} className="text-center mb-16">
          <p className="text-primary font-semibold text-lg mb-2">Keunggulan Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Manfaat Menunaikan Infaq bersama INUK</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            INUK hadir sebagai solusi penyalurkan infaq dengan amanah, transparan, dan berdampak. Kami tidak hanya menyalurkan, tetapi juga memastikan setiap rupiah membawa perubahan nyata bagi umat dan masyarakat yang membutuhkan.
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div variants={headerVariants} className="w-full bg-gray-50 p-4 md:p-8 rounded-xl shadow-xl space-y-4">
            {KEUNGGULAN_DATA.map((item) => {
              const isActive = item.id === activeIndex;
              return (
                <motion.div
                  key={item.id}
                  onClick={() => setActiveIndex(item.id)}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 md:p-5 rounded-lg border cursor-pointer transition-all duration-300 
                                        ${isActive ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"}
                                    `}
                >
                  <p className={`font-semibold text-lg ${isActive ? "text-white" : "text-gray-800"}`}>{item.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right Column*/}
          <div className="w-full h-full min-h-[400px] lg:min-h-0 relative flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={currentItem.id} variants={contentVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Dynamic Image */}
                  <motion.div
                    className="w-full rounded-xl overflow-hidden shadow-2xl transition-transform duration-500"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <img src={currentItem.image} alt={currentItem.title} className="w-full h-auto object-cover" />
                  </motion.div>

                  {/* Dynamic Text */}
                  <motion.div className="flex flex-col justify-center pt-4 md:pt-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{currentItem.title}</h3>
                    <p className="text-gray-600 mb-6">{currentItem.description}</p>
                    <motion.a
                      href="#"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block self-start bg-primary text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-green-600 transition-colors duration-300"
                    >
                      {currentItem.buttonText}
                    </motion.a>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Keunggulan;
