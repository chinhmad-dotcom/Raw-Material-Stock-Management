import { apiClient } from './apiClient';
import type { DashboardSummary } from '../types/dashboard';

export const fetchAvailableDates = async (): Promise<string[]> =>
  apiClient<string[]>('/api/dashboard/dates');

export const fetchDashboardSummary = async (date?: string): Promise<DashboardSummary> =>
  apiClient<DashboardSummary>(date ? `/api/dashboard/summary?date=${date}` : '/api/dashboard/summary');

export const fetchImportHistory = async (start: string, end: string): Promise<any[]> =>
  apiClient<any[]>('/api/dashboard/import-history?start=' + start + '&end=' + end);




