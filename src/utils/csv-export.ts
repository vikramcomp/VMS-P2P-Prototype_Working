/**
 * Utility for exporting data to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers
 * @returns CSV formatted string
 */
export function convertArrayToCSV<T>(data: T[], headers?: Record<string, string>): string {
  if (data.length === 0) return '';
  
  const columnHeaders = headers || Object.keys(data[0] as object).reduce((acc, key) => {
    acc[key] = key; // Default to using the same keys as headers
    return acc;
  }, {} as Record<string, string>);
  
  // Create header row
  let csv = Object.values(columnHeaders).join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = Object.keys(columnHeaders)
      .map(key => {
        const value = (item as any)[key];
        // Handle special characters and ensure proper CSV formatting
        if (value === null || value === undefined) {
          return '';
        }
        
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replaceAll('"', '""')}"`;
        }
        
        return String(value);
      })
      .join(',');
    csv += row + '\n';
  });
  
  return csv;
}

/**
 * Download data as a CSV file
 * @param data - CSV string data
 * @param filename - Name of the downloaded file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  link.remove();
}