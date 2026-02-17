import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";

// Komponen Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// PWA Install Prompt Component
import InstallPWA from "./components/InstallPWA";

import "./App.css";
import ScrollToTopButton from "./utils/ScrollToTopButton";
// import Register from "./pages/Register";
import Login from "./pages/Login";
import ArticleDetail from "./components/landing/ArticleDetail";
import DashboardRoutes from "./pages/Dashboard";

// Halaman Dummy untuk Router
const About = () => <div>Halaman Tentang</div>;
const Program = () => <div>Halaman Program</div>;
const News = () => <div>Halaman Berita</div>;
const Contact = () => <div>Halaman Kontak</div>;
const Donation = () => <div>Halaman Donasi</div>;

// Komponen Pembungkus untuk Halaman dengan Navbar & Footer
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      {/* PWA Install Prompt - shows when app is installable on Android */}
      <InstallPWA />

      <Routes>
        {/* Rute tanpa Navbar & Footer */}
        <Route path="/login" element={<Login />} />
        {/*<Route path="/register" element={<Register />} />*/}
        <Route path="/artikel/:slug" element={<ArticleDetail />} />

        {/* Rute dengan Navbar & Footer */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Landing />
            </MainLayout>
          }
        />
        <Route
          path="/tentang/*"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />
        <Route
          path="/program"
          element={
            <MainLayout>
              <Program />
            </MainLayout>
          }
        />
        <Route
          path="/berita"
          element={
            <MainLayout>
              <News />
            </MainLayout>
          }
        />
        <Route
          path="/kontak"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />
        <Route
          path="/donasi"
          element={
            <MainLayout>
              <Donation />
            </MainLayout>
          }
        />

        {/* Dashboard */}
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTopButton />
    </BrowserRouter>
  );
};

export default App;