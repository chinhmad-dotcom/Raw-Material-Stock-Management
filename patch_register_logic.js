const fs = require('fs');
let code = fs.readFileSync('mock-api/server.js', 'utf8');

const oldRegister = `return json(req, res, { 
                  token: 'mock-jwt-token-new-user', 
                  user: { id: Date.now(), name: data.name, email: data.email, role: 'user' } 
              });`;

const newRegister = `return json(req, res, { 
                  message: 'Registration successful. Account is pending admin approval.',
                  user: { id: Date.now(), name: data.name, email: data.email, role: 'pending' }
              });`;

code = code.replace(oldRegister, newRegister);
fs.writeFileSync('mock-api/server.js', code);
console.log('Register API updated');
