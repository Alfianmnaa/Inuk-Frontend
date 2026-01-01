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

/**
 * ArticleEditor
 *
 * Improvements made:
 * - Cleaner spacing and consistent padding/margins across components
 * - Fixed overlapping editor boxes by having a single bordered editor container
 * - Added internal padding to the TipTap editor content area
 * - Improved Link insertion to support both selected text and insertion with prompt
 * - Improved YouTube insertion by converting various URL formats (uses nocookie embed)
 * - Better toolbar styling and accessibility labels
 *
 * Notes:
 * - Styling uses Tailwind utility classes already present in the project.
 * - If the project doesn't include these exact utilities, adjust classNames accordingly.
 */

const ArticleEditor: React.FC = () => {
  React.useEffect(() => {}, []);

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
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false, // keep focus in editor when testing links
        autolink: true,
        linkOnPaste: true,
      }),
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setBody(editor.getJSON());
    },
  });

  // Utility to ensure we produce an embed-nocookie YouTube src from various inputs.
  const youtubeToEmbed = (input: string) => {
    if (!input) return input;
    try {
      // normalized input
      const maybeUrl = input.startsWith("http") ? input : `https://${input}`;
      const u = new URL(maybeUrl);
      // youtu.be short link
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      // youtube.com
      if (
        u.hostname.includes("youtube.com") ||
        u.hostname.includes("www.youtube.com")
      ) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
        // already an embed path?
        if (u.pathname.includes("/embed/")) {
          return `https://www.youtube-nocookie.com${u.pathname}`;
        }
      }
    } catch (e) {
      // not a URL - maybe an id
    }
    // fallback: if an 11-char id exists
    const idMatch = input.match(/[A-Za-z0-9_-]{11}/);
    if (idMatch) return `https://www.youtube-nocookie.com/embed/${idMatch[0]}`;
    // last resort - return input as-is (extension may throw or render nothing)
    return input;
  };

  const setYoutube = () => {
    const url = window.prompt(
      "Enter YouTube URL or ID (e.g. https://youtu.be/ID or ID)",
    );
    if (!url || !editor) return;
    const embedSrc = youtubeToEmbed(url.trim());
    // Insert a youtube node (works reliably)
    editor
      .chain()
      .focus()
      .insertContent({ type: "youtube", attrs: { src: embedSrc } })
      .run();
  };

  const setLink = () => {
    if (!editor) return;
    const url = window.prompt("Enter URL (include https://)");
    if (!url) return;

    const { state } = editor;
    const hasSelection = !state.selection.empty;

    if (hasSelection) {
      // If the user selected text, apply link to that selection
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank" })
        .run();
    } else {
      // If no selection, prompt for text and insert an <a> tag with the link target
      const text = window.prompt("Enter link text", url) || url;
      // Using HTML insertion here is simple and works across tiptap versions
      const safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${safe}</a>`,
        )
        .run();
    }
  };

  const openBodyImageModal = () => setShowBodyImageModal(true);

  const handleBodyImageUpload = (img: {
    url: string;
    alt: string;
    caption: string;
  }) => {
    setShowBodyImageModal(false);
    if (editor && img?.url) {
      editor
        .chain()
        .focus()
        .setImage({ src: img.url, alt: img.alt, title: img.caption })
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

      // reset
      setTitle("");
      setAuthor("");
      setHeaderImage(null);
      editor?.commands.clearContent(true);
      setTags([]);
    } catch (errorCaught: unknown) {
      console.error("Create article error:", errorCaught);
      const message =
        errorCaught instanceof Error
          ? errorCaught.message
          : typeof errorCaught === "object" &&
              errorCaught !== null &&
              "message" in errorCaught
            ? String((errorCaught as { message: unknown }).message)
            : "Failed to create article.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold text-gray-800">Create Article</h1>

      {/* Header Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          maxLength={300}
          onChange={(e) => setTitle(e.target.value)}
          className="col-span-1 md:col-span-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          maxLength={150}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Header Image */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowHeaderImageModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              {headerImage ? "Change Header Image" : "Upload Header Image"}
            </button>
            <span className="text-sm text-gray-500">Recommended: 1200x600</span>
          </div>
          {headerImage && (
            <div className="flex items-center space-x-4">
              <img
                src={headerImage.url}
                alt={headerImage.alt}
                className="w-48 h-28 object-cover rounded-md border"
              />
              <div className="text-sm text-gray-700">
                <div className="font-medium">
                  {headerImage.alt || "Header image"}
                </div>
                <div className="text-xs text-gray-500">
                  {headerImage.caption}
                </div>
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

      {/* Editor & Toolbar */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div
              className="flex flex-wrap items-center gap-2"
              role="toolbar"
              aria-label="Editor toolbar"
            >
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor}
                aria-label="Bold"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("bold") ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Bold
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor}
                aria-label="Italic"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("italic") ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Italic
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={!editor}
                aria-label="Underline"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("underline") ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Underline
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                disabled={!editor}
                aria-label="Strike"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("strike") ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Strike
              </button>

              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
                disabled={!editor}
                aria-label="Heading level 1"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("heading", { level: 1 }) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                H1
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                disabled={!editor}
                aria-label="Heading level 2"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("heading", { level: 2 }) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                H2
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
                disabled={!editor}
                aria-label="Heading level 3"
                className={`px-3 py-1 rounded text-sm border ${editor?.isActive("heading", { level: 3 }) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                H3
              </button>

              <button
                onClick={setLink}
                disabled={!editor}
                aria-label="Insert link"
                className="px-3 py-1 rounded text-sm border bg-white text-gray-700 hover:bg-gray-50"
              >
                Link
              </button>
              <button
                onClick={setYoutube}
                disabled={!editor}
                aria-label="Insert YouTube"
                className="px-3 py-1 rounded text-sm border bg-white text-gray-700 hover:bg-gray-50"
              >
                YouTube
              </button>
              <button
                onClick={openBodyImageModal}
                disabled={!editor}
                aria-label="Insert image"
                className="px-3 py-1 rounded text-sm border bg-white text-gray-700 hover:bg-gray-50"
              >
                Image
              </button>
            </div>
          </div>

          {/* Single editor container with border - avoids double overlapping boxes */}
          <div className="border border-gray-200 rounded-md min-h-[300px] overflow-auto bg-gray-50">
            <div className="p-4">
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-full min-h-[240px] focus:outline-none"
                // Add inline styles for images/iframes to be responsive inside the editor
                onBlur={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      <UploadImageModal
        open={showBodyImageModal}
        onClose={() => setShowBodyImageModal(false)}
        onUploaded={handleBodyImageUpload}
        token={token}
      />

      {/* Tags */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
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
              className="w-full md:w-72 border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-primary text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              Add Tag
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-xs text-red-500 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStatus("published")}
          disabled={status === "published"}
          className={`px-4 py-2 rounded-md text-sm font-medium ${status === "published" ? "bg-primary text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
        >
          Publish
        </button>
        <button
          type="button"
          onClick={() => setStatus("drafted")}
          disabled={status === "drafted"}
          className={`px-4 py-2 rounded-md text-sm font-medium ${status === "drafted" ? "bg-yellow-100 text-yellow-800" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
        >
          Draft
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Create Article"}
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;
