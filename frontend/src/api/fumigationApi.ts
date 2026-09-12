import { apiClient } from './apiClient';

export interface FumigationLog {
  id?: string;
  siloCode: string;
  materialName: string;
  weightKg: number;
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt?: string;
}

export const fumigationApi = {
  getAll: async (): Promise<FumigationLog[]> => {
    return await apiClient<FumigationLog[]>('/api/fumigations');
  },

  create: async (log: Omit<FumigationLog, 'id' | 'createdAt'>): Promise<FumigationLog> => {
    return await apiClient<FumigationLog>('/api/fumigations', {
      method: 'POST',
      body: JSON.stringify(log)
    });
  },

  update: async (id: string, log: Partial<FumigationLog>): Promise<FumigationLog> => {
    return await apiClient<FumigationLog>(`/api/fumigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(log)
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/fumigations/${id}`, {
      method: 'DELETE'
    });
  }
};
