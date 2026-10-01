const fs = require('fs');

let c = fs.readFileSync('mock-api/server.js', 'utf8');

c = c.replace(
  "function cors(req, res) {\n  const origin = req.headers.origin || '*';\n  res.setHeader('Access-Control-Allow-Origin', origin);",
  `function cors(req, res) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://stockrm.web.app', // Firebase domain placeholder
    'https://stockrm.firebaseapp.com'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://stockrm.web.app'); // Restrict to production domain by default
  }`
);

fs.writeFileSync('mock-api/server.js', c);
console.log('Fixed CORS security in server.js');
