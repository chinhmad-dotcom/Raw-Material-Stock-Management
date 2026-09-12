const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

// Update /api/register
const oldRegister = `    if (reqPath === '/api/register' && method === 'POST') {
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
                  message: 'Registration successful. Account is pending admin approval.',
                  user: { id: Date.now(), name: data.name, email: data.email, role: 'pending' }
              });
          } catch (e) {
              return json(req, res, { error: 'Invalid JSON request' }, 400);
          }
      });
      return;
    }`;

const newRegister = `    if (reqPath === '/api/register' && method === 'POST') {
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
              
              // Add to settingsData
              const newUser = {
                id: Date.now().toString(),
                email: data.email,
                name: data.name,
                password: data.password, // For mock purposes
                role: 'pending',
                status: 'pending'
              };
              settingsData.users.push(newUser);
              saveSettings(settingsData);
              
              return json(req, res, { 
                  message: 'Registration successful. Account is pending admin approval.',
                  user: newUser
              });
          } catch (e) {
              return json(req, res, { error: 'Invalid JSON request' }, 400);
          }
      });
      return;
    }

    // Add forgot-password
    if (reqPath === '/api/forgot-password' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
          try {
              const data = JSON.parse(body);
              const user = settingsData.users.find(u => u.email === data.email);
              if (user) {
                  // Mark user as requesting password reset
                  user.resetRequested = true;
                  saveSettings(settingsData);
              }
              // Always return success to prevent email enumeration
              return json(req, res, { message: 'If that email is in our system, a password reset request has been sent to the admin.' });
          } catch(e) { return json(req, res, { error: 'Invalid request' }, 400); }
      });
      return;
    }
    
    // Add approve user and reset password endpoints
    if (reqPath.startsWith('/api/settings/users/') && method === 'POST') {
        const parts = reqPath.split('/');
        const id = parts[4];
        const action = parts[5];
        
        if (action === 'approve') {
            const user = settingsData.users.find(u => u.id === id);
            if (user) {
                user.status = 'Active';
                user.role = 'Operator'; // Default role
                saveSettings(settingsData);
                return json(req, res, { message: 'User approved', user });
            }
            return json(req, res, { error: 'User not found' }, 404);
        }
        
        if (action === 'reset-password') {
            const user = settingsData.users.find(u => u.id === id);
            if (user) {
                user.resetRequested = false;
                user.password = '123456'; // Default reset password
                saveSettings(settingsData);
                return json(req, res, { message: 'Password reset to 123456', user });
            }
            return json(req, res, { error: 'User not found' }, 404);
        }
    }
`;

code = code.replace(oldRegister, newRegister);
fs.writeFileSync('mock-api/server.js', code);
console.log('API Patched');
