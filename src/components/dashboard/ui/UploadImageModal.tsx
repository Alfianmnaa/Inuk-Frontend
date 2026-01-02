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
    setError("");
    
    try {
      console.log("Uploading file:", file.name, "Size:", file.size);
      const { url } = await uploadImage(token, file);
      console.log("Upload successful, URL:", url);
      
      onUploaded({ url, alt, caption });
      
      // Reset form
      setFile(null);
      setAlt("");
      setCaption("");
      setError("");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      
      let msg = "Upload failed.";
      
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "object" && err !== null) {
        // Check for HTTP error response
        if ("response" in err) {
          const response = (err as any).response;
          if (response?.data?.error) {
            msg = response.data.error;
          } else if (response?.status === 401) {
            msg = "Authentication failed. Please log in again.";
          } else if (response?.status === 413) {
            msg = "File too large. Maximum size is 10MB.";
          } else if (response?.statusText) {
            msg = `Upload failed: ${response.statusText}`;
          }
        } else if ("message" in err) {
          msg = String((err as { message: unknown }).message);
        }
      } else {
        msg = String(err);
      }
      
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
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
              disabled={uploading}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer
                file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
              disabled={uploading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={uploading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
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
            disabled={uploading || !file}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}