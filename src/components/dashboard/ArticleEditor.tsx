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

const ArticleEditor: React.FC = () => {
  // Small no-op effect to ensure React variable is referenced at runtime (prevents some bundlers/lint from flagging unused React)
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
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 480,
        height: 320,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setBody(editor.getJSON());
    },
  });

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  const setYoutube = () => {
    const url = window.prompt("Enter YouTube URL");
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
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
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    // Guard against missing authentication token (match style used in DonaturManagement)
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
      // Optionally reset form or redirect
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
    <div>
      <h1>Create Article</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        maxLength={300}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        maxLength={150}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <div>
        <button type="button" onClick={() => setShowHeaderImageModal(true)}>
          {headerImage ? "Change Header Image" : "Upload Header Image"}
        </button>
        {headerImage && (
          <div>
            <img
              src={headerImage.url}
              alt={headerImage.alt}
              style={{ maxWidth: 200 }}
            />
            <div>{headerImage.caption}</div>
          </div>
        )}
      </div>
      <UploadImageModal
        open={showHeaderImageModal}
        onClose={() => setShowHeaderImageModal(false)}
        onUploaded={handleHeaderImageUpload}
        token={token}
      />
      {/* Tiptap Toolbar */}
      <div className="tiptap-toolbar">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor}
        >
          Underline
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor}
        >
          Strike
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={!editor}
        >
          H1
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={!editor}
        >
          H2
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={!editor}
        >
          H3
        </button>
        <button onClick={setLink} disabled={!editor}>
          Link
        </button>
        <button onClick={setYoutube} disabled={!editor}>
          YouTube
        </button>
        <button onClick={openBodyImageModal} disabled={!editor}>
          Image
        </button>
      </div>
      <div>
        <EditorContent editor={editor} />
      </div>
      <UploadImageModal
        open={showBodyImageModal}
        onClose={() => setShowBodyImageModal(false)}
        onUploaded={handleBodyImageUpload}
        token={token}
      />
      <div>
        <input
          type="text"
          placeholder="Add tag"
          value={tagInput}
          maxLength={35}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
        />
        <button type="button" onClick={handleAddTag}>
          Add Tag
        </button>
        <div>
          {tags.map((tag) => (
            <span key={tag}>{tag} </span>
          ))}
        </div>
        {/* Tag search/add/create UI - search unfinished */}
      </div>
      <div>
        <button
          type="button"
          onClick={() => setStatus("published")}
          disabled={status === "published"}
        >
          Publish
        </button>
        <button
          type="button"
          onClick={() => setStatus("drafted")}
          disabled={status === "drafted"}
        >
          Draft
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Create Article"}
      </button>
    </div>
  );
};

export default ArticleEditor;
