import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Infaq {
  id: string;
  masjid_id: string;
  name: string;
  provinsi: string;
  kabupaten_kota: string;
  kecamatan: string;
  desa_kelurahan: string;
  total: number;
  date_time: string;
}

export interface InfaqDetailResponse {
  id: string;
  admin_id: string;
  masjid_id: string;
  name: string;
  region_id: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  total: number;
  date_time: string;
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
  masjid_id: string;
  total: number;
  /** Format: YYYY-MM-DD (e.g. "2026-01-02") — must be a Jum'at Pon */
  date_time: string;
}

export interface UpdateInfaqPayload {
  total?: number;
  /** Format: YYYY-MM-DD (e.g. "2026-01-02") — must be a Jum'at Pon */
  date_time: string;
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

// ── Recap ─────────────────────────────────────────────────────────────────────

export interface InfaqsRecapYearsResponse {
  years: number[];
}

export interface InfaqsRecapPasaransResponse {
  dates: string[]; // "YYYY-MM-DD" strings, each a Jum'at Pon date
}

export interface InfaqsRecapMasjid {
  name: string;
  total_infaq: number;
}

export interface InfaqsRecapVillage {
  name: string;
  total_masjid: number;
  total_infaq: number;
  masjid: InfaqsRecapMasjid[];
}

export interface InfaqsRecapKecamatan {
  name: string;
  total_masjid: number;
  total_infaq: number;
  desa_kelurahan: InfaqsRecapVillage[];
}

export interface InfaqsRecapResponse {
  name: string; // kabupaten/kota name
  total_masjid: number;
  total_infaq: number;
  kecamatan: InfaqsRecapKecamatan[];
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
    return response.data ?? [];
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

// ── Recap ─────────────────────────────────────────────────────────────────────

/** GET /infaqs-recap/year → { years: number[] } */
export const getInfaqsRecapYears = async (): Promise<number[]> => {
  try {
    const response = await axios.get<InfaqsRecapYearsResponse>(`${VITE_API_URL}/infaqs-recap/year`);
    return response.data?.years ?? [];
  } catch (error) {
    console.error("Failed to fetch infaq recap years:", error);
    return [];
  }
};

/** GET /infaqs-recap/pasaran?year=YYYY → { dates: string[] } */
export const getInfaqsRecapPasarans = async (year: number): Promise<string[]> => {
  try {
    const response = await axios.get<InfaqsRecapPasaransResponse>(
      `${VITE_API_URL}/infaqs-recap/pasaran`,
      { params: { year } }
    );
    return response.data?.dates ?? [];
  } catch (error) {
    console.error(`Failed to fetch infaq pasarans for year ${year}:`, error);
    return [];
  }
};

/**
 * GET /infaqs-recap?pasaran=... → InfaqsRecapResponse
 *
 * pasaran formats:
 *  - "YYYY-MM-DD" → data for a specific Jum'at Pon
 *  - "YYYY"       → aggregated data for the entire year
 */
export const getInfaqsRecap = async (pasaran: string): Promise<InfaqsRecapResponse | null> => {
  try {
    const response = await axios.get<InfaqsRecapResponse>(`${VITE_API_URL}/infaqs-recap`, {
      params: { pasaran },
    });
    return response.data ?? null;
  } catch (error) {
    console.error(`Failed to fetch infaq recap for pasaran ${pasaran}:`, error);
    return null;
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