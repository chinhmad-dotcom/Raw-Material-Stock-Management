export interface ExcelImportResult {
  totalRows: number;
  succeededRows: number;
  failedRows: number;
  errors: string[];
  fileName: string;
  importedAt: string;
}
