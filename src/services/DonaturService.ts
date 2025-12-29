import axios, { type AxiosResponse } from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- Interfaces Sesuai Backend (Go) ---
// Donatur yang diterima/dikirim ke API (snake_case di Go JSON tag)
export interface DonaturAPI {
  id: string;
  user_id: string; // ID Petugas yang mendaftarkan
  kaleng: string;
  phone: string;
  name: string;
  rw: number;
  rt: number;
}

// Payload untuk membuat Donatur (sesuai CreateDonorRequest di Go)
export interface CreateDonaturPayload {
  kaleng: string;
  phone: string;
  name: string;
  rw: number;
  rt: number;
}

// Payload untuk update Donatur (semua optional, sesuai UpdateDonorRequest di Go)
export interface UpdateDonaturPayload {
  kaleng?: string;
  phone: string;
  name?: string;
  rw?: number;
  rt?: number;
}

// --- Interface untuk Komponen Frontend (Diolah untuk Display) ---
// Data yang ditampilkan di Frontend (sudah diolah)
export interface Donatur {
  id: string;
  noKaleng: string;
  phone: string;
  namaDonatur: string;
  rw: string;
  rt: string;
  kecamatan: string;
  desa: string;
}

// --- Helper ---
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- API Calls ---

// GET /donors
export const getDonaturList = async (
  token: string,
  searchTerm: string,
): Promise<DonaturAPI[]> => {
  if (!token) throw new Error("Autentikasi diperlukan.");

  try {
    const response: AxiosResponse<DonaturAPI[]> = await axios.get(
      `${VITE_API_URL}/donors`,
      getAuthHeaders(token),
    );

    let data = response.data;

    // Filter sisi klien berdasarkan searchTerm (nama atau kaleng)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerSearch) ||
          d.kaleng.toLowerCase().includes(lowerSearch),
      );
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Gagal memuat daftar Donatur.",
      );
    }
    throw new Error("Terjadi kesalahan jaringan saat memuat Donatur.");
  }
};

// POST /donor/
export const createDonatur = async (
  token: string,
  payload: CreateDonaturPayload,
): Promise<DonaturAPI> => {
  if (!token) throw new Error("Autentikasi diperlukan.");

  try {
    const response: AxiosResponse<DonaturAPI> = await axios.post(
      `${VITE_API_URL}/donor/`,
      payload,
      getAuthHeaders(token),
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errors = error.response.data?.errors
        ?.map((e: any) => `${e.field}: ${e.message}`)
        .join(", ");
      throw new Error(
        errors || error.response.data?.message || "Gagal membuat Donatur.",
      );
    }
    throw new Error("Terjadi kesalahan jaringan saat membuat Donatur.");
  }
};

// PATCH /donor/:id
export const updateDonatur = async (
  token: string,
  id: string,
  payload: UpdateDonaturPayload,
): Promise<DonaturAPI> => {
  if (!token) throw new Error("Autentikasi diperlukan.");

  try {
    const response: AxiosResponse<DonaturAPI> = await axios.patch(
      `${VITE_API_URL}/donor/${id}`,
      payload,
      getAuthHeaders(token),
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errors = error.response.data?.errors
        ?.map((e: any) => `${e.field}: ${e.message}`)
        .join(", ");
      throw new Error(
        errors || error.response.data?.message || "Gagal mengupdate Donatur.",
      );
    }
    throw new Error("Terjadi kesalahan jaringan saat mengupdate Donatur.");
  }
};

// DELETE /donor/:id
export const deleteDonatur = async (
  token: string,
  id: string,
): Promise<void> => {
  if (!token) throw new Error("Autentikasi diperlukan.");

  try {
    await axios.delete(`${VITE_API_URL}/donor/${id}`, getAuthHeaders(token));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Gagal menghapus Donatur.",
      );
    }
    throw new Error("Terjadi kesalahan jaringan saat menghapus Donatur.");
  }
};
