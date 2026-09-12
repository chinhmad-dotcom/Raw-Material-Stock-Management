import type { ExcelImportResult } from '../types/import';

const apiBase = import.meta.env.VITE_API_BASE_URL;

async function uploadExcel(path: string, file: File): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(apiBase + path, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export const uploadSiloStockExcel = (file: File) => uploadExcel('/api/SiloStock/import', file);
export const uploadAdditiveStockExcel = (file: File) => uploadExcel('/api/AdditiveStock/import', file);
