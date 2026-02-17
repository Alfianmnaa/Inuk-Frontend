import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaHome, FaArrowUp, FaShare, FaLink } from "react-icons/fa";
import { getArticleFromSlug, type GetArticleFromSlugResponse } from "../../services/CMSService";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<GetArticleFromSlugResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TiptapLink.configure({
        openOnClick: true,
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
    ],
    editable: false,
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await getArticleFromSlug(slug);
        setArticle(data);

        // Load content into read-only editor
        if (editor && data.body) {
          editor.commands.setContent(data.body);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Artikel tidak ditemukan atau terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, editor]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
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
            {/* Image Caption */}
            {article.header_image_caption && (
              <p className="text-sm text-gray-500 italic text-center mb-8 pb-8 border-b border-gray-200">
                {article.header_image_caption}
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
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
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md mb-12">
              <EditorContent editor={editor} />
            </div>
          </div>
        </motion.article>

        {/* Bottom Action Bar */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-center gap-6">
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors group"
              title="Kembali ke Beranda"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                <FaHome className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Beranda</span>
            </button>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors group"
              title="Ke Atas"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                <FaArrowUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Ke Atas</span>
            </button>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors group relative"
              title="Salin Link"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                <FaLink className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Salin Link</span>
              {copySuccess && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Link tersalin!
                </span>
              )}
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors group"
                title="Bagikan"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                  <FaShare className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Bagikan</span>
              </button>

              {showShareMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex gap-2 whitespace-nowrap">
                  <button
                    onClick={() => shareToSocial('whatsapp')}
                    className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-green-50 rounded transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 rounded transition-colors"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => shareToSocial('telegram')}
                    className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    Telegram
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleDetail;