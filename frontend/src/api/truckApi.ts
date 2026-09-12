export interface TruckRecord {
  id?: string;
  vehiclePlate: string;
  material: string;
  timeIn: string; // ISO String
  timeOut: string; // ISO String
  totalTimeMinutes?: number;
  reasonForDelay?: string | null;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalTrucks: number;
  delayedTrucks: number; // Percentage
  averageTurnaroundTime: number;
  records: TruckRecord[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const resolveApiBaseUrl = () => {
  if (API_BASE_URL) return API_BASE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

// We don't need auth headers for mock-api locally unless the project uses it
const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  const response = await fetch(url, { ...options, headers });
  return response;
};

const readErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (!text) return 'Request failed';
  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.error || text;
  } catch {
    return text;
  }
};

export const api = {
  async saveRecord(record: TruckRecord): Promise<{ message: string; id: string }> {
    const response = await fetchApi(`${resolveApiBaseUrl()}/api/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errorText = await readErrorMessage(response);
      throw new Error(errorText || 'Failed to save record');
    }

    return response.json();
  },

  async getMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
    const response = await fetchApi(`${resolveApiBaseUrl()}/api/records/monthly-report?month=${month}&year=${year}`);

    if (!response.ok) {
      const errorText = await readErrorMessage(response);
      throw new Error(errorText || 'Failed to fetch monthly report');
    }

    return response.json();
  },

  async getSuggestedReasons(): Promise<string[]> {
    const response = await fetchApi(`${resolveApiBaseUrl()}/api/records/reasons`);

    if (!response.ok) {
      const errorText = await readErrorMessage(response);
      throw new Error(errorText || 'Failed to fetch suggested reasons');
    }

    return response.json();
  },

  async clearRecordsByMonth(month: number, year: number): Promise<any> {
    const response = await fetchApi(`${resolveApiBaseUrl()}/api/records/clear-by-month?month=${month}&year=${year}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear records');
    return response.json();
  }
};
