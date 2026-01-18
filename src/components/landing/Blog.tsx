import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { getArticles, type GetArticlesResponse } from "../../services/CMSService";
import { Link } from "react-router-dom";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const Blog: React.FC = () => {
  const [articles, setArticles] = useState<GetArticlesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Fetch articles without token - API will return pinned and published by default
        const fetchedArticles = await getArticles();
        
        // Limit to first 10 articles
        const limitedArticles = fetchedArticles.slice(0, 10);
        
        // Only duplicate for infinite scroll if there are more than 3 articles
        if (limitedArticles.length > 3) {
          const duplicated = [...limitedArticles, ...limitedArticles, ...limitedArticles];
          setArticles(duplicated);
        } else {
          setArticles(limitedArticles);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const getVisibleCards = () => (window.innerWidth >= 768 ? 3 : 1);
  const getCardWidth = () => {
    if (!carouselRef.current) return 0;
    return carouselRef.current.offsetWidth / getVisibleCards();
  };

  // Calculate original data length based on whether we duplicated or not
  const originalDataLength = articles.length > 10 ? Math.floor(articles.length / 3) : articles.length;

  useEffect(() => {
    const updateBounds = () => {
      if (carouselRef.current) {
        getCardWidth();
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [articles]);

  const scroll = (direction: number) => {
    const cardWidth = getCardWidth();
    let newIndex = currentIndex + direction;

    const targetX = -newIndex * cardWidth;

    controls.start({ x: targetX, transition: { type: "spring", stiffness: 300, damping: 30 } }).then(() => {
      if (newIndex >= originalDataLength) {
        const teleportIndex = newIndex - originalDataLength;
        const teleportX = -teleportIndex * cardWidth;
        controls.start({ x: teleportX, transition: { duration: 0 } });
        setCurrentIndex(teleportIndex);
      } else if (newIndex < 0) {
        const teleportIndex = newIndex + originalDataLength;
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

  useEffect(() => {
    // Only auto-slide if there are enough articles to scroll
    if (originalDataLength <= getVisibleCards()) return;

    const autoSlide = setInterval(handleNext, 6000);
    return () => clearInterval(autoSlide);
  }, [currentIndex, originalDataLength]);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    
    return date.toLocaleString("id-ID", options);
  };

  if (loading) {
    return (
      <motion.section className="py-16 md:py-24 bg-white relative" variants={sectionVariants} initial="hidden" animate="visible">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full max-w-3xl mx-auto"></div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (articles.length === 0) {
    return (
      <motion.section className="py-16 md:py-24 bg-white relative" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-lg mb-2">Blog & Berita</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Cerita Inspiratif dan Info Terkini Seputar INUK</h2>
          </div>
          <p className="text-center text-gray-500 italic">Belum ada artikel yang dipublikasikan.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section className="py-16 md:py-24 bg-white relative" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-lg mb-2">Blog & Berita</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Cerita Inspiratif dan Info Terkini Seputar INUK</h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            Dapatkan informasi terbaru mengenai kegiatan sosial, edukasi filantropi, serta kisah nyata dari para penerima manfaat infaq Anda. Bersama INUK, setiap infaq adalah jalan keberkahan.
          </p>
        </div>

        {articles.length > 0 && (
          <div className="flex justify-end mb-4">
            <Link 
              to="/artikel" 
              className="text-primary font-semibold text-sm hover:text-green-700 transition-colors"
            >
              Lainnya →
            </Link>
          </div>
        )}

        <div className="relative">
          {originalDataLength > getVisibleCards() && (
            <>
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
            </>
          )}

          <div ref={carouselRef} className="overflow-hidden">
            <motion.div 
              drag={originalDataLength > getVisibleCards() ? "x" : false}
              onDragEnd={handleDragEnd} 
              animate={controls} 
              style={{ x }} 
              className="flex py-1" 
              whileTap={originalDataLength > getVisibleCards() ? { cursor: "grabbing" } : undefined}
            >
              {articles.map((article, index) => (
                <motion.div key={`${article.id}-${index}`} className="p-4 flex-shrink-0 w-full md:w-1/3">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      <img 
                        src={article.header_image_url} 
                        alt={article.header_image_alt} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                      {/* Tags */}
                      <div className="absolute bottom-4 left-4 flex gap-2 max-w-[calc(100%-2rem)]">
                        {article.tags.slice(0, 2).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md truncate"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {article.header_image_caption}
                      </p>

                      <div className="flex items-center justify-between mt-auto border-t pt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <FaCalendarAlt className="w-3 h-3 text-primary mr-1" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        
                        <Link 
                          to={`/artikel/${article.slug}`}
                          className="text-primary font-semibold text-sm hover:text-green-700 transition-colors"
                        >
                          Selengkapnya →
                        </Link>
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