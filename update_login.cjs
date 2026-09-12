const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

const oldLogin = `if (reqPath === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.email === 'admin@stockrm.com' && data.password === 'admin1234') {
                return json(req, res, { 
                    token: 'mock-jwt-token-12345', 
                    user: { id: 1, name: 'Admin', email: 'admin@stockrm.com', role: 'admin' } 
                });
            } else {
                return json(req, res, { error: 'Email hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c' }, 401);
            }
        } catch (e) {
            return json(req, res, { error: 'Invalid JSON request' }, 400);
        }
    });
    return;
  }`;

const newLogin = `if (reqPath === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            // 1. Check Admin
            if (data.email === 'admin@stockrm.com' && data.password === 'admin1234') {
                return json(req, res, { 
                    token: 'mock-jwt-token-12345', 
                    user: { id: 1, name: 'Admin', email: 'admin@stockrm.com', role: 'admin' } 
                });
            } 
            
            // 2. Check registered users
            const registeredUser = settingsData.users.find(u => u.email === data.email && u.password === data.password);
            
            if (registeredUser) {
                if (registeredUser.status === 'pending') {
                    return json(req, res, { error: 'Tài khoản của bạn đang chờ Admin duyệt.' }, 403);
                }
                if (registeredUser.status === 'Inactive') {
                    return json(req, res, { error: 'Tài khoản của bạn đã bị khóa.' }, 403);
                }
                
                return json(req, res, { 
                    token: 'mock-jwt-token-' + registeredUser.id, 
                    user: { 
                        id: registeredUser.id, 
                        name: registeredUser.name, 
                        email: registeredUser.email, 
                        role: registeredUser.role 
                    } 
                });
            }
            
            // 3. Fallback error
            return json(req, res, { error: 'Email hoặc mật khẩu không chính xác' }, 401);
            
        } catch (e) {
            return json(req, res, { error: 'Invalid JSON request' }, 400);
        }
    });
    return;
  }`;

if (code.includes(oldLogin)) {
    code = code.replace(oldLogin, newLogin);
    fs.writeFileSync('mock-api/server.js', code, 'utf8');
    console.log('Login logic updated successfully!');
} else {
    console.log('Could not find the exact old login block. Let me use regex.');
    const regex = /if \(reqPath === '\/api\/login' && method === 'POST'\) \{[\s\S]*?return;\s*\}/;
    code = code.replace(regex, newLogin);
    fs.writeFileSync('mock-api/server.js', code, 'utf8');
    console.log('Login logic updated via regex!');
}
