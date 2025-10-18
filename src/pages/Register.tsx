import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaPhoneAlt, FaLock, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import axios from "axios";

// Varian Framer Motion untuk seluruh halaman
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

// Varian untuk item di dalam form
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  // const { login } = useAuth();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Format nomor telepon ke format E.164 (cth: dari '0812' menjadi '+62812')
    let phoneInput = formData.phone;
    if (phoneInput.startsWith("0")) {
      phoneInput = `+62${phoneInput.substring(1)}`;
    } else if (!phoneInput.startsWith("+")) {
      phoneInput = `+62${phoneInput}`;
    }

    try {
      // 2. Kirim request ke backend Go
      await axios.post(`${VITE_API_URL}/register`, {
        name: formData.username,
        phone: phoneInput,
        password: formData.password,
      });

      // const { token } = response.data;
      // login(token, "user");
      toast.success("Pendaftaran berhasil! Mengarahkan ke Dashboard...");

      navigate("/login");
    } catch (error: any) {
      // 5. Handle Error dari Backend (response 400 Bad Request)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Pendaftaran gagal. Coba lagi.";
      toast.error(errorMsg);
      console.error("Registration Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="flex min-h-screen bg-white" variants={pageVariants} initial="initial" animate="animate">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <motion.div className="max-w-md w-full" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
          <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-gray-900 mb-2">
            Buat Akun Baru 👋
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600 mb-8">
            Daftarkan diri Anda untuk mulai berinfaq dan menebar manfaat bersama INUK.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama Lengkap */}
            <motion.div variants={itemVariants} className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Your Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </motion.div>

            {/* Input Nomor HP */}
            <motion.div variants={itemVariants} className="relative">
              <FaPhoneAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="Nomor Handphone (cth: 0812xxxx)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </motion.div>

            {/* Input Password dengan Toggle */}
            <motion.div variants={itemVariants} className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata Sandi"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={8}
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-12 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>

            {/* Tombol Register */}
            <motion.button
              variants={itemVariants}
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md
                ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-green-600"}
              `}
            >
              <span>{isLoading ? "Memproses..." : "Daftar Sekarang"}</span>
              {!isLoading && <FaArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>
          {/* Link Sudah Punya Akun */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-600">
              Sudah punya akun?
              <Link to="/login" className="text-primary font-semibold ml-1 hover:text-green-700 transition-colors">
                Masuk
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 items-center justify-center p-16 relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 leading-snug">
            Satu Langkah Menuju <br />
            <span className="text-primary">Kebaikan dan Kesejahteraan</span>
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">Bergabunglah dengan INUK untuk memastikan setiap infaq Anda dikelola secara profesional dan berdampak nyata bagi umat.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
