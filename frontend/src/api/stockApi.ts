export const api = {
  getSiloDetails: async () => {
    const res = await fetch('http://localhost:5147/api/settings/silos');
    if (!res.ok) throw new Error('Failed to fetch silos');
    return res.json();
  },
  getMasterMaterials: async () => {
    const res = await fetch('http://localhost:5147/api/settings/materials');
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },
  saveMasterMaterial: async (payload: any) => {
    // Mock save
    console.log('Saved material:', payload);
    return Promise.resolve(payload);
  }
};
