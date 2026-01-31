import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaPlayCircle, FaTiktok, FaInstagram, FaWallet, FaUsers } from "react-icons/fa";

import carousel1 from "../../assets/landing/hero/carousel-1.jpg";
import carousel2 from "../../assets/landing/hero/carousel-2.jpg";

// Data type untuk konten carousel
interface CarouselContent {
  title: string;
  subtitle: string;
  description: string;
}

const carouselContent: CarouselContent[] = [
  {
    title: "SELAMAT DATANG DI INUK",
    subtitle: "SALURKAN INFAQ UNTUK UMAT & KESEJAHTERAAN",
    description: "Bersama LAZISNU, setiap infaq Anda menjadi harapan bagi yang membutuhkan. INUK hadir untuk menjembatani kebaikan dengan amanah dan transparansi.",
  },
  {
    title: "PROGRAM INUK",
    subtitle: "MENEBAR MANFAAT LEWAT INFAQ ANDA",
    description: "Melalui program INUK, LAZISNU hadir menjadi solusi penyaluran infaq yang tepat guna, penuh keberkahan, dan menyentuh langsung masyarakat yang membutuhkan.",
  },
];

const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);

  const x = useMotionValue(0);
  const isCardLayout = currentIndex === 0;

  const images: string[] = [carousel1, carousel2];
  const currentContent = carouselContent[currentIndex];

  const handleNext = (): void => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = (): void => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // 1. Auto-slide Logic
  useEffect(() => {
    const interval = setInterval(handleNext, 8000);
    return () => clearInterval(interval);
  }, [currentIndex]); // Re-run effect saat currentIndex berubah

  const carouselVariants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: "0",
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const swipeConfidenceThreshold: number = 10000;

  const swipePower = (offset: number, velocity: number): number => {
    return Math.abs(offset) * velocity;
  };

  // Bouncing/floating pada gambar
  const bounceVariants: Variants = {
    initial: { opacity: 0, scale: 1 },
    animate: {
      opacity: 1,
      scale: [1, 1.05, 1],
      transition: {
        opacity: { duration: 0.8 },
        scale: {
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.8,
        },
      },
    },
    exit: { opacity: 0, scale: 1, transition: { duration: 0.8 } },
  };

  const textAlignClass = isCardLayout ? "text-left" : "text-center";
  const marginClass = isCardLayout ? "" : "mx-auto";

  // Handler onDragEnd
  const onContainerDragEnd = (_: any, { offset, velocity }: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      handleNext();
    } else if (swipe > swipeConfidenceThreshold) {
      handlePrev();
    }
    x.set(0);
  };

  return (
    <motion.section className="relative w-full h-screen overflow-hidden">
      {/* Background Images Bouncing/Floating Effect */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img key={currentIndex} src={images[currentIndex]} alt={`Carousel ${currentIndex + 1}`} className="absolute inset-0 w-full h-full object-cover" variants={bounceVariants} initial="initial" animate="animate" exit="exit" />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content Container */}
      <motion.div className="relative z-10 container mx-auto h-full flex items-center md:items-start p-4 sm:p-10 md:p-14 lg:p-28" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1} onDragEnd={onContainerDragEnd} style={{ x }}>
        <div
          className={`w-full flex flex-col items-center pt-16 md:pt-40 
            ${isCardLayout ? "md:flex-row" : "md:flex-col justify-center text-center"}
          `}
        >
          {/* 1. Left Cards Section */}
          <AnimatePresence>
            {isCardLayout && (
              <motion.div
                className="flex items-center gap-4 md:space-x-0 w-full justify-center md:w-1/3 mb-8 md:mb-0"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Total Donasi Card */}
                <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg w-1/2 md:w-48 xl:w-56 text-gray-800">
                  <FaWallet color="#10B981" size={50} className="mb-2" />
                  <p className="text-xl font-bold">Rp 0</p>
                  <p className="text-sm text-gray-500">Total Donasi</p>
                </div>
                {/* Total Donatur Card */}
                <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg w-1/2 md:w-48 xl:w-56 text-gray-800">
                  <FaUsers color="#3B82F6" size={50} className="mb-2" />
                  <p className="text-xl font-bold">0</p>
                  <p className="text-sm text-gray-500">Total Donatur</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Main Carousel Content Container */}
          <div
            className={`relative flex items-start h-full min-h-75 md:min-h-0 
              ${isCardLayout ? "w-full md:w-2/3 md:pl-20" : "w-full"} 
              ${isCardLayout ? "justify-start" : "justify-center"}
            `}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div key={currentIndex} custom={direction} variants={carouselVariants} initial="initial" animate="animate" exit="exit" className={`w-full flex flex-col justify-center ${textAlignClass}`}>
                <motion.p className={`text-primary font-bold mb-2 uppercase ${marginClass}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                  {currentContent.title}
                </motion.p>

                <motion.h1 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white ${marginClass}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                  {currentContent.subtitle}
                </motion.h1>

                <motion.p className={`text-base md:text-lg text-gray-300 max-w-2xl ${marginClass}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
                  {currentContent.description}
                </motion.p>

                <div className={`mt-8 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 ${isCardLayout ? "justify-start" : "justify-center"}`}>
                  <motion.button
                    className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full flex items-center space-x-2 transition-colors duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <FaPlayCircle size={20} className="text-primary" />
                    <span className="text-primary">Tonton Video</span>
                  </motion.button>
                  <motion.div className="flex space-x-4 mt-4 sm:mt-0 items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.5 }}>
                    <p className="text-gray-300 font-semibold">Ikuti Kami:</p>

                    <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <FaTiktok size={20} className="text-gray-800" />
                    </a>

                    <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <FaInstagram size={20} className="text-gray-800" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Carousel Navigation Arrows */}
      <motion.button
        onClick={handlePrev}
        className="absolute bottom-4 left-6 p-3 rounded-full bg-primary text-white hover:bg-green-600 transition-colors z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <FaChevronLeft size={24} />
      </motion.button>
      <motion.button
        onClick={handleNext}
        className="absolute bottom-4 left-20 p-3 rounded-full bg-primary text-white hover:bg-green-600 transition-colors z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <FaChevronRight size={24} />
      </motion.button>
    </motion.section>
  );
};

export default HeroSection;
