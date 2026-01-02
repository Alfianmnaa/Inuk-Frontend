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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Upload Image</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer
                file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer"
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Alt Text */}
          <div>
            <label
              htmlFor="alt-text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Alt Text
            </label>
            <input
              id="alt-text"
              type="text"
              placeholder="Describe the image"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Caption */}
          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Caption (optional)
            </label>
            <input
              id="caption"
              type="text"
              placeholder="Image caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}