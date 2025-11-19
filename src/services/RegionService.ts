// inuk-frontend/src/services/RegionService.ts

import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- 1. TYPES & INTERFACES ---

// Tipe data user ringkas di dalam object region
export interface RegionUser {
  user_id: string;
  user_name: string;
}

// Tipe data untuk filter (menggunakan nama parameter backend)
export interface RegionFilterBody {
  province?: string;
  city?: string;
  subdistrict?: string;
  village?: string;
}

// Tipe data Region Detail (Updated: Mendukung Multiple Users)
export interface RegionDetail {
  id: string;
  provinsi: string;
  kabupaten_kota: string;
  kecamatan: string;
  desa_kelurahan: string;
  // Array users menggantikan user_id single agar bisa menampung banyak PJT
  user: RegionUser[];
}

// Payload untuk Create/Update Region (HANYA LOKASI)
export interface CreateRegionPayload {
  provinsi: string;
  kabupaten_kota: string;
  kecamatan: string;
  desa_kelurahan: string;
}

// Payload untuk Assign Users (Bulk)
export interface SetRegionUsersPayload {
  users: string[]; // Array of User UUIDs
}

// Helper untuk Header Admin (memerlukan JWT)
const getAdminHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Helper Error Handler
const handleError = (error: any, defaultMsg: string) => {
  if (axios.isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message || error.response.data?.error;
    throw new Error(backendMessage || defaultMsg);
  }
  throw new Error(defaultMsg);
};

// --- 2. MAIN API METHODS (ADMIN) ---

// Endpoint: GET /regions (Read/Filter)
export const getRegions = async (filters?: RegionFilterBody): Promise<RegionDetail[]> => {
  try {
    const response = await axios.get<RegionDetail[]>(`${VITE_API_URL}/regions`, {
      params: filters,
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return []; // Return kosong agar UI tidak crash
  }
};

// Endpoint: POST /region/ (Create HANYA Region, text only)
export const createRegion = async (data: CreateRegionPayload, token: string): Promise<RegionDetail> => {
  try {
    const response = await axios.post<RegionDetail>(`${VITE_API_URL}/region/`, data, getAdminHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal membuat region.");
    throw error;
  }
};

// Endpoint: PATCH /region/:id (Update LOKASI)
export const updateRegion = async (id: string, data: CreateRegionPayload, token: string): Promise<RegionDetail> => {
  try {
    const response = await axios.patch<RegionDetail>(`${VITE_API_URL}/region/${id}`, data, getAdminHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal memperbarui region.");
    throw error;
  }
};

// Endpoint: DELETE /region/:id (Delete)
export const deleteRegion = async (id: string, token: string): Promise<boolean> => {
  try {
    await axios.delete(`${VITE_API_URL}/region/${id}`, getAdminHeaders(token));
    return true;
  } catch (error) {
    handleError(error, "Gagal menghapus region.");
    throw error;
  }
};

// Endpoint: POST /region/:id/users (ASSIGN Multiple Users)
// Ini digunakan oleh modal "Tambah Penanggung Jawab"
export const setRegionUsers = async (regionId: string, userIds: string[], token: string): Promise<any> => {
  try {
    const payload: SetRegionUsersPayload = { users: userIds };
    const response = await axios.post(`${VITE_API_URL}/region/${regionId}/users`, payload, getAdminHeaders(token));
    return response.data;
  } catch (error) {
    handleError(error, "Gagal menetapkan penanggung jawab.");
    throw error;
  }
};

// --- 3. PUBLIC API HELPERS (Dropdown Wilayah) ---

export const getProvinces = async () => {
  try {
    const response = await axios.get<Array<{ provinsi: string }>>(`${VITE_API_URL}/region/provinces`);
    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.provinsi).filter((p) => p !== "");
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getCities = async (province: string) => {
  if (!province) return [];
  try {
    const response = await axios.get<Array<{ kabupaten_kota: string }>>(`${VITE_API_URL}/region/cities`, {
      params: { province: province },
    });
    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.kabupaten_kota).filter((c) => c !== "");
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getSubdistricts = async (province: string, city: string) => {
  if (!province || !city) return [];
  try {
    const response = await axios.get<Array<{ kecamatan: string }>>(`${VITE_API_URL}/region/subdistricts`, {
      params: { province: province, city: city },
    });
    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.kecamatan).filter((s) => s !== "");
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getVillages = async (province: string, city: string, subdistrict: string) => {
  if (!province || !city || !subdistrict) return [];
  try {
    const response = await axios.get<Array<{ desa_kelurahan: string }>>(`${VITE_API_URL}/region/villages`, {
      params: { province: province, city: city, subdistrict: subdistrict },
    });
    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.desa_kelurahan).filter((v) => v !== "");
    }
    return [];
  } catch (error) {
    return [];
  }
};
