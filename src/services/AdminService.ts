import axios, { type AxiosResponse } from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// BARU: Interface untuk response GetAdminsHandler (admin endpoint)
export interface GetAdminsResponse {
  id: string;
  name: string;
  phone: string;
  region_id: string | null; // Region ID yang dipegang admin (null jika belum punya)
  created_at: string;
}

// --- BARU: Interfaces untuk Admin Profile (GET /admin/profile) ---
export interface GetAdminProfileResponse {
  id: string;
  phone: string;
  name: string;
  region_id: string;
  provinsi: string;
  kecamatan: string;
  kabupaten_kota: string;
  desa_kelurahan: string;
  created_at: string;
  updated_at: string;
}
// --- AKHIR: Interfaces untuk Admin Profile ---

// --- BARU: Interfaces untuk Admin Get Admin From ID ---
export interface GetDonorFromAdminID {
  id: string;
  kaleng: string;
}

export interface GetAdminFromIDResponse {
  id: string;
  name: string;
  phone: string;
  region_id: string;
  provinsi: string;
  kecamatan: string;
  kabupaten_kota: string;
  desa_kelurahan: string;
  // donors: GetDonorFromAdminID[];
  created_at: string;
  updated_at: string;
}

// Payload untuk Registrasi (Tambah Admin oleh Admin)
export interface RegisterAdminPayload {
  name: string;
  phone: string;
  password: string;
}

// Payload untuk Update Admin (Admin)
export interface UpdateAdminPayload {
  name?: string; // Menjadi opsional
  phone?: string; // Menjadi opsional
  region_id?: string; // Dapat berupa UUID Region atau string kosong/null
}

export interface UpdateDeleteAdminRegionPayload {
  region_id?: string; // Dapat berupa UUID Region atau string kosong/null
}

// ── Admin Treasurer ───────────────────────────────────────────────────────────

/** Response dari GET /admin/treasurer */
export interface GetAdminTreasurerResponse {
  treasurer_phone: string;
  treasurer_name: string;
}

/** Payload untuk PATCH /admin/treasurer */
export interface UpdateAdminTreasurerPayload {
  treasurer_name: string;
  treasurer_phone: string;
}

/** Response dari PATCH /admin/treasurer */
export interface UpdateAdminTreasurerResponse {
  id: string;
  phone: string;
  name: string;
  treasurer_phone: string;
  treasurer_name: string;
  created_at: string;
  updated_at: string;
}

// --- Helper ---
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

// GET /admin/profile
/**
 * Mengambil data profil lengkap admin yang sedang login, termasuk region (jika terikat).
 */
export const getAdminProfile = async (token: string): Promise<GetAdminProfileResponse> => {
  if (!token) {
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }
  try {
    const response: AxiosResponse<GetAdminProfileResponse> = await axios.get(`${VITE_API_URL}/admin/profile`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memuat data profil pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat profil pengguna.");
  }
};

// GET /admin/treasurer
/**
 * Mengambil data Bendahara dari akun admin yang sedang login.
 */
export const getAdminTreasurer = async (token: string): Promise<GetAdminTreasurerResponse> => {
  if (!token) throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  try {
    const response: AxiosResponse<GetAdminTreasurerResponse> = await axios.get(
      `${VITE_API_URL}/admin/treasurer`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memuat data Bendahara.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat data Bendahara.");
  }
};

// PATCH /admin/treasurer
/**
 * Memperbarui data Bendahara dari akun admin yang sedang login.
 */
export const updateAdminTreasurer = async (
  token: string,
  payload: UpdateAdminTreasurerPayload
): Promise<UpdateAdminTreasurerResponse> => {
  if (!token) throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  try {
    const response: AxiosResponse<UpdateAdminTreasurerResponse> = await axios.patch(
      `${VITE_API_URL}/admin/treasurer`,
      payload,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memperbarui data Bendahara.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memperbarui data Bendahara.");
  }
};

// GET /superadmin/admins (Read/Filter)
// is_verified dipertahankan untuk kebutuhan dual call di frontend
export const getAdmins = async (token: string, name?: string, phone?: string, is_verified?: boolean): Promise<GetAdminsResponse[]> => {
  if (!token) {
    throw new Error("Autentikasi diperlukan. Token tidak ditemukan.");
  }

  try {
    const response: AxiosResponse<GetAdminsResponse[]> = await axios.get(`${VITE_API_URL}/superadmin/admins`, {
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

// BARU: GET /superadmin/admin/:id (Read Detail Admin)
export const getAdminFromID = async (token: string, id: string): Promise<GetAdminFromIDResponse> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    const response: AxiosResponse<GetAdminFromIDResponse> = await axios.get(`${VITE_API_URL}/superadmin/admin/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memuat detail pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat detail pengguna.");
  }
};

// --- BARU: Admin Register Admin (Tambah Admin) ---
export const adminRegisterAdmin = async (token: string, payload: RegisterAdminPayload): Promise<any> => {
  // Endpoint yang dipanggil sesuai role yang akan dibuat
  const endpoint = "/admin/register";
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

// --- BARU: Admin Update Admin (Edit Admin) ---
export const updateAdmin = async (token: string, id: string, payload: UpdateAdminPayload): Promise<any> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    const response: AxiosResponse<any> = await axios.patch(`${VITE_API_URL}/superadmin/admin/${id}`, payload, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memperbarui pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memperbarui pengguna.");
  }
};

export const updateDeleteAdminRegion = async (token: string, id: string, payload: UpdateDeleteAdminRegionPayload): Promise<any> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    const response: AxiosResponse<any> = await axios.patch(`${VITE_API_URL}/superadmin/admin/${id}/region`, payload, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memperbarui pengguna.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat memperbarui pengguna.");
  }
};

// --- BARU: Admin Delete Admin ---
export const deleteAdmin = async (token: string, id: string): Promise<void> => {
  if (!token) throw new Error("Autentikasi diperlukan.");
  try {
    await axios.delete(`${VITE_API_URL}/superadmin/admin/${id}`, getAuthHeaders(token));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || "Gagal menghapus pengguna.");
    }
    throw new Error("Terjadi kesalahan jaringan saat menghapus pengguna.");
  }
};