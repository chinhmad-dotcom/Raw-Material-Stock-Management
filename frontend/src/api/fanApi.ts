export interface FanRecord {
  id?: string;
  siloName: string;
  reason: string;
  volumeTons: number;
  totalHoursRegulated: number;
  planStart: string; // ISO DateTime
  planEnd: string; // ISO DateTime
  planTotalHours: number;
  actualStart?: string | null;
  actualEnd?: string | null;
  actualTotalHours?: number | null;
  staffOpen?: string;
  staffClose?: string;
  inspectorSilo?: string;
  inspectorLab?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Appproval flow fields
  status?: 'pending' | 'approved';
  reporterSignature?: string | null;
  reporterName?: string | null;
  reviewerSignature?: string | null;
  reviewerName?: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(new RegExp('/$'), '');

const resolveApiBaseUrl = () => {
  if (API_BASE_URL) return API_BASE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
  };
  return await fetch(url, { ...options, headers });
};

export const fanApi = {
  async getFans(): Promise<FanRecord[]> {
    const res = await fetchApi(resolveApiBaseUrl() + '/api/fans');
    if (!res.ok) throw new Error('Failed to fetch fans');
    return res.json();
  },

  async saveFan(record: FanRecord): Promise<any> {
    const res = await fetchApi(resolveApiBaseUrl() + '/api/fans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to save fan record');
    return res.json();
  },

  async updateFan(id: string, updates: Partial<FanRecord>): Promise<any> {
    const res = await fetchApi(resolveApiBaseUrl() + '/api/fans/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update fan record');
    return res.json();
  },

  async approveFan(id: string, signature: string, name: string): Promise<any> {
    return this.updateFan(id, {
      status: 'approved',
      reviewerSignature: signature,
      reviewerName: name
    });
  },

  async deleteFan(id: string): Promise<any> {
    const res = await fetchApi(resolveApiBaseUrl() + '/api/fans/' + id, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete fan record');
    return res.json();
  }
};
