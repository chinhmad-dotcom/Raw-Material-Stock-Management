const fs = require('fs');
let c = fs.readFileSync('mock-api/server-firestore.js', 'utf8');

c = c.replace(/\/\/ ALIASES TO MATCH FRONTEND EXPECTATIONS[\s\S]*?\/\/ 3\. GENERIC COLLECTIONS API/, `// ALIASES TO MATCH FRONTEND EXPECTATIONS
app.use((req, res, next) => {
  if (req.url.startsWith('/api/reports/fans')) {
    req.url = req.url.replace('/api/reports/fans', '/api/collection/fans');
  } else if (req.url.startsWith('/api/reports/fumigations')) {
    req.url = req.url.replace('/api/reports/fumigations', '/api/collection/fumigations');
  } else if (req.url.startsWith('/api/trucks/queue-history')) {
    req.url = req.url.replace('/api/trucks/queue-history', '/api/collection/queueHistory');
  } else if (req.url.startsWith('/api/kpi/kaizen')) {
    req.url = req.url.replace('/api/kpi/kaizen', '/api/collection/kpiKaizen');
  } else if (req.url.startsWith('/api/extruder/production')) {
    req.url = req.url.replace('/api/extruder/production', '/api/collection/extruderData');
  }
  next();
});

// 3. GENERIC COLLECTIONS API`);

fs.writeFileSync('mock-api/server-firestore.js', c);
console.log('Fixed aliases routing');
