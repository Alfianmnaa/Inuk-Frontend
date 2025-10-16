import axios from "axios";
import { toast } from "react-hot-toast";

// URL API diambil dari .env (misal: http://localhost:8000)
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Tipe data untuk permintaan dan respons
export interface RegionFilterBody {
  province?: string; // Diperbaiki: menggunakan nama parameter backend
  city?: string;
  subdistrict?: string;
  village?: string;
}

export interface RegionDetail {
  id: string;
  user_id: string;
  user_name: string;
  rw: number;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
}

// --- Helper untuk Header Admin (memerlukan JWT) ---
const getAdminHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Public Access API (Menggunakan GET dengan Query Params) ---

// Endpoint: GET /region/provinces
export const getProvinces = async () => {
  try {
    const response = await axios.get<Array<{ provinsi: string }>>(`${VITE_API_URL}/region/provinces`);

    // Perbaikan Error: Cek apakah data adalah array sebelum map
    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.provinsi).filter((p) => p !== "");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch provinces:", error);
    return [];
  }
};

// Endpoint: GET /region/cities
export const getCities = async (province: string) => {
  // Menggunakan 'province' sebagai parameter
  if (!province) return [];
  try {
    // PERBAIKAN: Menggunakan key 'province' agar match dengan c.Query("province")
    const response = await axios.get<Array<{ kabupaten_kota: string }>>(`${VITE_API_URL}/region/cities`, {
      params: { province: province },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.kabupaten_kota).filter((c) => c !== "");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return [];
  }
};

// Endpoint: GET /region/Subdistricts
export const getSubdistricts = async (province: string, city: string) => {
  // Menggunakan 'city'
  if (!province || !city) return [];
  try {
    // PERBAIKAN: Menggunakan key 'province' dan 'city'
    const response = await axios.get<Array<{ kecamatan: string }>>(`${VITE_API_URL}/region/Subdistricts`, {
      params: { province: province, city: city },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.kecamatan).filter((s) => s !== "");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch subdistricts:", error);
    return [];
  }
};

// Endpoint: GET /region/villages
export const getVillages = async (province: string, city: string, subdistrict: string) => {
  // Menggunakan 'subdistrict'
  if (!province || !city || !subdistrict) return [];
  try {
    // PERBAIKAN: Menggunakan key 'province', 'city', dan 'subdistrict'
    const response = await axios.get<Array<{ desa_kelurahan: string }>>(`${VITE_API_URL}/region/villages`, {
      params: { province: province, city: city, subdistrict: subdistrict },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => item.desa_kelurahan).filter((v) => v !== "");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch villages:", error);
    return [];
  }
};

// Endpoint: GET /regions (Untuk Admin List/Filter)
export const getRegions = async (filters: RegionFilterBody): Promise<RegionDetail[]> => {
  try {
    // Axios akan mengirim key: 'province', 'city', dll. sesuai dengan object filters
    const response = await axios.get<RegionDetail[]>(`${VITE_API_URL}/regions`, {
      params: filters,
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => ({
        ...item,
        user_name: item.user_name || "N/A", // Handle jika user_name null
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    throw error;
  }
};

// --- Admin Access API (CRUD) ---

// Endpoint: POST /region/
export const createRegion = async (data: { userID: string; rw: number; province: string; city: string; subdistrict: string; village: string }, token: string) => {
  // Disesuaikan dengan CreateRegionRequest di backend
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
