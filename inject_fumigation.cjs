const fs = require('fs');
let code = fs.readFileSync('mock-api/server.js', 'utf8');

const injection = `
// ================= FUMIGATION LOGS API =================
const fumigationsPath = path.join(__dirname, 'fumigations.json');

const getFumigations = () => {
  if (fs.existsSync(fumigationsPath)) {
    return JSON.parse(fs.readFileSync(fumigationsPath, 'utf8'));
  }
  return [];
};

const saveFumigations = (data) => {
  fs.writeFileSync(fumigationsPath, JSON.stringify(data, null, 2));
};

if (reqPath === '/api/fumigations' && method === 'GET') {
  return json(req, res, getFumigations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

if (reqPath === '/api/fumigations' && method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const logs = getFumigations();
      
      const record = {
        id: Date.now().toString(),
        siloCode: data.siloCode,
        materialName: data.materialName,
        weightKg: data.weightKg,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      
      logs.push(record);
      saveFumigations(logs);
      
      return json(req, res, record);
    } catch (e) {
      console.error(e);
      res.writeHead(400);
      res.end('Invalid request');
    }
  });
  return;
}

if (reqPath.startsWith('/api/fumigations/') && method === 'PUT') {
  const id = reqPath.split('/').pop();
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const logs = getFumigations();
      const index = logs.findIndex(r => r.id === id);
      
      if (index !== -1) {
        logs[index] = {
          ...logs[index],
          ...data,
          id // prevent changing ID
        };
        saveFumigations(logs);
        return json(req, res, logs[index]);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } catch (e) {
      res.writeHead(400);
      res.end('Invalid data');
    }
  });
  return;
}

if (reqPath.startsWith('/api/fumigations/') && method === 'DELETE') {
  const id = reqPath.split('/').pop();
  const logs = getFumigations();
  const filtered = logs.filter(r => r.id !== id);
  
  if (filtered.length !== logs.length) {
    saveFumigations(filtered);
    return json(req, res, { success: true });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
  return;
}

  // Not found
  res.writeHead(404);
  res.end('Not found');
`;

code = code.replace(/^[ \t]*\/\/\s*Not found\s*res\.writeHead\(404\);\s*res\.end\('Not found'\);/m, injection);
fs.writeFileSync('mock-api/server.js', code);
console.log('Injected API endpoints');
