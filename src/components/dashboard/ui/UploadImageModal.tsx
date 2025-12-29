import React, { useState } from "react";
import { uploadImage } from "../../../services/CMSService";

interface UploadImageModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (img: { url: string; alt: string; caption: string }) => void;
  token: string | null;
}

export default function UploadImageModal({
  open,
  onClose,
  onUploaded,
  token,
}: UploadImageModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (
      selected &&
      ["image/jpeg", "image/png", "image/jpg"].includes(selected.type) &&
      selected.size < 10 * 1024 * 1024
    ) {
      setFile(selected);
      setError("");
    } else {
      setError("Invalid file type or size > 10MB.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadImage(token, file);
      onUploaded({ url, alt, caption });
      setFile(null);
      setAlt("");
      setCaption("");
      setError("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Upload error:", err);
      setError(msg || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Upload Image</h2>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="Alt text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onClose} disabled={uploading}>
          Cancel
        </button>
      </div>
    </div>
  );
}
