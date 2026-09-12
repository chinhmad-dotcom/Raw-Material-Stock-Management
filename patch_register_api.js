const fs = require('fs');
let code = fs.readFileSync('mock-api/server.js', 'utf8');

const registerApiCode = `
    if (reqPath === '/api/register' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', () => {
          try {
              const data = JSON.parse(body);
              if (!data.email || !data.password || !data.name) {
                  return json(req, res, { error: 'Missing fields' }, 400);
              }
              // Mock success
              return json(req, res, { 
                  token: 'mock-jwt-token-new-user', 
                  user: { id: Date.now(), name: data.name, email: data.email, role: 'user' } 
              });
          } catch (e) {
              return json(req, res, { error: 'Invalid JSON request' }, 400);
          }
      });
      return;
    }
`;

// Insert it right before `/api/login` route.
code = code.replace(
  `if (reqPath === '/api/login' && method === 'POST') {`,
  registerApiCode + `\n    if (reqPath === '/api/login' && method === 'POST') {`
);

fs.writeFileSync('mock-api/server.js', code);
console.log('Added /api/register to mock API');
