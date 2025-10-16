// src/services/RegionService.ts

import axios from "axios";
import { toast } from "react-hot-toast";

// URL API diambil dari .env (misal: http://localhost:8000)
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Tipe data untuk permintaan dan respons, disesuaikan dengan models.go
// dan regions.sql.go

export interface RegionFilterBody {
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
}

export interface RegionDetail {
  id: string; // UUID
  user_id: string;
  user_name: string;
  rw: number;
  desa_kelurahan: string; // Village
  kecamatan: string; // Subdistrict
  kabupaten_kota: string; // City
  provinsi: string; // Province
  // created_at, updated_at dihilangkan dari interface ini untuk penyederhanaan
}

// --- Helper untuk Header Admin (memerlukan JWT) ---
const getAdminHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Public Access API (Cascading Dropdown - Menggunakan POST untuk mengirim body) ---

// Endpoint: GET /region/provinces
export const getProvinces = async () => {
  try {
    const response = await axios.get<Array<{ provinsi: string }>>(`${VITE_API_URL}/region/provinces`);
    return response.data.map((item) => item.provinsi).filter((p) => p !== "");
  } catch (error) {
    console.error("Failed to fetch provinces:", error);
    return [];
  }
};

// Endpoint: POST /region/cities
export const getCities = async (provinsi: string) => {
  if (!provinsi) return [];
  try {
    const response = await axios.post<Array<{ kabupaten_kota: string }>>(`${VITE_API_URL}/region/cities`, { provinsi });
    return response.data.map((item) => item.kabupaten_kota).filter((c) => c !== "");
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return [];
  }
};

// Endpoint: POST /region/Subdistricts
export const getSubdistricts = async (provinsi: string, kabupaten_kota: string) => {
  if (!provinsi || !kabupaten_kota) return [];
  try {
    const response = await axios.post<Array<{ kecamatan: string }>>(`${VITE_API_URL}/region/Subdistricts`, { provinsi, kabupaten_kota });
    return response.data.map((item) => item.kecamatan).filter((s) => s !== "");
  } catch (error) {
    console.error("Failed to fetch subdistricts:", error);
    return [];
  }
};

// Endpoint: POST /region/villages
export const getVillages = async (provinsi: string, kabupaten_kota: string, kecamatan: string) => {
  if (!provinsi || !kabupaten_kota || !kecamatan) return [];
  try {
    const response = await axios.post<Array<{ desa_kelurahan: string }>>(`${VITE_API_URL}/region/villages`, { provinsi, kabupaten_kota, kecamatan });
    return response.data.map((item) => item.desa_kelurahan).filter((v) => v !== "");
  } catch (error) {
    console.error("Failed to fetch villages:", error);
    return [];
  }
};

// Endpoint: GET /regions (Untuk Admin List/Filter)
// Backend Go menggunakan Query Params untuk GET /regions
export const getRegions = async (filters: RegionFilterBody): Promise<RegionDetail[]> => {
  try {
    const response = await axios.get<RegionDetail[]>(`${VITE_API_URL}/regions`, {
      params: {
        provinsi: filters.provinsi || undefined,
        kabupaten_kota: filters.kabupaten_kota || undefined,
        kecamatan: filters.kecamatan || undefined,
        desa_kelurahan: filters.desa_kelurahan || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return [];
  }
};

// --- Admin Access API (CRUD) ---

// Endpoint: POST /region/
export const createRegion = async (data: { userID: string; rw: number; province: string; city: string; subdistrict: string; village: string }, token: string) => {
  const payload = {
    user_id: data.userID,
    rw: data.rw,
    desa_kelurahan: data.village,
    kecamatan: data.subdistrict,
    kabupaten_kota: data.city,
    provinsi: data.province,
  };
  const response = await axios.post<RegionDetail>(`${VITE_API_URL}/region/`, payload, getAdminHeaders(token));
  return response.data;
};

// Endpoint: DELETE /region/:id
export const deleteRegion = async (id: string, token: string) => {
  await axios.delete(`${VITE_API_URL}/region/${id}`, getAdminHeaders(token));
  return true;
};
