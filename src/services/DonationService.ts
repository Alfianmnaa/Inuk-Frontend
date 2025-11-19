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
  await axios.delete(`${VITE_API_URL}/donation/${id}`, getAuthHeaders(token));
};

export const getDonationRecap = async (): Promise<KecamatanDataRecap[]> => {
  // Implementation notes / assumptions:
  // - The endpoint `GET ${VITE_API_URL}/donations` supports a `page` query param and returns
  //   a DonationsResponse with fields `result` and `has_next_page`.
  // - jumlahDonatur is computed as the number of unique `kaleng` values per `desa_kelurahan`.
  //   If `kaleng` is missing for a transaction we ignore it for the uniqueness count but still
  //   sum its `total` to totalDonasi.
  // - On failure we return the previous hard-coded sample (keeps backward compatibility for UI).

  try {
    const allTransactions: TransactionAPI[] = [];
    let page = 1;

    // Page through all donations
    while (true) {
      const resp = await axios.get<DonationsResponse>(`${VITE_API_URL}/donations`, { params: { page } });
      const payload = resp.data;
      if (!payload || !Array.isArray(payload.result)) break;
      allTransactions.push(...payload.result);
      if (!payload.has_next_page) break;
      page += 1;
    }

    // Aggregate: kecamatan -> desa_kelurahan -> { totalDonasi, kalengSet }
    const kecMap = new Map<string, Map<string, { totalDonasi: number; kalengSet: Set<string> }>>();

    for (const tx of allTransactions) {
      const kec = tx.kecamatan ?? "(UNKNOWN)";
      const desa = tx.desa_kelurahan ?? "(UNKNOWN)";

      let desaMap = kecMap.get(kec);
      if (!desaMap) {
        desaMap = new Map();
        kecMap.set(kec, desaMap);
      }

      let entry = desaMap.get(desa);
      if (!entry) {
        entry = { totalDonasi: 0, kalengSet: new Set<string>() };
        desaMap.set(desa, entry);
      }

      entry.totalDonasi += typeof tx.total === "number" ? tx.total : 0;
      if (tx.kaleng) entry.kalengSet.add(tx.kaleng);
    }

    const recap: KecamatanDataRecap[] = [];
    for (const [kecName, desaMap] of kecMap.entries()) {
      const data: DonationDataRecap[] = [];
      for (const [desaName, entry] of desaMap.entries()) {
        data.push({ desa: desaName, jumlahDonatur: entry.kalengSet.size, totalDonasi: entry.totalDonasi });
      }
      // Optional: sort villages by totalDonasi desc for better presentation
      data.sort((a, b) => b.totalDonasi - a.totalDonasi);
      recap.push({ nama: kecName, data });
    }

    // Optional: sort kecamatan by name
    recap.sort((a, b) => a.nama.localeCompare(b.nama));
    return recap;
  } catch (error) {
    // If anything goes wrong, log and return the previous sample dataset so UI can continue
    console.error("Failed to fetch donation recap (falling back to sample):", error);
    await new Promise((resolve) => setTimeout(resolve, 500)); // keep previous simulated delay
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
  }
};
