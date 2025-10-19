import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronUp } from "react-icons/fa";
import type { Variants } from "framer-motion";

// Varian Framer Motion untuk tombol muncul/hilang
const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-green-600 transition-colors"
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <FaChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
