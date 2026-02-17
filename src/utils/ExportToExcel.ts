import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Antarmuka generik untuk data yang dapat diexport
interface ExportData {
  [key: string]: any;
}

/**
 * Fungsi inti yang hanya menghasilkan Blob (paket data file) dari data JSON.
 * Blob ini dapat digunakan untuk pengunduhan instan atau membuat Object URL.
 */
export const generateExcelBlob = (data: ExportData[], sheetName: string = "Data"): Blob | null => {
  if (!data || data.length === 0) {
    console.warn("No data provided for export.");
    return null;
  }

  // 1. Konversi data JSON ke format Sheet (Array of Arrays)
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Buat Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 3. Tulis file dan simpan sebagai Array Buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // 4. Buat dan kembalikan Blob (dengan MIME Type yang sesuai)
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

  return blob;
};

/**
 * Fungsi pembantu untuk download instan menggunakan 'file-saver'.
 */
export const downloadExcelFromBlob = (blob: Blob | null, fileName: string) => {
  if (!blob) return;
  // Menambahkan tanggal pada nama file
  const dateSuffix = new Date().toISOString().substring(0, 10); // Format YYYY-MM-DD
  saveAs(blob, `${fileName}_${dateSuffix}.xlsx`);
};

/**
 * Fungsi utama (untuk kompatibilitas) - Menggabungkan pembuatan dan pengunduhan.
 */
export const exportToExcel = (data: ExportData[], fileName: string, sheetName: string = "Data") => {
  const blob = generateExcelBlob(data, sheetName);
  if (blob) {
    downloadExcelFromBlob(blob, fileName);
  }
};
