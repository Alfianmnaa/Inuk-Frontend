import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaReceipt, FaUsers, FaEdit, FaChevronDown, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/UserService"; // NEW: Import getUserProfile

// Data Type Navigasi Dashboard
interface NavItem {
  name: string;
  icon: React.ElementType;
  link: string;
  isHeader?: boolean;
  // NEW: Tentukan peran yang diizinkan
  roles?: ("user" | "admin" | "superadmin")[];
}

const DASHBOARD_NAV: NavItem[] = [
  { name: "DASHBOARD UTAMA", icon: FaHome, link: "/dashboard" },
  // { name: "TRANSPARANSI & ANALISIS", icon: FaChartBar, link: "/dashboard/visualisasi", roles: ["user", "admin"] },
  { name: "--- MENU INUK ---", icon: FaChevronDown, link: "#", isHeader: true },
  { name: "Pencatatan Donasi", icon: FaReceipt, link: "/dashboard/transaksi", roles: ["user", "admin", "superadmin"] },
  { name: "Manajemen Donatur", icon: FaUsers, link: "/dashboard/donatur-management", roles: ["user"] }, // HANYA UNTUK USER
  { name: "--- MENU ADMIN ---", icon: FaChevronDown, link: "#", isHeader: true, roles: ["admin", "superadmin"] },
  { name: "Manajemen Pengguna", icon: FaUsers, link: "/dashboard/user-management", roles: ["admin", "superadmin"] },
  { name: "Manajemen Wilayah", icon: FaMapMarkerAlt, link: "/dashboard/region-management", roles: ["admin", "superadmin"] },
  { name: "--- MENU ADMIN PUSAT ---", icon: FaChevronDown, link: "#", isHeader: true, roles: ["superadmin"] },
  { name: "Manajemen Admin", icon: FaUsers, link: "/dashboard/admin-management", roles: ["superadmin"] },
  { name: "Manajemen Berita/Blog", icon: FaEdit, link: "/dashboard/cms-berita", roles: ["superadmin"] },
];

// Sidebar menerima userRole baru
const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; activeLink: string; userRole: "user" | "admin" | "superadmin" | null }> = ({ isOpen, toggleSidebar, activeLink, userRole }) => {
  return (
    <motion.div
      initial={false}
      animate={{ x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : "-100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed lg:relative top-0 left-0 h-full w-64 bg-gray-900 z-40 lg:translate-x-0 transition-shadow shadow-2xl flex flex-col"
    >
      {/* Header Sidebar - Logo & Close Button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
        <h1 className="text-xl font-extrabold text-primary flex items-center">
          INUK <span className="text-white ml-1 font-light">Admin</span>
        </h1>
        {/* TClose Button Mobile */}
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-white lg:hidden">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Navigasi - Filter berdasarkan peran */}
      <nav className="grow p-4 overflow-y-auto">
        {DASHBOARD_NAV.filter((item) => !item.roles || (userRole && item.roles.includes(userRole))) // Logika Filter
          .map((item, index) =>
            item.isHeader ? (
              <p key={index} className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 tracking-wider">
                {item.name.replace("--- ", "").replace(" ---", "")}
              </p>
            ) : (
              <motion.a
                key={item.link}
                href={item.link}
                className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors mb-1
                                ${activeLink === item.link ? "bg-primary text-white shadow-md" : "text-gray-300 hover:bg-gray-800 hover:text-white"}
                            `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </motion.a>
            )
          )}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-gray-700/50 text-xs text-gray-500">
        <p>INUK Dashboard v1.0</p>
      </div>
    </motion.div>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode; activeLink: string; pageTitle: string }> = ({ children, activeLink, pageTitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRegionVillage, setUserRegionVillage] = useState("Memuat...");

  const { logout, userRole, token } = useAuth();
  const navigate = useNavigate();

  // NEW: Efek untuk mengambil data Region (Desa/Kelurahan) dan menyimpan ke LocalStorage
  useEffect(() => {
    if (userRole === "user" && token) {
      getUserProfile(token)
        .then((profile) => {
          const village = profile.desa_kelurahan || "belum ditetapkan";
          const subdistrict = profile.kecamatan || "N/A";
          const city = profile.kabupaten_kota || "N/A";
          const province = profile.provinsi || "N/A";

          setUserRegionVillage(village);

          // Simpan konteks region lengkap ke Local Storage
          localStorage.setItem("user_province", province);
          localStorage.setItem("user_city", city);
          localStorage.setItem("user_subdistrict", subdistrict);
          localStorage.setItem("user_village", village);
          // Hapus item lama yang mungkin ada
          localStorage.removeItem("user_id_temp_hack");
        })
        .catch(() => {
          setUserRegionVillage("Gagal Memuat Region");
          // Hapus data region di localStorage jika gagal fetch / user tidak terikat region
          localStorage.removeItem("user_province");
          localStorage.removeItem("user_city");
          localStorage.removeItem("user_subdistrict");
          localStorage.removeItem("user_village");
        });
    } else {
      setUserRegionVillage("");
      // Hapus data region lama dari Local Storage jika bukan user
      localStorage.removeItem("user_province");
      localStorage.removeItem("user_city");
      localStorage.removeItem("user_subdistrict");
      localStorage.removeItem("user_village");
    }
  }, [userRole, token]);

  // NEW: Logic untuk teks status di header
  const statusText = useMemo(() => {
    const role = localStorage.getItem("userRole");
    const village = localStorage.getItem("user_village") || userRegionVillage; // Fallback ke state lokal saat loading

    if (role === "user") {
      return `login sebagai USER | Region: ${village}`;
    }
    if (role === "admin") {
      return `login sebagai ADMIN`;
    }
    if (role === "superadmin") {
      return `login sebagai SUPER ADMIN`;
    }
    return "Guest";
  }, [userRegionVillage]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay untuk Mobile - z-30  */}
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}

      {/* Sidebar - Meneruskan userRole ke Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeLink={activeLink} userRole={userRole} />

      {/* Main Content Area - z-10 ( */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar Top */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md z-20">
          <div className="flex items-center">
            {/* THamburger button utk mobile */}
            <button onClick={toggleSidebar} className="text-gray-800 mr-4 lg:hidden">
              <FaBars size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>

            {/* NEW: Status Tag */}
            {userRole && <span className="ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hidden sm:inline-block">{statusText}</span>}
          </div>

          <button onClick={handleLogout} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
            Logout
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
