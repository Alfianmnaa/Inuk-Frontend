import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Backend GetMasjidsResponse now includes region fields directly
export interface MasjidResponse {
  id: string;
  name: string;
  admin_id: string;
  region_id: string;
  provinsi: string;
  kecamatan: string;
  kabupaten_kota: string;
  desa_kelurahan: string;
}

export interface CreateMasjidPayload {
  name: string;
  region_id: string;
}

export interface UpdateMasjidPayload {
  name?: string;
  region_id?: string;
  admin_id?: string;
}

export interface DeleteMasjidResponse {
  id: string;
  is_deleted: boolean;
}

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: any, defaultMsg: string) => {
  if (axios.isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message || error.response.data?.error;
    throw new Error(backendMessage || defaultMsg);
  }
  throw new Error(defaultMsg);
};

export const getMasjids = async (token: string): Promise<MasjidResponse[]> => {
  try {
    const response = await axios.get<MasjidResponse[]>(
      `${VITE_API_URL}/masjids`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch masjids:", error);
    return [];
  }
};

export const createMasjid = async (
  token: string,
  data: CreateMasjidPayload
): Promise<MasjidResponse> => {
  try {
    const response = await axios.post<MasjidResponse>(
      `${VITE_API_URL}/masjid`,
      data,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleError(error, "Gagal membuat masjid.");
    throw error;
  }
};

export const updateMasjid = async (
  token: string,
  id: string,
  data: UpdateMasjidPayload
): Promise<MasjidResponse> => {
  try {
    const response = await axios.patch<MasjidResponse>(
      `${VITE_API_URL}/masjid/${id}`,
      data,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleError(error, "Gagal memperbarui masjid.");
    throw error;
  }
};

export const deleteMasjid = async (
  token: string,
  id: string
): Promise<DeleteMasjidResponse> => {
  try {
    const response = await axios.delete<DeleteMasjidResponse>(
      `${VITE_API_URL}/masjid/${id}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleError(error, "Gagal menghapus masjid.");
    throw error;
  }
};