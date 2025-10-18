import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaQuoteRight, FaStar } from "react-icons/fa";

import user from "../../assets/landing/testimoni/user.png";

// Data Type Testimoni
interface TestimonialItem {
  id: number;
  text: string;
  name: string;
  role: string;
  rating: number;
}

const ORIGINAL_TESTIMONI_DATA: TestimonialItem[] = [
  {
    id: 1,
    text: "Bantuan biaya pendidikan dari program INUK sangat membantu anak saya melanjutkan sekolah. Terima kasih kepada para donatur yang telah berbagi.",
    name: "Siti Aisyah",
    role: "Penerima Manfaat",
    rating: 5,
  },
  {
    id: 2,
    text: "Saya merasa tenang dan percaya menyalurkan infaq melalui INUK. Laporannya transparan dan jelas penggunaannya.",
    name: "Ahmad Fauzi",
    role: "Donatur Tetap",
    rating: 4,
  },
  {
    id: 3,
    text: "Saat usaha saya terpuruk, bantuan modal usaha kecil dari INUK membantu saya bangkit. Alhamdulillah, sekarang mulai stabil kembali.",
    name: "Pak Rahmat",
    role: "Penerima Bantuan UMKM",
    rating: 5,
  },
  {
    id: 4,
    text: "Kemudahan berdonasi secara digital sangat praktis. Saya bisa berinfaq kapan saja tanpa perlu repot ke kantor LAZISNU.",
    name: "Budi Santoso",
    role: "Donatur Digital",
    rating: 5,
  },
];

// Gandakan data untuk efek infinite loop
const TESTIMONI_DATA = [...ORIGINAL_TESTIMONI_DATA, ...ORIGINAL_TESTIMONI_DATA, ...ORIGINAL_TESTIMONI_DATA];
const ORIGINAL_DATA_LENGTH = ORIGINAL_TESTIMONI_DATA.length;

// --- Varian Framer Motion ---
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const Testimoni: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const getVisibleCards = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1); // 3 di lg, 2 di md, 1 di sm
  const getCardWidth = () => {
    if (!carouselRef.current) return 0;
    return carouselRef.current.offsetWidth / getVisibleCards();
  };

  // Infinite Scroll

  // Logic untuk menggeser
  const scroll = (direction: number) => {
    const cardWidth = getCardWidth();
    let newIndex = currentIndex + direction;

    const targetX = -newIndex * cardWidth;

    controls.start({ x: targetX, transition: { type: "spring", stiffness: 300, damping: 30 } }).then(() => {
      if (newIndex >= ORIGINAL_DATA_LENGTH) {
        const teleportIndex = newIndex - ORIGINAL_DATA_LENGTH;
        const teleportX = -teleportIndex * cardWidth;

        controls.start({ x: teleportX, transition: { duration: 0 } });
        setCurrentIndex(teleportIndex);
      } else if (newIndex < 0) {
        const teleportIndex = newIndex + ORIGINAL_DATA_LENGTH;
        const teleportX = -teleportIndex * cardWidth;

        controls.start({ x: teleportX, transition: { duration: 0 } });
        setCurrentIndex(teleportIndex);
      } else {
        setCurrentIndex(newIndex);
      }
    });
  };

  const handleNext = () => scroll(1);
  const handlePrev = () => scroll(-1);

  //Auto next slide
  useEffect(() => {
    if (ORIGINAL_DATA_LENGTH <= getVisibleCards()) return;

    const autoSlide = setInterval(handleNext, 5000);

    return () => clearInterval(autoSlide);
  }, [currentIndex]);

  // Boundary update (
  useEffect(() => {
    const updatePosition = () => {
      const cardWidth = getCardWidth();
      const targetX = -currentIndex * cardWidth;
      controls.start({ x: targetX, transition: { duration: 0 } });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [currentIndex]);

  // Handle drag end
  const handleDragEnd = () => {
    const cardWidth = getCardWidth();
    let proposedIndex = Math.round(-x.get() / cardWidth);
    scroll(proposedIndex - currentIndex);
  };

  // Render Bintang Rating
  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<FaStar key={i} className={`w-4 h-4 ${i < rating ? "text-green-500" : "text-gray-300"}`} />);
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  return (
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-white relative" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-lg mb-2">Testimoni</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Cerita dari Para Penerima & Donatur</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">Berikut adalah kesan dan pesan dari para donatur serta penerima manfaat program INUK. Mereka merasakan langsung dampak nyata dari infaq yang dikelola oleh LAZISNU.</p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <motion.button onClick={handlePrev} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 text-primary rounded-full shadow-lg hover:bg-gray-100 transition-colors hidden lg:block">
            <FaChevronLeft className="w-4 h-4" />
          </motion.button>

          <motion.button onClick={handleNext} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 text-primary rounded-full shadow-lg hover:bg-gray-100 transition-colors hidden lg:block">
            <FaChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Testimonial Cards Track */}
          <div ref={carouselRef} className="overflow-hidden">
            <motion.div drag="x" onDragEnd={handleDragEnd} animate={controls} style={{ x }} className="flex py-1" whileTap={{ cursor: "grabbing" }}>
              {TESTIMONI_DATA.map((item, index) => (
                <motion.div key={index} className="p-4 flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col h-full relative overflow-hidden">
                    <FaQuoteLeft className="absolute left-6 top-6 w-10 h-10 text-green-500/20" />
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img src={user} alt={item.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                      </div>
                    </div>

                    <p className="text-gray-700 text-center text-md mb-4 flex-grow">{item.text}</p>

                    <div className="flex justify-center mb-4">{renderRating(item.rating)}</div>

                    <div className="text-center border-t pt-4">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.role}</p>
                    </div>

                    <FaQuoteRight className="absolute right-6 bottom-6 w-10 h-10 text-green-500/20" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Testimoni;
