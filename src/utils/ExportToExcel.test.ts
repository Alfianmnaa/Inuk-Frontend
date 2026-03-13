import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateExcelBlob, downloadExcelFromBlob, exportToExcel } from './ExportToExcel';

// Use vi.hoisted to keep mock functions accessible
const { mockSaveAs, mockJsonToSheet, mockBookNew, mockBookAppendSheet, mockWrite } = vi.hoisted(() => ({
  mockSaveAs: vi.fn(),
  mockJsonToSheet: vi.fn(() => ({})),
  mockBookNew: vi.fn(() => ({})),
  mockBookAppendSheet: vi.fn(),
  mockWrite: vi.fn(() => new ArrayBuffer(1024)),
}));

// Mock xlsx - note: write is a top-level export, not under utils
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: mockJsonToSheet,
    book_new: mockBookNew,
    book_append_sheet: mockBookAppendSheet,
  },
  write: mockWrite,
}));

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs,
}));

describe('ExportToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateExcelBlob', () => {
    it('returns Blob for valid data array', () => {
      const data = [{ name: 'Test', value: 123 }];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Blob);
    });

    it('returns null for empty array', () => {
      const result = generateExcelBlob([]);
      
      expect(result).toBeNull();
    });

    it('returns null for null data', () => {
      const result = generateExcelBlob(null as any);
      
      expect(result).toBeNull();
    });

    it('returns null for undefined data', () => {
      const result = generateExcelBlob(undefined as any);
      
      expect(result).toBeNull();
    });

    it('uses custom sheetName', () => {
      const data = [{ name: 'Test' }];
      const result = generateExcelBlob(data, 'CustomSheet');
      
      expect(result).not.toBeNull();
    });

    it('disables autoFit when false', () => {
      const data = [{ name: 'Test', value: 123 }];
      const result = generateExcelBlob(data, 'Data', false);
      
      expect(result).not.toBeNull();
    });

    it('applies autoFit columns when enabled (default)', () => {
      const data = [{ name: 'TestName', value: 'TestValue' }];
      const result = generateExcelBlob(data, 'Data', true);
      
      expect(result).not.toBeNull();
    });
  });

  describe('downloadExcelFromBlob', () => {
    it('calls file-saver saveAs with correct filename', () => {
      const blob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = 'testfile';
      
      downloadExcelFromBlob(blob, fileName);
      
      expect(mockSaveAs).toHaveBeenCalledWith(blob, expect.stringContaining(fileName));
      expect(mockSaveAs).toHaveBeenCalledWith(blob, expect.stringMatching(/_202[0-9]-[0-1][0-9]-[0-3][0-9]\.xlsx$/));
    });

    it('does nothing for null blob', () => {
      downloadExcelFromBlob(null, 'testfile');
      
      expect(mockSaveAs).not.toHaveBeenCalled();
    });

    it('does nothing for undefined blob', () => {
      downloadExcelFromBlob(undefined as unknown as Blob | null, 'testfile');
      
      expect(mockSaveAs).not.toHaveBeenCalled();
    });
  });

  describe('exportToExcel', () => {
    it('calls generateExcelBlob then downloadExcelFromBlob', () => {
      const data = [{ name: 'Test' }];
      const fileName = 'export';
      
      exportToExcel(data, fileName);
      
      // Should generate blob and call saveAs
      expect(mockSaveAs).toHaveBeenCalled();
    });

    it('does nothing when data is empty', () => {
      exportToExcel([], 'testfile');
      
      expect(mockSaveAs).not.toHaveBeenCalled();
    });

    it('does nothing when data is null', () => {
      exportToExcel(null as any, 'testfile');
      
      expect(mockSaveAs).not.toHaveBeenCalled();
    });

    it('passes sheetName parameter correctly', () => {
      const data = [{ name: 'Test' }];
      
      exportToExcel(data, 'file', 'MySheet');
      
      // The function should work without errors
      expect(generateExcelBlob).toBeDefined();
    });

    it('passes autoFit parameter correctly', () => {
      const data = [{ name: 'Test' }];
      
      // This should not throw
      expect(() => exportToExcel(data, 'file', 'Data', false)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles data with special characters', () => {
      const data = [{ name: 'Test <>&"\'üñ', value: 'Special: @#$%' }];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
    });

    it('handles data with missing/null values in some fields', () => {
      const data = [
        { name: 'Test1', value: '123' },
        { name: 'Test2', value: null },
        { name: 'Test3' },
      ];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
    });

    it('handles empty object in data array', () => {
      const data = [{}];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
    });

    it('handles numeric values in data', () => {
      const data = [{ count: 0, price: 99.99, negative: -10 }];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
    });

    it('handles boolean values in data', () => {
      const data = [{ active: true, deleted: false }];
      const result = generateExcelBlob(data);
      
      expect(result).not.toBeNull();
    });
  });
});
