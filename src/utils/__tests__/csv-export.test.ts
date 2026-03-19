/**
 * Tests for CSV Export Utility
 */

import { convertArrayToCSV, downloadCSV } from '../csv-export';

describe('CSV Export Utility', () => {
  describe('convertArrayToCSV', () => {
    it('should convert simple array to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      
      const result = convertArrayToCSV(data);
      expect(result).toContain('name,age');
      expect(result).toContain('John,30');
      expect(result).toContain('Jane,25');
    });

    it('should handle empty array', () => {
      const result = convertArrayToCSV([]);
      expect(result).toBe('');
    });

    it('should handle custom headers', () => {
      const data = [{ firstName: 'John', age: 30 }];
      const headers = { firstName: 'First Name', age: 'Age' };
      
      const result = convertArrayToCSV(data, headers);
      expect(result).toContain('First Name,Age');
    });

    it('should escape commas in values', () => {
      const data = [{ name: 'Doe, John', age: 30 }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('"Doe, John"');
    });

    it('should escape quotes in values', () => {
      const data = [{ name: 'John "Johnny" Doe', age: 30 }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('"John ""Johnny"" Doe"');
    });

    it('should handle newlines in values', () => {
      const data = [{ name: 'John\nDoe', age: 30 }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('"John\nDoe"');
    });

    it('should handle null values', () => {
      const data = [{ name: 'John', age: null }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('John,\n');
    });

    it('should handle undefined values', () => {
      const data = [{ name: 'John', age: undefined }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('John,\n');
    });

    it('should handle numeric values', () => {
      const data = [{ name: 'John', age: 30, salary: 50000.50 }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('30');
      expect(result).toContain('50000.5');
    });

    it('should handle boolean values', () => {
      const data = [{ name: 'John', active: true }];
      const result = convertArrayToCSV(data);
      expect(result).toContain('true');
    });

    it('should handle multiple rows', () => {
      const data = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' },
      ];
      const result = convertArrayToCSV(data);
      const lines = result.split('\n').filter(Boolean);
      expect(lines).toHaveLength(4); // header + 3 rows
    });
  });

});
