import React, { useState } from "react";
import { FiLogIn, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/landing/layout/logo.png";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "font-semibold transition-colors duration-200";
    return `${baseClass} ${isActive ? "text-primary" : "text-gray-800 hover:text-primary"}`;
  };

  return (
    <nav className="fixed w-full z-50 bg-white shadow-md text-gray-800">
      {/* Top Bar */}
      <div className="md:px-12 sm:px-8 px-4 bg-white text-gray-600 border-b border-gray-200 py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-4 text-sm">
            <a href="https://maps.app.goo.gl/uYPUymjKpE5fWDKf7" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <MdLocationOn size={16} className="mr-2 text-primary" />
              <span>Find A Location</span>
            </a>
            <a href="tel:+628112893345" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <FaPhone size={16} className="mr-2 text-primary" />
              <span>+62 811-2893-345</span>
            </a>
            <a href="mailto:info@inuk-nukudus.org" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <MdEmail size={16} className="mr-2 text-primary" />
              <span>info@inuk-nukudus.org</span>
            </a>
          </div>
          <div className="flex space-x-4 text-sm">
            <Link to="/login" className="flex items-center space-x-1 hover:text-primary transition-colors">
              {" "}
              {/* Menggunakan Link */}
              <FiLogIn size={16} className="mr-2 text-primary" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto md:px-12 sm:px-8 px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center text-primary md:text-4xl text-2xl font-bold">
              <img src={logo} alt="INUK Logo" className="md:h-16 h-10 mr-2" />
              INUK
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex grow justify-end items-center space-x-8">
            <NavLink to="/" end className={getNavLinkClass}>
              Beranda
            </NavLink>

            <Link to="/donasi" className="ml-6 px-5 py-2 rounded-full text-white bg-primary hover:bg-green-600 font-bold transition-colors">
              Donasi Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <Link to="/donasi" className="px-5 py-2 rounded-full text-white bg-primary hover:bg-green-600 font-bold transition-colors">
              Donasi
            </Link>
            <button onClick={toggleMobileMenu} className="text-xl focus:outline-none">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-0 left-0 w-full bg-white shadow-lg transform transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "translate-x-0 h-screen" : "-translate-x-full h-screen"}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <img src={logo} alt="INUK Logo" className="h-10" />
            <button onClick={toggleMobileMenu} className="text-xl text-gray-800 focus:outline-none">
              <FiX size={24} />
            </button>
          </div>

          <ul className="flex flex-col space-y-4 mt-6 text-gray-800 font-semibold text-lg">
            <li>
              <NavLink to="/" end onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "text-primary!" : ""}`}>
                Beranda
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "text-primary!" : ""}`}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" onClick={toggleMobileMenu} className={({ isActive }) => `block hover:text-primary ${isActive ? "text-primary!" : ""}`}>
                Register
              </NavLink>
            </li>
            <li className="mt-4">
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
