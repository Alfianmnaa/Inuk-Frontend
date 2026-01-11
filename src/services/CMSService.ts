import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- Models ---
export interface GetArticlesQuery {
  title?: string;
  status?: string;
  tags?: string[];
  year?: number;
  month?: number;
}

export interface GetArticlesResponse {
  id: string;
  title: string;
  slug: string;
  status: string;
  header_image_url: string;
  header_image_alt: string;
  header_image_caption: string;
  published_at: string | null;
  updated_at: string;
  tags: string[];
}

export interface GetArticleFromSlugResponse {
  id: string;
  slug: string;
  title: string;
  author: string;
  header_image_url: string;
  header_image_alt: string;
  header_image_caption: string;
  status: string;
  body: any;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface ReplaceArticleRequest {
  title: string;
  author: string;
  header_image_url: string;
  header_image_alt: string;
  header_image_caption: string;
  status: "drafted" | "published";
  body: any;
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

export interface UpdateArticleStatusRequest {
  status: "drafted" | "published" | "archived" | "pinned";
}

export interface UpdateArticleStatusResponse {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

export interface DeleteArticleResponse {
  id: string;
  is_deleted: boolean;
}

export interface UploadImageResponse {
  url: string;
}

// --- Helpers ---

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

export const getArticles = async (
  query?: GetArticlesQuery
): Promise<GetArticlesResponse[]> => {
  const params = new URLSearchParams();
  
  if (query?.title) params.append("title", query.title);
  if (query?.status) params.append("status", query.status);
  if (query?.tags && query.tags.length > 0) {
    query.tags.forEach(tag => params.append("tags", tag));
  }
  if (query?.year) params.append("year", query.year.toString());
  if (query?.month) params.append("month", query.month.toString());

  const response = await axios.get<GetArticlesResponse[]>(
    `${VITE_API_URL}/articles${params.toString() ? `?${params.toString()}` : ""}`,
  );
  return response.data;
};

export const getArticleFromSlug = async (
  slug: string
): Promise<GetArticleFromSlugResponse> => {
  const response = await axios.get<GetArticleFromSlugResponse>(
    `${VITE_API_URL}/articles/${slug}`
  );
  return response.data;
};

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

export const replaceArticle = async (
  token: string,
  id: string,
  data: ReplaceArticleRequest
): Promise<CreateReplaceArticleResponse> => {
  const response = await axios.put<CreateReplaceArticleResponse>(
    `${VITE_API_URL}/articles/${id}`,
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

export const updateArticleStatus = async (
  token: string,
  id: string,
  data: UpdateArticleStatusRequest
): Promise<UpdateArticleStatusResponse> => {
  const response = await axios.patch<UpdateArticleStatusResponse>(
    `${VITE_API_URL}/articles/${id}`,
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

export const deleteArticle = async (
  token: string,
  id: string
): Promise<DeleteArticleResponse> => {
  const response = await axios.delete<DeleteArticleResponse>(
    `${VITE_API_URL}/articles/${id}`,
    getAuthHeaders(token)
  );
  return response.data;
};

export const uploadImage = async (
  token: string,
  file: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post<UploadImageResponse>(
    `${VITE_API_URL}/upload/image`,
    formData,
    getAuthHeaders(token)
  );
  
  return response.data;
};