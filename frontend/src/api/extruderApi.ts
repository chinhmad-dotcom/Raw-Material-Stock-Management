export const uploadExtruderReport = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5147'}/api/extruder/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload extruder report');
  }
  return response.json();
};

export const getExtruderProduction = async (): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5147'}/api/extruder/production`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch extruder production data');
  }
  return response.json();
};

export const getExtruderOEE = async (): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5147'}/api/extruder/oee`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch extruder OEE data');
  }
  return response.json();
};

export const checkExtruderReport = async (): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5147'}/api/extruder/check`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to check report');
  }
  return response.json();
};
