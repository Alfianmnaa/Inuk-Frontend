import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Login berhasil! 🎉");
  };

  return (
    <motion.div className="flex min-h-screen bg-white" variants={pageVariants} initial="initial" animate="animate">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <motion.div className="max-w-md w-full" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
          <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-gray-900 mb-2">
            Selamat Datang Kembali 👋
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600 mb-8">
            Masuk ke akun Anda untuk melanjutkan berinfaq dan menebar manfaat bersama INUK.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama/No HP */}
            <motion.div variants={itemVariants} className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nama atau Nomor Handphone"
                required
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </motion.div>

            {/* Input Password */}
            <motion.div variants={itemVariants} className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata Sandi"
                required
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-12 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>

            {/* Tombol Login */}
            <motion.button
              variants={itemVariants}
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Masuk</span>
              <FaArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Link Belum Punya Akun */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-600">
              Belum punya akun?
              <Link to="/register" className="text-primary font-semibold ml-1 hover:text-green-700 transition-colors">
                Daftar
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 items-center justify-center p-16 relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 leading-snug">
            Selangkah Lagi Menuju <br />
            <span className="text-primary">Kebaikan dan Kesejahteraan</span>
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">Masuk untuk melanjutkan perjalanan kebaikan Anda bersama INUK.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
