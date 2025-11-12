// inuk-frontend/src/services/RegionService.ts

import axios from "axios";
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Tipe data untuk filter (menggunakan nama parameter backend)
export interface RegionFilterBody {
  province?: string;
  city?: string;
  subdistrict?: string;
  village?: string;
}

// Tipe data Region Detail (DIPERBAIKI: RW Dihapus)
export interface RegionDetail {
  id: string;
  user_id: string;
  user_name: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
}

// Payload untuk Create Region
export interface CreateRegionPayload {
  user_id: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
}

// Payload untuk Update Region (hanya user_id yang bisa diubah, sesuai backend)
export interface UpdateRegionPayload {
  user_id: string;
}

// Tipe data untuk response update/create (sesuai backend model)
export interface CreateUpdateRegionResponse {
  id: string;
  user_id: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  created_at: string;
  updated_at: string;
}

// --- Helper untuk Header Admin (memerlukan JWT) ---
const getAdminHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Endpoint: GET /regions (Read/Filter)
export const getRegions = async (filters: RegionFilterBody): Promise<RegionDetail[]> => {
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
    throw error;
  }
};

// --- Admin Access API (CRUD) ---

// Endpoint: POST /region/ (Create)
// DIPERBAIKI: Menggunakan CreateRegionPayload (tanpa RW)
export const createRegion = async (data: CreateRegionPayload, token: string): Promise<CreateUpdateRegionResponse> => {
  const payload: CreateRegionPayload = {
    user_id: data.user_id,
    desa_kelurahan: data.desa_kelurahan,
    kecamatan: data.kecamatan,
    kabupaten_kota: data.kabupaten_kota,
    provinsi: data.provinsi,
  };
  try {
    const response = await axios.post<CreateUpdateRegionResponse>(`${VITE_API_URL}/region/`, payload, getAdminHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal membuat region.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat mencoba membuat region.");
  }
};

// Endpoint: PATCH /region/:id (Update)
export const updateRegion = async (id: string, data: UpdateRegionPayload, token: string): Promise<CreateUpdateRegionResponse> => {
  const payload: UpdateRegionPayload = { user_id: data.user_id };

  try {
    const response = await axios.patch<CreateUpdateRegionResponse>(`${VITE_API_URL}/region/${id}`, payload, getAdminHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal memperbarui region.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat mencoba memperbarui region.");
  }
};

// Endpoint: DELETE /region/:id (Delete)
export const deleteRegion = async (id: string, token: string) => {
  try {
    await axios.delete(`${VITE_API_URL}/region/${id}`, getAdminHeaders(token));
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || "Gagal menghapus region.";
      throw new Error(backendMessage);
    }
    throw new Error("Terjadi kesalahan jaringan saat mencoba menghapus region.");
  }
};

// --- Fungsi Public Access API sisanya yang tidak diubah (untuk AddressSelector) ---
// Note: Fungsi-fungsi ini DIJAGA agar tetap ada dan namanya tidak berubah
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
