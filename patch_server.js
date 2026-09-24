const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('mock-api/server.js', 'utf8');

// Replace target defaults
content = content.replace(/\{ truck: 80, elecReceive: 0\.8, elecExtruder: 220 \}/g, "{ truck: 80, elecReceive: 0.8, loss: 1.5 }");

// Add loss endpoints before '/api/kpi/targets'
const newEndpoints = `
  if (reqPath === '/api/kpi/loss' && method === 'GET') {
    const year = Number(url.searchParams.get('year')) || new Date().getFullYear();
    const file = path.join(__dirname, 'kpiLoss.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){}
    const results = [];
    for (let i = 1; i <= 12; i++) {
        results.push({ month: i, val: data[\`\${year}-\${i}\`] || 0 });
    }
    return json(req, res, { data: results });
  }

  if (reqPath === '/api/kpi/loss' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const { year, month, val } = JSON.parse(body);
            const file = path.join(__dirname, 'kpiLoss.json');
            let data = {};
            try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){}
            data[\`\${year}-\${month}\`] = Number(val) || 0;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
            return json(req, res, { success: true });
        } catch (e) {
            return json(req, res, { success: false });
        }
    });
    return;
  }
`;

content = content.replace("  if (reqPath === '/api/kpi/targets' && method === 'GET') {", newEndpoints + "\n  if (reqPath === '/api/kpi/targets' && method === 'GET') {");

fs.writeFileSync('mock-api/server.js', content);
console.log('patched');
