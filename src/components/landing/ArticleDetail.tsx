import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag } from "react-icons/fa";
import { getArticleFromSlug, type GetArticleFromSlugResponse } from "../../services/CMSService";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<GetArticleFromSlugResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await getArticleFromSlug(slug);
        setArticle(data);

        // Generate HTML from Tiptap JSON
        const html = generateHTML(data.body, [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3],
            },
          }),
          Underline,
          TiptapLink.configure({
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
              class: 'text-blue-600 underline hover:text-blue-800 transition-colors',
            },
          }),
          Image.configure({
            inline: false,
            allowBase64: false,
          }),
          Youtube.configure({
            controls: true,
            nocookie: true,
            width: 640,
            height: 360,
            inline: false,
            modestBranding: true,
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
        ]);

        setHtmlContent(html);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Artikel tidak ditemukan atau terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    
    return date.toLocaleString("id-ID", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{error || "Artikel tidak ditemukan"}</p>
            <Link 
              to="/" 
              className="inline-flex items-center text-primary font-semibold hover:text-green-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary font-semibold mb-6 hover:text-green-700 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Kembali ke Beranda
        </Link>

        <motion.article 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header Image */}
          <div className="relative h-96 w-full overflow-hidden bg-gray-100">
            <img 
              src={article.header_image_url} 
              alt={article.header_image_alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/1200x600?text=No+Image";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Image Caption */}
            {article.header_image_caption && (
              <p className="text-sm text-gray-500 italic mb-6 pb-6 border-b border-gray-200">
                {article.header_image_caption}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center">
                <FaUser className="mr-2 text-primary" />
                <span className="font-medium">{article.author}</span>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-primary" />
                <span>{formatDate(article.published_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <FaTag className="text-primary" />
                {article.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-green-50 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Body */}
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </motion.article>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary font-semibold hover:text-green-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleDetail;