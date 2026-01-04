import React, { useState } from "react";
import {
  createArticle,
  type CreateArticleRequest,
} from "../../services/CMSService";
import UploadImageModal from "./ui/UploadImageModal";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "./DashboardLayout";

const ArticleEditor: React.FC = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [headerImage, setHeaderImage] = useState<{
    url: string;
    alt: string;
    caption: string;
  } | null>(null);
  const [showHeaderImageModal, setShowHeaderImageModal] = useState(false);
  const [showBodyImageModal, setShowBodyImageModal] = useState(false);
  const [body, setBody] = useState({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"drafted" | "published">("drafted");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const editor = useEditor({
    extensions: [
      // FIX: Remove Link and Strike from StarterKit to avoid duplicates
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        strike: false, // Disable strike in StarterKit
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
      // FIX: Use youtube-nocookie for better compatibility
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg my-4',
        },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setBody(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  const youtubeToEmbed = (input: string) => {
    if (!input) return input;
    input = input.trim();

    try {
      // Just ID (11 characters)
      if (/^[A-Za-z0-9_-]{11}$/.test(input)) {
        return `https://www.youtube-nocookie.com/embed/${input}`;
      }

      const maybeUrl = input.startsWith("http") ? input : `https://${input}`;
      const u = new URL(maybeUrl);

      // youtu.be
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1).split("?")[0];
        if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      }

      // youtube.com
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;

        // embed path
        if (u.pathname.includes("/embed/")) {
          const id = u.pathname.split("/embed/")[1].split("?")[0];
          return `https://www.youtube-nocookie.com/embed/${id}`;
        }
      }
    } catch (e) {
      console.error("YouTube URL error:", e);
    }

    // Extract ID
    const idMatch = input.match(/[A-Za-z0-9_-]{11}/);
    if (idMatch) return `https://www.youtube-nocookie.com/embed/${idMatch[0]}`;

    return input;
  };

  const setYoutube = () => {
    if (!editor) return;

    const url = window.prompt(
      "Enter YouTube URL or ID:\n\nExamples:\n- dQw4w9WgXcQ\n- https://youtu.be/dQw4w9WgXcQ\n- https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );

    if (!url) return;

    const embedSrc = youtubeToEmbed(url);
    console.log("YouTube embed URL:", embedSrc);

    // Use setYoutubeVideo command
    editor.chain().focus().setYoutubeVideo({ src: embedSrc }).run();
  };

  const setLink = () => {
    if (!editor) return;
    const url = window.prompt("Enter URL (include https://)");
    if (!url) return;

    const { state } = editor;
    const hasSelection = !state.selection.empty;

    if (hasSelection) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      const text = window.prompt("Enter link text", url) || url;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a> `)
        .run();
    }
  };

  const toggleStrike = () => {
    if (!editor) return;
    editor.chain().focus().toggleStrike().run();
  };

  const openBodyImageModal = () => setShowBodyImageModal(true);

  const handleBodyImageUpload = (img: {
    url: string;
    alt: string;
    caption: string;
  }) => {
    setShowBodyImageModal(false);
    console.log("Inserting image:", img);
    if (editor && img?.url) {
      editor
        .chain()
        .focus()
        .setImage({ 
          src: img.url, 
          alt: img.alt, 
          title: img.caption 
        })
        .run();
    }
  };

  const handleHeaderImageUpload = (img: {
    url: string;
    alt: string;
    caption: string;
  }) => {
    setHeaderImage(img);
    setShowHeaderImageModal(false);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tg) => tg !== t));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!token) {
      setError("Authentication required. Please log in.");
      setSubmitting(false);
      return;
    }

    try {
      const payload: CreateArticleRequest = {
        title,
        author,
        header_image_url: headerImage?.url || "",
        header_image_alt: headerImage?.alt || "",
        header_image_caption: headerImage?.caption || "",
        status,
        body,
        tags,
      };
      await createArticle(token, payload);

      setTitle("");
      setAuthor("");
      setHeaderImage(null);
      editor?.commands.clearContent(true);
      setTags([]);
      setError("");
      alert("Article created successfully!");
    } catch (errorCaught: unknown) {
      console.error("Create article error:", errorCaught);
      const message =
        errorCaught instanceof Error
          ? errorCaught.message
          : "Failed to create article.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeLink="/dashboard/cms-berita" pageTitle="Create Article">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Create Article</h1>

        {/* Header Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            maxLength={300}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-1 md:col-span-2 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            maxLength={150}
            onChange={(e) => setAuthor(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Header Image */}
        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowHeaderImageModal(true)}
                className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition-colors"
              >
                {headerImage ? "Change Header Image" : "Upload Header Image"}
              </button>
              <span className="text-xs text-gray-500">Recommended: 1200x600</span>
            </div>
            {headerImage && (
              <div className="flex items-center gap-3">
                <img
                  src={headerImage.url}
                  alt={headerImage.alt}
                  className="w-32 h-20 object-cover rounded border border-gray-200"
                />
                <div className="text-xs text-gray-700">
                  <div className="font-medium">{headerImage.alt || "Header image"}</div>
                  <div className="text-gray-500">{headerImage.caption}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <UploadImageModal
          open={showHeaderImageModal}
          onClose={() => setShowHeaderImageModal(false)}
          onUploaded={handleHeaderImageUpload}
          token={token}
        />

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-gray-200 p-2 bg-gray-50">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("bold")
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Bold
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("italic")
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Italic
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("underline")
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Underline
              </button>
              <button
                onClick={toggleStrike}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("strike")
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Strike
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("heading", { level: 1 })
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                H1
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("heading", { level: 2 })
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                H2
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={!editor}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  editor?.isActive("heading", { level: 3 })
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                H3
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                onClick={setLink}
                disabled={!editor}
                className="px-2.5 py-1 rounded text-xs font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Link
              </button>
              <button
                onClick={setYoutube}
                disabled={!editor}
                className="px-2.5 py-1 rounded text-xs font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                YouTube
              </button>
              <button
                onClick={openBodyImageModal}
                disabled={!editor}
                className="px-2.5 py-1 rounded text-xs font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Image
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        <UploadImageModal
          open={showBodyImageModal}
          onClose={() => setShowBodyImageModal(false)}
          onUploaded={handleBodyImageUpload}
          token={token}
        />

        {/* Tags */}
        <div className="bg-white border border-gray-200 rounded p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Add tag"
                value={tagInput}
                maxLength={35}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              status === "published"
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Publish
          </button>
          <button
            type="button"
            onClick={() => setStatus("drafted")}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              status === "drafted"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Draft
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Create Article"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArticleEditor;