import type { ChangeEvent } from 'react';
import type { ExcelImportResult } from '../../types/import';

interface ImportPanelProps {
  selectedFile: File | null;
  importing: boolean;
  importResult: ExcelImportResult | null;
  importError: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImport: (target: 'silo' | 'additive') => void;
}

export function ImportPanel({
  selectedFile,
  importing,
  importResult,
  importError,
  onFileChange,
  onImport
}: ImportPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 sm:px-6 sm:py-3.5 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Excel Import</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">Upload stock data</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Import silo or additive stock entries from Excel and refresh the dashboard automatically.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-50 dark:bg-slate-950/80 px-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition hover:border-slate-300/20">
            <input type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={onFileChange} />
            <span>{selectedFile?.name ?? 'Choose Excel file'}</span>
          </label>
          <button
            type="button"
            disabled={!selectedFile || importing}
            onClick={() => onImport('silo')}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import Silo Stock
          </button>
          <button
            type="button"
            disabled={!selectedFile || importing}
            onClick={() => onImport('additive')}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import Additives
          </button>
        </div>
      </div>

      {(importResult || importError) && (
        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-50 dark:bg-slate-950/80 p-4 text-slate-800 dark:text-slate-200">
          {importError ? (
            <p className="text-sm text-rose-300">{importError}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">File</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{importResult?.fileName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Success</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{importResult?.succeededRows ?? 0} / {importResult?.totalRows ?? 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Failed</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{importResult?.failedRows ?? 0}</p>
              </div>
            </div>
          )}
          {importResult?.errors.length ? (
            <div className="mt-4 rounded-2xl bg-rose-950/60 p-4 text-sm text-rose-200">
              <p className="font-medium text-rose-100">Import errors:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {importResult.errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

