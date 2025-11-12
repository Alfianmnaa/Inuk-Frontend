import axios from "axios";
import { type RegionFilterBody } from "./RegionService";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface DonationDataRecap {
  desa: string;
  jumlahDonatur: number;
  totalDonasi: number;
}

// Interface Rekapitulasi per Kecamatan BARU
export interface KecamatanDataRecap {
  nama: string;
  data: DonationDataRecap[];
}
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
  donor_id: string;
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
export const getDonationRecap = async (): Promise<KecamatanDataRecap[]> => {
  // --- SIMULASI API CALL ---
  // Di lingkungan nyata, ini akan memanggil backend API:
  // const response = await axios.get<KecamatanDataRecap[]>(`${VITE_API_URL}/donations/recap`);
  // return response.data;

  // Data simulasi berdasarkan Kecamatan Kaliwungu (15 Desa) dan Gebog (11 Desa)
  // Data ini harusnya diambil dari backend yang melakukan agregasi
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  return [
    {
      nama: "KALIWUNGU",
      data: [
        { desa: "Bakalankrapyak", jumlahDonatur: 10, totalDonasi: 5000000 },
        { desa: "Banget", jumlahDonatur: 5, totalDonasi: 1500000 },
        { desa: "Blimbing Kidul", jumlahDonatur: 12, totalDonasi: 3500000 },
        { desa: "Gamong", jumlahDonatur: 8, totalDonasi: 2200000 },
        { desa: "Garung Kidul", jumlahDonatur: 15, totalDonasi: 4800000 },
        { desa: "Garung Lor", jumlahDonatur: 9, totalDonasi: 2700000 },
        { desa: "Kaliwungu", jumlahDonatur: 20, totalDonasi: 7000000 },
        { desa: "Karangampel", jumlahDonatur: 6, totalDonasi: 1800000 },
        { desa: "Kedungdowo", jumlahDonatur: 11, totalDonasi: 3100000 },
        { desa: "Mijen", jumlahDonatur: 7, totalDonasi: 2000000 },
        { desa: "Papringan", jumlahDonatur: 14, totalDonasi: 4500000 },
        { desa: "Prambatan Kidul", jumlahDonatur: 16, totalDonasi: 5200000 },
        { desa: "Prambatan Lor", jumlahDonatur: 13, totalDonasi: 4100000 },
        { desa: "Setrokalangan", jumlahDonatur: 18, totalDonasi: 6000000 },
        { desa: "Sidorekso", jumlahDonatur: 10, totalDonasi: 3000000 },
      ],
    },
    {
      nama: "GEBOG",
      data: [
        { desa: "Besito", jumlahDonatur: 25, totalDonasi: 8500000 },
        { desa: "Getassrabi", jumlahDonatur: 10, totalDonasi: 3000000 },
        { desa: "Gondosari", jumlahDonatur: 8, totalDonasi: 2400000 },
        { desa: "Gribig", jumlahDonatur: 18, totalDonasi: 5500000 },
        { desa: "Jurang", jumlahDonatur: 7, totalDonasi: 2000000 },
        { desa: "Karangmalang", jumlahDonatur: 15, totalDonasi: 4500000 },
        { desa: "Kedungsari", jumlahDonatur: 12, totalDonasi: 3600000 },
        { desa: "Klumpit", jumlahDonatur: 9, totalDonasi: 2800000 },
        { desa: "Menawan", jumlahDonatur: 11, totalDonasi: 3300000 },
        { desa: "Pedurenan", jumlahDonatur: 14, totalDonasi: 4000000 },
        { desa: "Rahtawu", jumlahDonatur: 20, totalDonasi: 6500000 },
      ],
    },
  ];
};
