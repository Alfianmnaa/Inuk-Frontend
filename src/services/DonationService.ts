import axios from "axios";
import { type RegionFilterBody } from "./RegionService";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface DonationDataRecap {
  name: string;
  total_donor: number;
  total_donation: number;
  kecamatan: KecamatanDataRecap[];
}

// Interface Rekapitulasi per Kecamatan BARU
export interface KecamatanDataRecap {
  name: string;
  total_donor: number;
  total_donation: number;
  desa_kelurahan: DesaDataRecap[];
}

export interface DesaDataRecap {
  name: string;
  total_donor: number;
  total_donation: number;
}

// Interface Transaksi (Sesuai Respon API)
export interface TransactionAPI {
  id: string;
  kaleng: string;
  name: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  total: number;
  date_time: string; // ISO 8601 string
}

// Interface Respon Paginated
export interface DonationsResponse {
  total_page: number;
  current_page: number;
  has_next_page: boolean;
  result: TransactionAPI[];
}

// Interface Request Filter Donasi (Memperbaiki error object literal)
export interface DonationsFilter extends RegionFilterBody {
  page?: number;
  // REMOVED: method?: string;
  startDate?: string; // RFC3339 format
  endDate?: string; // RFC3339 format
  sortBy?: "newest" | "oldest";
}

// Interface Request Tambah Donasi
export interface CreateDonationRequest {
  donor_id: string;
  total: number;
  date_time: string; // RFC3339 (misal: 2025-10-15T12:00:00Z)
  // REMOVED: method: string;
}

// Interface Request Update Donasi BARU
export interface UpdateDonationRequest {
  total: number;
  date_time: string; // RFC3339
  // REMOVED: method: string;
}

// --- Helpers ---
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

// GET /donations (Read/Filter)
export const getDonations = async (token: string, filters: DonationsFilter): Promise<DonationsResponse> => {
  // Axios secara otomatis membersihkan parameter yang undefined atau null
  const response = await axios.get<DonationsResponse>(`${VITE_API_URL}/donations`, {
    params: filters,
    ...getAuthHeaders(token),
  });
  return response.data;
};

// REMOVED: GET /donation/methods

// POST /donation/ (Create)
export const createDonation = async (token: string, data: CreateDonationRequest): Promise<TransactionAPI> => {
  const response = await axios.post<TransactionAPI>(`${VITE_API_URL}/donation`, data, getAuthHeaders(token));
  return response.data;
};

// PATCH /donation/:id (Update) BARU
export const updateDonation = async (token: string, id: string, data: UpdateDonationRequest): Promise<TransactionAPI> => {
  const response = await axios.patch<TransactionAPI>(`${VITE_API_URL}/donation/${id}`, data, getAuthHeaders(token));
  return response.data;
};

// DELETE /donation/:id (Delete) BARU
export const deleteDonation = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${VITE_API_URL}/donation/${id}`, getAuthHeaders(token));
};

export const getDonationRecap = async (subdistrict?: string, village?: string, year?: number, month?: number): Promise<DonationDataRecap> => {
  try {
    // Set default year to current year if not provided
    const currentYear = new Date().getFullYear();
    year = year || currentYear;

    // Fetch data from the API
    const response = await axios.get(`${VITE_API_URL}/donations-recap`, {
      params: {
        kecamatan: subdistrict,
        desa_kelurahan: village,
        year,
        month,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Failed to fetch donation recap:", error);
    throw new Error("Unable to fetch donation recap data.");
  }
};

export interface ExportDonationsDateQuery {
  startDate?: string; // RFC3339 format, optional
  endDate?: string; // RFC3339 format, optional
  sortBy?: "newest" | "oldest"; // optional
}

export interface ExportDonationsResponse {
  job_id: string;
  status: string;
  message: string;
  file_url?: string;
  file_name?: string;
}

export const exportDonations = async (
  token: string,
  query: ExportDonationsDateQuery = {}
): Promise<ExportDonationsResponse> => {
  const response = await axios.post<ExportDonationsResponse>(
    `${VITE_API_URL}/export/donation`,
    null,
    {
      params: query,
      ...getAuthHeaders(token),
    }
  );
  return response.data;
};