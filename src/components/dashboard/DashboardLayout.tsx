import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaUsers, FaMapMarkerAlt, FaMosque, FaNewspaper, FaChartBar, FaMoneyBillWave, FaHandHoldingHeart, FaFileExport } from "react-icons/fa";
import { MdOutlineReceiptLong } from "react-icons/md";
import { ChevronDown, LogOut, Lock, User } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { logoutApi } from "../../services/AuthService";
import { getUserProfile } from "../../services/UserService";
import ChangePasswordModal from "./ui/ChangePasswordModal";

// ─── Navigation items ─────────────────────────────────────────────────────────

const DASHBOARD_NAV = [
  { name: "MENU INUK", isHeader: true, roles: ["user", "admin", "superadmin"] as const },
  { name: "Dashboard Utama", link: "/dashboard", icon: FaChartBar, roles: ["user", "admin", "superadmin"] as const },
  { name: "Pencatatan Donasi", link: "/dashboard/donation", icon: MdOutlineReceiptLong, roles: ["user"] as const },

  { name: "MENU ADMIN", isHeader: true, roles: ["admin", "superadmin"] as const },
  { name: "Pencatatan Infaq", link: "/dashboard/infaq", icon: FaMoneyBillWave, roles: ["admin", "superadmin"] as const },
  { name: "Manajemen Pengguna", link: "/dashboard/user-management", icon: FaUsers, roles: ["admin", "superadmin"] as const },
  { name: "Manajemen Wilayah", link: "/dashboard/region-management", icon: FaMapMarkerAlt, roles: ["admin", "superadmin"] as const },
  { name: "Manajemen Masjid", link: "/dashboard/masjid-management", icon: FaMosque, roles: ["admin", "superadmin"] as const },

  { name: "MENU ADMIN PUSAT", isHeader: true, roles: ["superadmin"] as const },
  { name: "Manajemen Admin", link: "/dashboard/admin-management", icon: FaUsers, roles: ["superadmin"] as const },
  { name: "Manajemen Berita/Blog", link: "/dashboard/cms-berita", icon: FaNewspaper, roles: ["superadmin"] as const },
  { name: "Manajemen Donatur", link: "/dashboard/donatur-management", icon: FaHandHoldingHeart, roles: ["admin", "superadmin"] as const },
  { name: "Export Data", link: "/dashboard/export", icon: FaFileExport, roles: ["admin", "superadmin"] as const },
];

// ─── Role label helpers ───────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Admin",
  superadmin: "Super Admin",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-blue-100 text-blue-700",
  admin: "bg-green-100 text-green-700",
  superadmin: "bg-purple-100 text-purple-700",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar: React.FC<{
  isOpen: boolean;
  toggleSidebar: () => void;
  activeLink: string;
  userRole: "user" | "admin" | "superadmin" | null;
}> = ({ isOpen, toggleSidebar, activeLink, userRole }) => (
  <motion.div
    initial={false}
    animate={{ x: typeof window !== "undefined" && window.innerWidth < 1024 ? (isOpen ? 0 : "-100%") : 0 }}
    transition={{ type: "tween", duration: 0.3 }}
    className="fixed lg:relative top-0 left-0 h-full w-64 bg-gray-900 z-40 lg:translate-x-0 transition-shadow shadow-2xl flex flex-col"
  >
    <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
      <h1 className="text-xl font-extrabold text-primary flex items-center">
        INUK <span className="text-white ml-1 font-light">Admin</span>
      </h1>
      <button onClick={toggleSidebar} className="text-gray-400 hover:text-white lg:hidden">
        <FaTimes size={20} />
      </button>
    </div>

    <nav className="grow p-4 overflow-y-auto">
      {DASHBOARD_NAV.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole as any))
      ).map((item, index) =>
        item.isHeader ? (
          <p key={index} className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 tracking-wider">
            {item.name.replace("--- ", "").replace(" ---", "")}
          </p>
        ) : (
          <motion.a
            key={item.link}
            href={item.link}
            className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
              activeLink === item.link
                ? "bg-primary text-white shadow-md"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </motion.a>
        )
      )}
    </nav>

    <div className="p-4 border-t border-gray-700/50 text-xs text-gray-500">
      <p>INUK Dashboard v1.0</p>
    </div>
  </motion.div>
);

// ─── DashboardLayout ──────────────────────────────────────────────────────────

const DashboardLayout: React.FC<{
  children: React.ReactNode;
  activeLink: string;
  pageTitle: string;
}> = ({ children, activeLink, pageTitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRegionVillage, setUserRegionVillage] = useState("Memuat...");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logout, userRole, token } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch region for user role
  useEffect(() => {
    if (userRole === "user" && token) {
      getUserProfile(token)
        .then((profile) => {
          const village = profile.desa_kelurahan || "belum ditetapkan";
          const subdistrict = profile.kecamatan || "N/A";
          const city = profile.kabupaten_kota || "N/A";
          const province = profile.provinsi || "N/A";
          setUserRegionVillage(village);
          localStorage.setItem("user_province", province);
          localStorage.setItem("user_city", city);
          localStorage.setItem("user_subdistrict", subdistrict);
          localStorage.setItem("user_village", village);
        })
        .catch(() => {
          setUserRegionVillage("Gagal Memuat Region");
          localStorage.removeItem("user_province");
          localStorage.removeItem("user_city");
          localStorage.removeItem("user_subdistrict");
          localStorage.removeItem("user_village");
        });
    } else {
      setUserRegionVillage("");
      localStorage.removeItem("user_province");
      localStorage.removeItem("user_city");
      localStorage.removeItem("user_subdistrict");
      localStorage.removeItem("user_village");
    }
  }, [userRole, token]);

  const statusText = useMemo(() => {
    const role = localStorage.getItem("userRole");
    const village = localStorage.getItem("user_village") || userRegionVillage;
    if (role === "user") return `login sebagai USER | Region: ${village}`;
    if (role === "admin") return `login sebagai ADMIN`;
    if (role === "superadmin") return `login sebagai SUPER ADMIN`;
    return "Guest";
  }, [userRegionVillage]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ── Logout: call backend first, then clear local state ──────────────────────
  const handleLogout = async () => {
    if (!token || !userRole || isLoggingOut) return;
    setIsLoggingOut(true);
    setIsDropdownOpen(false);
    try {
      // Fire-and-forget to server (logoutApi never throws)
      await logoutApi(token, userRole);
    } finally {
      // Always clear local state, regardless of server response
      logout();
      navigate("/");
    }
  };

  // ── After own-password change: forced logout ─────────────────────────────────
  const handlePasswordChanged = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeLink={activeLink}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top navbar */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md z-20">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-800 mr-4 lg:hidden">
              <FaBars size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
            {userRole && (
              <span className="ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hidden sm:inline-block">
                {statusText}
              </span>
            )}
          </div>

          {/* ── User dropdown (replaces the plain Logout button) ────────────── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              {/* Role badge */}
              {userRole && (
                <span
                  className={`hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    ROLE_COLORS[userRole] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ROLE_LABELS[userRole] ?? userRole}
                </span>
              )}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                >
                  {/* Change password */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Lock size={15} className="text-gray-400" />
                    Ganti Kata Sandi
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <svg className="animate-spin w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <LogOut size={15} />
                    )}
                    {isLoggingOut ? "Keluar..." : "Keluar"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
};

export default DashboardLayout;