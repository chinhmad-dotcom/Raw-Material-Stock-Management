const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

const targetRegex = /if \(reqPath === '\/api\/records' && method === 'POST'\) \{\s*return handleJsonRequest\(req, res, \(data\) => \{([\s\S]*?)\}\);\s*\}/;

const newPostHandler = `if (reqPath === '/api/records' && method === 'POST') {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
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
  return;
}`;

code = code.replace(targetRegex, newPostHandler);
fs.writeFileSync('mock-api/server.js', code);
console.log('Fixed POST handler');
