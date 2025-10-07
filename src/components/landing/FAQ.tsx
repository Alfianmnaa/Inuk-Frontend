import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

import faqpic from "../../assets/landing/faq/faq.jpg";

// Data type FAQ
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    question: "Apa itu INUK?",
    answer: "INUK (Infaq untuk Umat dan Kesejahteraan) adalah program infaq yang dikelola oleh LAZISNU, berfokus pada penyaluran dana infaq secara amanah, transparan, dan berdampak bagi umat.",
  },
  {
    id: 2,
    question: "Ke mana dana infaq saya disalurkan?",
    answer: "Dana infaq disalurkan untuk program pendidikan, kesehatan, pemberdayaan ekonomi, bantuan bencana, dan santunan yatim dan dhuafa di berbagai wilayah.",
  },
  {
    id: 3,
    question: "Apakah saya akan menerima laporan penggunaan infaq?",
    answer: "Ya. Setiap donatur akan mendapatkan laporan bulanan dan dokumentasi penyaluran melalui email, WhatsApp, atau dapat dilihat langsung di situs resmi kami.",
  },
  {
    id: 4,
    question: "Bagaimana cara berdonasi melalui INUK?",
    answer: "Anda dapat berdonasi melalui transfer bank, QRIS, atau menggunakan form donasi online di website ini. Proses cepat, mudah, dan bisa dilakukan kapan saja.",
  },
  {
    id: 5,
    question: "Apakah donasi saya bisa atas nama orang lain?",
    answer: "Bisa. Anda dapat berdonasi atas nama pribadi, keluarga, almarhum, ataupun lembaga. Cukup cantumkan nama dalam keterangan saat pengisian form donasi.",
  },
];

// Varian Framer Motion
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const, when: "beforeChildren" },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 } },
};

const FaqItemContentVariants: Variants = {
  open: { height: "auto", opacity: 1, transition: { type: "spring", duration: 0.4, bounce: 0 } },
  collapsed: { height: 0, opacity: 0, transition: { type: "spring", duration: 0.4, bounce: 0 } },
};

const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-white" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl ">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-lg mb-2">FAQs</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">Temukan jawaban atas pertanyaan umum seputar layanan, transparansi, dan kemudahan berdonasi melalui INUK. Kami hadir untuk memastikan infaq Anda sampai dan berdampak.</p>
        </div>

        {/* Main Content Area: FAQ List & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Kolom Kiri: FAQ Accordion Container */}
          <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1, delay: 0.4 }} className="w-full space-y-2 p-6 rounded-xl bg-gray-50">
            {FAQ_DATA.map((item) => {
              const isOpen = item.id === openId;
              return (
                <motion.div key={item.id} layout className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Question Button */}
                  <motion.button
                    layout
                    onClick={() => toggleFaq(item.id)}
                    className={`flex justify-between items-center w-full p-4 md:p-5 text-left font-semibold transition-colors duration-300
                                            ${isOpen ? "bg-green-50 text-primary" : "text-gray-800 hover:bg-gray-50"}
                                        `}
                  >
                    <span>{item.question}</span>
                    <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                  </motion.button>

                  {/* Answer Content (Animated) */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="content" initial="collapsed" animate="open" exit="collapsed" variants={FaqItemContentVariants} className="px-4 pb-4 md:px-5 md:pb-5 pt-0 text-gray-600">
                        <p>{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Kolom Kanan: Gambar */}
          <motion.div variants={imageVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full flex justify-center lg:justify-start">
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl h-full min-h-[400px]">
              <img src={faqpic} alt="Donasi Infaq" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default FAQ;
