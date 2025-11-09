// Tipe Data Donatur Baru
export interface Donatur {
  id: string;
  noKaleng: string;
  namaDonatur: string;
  kecamatan: string;
  desa: string;
  rw: string;
  rt: string;
}

// Fixed Region Data (Simulasi dari Auth Context)
const FIXED_KECAMATAN = "Kaliwungu";
const FIXED_DESA = "Bakalankrapyak";
const FIXED_RW = "001";

// Dummy Data Awal
let DUMMY_DONATUR: Donatur[] = [
  { id: "1", noKaleng: "KLD-001", namaDonatur: "Ahmad Subroto", kecamatan: FIXED_KECAMATAN, desa: FIXED_DESA, rw: FIXED_RW, rt: "001" },
  { id: "2", noKaleng: "KLD-002", namaDonatur: "Siti Aisyah", kecamatan: FIXED_KECAMATAN, desa: FIXED_DESA, rw: FIXED_RW, rt: "002" },
  { id: "3", noKaleng: "KLD-003", namaDonatur: "Budi Santoso", kecamatan: FIXED_KECAMATAN, desa: FIXED_DESA, rw: FIXED_RW, rt: "003" },
];

// --- DUMMY API SIMULATION ---

export const getDonaturList = async (search: string, kecamatan: string, desa: string): Promise<Donatur[]> => {
  // Simulasikan delay API
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter berdasarkan region (ini hanya akan mengembalikan data jika cocok dengan region yang ditetapkan)
  let filtered = DUMMY_DONATUR.filter((d) => d.kecamatan === kecamatan && d.desa === desa);

  // Filter berdasarkan search term (nama atau no kaleng)
  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter((d) => d.namaDonatur.toLowerCase().includes(lowerSearch) || d.noKaleng.toLowerCase().includes(lowerSearch));
  }

  return filtered;
};

export const createDonatur = async (data: Omit<Donatur, "id" | "kecamatan" | "desa" | "rw">, kecamatan: string, desa: string, rw: string): Promise<Donatur> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newId = (DUMMY_DONATUR.length + 1).toString();
  const newDonatur: Donatur = {
    id: newId,
    ...data,
    kecamatan,
    desa,
    rw,
  };
  DUMMY_DONATUR.push(newDonatur);
  return newDonatur;
};

export const updateDonatur = async (id: string, data: Omit<Donatur, "kecamatan" | "desa" | "rw">): Promise<Donatur> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = DUMMY_DONATUR.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error("Donatur not found");
  }

  const updatedDonatur: Donatur = {
    ...DUMMY_DONATUR[index],
    ...data,
  };

  DUMMY_DONATUR[index] = updatedDonatur;
  return updatedDonatur;
};

export const deleteDonatur = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const initialLength = DUMMY_DONATUR.length;
  DUMMY_DONATUR = DUMMY_DONATUR.filter((d) => d.id !== id);
  if (DUMMY_DONATUR.length === initialLength) {
    throw new Error("Donatur not found");
  }
};
