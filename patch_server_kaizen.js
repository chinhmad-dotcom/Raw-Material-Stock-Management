const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('mock-api/server.js', 'utf8');

// 1. Update targets default
content = content.replace(/\{ truck: 80, elecReceive: 0\.8, loss: 1\.5 \}/g, "{ truck: 80, elecReceive: 0.8, loss: 1.5, kaizen: 10 }");

// 2. Add Kaizen API
const newEndpoints = `
  if (reqPath === '/api/kpi/kaizen' && method === 'GET') {
    const year = Number(url.searchParams.get('year')) || new Date().getFullYear();
    const file = path.join(__dirname, 'kpiKaizen.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){}
    // filter by year
    const results = data.filter(d => d.year === year);
    return json(req, res, { data: results });
  }

  if (reqPath === '/api/kpi/kaizen' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const newKaizen = JSON.parse(body);
            const file = path.join(__dirname, 'kpiKaizen.json');
            let data = [];
            try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){}
            
            if (newKaizen.id) {
                // update
                const idx = data.findIndex(d => d.id === newKaizen.id);
                if (idx >= 0) data[idx] = newKaizen;
                else data.push(newKaizen);
            } else {
                // insert
                newKaizen.id = Date.now().toString();
                data.push(newKaizen);
            }
            
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
            return json(req, res, { success: true, data: newKaizen });
        } catch (e) {
            return json(req, res, { success: false });
        }
    });
    return;
  }

  if (reqPath === '/api/kpi/kaizen' && method === 'DELETE') {
    const id = url.searchParams.get('id');
    const file = path.join(__dirname, 'kpiKaizen.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){}
    data = data.filter(d => d.id !== id);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return json(req, res, { success: true });
  }
`;

content = content.replace("  if (reqPath === '/api/kpi/targets' && method === 'GET') {", newEndpoints + "\n  if (reqPath === '/api/kpi/targets' && method === 'GET') {");

fs.writeFileSync('mock-api/server.js', content);
console.log('patched');
