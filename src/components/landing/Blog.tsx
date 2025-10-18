import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaUser, FaCalendarAlt } from "react-icons/fa";

// Import dummy gambar
import blog1 from "../../assets/landing/blog/blog1.jpg";
import blog2 from "../../assets/landing/blog/blog2.jpg";
import blog3 from "../../assets/landing/blog/blog3.jpg";
import blog4 from "../../assets/landing/blog/blog4.jpg";

// Data Type Blog
interface BlogItem {
  id: number;
  image: string;
  category: string;
  categoryColor: string; // Tailwind color class
  title: string;
  description: string;
  author: string;
  date: string;
}

const ORIGINAL_BLOG_DATA: BlogItem[] = [
  {
    id: 1,
    image: blog1,
    category: "Kisah Nyata",
    categoryColor: "bg-green-600",
    title: "Dari Infaq ke Harapan: Kisah Ibu Siti",
    description: "Ibu Siti, janda dengan tiga anak, kini memiliki usaha kecil berkat program infaq pemberdayaan ekonomi dari INUK. Kisahnya menjadi inspirasi bagi kita semua.",
    author: "Admin",
    date: "26 Juni 2025",
  },
  {
    id: 2,
    image: blog2,
    category: "Infaq & Kesehatan",
    categoryColor: "bg-green-700",
    title: "Layanan Kesehatan Gratis Lewat Infaq",
    description: "LAZISNU INUK mengadakan pengobatan gratis bagi masyarakat prasejahtera. Infaq Anda menjadi jalan kesembuhan bagi mereka yang membutuhkan.",
    author: "Admin",
    date: "19 Juni 2025",
  },
  {
    id: 3,
    image: blog3,
    category: "Literasi ZIS",
    categoryColor: "bg-blue-500",
    title: "Apa Perbedaan Infaq, Zakat, dan Sedekah?",
    description: "Edukasi dasar tentang konsep ZIS (Zakat, Infaq, Sedekah) agar umat lebih paham perannya dalam pembangunan sosial dan ekonomi umat Islam.",
    author: "Admin",
    date: "10 Juni 2025",
  },
  {
    id: 4,
    image: blog4,
    category: "Pendidikan",
    categoryColor: "bg-red-500",
    title: "Infaq Beasiswa: Mewujudkan Mimpi Anak Bangsa",
    description: "Dampak positif infaq beasiswa dalam membantu akses pendidikan. Setiap rupiah infaq adalah investasi masa depan generasi muda.",
    author: "Admin",
    date: "01 Juni 2025",
  },
];

// Gandakan data untuk efek infinite loop
const BLOG_DATA = [...ORIGINAL_BLOG_DATA, ...ORIGINAL_BLOG_DATA, ...ORIGINAL_BLOG_DATA];
const ORIGINAL_DATA_LENGTH = ORIGINAL_BLOG_DATA.length;

// Varian Framer Motion
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const Blog: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Perhitungan untuk drag/swipe
  // const [bounds, setBounds] = useState({ left: 0, right: 0 });

  const getVisibleCards = () => (window.innerWidth >= 768 ? 3 : 1);
  const getCardWidth = () => {
    if (!carouselRef.current) return 0;
    return carouselRef.current.offsetWidth / getVisibleCards();
  };

  // Infinite Loop Logic
  useEffect(() => {
    const updateBounds = () => {
      if (carouselRef.current) {
        getCardWidth();
        // Batas drag: sejauh total lebar track
        // setBounds({ left: -Infinity, right: Infinity });
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  // Logic untuk menggeser ke index berikutnya/sebelumnya
  const scroll = (direction: number) => {
    const cardWidth = getCardWidth();
    let newIndex = currentIndex + direction;

    // 1. Tentukan target X (dengan transisi normal)
    const targetX = -newIndex * cardWidth;

    controls.start({ x: targetX, transition: { type: "spring", stiffness: 300, damping: 30 } }).then(() => {
      // 2. Cek apakah sudah waktunya teleport
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

  // Auto Slide / Next Slide
  useEffect(() => {
    // Hentikan auto-slide jika data kurang dari 3
    if (ORIGINAL_DATA_LENGTH <= 3) return;

    const autoSlide = setInterval(handleNext, 6000);
    return () => clearInterval(autoSlide);
  }, [currentIndex]);

  // Handle drag end
  const handleDragEnd = () => {
    const cardWidth = getCardWidth();
    let proposedIndex = Math.round(-x.get() / cardWidth);
    scroll(proposedIndex - currentIndex);
  };

  useEffect(() => {
    const cardWidth = getCardWidth();
    const targetX = -currentIndex * cardWidth;
    controls.start({ x: targetX, transition: { duration: 0.1 } });
  }, [currentIndex, controls]);

  useEffect(() => {
    x.on("change", () => {});
  }, [x]);

  return (
    <motion.section className="py-16 md:py-24 bg-white relative" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-lg mb-2">Blog & Berita</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Cerita Inspiratif dan Info Terkini Seputar INUK</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            Dapatkan informasi terbaru mengenai kegiatan sosial, edukasi filantropi, serta kisah nyata dari para penerima manfaat infaq Anda. Bersama INUK, setiap infaq adalah jalan keberkahan.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-primary text-white rounded-full shadow-md hover:bg-green-600 transition-colors"
          >
            <FaChevronLeft className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-primary text-white rounded-full shadow-md hover:bg-green-600 transition-colors"
          >
            <FaChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Blog Cards Track */}
          <div ref={carouselRef} className="overflow-hidden">
            <motion.div drag="x" onDragEnd={handleDragEnd} animate={controls} style={{ x }} className="flex py-1" whileTap={{ cursor: "grabbing" }}>
              {BLOG_DATA.map((blog, index) => (
                <motion.div key={index} className="p-4 flex-shrink-0 w-full md:w-1/3">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* Gambar dan Kategori */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      <div className={`absolute bottom-4 left-4 ${blog.categoryColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>{blog.category}</div>
                    </div>

                    {/* Konten Teks */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h3>
                      <p className="text-gray-600 text-sm flex-grow mb-4">{blog.description}</p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3 mt-auto">
                        <div className="flex items-center space-x-1">
                          <FaUser className="w-3 h-3 text-primary" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3 text-primary" />
                          <span>{blog.date}</span>
                        </div>
                      </div>
                    </div>
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

export default Blog;
