const fs = require('fs');

let c = fs.readFileSync('mock-api/server-firestore.js', 'utf8');

const aliases = `
// ALIASES TO MATCH FRONTEND EXPECTATIONS
app.use('/api/reports/fans', (req, res, next) => { req.url = req.url === '/' ? '' : req.url; req.url = \`/collection/fans\${req.url}\`; next(); });
app.use('/api/reports/fumigations', (req, res, next) => { req.url = req.url === '/' ? '' : req.url; req.url = \`/collection/fumigations\${req.url}\`; next(); });
app.use('/api/trucks/queue-history', (req, res, next) => { req.url = req.url === '/' ? '' : req.url; req.url = \`/collection/queueHistory\${req.url}\`; next(); });
app.use('/api/kpi/kaizen', (req, res, next) => { req.url = req.url === '/' ? '' : req.url; req.url = \`/collection/kpiKaizen\${req.url}\`; next(); });
app.use('/api/extruder/production', (req, res, next) => { req.url = req.url === '/' ? '' : req.url; req.url = \`/collection/extruderData\${req.url}\`; next(); });

// 3. GENERIC COLLECTIONS API
`;

c = c.replace('// 3. GENERIC COLLECTIONS API', aliases);
fs.writeFileSync('mock-api/server-firestore.js', c);
console.log('Added route aliases');
