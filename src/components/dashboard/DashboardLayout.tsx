import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaBars, FaTimes, FaChartBar, FaReceipt, FaUsers, FaPaperPlane, FaEdit, FaChevronDown, FaHome } from "react-icons/fa";

// Data Type Navigasi Dashboard
interface NavItem {
  name: string;
  icon: React.ElementType;
  link: string;
  isHeader?: boolean;
}

const DASHBOARD_NAV: NavItem[] = [
  { name: "DASHBOARD UTAMA", icon: FaHome, link: "/dashboard" },
  { name: "TRANSPARANSI & ANALISIS", icon: FaChartBar, link: "/dashboard/visualisasi" },
  { name: "--- MANAJEMEN DATA ---", icon: FaChevronDown, link: "#", isHeader: true },
  { name: "Pencatatan Donasi (INFAQ/ZIS)", icon: FaReceipt, link: "/dashboard/transaksi" },
  { name: "Penyaluran Dana", icon: FaPaperPlane, link: "/dashboard/penyaluran" },
  { name: "Donatur & Penerima Manfaat", icon: FaUsers, link: "/dashboard/donatur-penerima" },
  { name: "--- PENGELOLAAN KONTEN ---", icon: FaChevronDown, link: "#", isHeader: true },
  { name: "Manajemen Berita/Blog", icon: FaEdit, link: "/dashboard/cms-berita" },
];

const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; activeLink: string }> = ({ isOpen, toggleSidebar, activeLink }) => {
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

      {/* Navigasi */}
      <nav className="flex-grow p-4 overflow-y-auto">
        {DASHBOARD_NAV.map((item, index) =>
          item.isHeader ? (
            <p key={index} className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 tracking-wider">
              {item.name.replace("--- ", "").replace(" ---", "")}
            </p>
          ) : (
            <motion.a
              key={index}
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay untuk Mobile - z-30  */}
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeLink={activeLink} />

      {/* Main Content Area - z-10 ( */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar Top */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md z-20">
          {" "}
          {/* z-20 untuk header */}
          <div className="flex items-center">
            {/* THamburger button utk mobile */}
            <button onClick={toggleSidebar} className="text-gray-800 mr-4 lg:hidden">
              <FaBars size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">Logout</button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
