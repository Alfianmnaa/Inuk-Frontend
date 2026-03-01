import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Antarmuka generik untuk data yang dapat diexport
interface ExportData {
  [key: string]: any;
}

/**
 * Menghitung lebar kolom otomatis berdasarkan panjang teks terpanjang
 * di header dan tiap baris data. Mirip perilaku "auto-fit" di Excel.
 *
 * @param data    Array of row objects
 * @param minWidth Lebar minimum per kolom (default 8)
 * @param maxWidth Lebar maksimum per kolom (default 50)
 */
const autoFitColumns = (
  worksheet: XLSX.WorkSheet,
  data: ExportData[],
  minWidth = 8,
  maxWidth = 50
): void => {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);

  const colWidths = keys.map((key) => {
    // Mulai dari panjang nama header
    let maxLen = String(key).length;

    // Bandingkan dengan setiap nilai di kolom ini
    for (const row of data) {
      const val = row[key];
      if (val != null) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    }

    // Tambahkan padding kecil agar tidak terlalu rapat
    const width = Math.min(Math.max(maxLen + 2, minWidth), maxWidth);
    return { wch: width };
  });

  worksheet["!cols"] = colWidths;
};

/**
 * Fungsi inti yang hanya menghasilkan Blob (paket data file) dari data JSON.
 * Blob ini dapat digunakan untuk pengunduhan instan atau membuat Object URL.
 *
 * @param data       Array of row objects
 * @param sheetName  Nama sheet (default "Data")
 * @param autoFit    Aktifkan auto-fit lebar kolom (default true)
 */
export const generateExcelBlob = (
  data: ExportData[],
  sheetName: string = "Data",
  autoFit: boolean = true
): Blob | null => {
  if (!data || data.length === 0) {
    console.warn("No data provided for export.");
    return null;
  }

  // 1. Konversi data JSON ke format Sheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Terapkan auto-fit lebar kolom jika diaktifkan
  if (autoFit) {
    autoFitColumns(worksheet, data);
  }

  // 3. Buat Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 4. Tulis file dan simpan sebagai Array Buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // 5. Buat dan kembalikan Blob
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  return blob;
};

/**
 * Fungsi pembantu untuk download instan menggunakan 'file-saver'.
 */
export const downloadExcelFromBlob = (blob: Blob | null, fileName: string) => {
  if (!blob) return;
  const dateSuffix = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
  saveAs(blob, `${fileName}_${dateSuffix}.xlsx`);
};

/**
 * Fungsi utama (untuk kompatibilitas) — Menggabungkan pembuatan dan pengunduhan.
 */
export const exportToExcel = (
  data: ExportData[],
  fileName: string,
  sheetName: string = "Data",
  autoFit: boolean = true
) => {
  const blob = generateExcelBlob(data, sheetName, autoFit);
  if (blob) {
    downloadExcelFromBlob(blob, fileName);
  }
};