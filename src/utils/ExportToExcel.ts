import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Antarmuka generik untuk data yang dapat diexport
interface ExportData {
  [key: string]: any;
}

export const exportToExcel = (data: ExportData[], fileName: string, sheetName: string = "Data") => {
  if (!data || data.length === 0) {
    console.warn("No data provided for export.");
    return;
  }

  // 1. Konversi data JSON ke format Sheet (Array of Arrays)
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Buat Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 3. Tulis file dan simpan sebagai Blob
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

  // 4. Download file
  saveAs(blob, `${fileName}_${new Date().toISOString().substring(0, 10)}.xlsx`);
};
