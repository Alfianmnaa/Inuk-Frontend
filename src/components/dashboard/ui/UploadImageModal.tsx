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
      className="fixed inset-0 bg-black/30 backdrop-blur flex justify-center items-center z-[1050] h-full"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 m-4 rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">Upload Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={uploading}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              placeholder="Describe the image"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={uploading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              placeholder="Image caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={uploading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
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
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="py-2 px-4 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}