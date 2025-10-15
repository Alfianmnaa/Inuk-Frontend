import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const [showPassword, setShowPassword] = useState(false); // Menggunakan phone karena fokus hanya pada phone
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }; // Handler Pembantu untuk mencoba login ke endpoint tertentu

  const attemptLogin = async (endpoint: string, role: "user" | "admin") => {
    // 1. Konversi Nomor HP ke format +62 di SISI FRONTEND (wajib karena backend Go perlu +62)
    let phoneInput = formData.phone;
    if (phoneInput.startsWith("0")) {
      phoneInput = `+62${phoneInput.substring(1)}`;
    } else if (!phoneInput.startsWith("+")) {
      phoneInput = `+62${phoneInput}`;
    }

    const payload = {
      phone: phoneInput,
      password: formData.password,
    }; // Mengirim request

    const response = await axios.post(`${VITE_API_URL}${endpoint}`, payload); // Jika berhasil, simpan token dan role
    const { token } = response.data;
    login(token, role);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let success = false;
    let finalError = "Login gagal. Periksa Nomor HP dan Kata Sandi.";

    try {
      // --- LOGIKA DUAL ENDPOINT ---

      // 1. /login
      try {
        await attemptLogin("/login", "user");
        success = true;
      } catch (error: any) {
        finalError = error.response?.data?.message || error.response?.data?.error || finalError;

        if (finalError.includes("Invalid password") || finalError.includes("invalid_credentials")) {
          try {
            await attemptLogin("/admin/login", "admin");
            success = true;
          } catch (adminError: any) {
            // Simpan error final dari percobaan admin
            finalError = adminError.response?.data?.message || adminError.response?.data?.error || finalError;
          }
        }
      }
      if (success) {
        toast.success("Login berhasil! Mengarahkan ke Dashboard...");
        navigate("/dashboard");
      } else {
        // Lempar error jika kedua percobaan gagal
        console.log("finalError admin:", finalError);
        throw new Error(finalError);
      }
    } catch (error: any) {
      // Menampilkan error yang paling relevan
      toast.error(finalError);
      console.error("Login Error:", error.message);
    } finally {
      setIsLoading(false);
    }
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
                placeholder="Nomor Handphone (cth: 0812xxxx)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
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
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md
                ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-green-600"}
              `}
            >
              <span>{isLoading ? "Memproses..." : "Masuk"}</span>
              {!isLoading && <FaArrowRight className="w-4 h-4" />}
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
