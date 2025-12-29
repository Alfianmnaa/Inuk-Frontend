import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- Models ---

export interface CreateArticleRequest {
  title: string;
  author: string;
  header_image_url: string;
  header_image_alt: string;
  header_image_caption: string;
  status: "drafted" | "published";
  body: any; // Tiptap JSON
  tags: string[];
}

export interface CreateReplaceArticleResponse {
  id: string;
  slug: string;
  title: string;
  author: string;
  status: "drafted" | "published";
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface UploadImageResponse {
  url: string;
}

// --- Helpers ---

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

/**
 * Create a new article.
 */
export const createArticle = async (
  token: string,
  data: CreateArticleRequest
): Promise<CreateReplaceArticleResponse> => {
  const response = await axios.post<CreateReplaceArticleResponse>(
    `${VITE_API_URL}/articles`,
    data,
    {
      ...getAuthHeaders(token),
      headers: {
        ...getAuthHeaders(token).headers,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/**
 * Upload an image and get its URL.
 */
export const uploadImage = async (
  token: string,
  file: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post<UploadImageResponse>(
    `${VITE_API_URL}/upload/image`,
    formData,
    {
      ...getAuthHeaders(token),
      headers: {
        ...getAuthHeaders(token).headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
