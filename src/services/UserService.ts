// inuk-frontend/src/services/UserService.ts

import axios, { type AxiosResponse } from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Payload yang sesuai dengan UpdateTreasurerRequest di Go (snake_case)
export interface UpdateTreasurerPayload {
  treasurer_name: string;
  treasurer_phone: string;
}

// Respon yang sesuai dengan UpdateTreasurerResponse di Go
export interface UpdateTreasurerResponse {
  id: string;
  phone: string;
  name: string;
  secretary_phone: string;
  secretary_name: string;
  created_at: string;
  updated_at: string;
}

// BARU: Interface untuk response GetUsersHandler (admin endpoint)
export interface GetUsersResponse {
  id: string;
  name: string;
  phone: string;
  region_id: string | null; // Region ID yang dipegang user (null jika belum punya)
  created_at: string;
}

// Helper untuk Header Autentikasi
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Mengambil daftar semua pengguna (Hanya untuk Admin)
 * @param token - Token JWT pengguna yang sedang login
 * @param name - Filter opsional berdasarkan nama
 * @param phone - Filter opsional berdasarkan nomor telepon
 * @returns Promise<GetUsersResponse[]>
 */
export const getUsers = async (token: string, name?: string, phone?: string): Promise<GetUsersResponse[]> => {
  if (!token) {
    // throw new Error akan ditangkap di komponen
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }

  try {
    const response: AxiosResponse<GetUsersResponse[]> = await axios.get(`${VITE_API_URL}/admin/users/`, {
      params: { name, phone },
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // PENTING: Response 401/403 dari backend Go
      const backendMessage = error.response.data?.message || error.response.data?.error || "Akses ditolak.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat pengguna.");
  }
};
/**
 * Mengirimkan data Bendahara baru ke endpoint PATCH /user/treasurer
 */
export const updateTreasurer = async (token: string, payload: UpdateTreasurerPayload): Promise<UpdateTreasurerResponse> => {
  if (!token) {
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }

  try {
    const response: AxiosResponse<UpdateTreasurerResponse> = await axios.patch(`${VITE_API_URL}/user/treasurer`, payload, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal mengupdate data Bendahara.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat mencoba mengupdate Bendahara.");
  }
};
