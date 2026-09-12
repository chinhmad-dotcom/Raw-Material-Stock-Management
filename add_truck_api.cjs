const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

// Find a good spot to inject new routes. Just before `// Start Server`
const targetStr = '// Start Server';

const recordsCode = `
// ==================== TRUCK TRACKING ROUTES ====================
const recordsPath = path.join(__dirname, 'records.json');
const reasonsPath = path.join(__dirname, 'reasons.json');

const getRecords = () => {
  if (fs.existsSync(recordsPath)) {
    return JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  }
  return [];
};

const saveRecords = (data) => {
  fs.writeFileSync(recordsPath, JSON.stringify(data, null, 2));
};

const getReasons = () => {
  if (fs.existsSync(reasonsPath)) {
    return JSON.parse(fs.readFileSync(reasonsPath, 'utf8'));
  }
  return [
    "Kẹt xe",
    "Thủ tục giấy tờ chậm",
    "Chờ bốc dỡ hàng",
    "Xe hỏng",
    "Silo đầy, chờ chuyển kho",
    "Tài xế nghỉ ngơi",
    "Thời tiết xấu"
  ];
};

if (url === '/api/records' && method === 'POST') {
  return handleJsonRequest(req, res, (data) => {
    try {
      const records = getRecords();
      
      const timeIn = new Date(data.timeIn);
      const timeOut = new Date(data.timeOut);
      const diffMs = timeOut.getTime() - timeIn.getTime();
      const totalTimeMinutes = Math.floor(diffMs / 60000);
      
      const record = {
        id: data.id || Date.now().toString(),
        vehiclePlate: data.vehiclePlate,
        material: data.material,
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        totalTimeMinutes,
        reasonForDelay: data.reasonForDelay || null,
        createdAt: new Date().toISOString()
      };
      
      if (data.id) {
        const idx = records.findIndex(r => r.id === data.id);
        if (idx !== -1) records[idx] = record;
        else records.push(record);
      } else {
        records.push(record);
      }
      
      saveRecords(records);
      return json(req, res, { message: 'Record saved successfully', id: record.id });
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
}

if (url.startsWith('/api/records/monthly-report') && method === 'GET') {
  const query = new URL(req.url, 'http://localhost').searchParams;
  const month = parseInt(query.get('month'));
  const year = parseInt(query.get('year'));
  
  const records = getRecords();
  
  const monthlyRecords = records.filter(r => {
    const d = new Date(r.timeOut);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  
  const totalTrucks = monthlyRecords.length;
  let delayedCount = 0;
  let totalTime = 0;
  
  monthlyRecords.forEach(r => {
    if (r.totalTimeMinutes > 120) delayedCount++;
    totalTime += r.totalTimeMinutes || 0;
  });
  
  const delayedTrucks = totalTrucks > 0 ? Math.round((delayedCount / totalTrucks) * 100) : 0;
  const averageTurnaroundTime = totalTrucks > 0 ? Math.round(totalTime / totalTrucks) : 0;
  
  return json(req, res, {
    month,
    year,
    totalTrucks,
    delayedTrucks,
    averageTurnaroundTime,
    records: monthlyRecords.sort((a, b) => new Date(b.timeOut) - new Date(a.timeOut))
  });
}

if (url === '/api/records/reasons' && method === 'GET') {
  return json(req, res, getReasons());
}

if (url.startsWith('/api/records/clear-by-month') && method === 'DELETE') {
  const query = new URL(req.url, 'http://localhost').searchParams;
  const month = parseInt(query.get('month'));
  const year = parseInt(query.get('year'));
  
  let records = getRecords();
  const initialLength = records.length;
  
  records = records.filter(r => {
    const d = new Date(r.timeOut);
    return !(d.getMonth() + 1 === month && d.getFullYear() === year);
  });
  
  saveRecords(records);
  const deletedCount = initialLength - records.length;
  return json(req, res, { message: 'Records cleared', deletedCount });
}
// ===============================================================

// Start Server`;

code = code.replace(targetStr, recordsCode);
fs.writeFileSync('mock-api/server.js', code);
console.log('Added records routes to mock-api');
