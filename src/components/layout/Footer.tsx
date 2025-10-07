import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronRight, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";

// --- Data Footer ---
const QUICK_LINKS = ["Tentang Kami", "Program", "Donasi", "Blog", "Kontak"];
const SUPPORT_LINKS = ["Kebijakan Privasi", "Syarat & Ketentuan", "Disclaimer", "Bantuan", "FAQ", "Hubungi Kami"];

// --- Varian Framer Motion ---
const footerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, staggerChildren: 0.1 },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const Footer: React.FC = () => {
  return (
    <motion.footer
      // Gaya Background Utama: #17303B
      style={{ backgroundColor: "#17303B" }}
      className="text-white relative"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      // Pemicu animasi saat footer mulai terlihat
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-4 max-w-7xl pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Kolom 1: Logo & Deskripsi */}
          <motion.div variants={linkVariants}>
            {/* Placeholder Logo INUK (Ganti dengan gambar jika tersedia) */}
            <div className="flex items-center text-2xl font-extrabold text-primary mb-4">INUK</div>
            <p className="text-sm text-gray-400 mb-6">INUK (Infaq NU Kudus) adalah program pengelolaan infaq yang amanah dan transparan, membantu umat untuk kesejahteraan bersama.</p>

            {/* Download Buttons */}
            <div className="flex space-x-3">
              {/* Apple Store Button */}
              <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors text-sm">
                Download on the App Store
              </motion.a>
              {/* Google Play Button */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // Gaya Background Hitam untuk Google Play
                style={{ backgroundColor: "#111111" }}
                className="flex items-center text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-colors text-sm"
              >
                Get it on Google Play
              </motion.a>
            </div>
          </motion.div>

          {/* Kolom 2: Quick Links */}
          <motion.div variants={linkVariants}>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((link, index) => (
                <motion.li key={index} variants={linkVariants}>
                  <a href="#" className="flex items-center text-gray-400 hover:text-primary transition-colors">
                    <FaChevronRight className="w-3 h-3 mr-2" />
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Kolom 3: Support */}
          <motion.div variants={linkVariants}>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {SUPPORT_LINKS.map((link, index) => (
                <motion.li key={index} variants={linkVariants}>
                  <a href="#" className="flex items-center text-gray-400 hover:text-primary transition-colors">
                    <FaChevronRight className="w-3 h-3 mr-2" />
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Kolom 4: Kontak Kami */}
          <motion.div variants={linkVariants}>
            <h3 className="text-lg font-bold mb-4">Kontak Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start text-gray-400">
                <FaMapMarkerAlt className="w-4 h-4 mr-3 mt-1 text-primary flex-shrink-0" />
                <address className="not-italic">Jl. KH. Wahid Hasyim No. 45, Kudus, Jawa Tengah</address>
              </li>
              <li className="flex items-center text-gray-400">
                <FaEnvelope className="w-4 h-4 mr-3 text-primary" />
                <a href="mailto:info@inuk-nukudus.org" className="hover:text-primary transition-colors">
                  info@inuk-nukudus.org
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <FaPhoneAlt className="w-4 h-4 mr-3 text-primary" />
                <a href="tel:+6285712345678" className="hover:text-primary transition-colors">
                  +62 857 1234 5678
                </a>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-6">
              <p className="text-gray-400 mb-2 font-semibold">@INUK.NUkudus</p>
              <div className="flex space-x-3">
                {/* Facebook/Twitter (Ganti dengan ikon yang tersedia jika FaFacebookF tidak cukup) */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-primary transition-colors">
                  <FaFacebookF className="w-4 h-4" />
                </a>
                {/* TikTok */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-primary transition-colors">
                  <FaTiktok className="w-4 h-4" />
                </a>
                {/* Instagram */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-primary transition-colors">
                  <FaInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Copyright Section */}
      <div style={{ backgroundColor: "#111111" }} className="py-4 text-gray-400 text-sm border-t border-gray-700/50">
        <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center">
          <p>© INUK : Infaq NU Kudus. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
