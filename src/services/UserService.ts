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
  treasurer_phone: string; // FIX: Perubahan dari secretary_phone
  treasurer_name: string; // FIX: Perubahan dari secretary_name
  created_at: string;
  updated_at: string;
}

// BARU: Interface untuk response GetTreasurerHandler
export interface GetTreasurerResponse {
  treasurer_phone: string;
  treasurer_name: string;
}

// BARU: Interface untuk response GetUsersHandler (admin endpoint)
export interface GetUsersResponse {
  id: string;
  name: string;
  phone: string;
  region_id: string | null; // Region ID yang dipegang user (null jika belum punya)
  created_at: string;
}

// --- BARU: Interfaces untuk Admin Get User From ID ---
export interface GetDonorFromUserID {
  id: string;
  kaleng: string;
}

export interface GetUserFromIDResponse {
  id: string;
  name: string;
  phone: string;
  treasurer_name: string;
  region_id: string;
  provinsi: string;
  kecamatan: string;
  kabupaten_kota: string;
  desa_kelurahan: string;
  donors: GetDonorFromUserID[];
  created_at: string;
  updated_at: string;
}
// --- AKHIR: Interfaces untuk Admin Get User From ID ---

// --- BARU: Interfaces untuk Admin CRUD User ---

// Payload untuk Registrasi (Tambah User oleh Admin)
export interface RegisterUserPayload {
  name: string;
  phone: string;
  password: string;
}

// Payload untuk Update User (Admin)
export interface UpdateUserPayload {
  name?: string; // Menjadi opsional
  phone?: string; // Menjadi opsional
  region_id?: string; // Dapat berupa UUID Region atau string kosong/null
}

// --- Helper ---
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

// GET /user/treasurer
/**
 * Mengambil data Bendahara dari akun user yang sedang login.
 */
export const getTreasurer = async (token: string): Promise<GetTreasurerResponse> => {
  if (!token) {
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }
  try {
    const response: AxiosResponse<GetTreasurerResponse> = await axios.get(`${VITE_API_URL}/user/treasurer`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memuat data Bendahara.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat Bendahara.");
  }
};

// GET /admin/users (Read/Filter)
// is_verified dipertahankan untuk kebutuhan dual call di frontend
export const getUsers = async (token: string, name?: string, phone?: string, is_verified?: boolean): Promise<GetUsersResponse[]> => {
  if (!token) {
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }

  try {
    const response: AxiosResponse<GetUsersResponse[]> = await axios.get(`${VITE_API_URL}/admin/users`, {
      params: { name, phone, is_verified },
      ...getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Akses ditolak.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat pengguna.");
  }
};

// BARU: GET /admin/user/:id (Read Detail User)
export const getUserFromID = async (token: string, id: string): Promise<GetUserFromIDResponse> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    const response: AxiosResponse<GetUserFromIDResponse> = await axios.get(`${VITE_API_URL}/admin/user/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memuat detail pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat detail pengguna.");
  }
};

// PATCH /user/treasurer
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

// --- BARU: Admin Register User (Tambah User) ---
export const adminRegisterUser = async (token: string, payload: RegisterUserPayload, role: "user" | "admin"): Promise<any> => {
  // Endpoint yang dipanggil sesuai role yang akan dibuat
  const endpoint = role === "admin" ? "/admin/register" : "/register";
  try {
    // NOTE: Endpoint register tidak di bawah middleware Admin, namun kita tetap kirim token untuk konsistensi
    const response: AxiosResponse<any> = await axios.post(`${VITE_API_URL}${endpoint}`, payload, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal mendaftarkan pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat mendaftarkan pengguna.");
  }
};

// --- BARU: Admin Update User (Edit User) ---
export const updateUser = async (token: string, id: string, payload: UpdateUserPayload): Promise<any> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    const response: AxiosResponse<any> = await axios.patch(`${VITE_API_URL}/admin/user/${id}`, payload, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memperbarui pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memperbarui pengguna.");
  }
};

// --- BARU: Admin Delete User ---
export const deleteUser = async (token: string, id: string): Promise<void> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    await axios.delete(`${VITE_API_URL}/admin/user/${id}`, getAuthHeaders(token));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal menghapus pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat menghapus pengguna.");
  }
};
