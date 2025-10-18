import axios from "axios";
import { type RegionFilterBody } from "./RegionService";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Interface Transaksi (Sesuai Respon API)
export interface TransactionAPI {
  id: string;
  name: string;
  phone: string;
  rw: number;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  total: number;
  date_time: string; // ISO 8601 string
  method: string;
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
  method?: string;
  startDate?: string; // RFC3339 format
  endDate?: string; // RFC3339 format
  sortBy?: "newest" | "oldest";
}

// Interface Request Tambah Donasi
export interface CreateDonationRequest {
  total: number;
  date_time: string; // RFC3339 (misal: 2025-10-15T12:00:00Z)
  method: string;
}

// Interface Request Update Donasi BARU
export interface UpdateDonationRequest {
  total: number;
  date_time: string; // RFC3339
  method: string;
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

// GET /donation/methods
export const getDonationMethods = async (token: string): Promise<string[]> => {
  try {
    const response = await axios.get<Array<{ method: string }>>(`${VITE_API_URL}/donation/methods`, getAuthHeaders(token));
    return response.data.map((item) => item.method);
  } catch (error) {
    console.error("Failed to fetch methods:", error);
    return [];
  }
};

// POST /donation/ (Create)
export const createDonation = async (token: string, data: CreateDonationRequest): Promise<TransactionAPI> => {
  const response = await axios.post<TransactionAPI>(`${VITE_API_URL}/donation/`, data, getAuthHeaders(token));
  return response.data;
};

// PATCH /donation/:id (Update) BARU
export const updateDonation = async (token: string, id: string, data: UpdateDonationRequest): Promise<TransactionAPI> => {
  const response = await axios.patch<TransactionAPI>(`${VITE_API_URL}/donation/${id}`, data, getAuthHeaders(token));
  return response.data;
};

// DELETE /donation/:id (Delete) BARU
export const deleteDonation = async (token: string, id: string): Promise<void> => {
  await axios.delete<void>(`${VITE_API_URL}/donation/${id}`, getAuthHeaders(token));
};
