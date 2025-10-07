import React, { useState, useEffect } from "react";
import { FiLogIn, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import logo from "../../assets/landing/layout/logo.png";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa";
// Impor Link dan NavLink dari react-router-dom
import { Link, NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Kelas untuk tautan aktif (saat isScrolled TRUE)
  const activeClassScrolled = "text-gray-800 hover:text-primary !text-primary";
  // Kelas untuk tautan aktif (saat isScrolled FALSE)
  const activeClassTransparent = "text-white hover:text-primary !text-primary";
  // Kelas default untuk tautan (saat isScrolled TRUE)
  const defaultClassScrolled = "text-gray-800 hover:text-primary";
  // Kelas default untuk tautan (saat isScrolled FALSE)
  const defaultClassTransparent = "text-white hover:text-primary";

  // Fungsi untuk mendapatkan className berdasarkan status aktif dan scroll
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "font-semibold transition-colors duration-200";
    if (isScrolled) {
      return `${baseClass} ${isActive ? activeClassScrolled : defaultClassScrolled}`;
    } else {
      return `${baseClass} ${isActive ? activeClassTransparent : defaultClassTransparent}`;
    }
  };

  return (
    <nav className={` fixed w-full z-50 transition-all duration-300 ease-in-out ${isScrolled ? "bg-white shadow-md text-gray-800" : "bg-transparent text-white"}`}>
      {/* Top Bar */}
      {!isScrolled && (
        <div className={`md:px-12 sm:px-8 px-4 bg-white text-gray-600 transition-all duration-300 ease-in-out border-b border-gray-200 py-2 hidden md:block ${isScrolled ? "h-0 opacity-0 overflow-hidden " : "h-auto opacity-100"}`}>
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex space-x-4 text-sm">
              {/* Tetap <a> atau ganti Link jika ada rute internal */}
              <a href="#" className="flex items-center space-x-1 hover:text-primary transition-colors">
                <MdLocationOn size={16} className="mr-2 text-primary" />
                <span>Find A Location</span>
              </a>
              <a href="tel:+01234567890" className="flex items-center space-x-1 hover:text-primary transition-colors">
                <FaPhone size={16} className="mr-2 text-primary" />
                <span>+01234567890</span>
              </a>
              <a href="mailto:example@gmail.com" className="flex items-center space-x-1 hover:text-primary transition-colors">
                <MdEmail size={16} className="mr-2 text-primary" />
                <span>Example@gmail.com</span>
              </a>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link to="/register" className="flex items-center space-x-1 hover:text-primary transition-colors">
                {" "}
                {/* Menggunakan Link */}
                <FaUser size={16} className="mr-2 text-primary" />
                <span>Register</span>
              </Link>
              <Link to="/login" className="flex items-center space-x-1 hover:text-primary transition-colors">
                {" "}
                {/* Menggunakan Link */}
                <FiLogIn size={16} className="mr-2 text-primary" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="container mx-auto md:px-12 sm:px-8 px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="">
            <Link to="/" className="flex items-center text-primary md:text-4xl text-2xl font-bold">
              {" "}
              {/* Menggunakan Link */}
              <img src={logo} alt="INUK Logo" className="md:h-16 h-10 mr-2" />
              INUK
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex flex-grow justify-end items-center space-x-8">
            {/* Beranda - NavLink dengan 'end' agar hanya aktif di root '/' */}
            <NavLink to="/" end className={getNavLinkClass}>
              Beranda
            </NavLink>

            {/* Tentang - Gunakan NavLink untuk link utama dropdown */}
            <div className="relative group">
              <NavLink to="/tentang" className={({ isActive }) => `${getNavLinkClass({ isActive })} flex items-center`}>
                Tentang
                <FiChevronDown className="ml-1 text-xs transition-transform duration-300 group-hover:rotate-180" size={14} />
              </NavLink>
              {/* Dropdown Menu */}
              <div className={`absolute top-full mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300`}>
                <NavLink to="/tentang/sejarah" className={({ isActive }) => `block px-4 py-2 hover:bg-gray-100 rounded-t-md ${isActive ? "!bg-gray-100 !text-primary" : ""}`}>
                  Sejarah
                </NavLink>
                <NavLink to="/tentang/visi-misi" className={({ isActive }) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? "!bg-gray-100 !text-primary" : ""}`}>
                  Visi Misi
                </NavLink>
                <NavLink to="/tentang/tim-kami" className={({ isActive }) => `block px-4 py-2 hover:bg-gray-100 rounded-b-md ${isActive ? "!bg-gray-100 !text-primary" : ""}`}>
                  Tim Kami
                </NavLink>
              </div>
            </div>

            {/* Program, Berita, Kontak, Login - Menggunakan NavLink */}
            <NavLink to="/program" className={getNavLinkClass}>
              Program
            </NavLink>
            <NavLink to="/berita" className={getNavLinkClass}>
              Berita
            </NavLink>
            <NavLink to="/kontak" className={getNavLinkClass}>
              Kontak
            </NavLink>

            {/* Donasi - Menggunakan Link */}
            <Link to="/donasi" className="ml-6 px-5 py-2 rounded-full text-white bg-primary hover:bg-green-600 font-bold transition-colors">
              Donasi Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <Link to="/donasi" className="px-5 py-2 rounded-full text-white bg-primary hover:bg-green-600 font-bold transition-colors">
              {" "}
              {/* Menggunakan Link */}
              Donasi
            </Link>
            <button onClick={toggleMobileMenu} className="text-xl focus:outline-none">
              {isMobileMenuOpen ? <FiX className={isScrolled ? "text-gray-800" : "text-white"} size={24} /> : <FiMenu className={isScrolled ? "text-gray-800" : "text-white"} size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-0 left-0 w-full bg-white shadow-lg transform transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "translate-x-0 h-screen" : "-translate-x-full h-screen"}`}>
        <div className="container mx-auto px-4 py-4">
          <div onClick={toggleMobileMenu} className="flex justify-between items-center">
            <img src={logo} alt="INUK Logo" className="h-10" />
            <button className="text-xl text-gray-800 focus:outline-none">
              <FiX size={24} />
            </button>
          </div>
          <ul className="flex flex-col space-y-4 mt-6 text-gray-800 font-semibold text-lg">
            <li>
              {/* NavLink Mobile Beranda */}
              <NavLink to="/" end onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                Beranda
              </NavLink>
            </li>
            <li>
              <button onClick={toggleDropdown} className="w-full text-left flex items-center justify-between hover:text-primary">
                {/* Tidak perlu NavLink di button, cukup cek path untuk highlight text 'Tentang' */}
                <span>Tentang</span>
                <FiChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} size={16} />
              </button>
              <div className={`overflow-hidden transition-max-h duration-500 ease-in-out ${isDropdownOpen ? "max-h-40" : "max-h-0"}`}>
                <ul className="ml-4 mt-2 space-y-2 text-sm text-gray-600">
                  <li>
                    {/* NavLink Mobile Sejarah */}
                    <NavLink to="/tentang/sejarah" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                      Sejarah
                    </NavLink>
                  </li>
                  <li>
                    {/* NavLink Mobile Visi Misi */}
                    <NavLink to="/tentang/visi-misi" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                      Visi Misi
                    </NavLink>
                  </li>
                  <li>
                    {/* NavLink Mobile Tim Kami */}
                    <NavLink to="/tentang/tim-kami" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                      Tim Kami
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              {/* NavLink Mobile Program */}
              <NavLink to="/program" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                Program
              </NavLink>
            </li>
            <li>
              {/* NavLink Mobile Berita */}
              <NavLink to="/berita" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                Berita
              </NavLink>
            </li>
            <li>
              {/* NavLink Mobile Kontak */}
              <NavLink to="/kontak" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "!text-primary" : ""}`}>
                Kontak
              </NavLink>
            </li>
            <li className="mt-4">
              {/* Link Mobile Donasi */}
              <Link to="/donasi" onClick={toggleMobileMenu} className="block w-full text-center px-5 py-3 rounded-full text-white bg-primary hover:bg-green-600 font-bold transition-colors">
                Donasi Sekarang
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
