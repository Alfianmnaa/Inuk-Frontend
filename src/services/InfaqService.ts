import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Infaq {
  id: string;
  MasjidID: string;
  Name: string;
  Province: string;
  City: string;
  Subdistrict: string;
  Village: string;
  Total: number;
  DateTime: string;
}

export interface InfaqDetailResponse {
  id: string;
  admin_id: string;
  MasjidID: string;
  Name: string;
  RegionID: string;
  Village: string;
  Subdistrict: string;
  City: string;
  Province: string;
  Total: number;
  DateTime: string;
  created_at: string;
  updated_at: string;
}

export interface GetInfaqsQuery {
  province?: string;
  city?: string;
  subdistrict?: string;
  date_time?: string;
}

export interface CreateInfaqPayload {
  MasjidID: string;
  Total: number;
  DateTime: string;
}

export interface UpdateInfaqPayload {
  Total?: number;
  DateTime: string;
}

export interface DeleteInfaqResponse {
  id: string;
  is_deleted: boolean;
}

// ── Export ────────────────────────────────────────────────────────────────────

export interface ExportInfaqsQuery {
  /**
   * Pasaran filter:
   *  - ""           → semua data
   *  - "2026"       → seluruh tahun 2026
   *  - "2006-01-02" → Jumat Pon spesifik
   */
  pasaran?: string;
  sort_by?: "newest" | "oldest";
}

export interface ExportInfaqsResponse {
  job_id: string;
  status: string;
  message: string;
  file_url?: string;
  file_name?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: any, defaultMsg: string) => {
  if (axios.isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message || error.response.data?.error;
    throw new Error(backendMessage || defaultMsg);
  }
  throw new Error(defaultMsg);
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getInfaqs = async (token: string, filters?: GetInfaqsQuery): Promise<Infaq[]> => {
  try {
    const response = await axios.get<Infaq[]>(`${VITE_API_URL}/infaqs`, {
      params: filters,
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch infaqs:", error);
    return [];
  }
};

export const createInfaq = async (token: string, data: CreateInfaqPayload): Promise<InfaqDetailResponse> => {
  try {
    const response = await axios.post<InfaqDetailResponse>(`${VITE_API_URL}/infaq`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal membuat infaq.");
    throw error;
  }
};

export const updateInfaq = async (token: string, id: string, data: UpdateInfaqPayload): Promise<InfaqDetailResponse> => {
  try {
    const response = await axios.patch<InfaqDetailResponse>(`${VITE_API_URL}/infaq/${id}`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal memperbarui infaq.");
    throw error;
  }
};

export const deleteInfaq = async (token: string, id: string): Promise<DeleteInfaqResponse> => {
  try {
    const response = await axios.delete<DeleteInfaqResponse>(`${VITE_API_URL}/infaq/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal menghapus infaq.");
    throw error;
  }
};

// ── Export ────────────────────────────────────────────────────────────────────

/**
 * POST /export/infaq
 *
 * Meminta backend untuk membuat file Excel laporan infaq secara async dan
 * mengirimkan notifikasi WhatsApp ke nomor yang terdaftar di akun admin.
 */
export const exportInfaqs = async (
  token: string,
  query: ExportInfaqsQuery = {}
): Promise<ExportInfaqsResponse> => {
  const response = await axios.post<ExportInfaqsResponse>(
    `${VITE_API_URL}/export/infaq`,
    null,
    {
      params: query,
      ...getAuthHeaders(token),
    }
  );
  return response.data;
};