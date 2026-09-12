export const calculateFanHours = (siloName: string, tons: number): number => {
  const t = Math.max(0, tons);
  
  // Silo 301-306 (8000T capacity)
  if (/^30[1-6]$/.test(siloName)) {
    const table: Record<number, number> = {
      500: 10, 1000: 21, 1500: 31, 2000: 41,
      2500: 52, 3000: 62, 3500: 72, 4000: 83,
      4500: 93, 5000: 104, 5500: 114, 6000: 124,
      6500: 135, 7000: 145, 7500: 155, 8000: 166
    };
    
    // Round to nearest 500
    let rounded = Math.round(t / 500) * 500;
    if (rounded < 500 && t > 0) rounded = 500;
    if (rounded > 8000) rounded = 8000;
    
    return table[rounded] || 0;
  }
  
  // Silo 21-24 (6000T capacity)
  if (/^2[1-4]$/.test(siloName)) {
    let rounded = Math.round(t / 500) * 500;
    if (rounded < 500 && t > 0) rounded = 500;
    if (rounded > 6000) rounded = 6000;
    
    // Formula: (tons/500) * 13
    return (rounded / 500) * 13;
  }
  
  // Fallback for others
  return 0;
};
