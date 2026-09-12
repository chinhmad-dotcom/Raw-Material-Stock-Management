export const apiClient = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(import.meta.env.VITE_API_BASE_URL + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
};
