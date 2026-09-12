const fs = require('fs');
const path = require('path');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

const targetStr = '// --- END EXTRUDER API MOCKS ---';

const fanApiCode = `
// ==================== SILO FANS ROUTES ====================
const fansPath = path.join(__dirname, 'fans.json');

const getFans = () => {
  if (fs.existsSync(fansPath)) {
    return JSON.parse(fs.readFileSync(fansPath, 'utf8'));
  }
  return [];
};

const saveFans = (data) => {
  fs.writeFileSync(fansPath, JSON.stringify(data, null, 2));
};

if (reqPath === '/api/fans' && method === 'GET') {
  return json(req, res, getFans().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

if (reqPath === '/api/fans' && method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const fans = getFans();
      
      const record = {
        id: Date.now().toString(),
        siloName: data.siloName,
        reason: data.reason,
        volumeTons: data.volumeTons,
        totalHoursRegulated: data.totalHoursRegulated,
        planStart: data.planStart,
        planEnd: data.planEnd,
        planTotalHours: data.planTotalHours,
        actualStart: data.actualStart || null,
        actualEnd: data.actualEnd || null,
        actualTotalHours: data.actualTotalHours || null,
        staffOpen: data.staffOpen || '',
        staffClose: data.staffClose || '',
        inspectorSilo: data.inspectorSilo || '',
        inspectorLab: data.inspectorLab || '',
        note: data.note || '',
        createdAt: new Date().toISOString()
      };
      
      fans.push(record);
      saveFans(fans);
      return json(req, res, { message: 'Thêm kế hoạch thành công', id: record.id });
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
  return;
}

if (reqPath.startsWith('/api/fans/') && method === 'PUT') {
  const id = reqPath.split('/').pop();
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const updates = JSON.parse(body);
      const fans = getFans();
      const idx = fans.findIndex(f => f.id === id);
      if (idx !== -1) {
        fans[idx] = { ...fans[idx], ...updates, updatedAt: new Date().toISOString() };
        saveFans(fans);
        return json(req, res, { message: 'Cập nhật thành công', record: fans[idx] });
      }
      return json(req, res, { error: 'Không tìm thấy record' }, 404);
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
  return;
}

if (reqPath.startsWith('/api/fans/') && method === 'DELETE') {
  const id = reqPath.split('/').pop();
  let fans = getFans();
  const initialLen = fans.length;
  fans = fans.filter(f => f.id !== id);
  if (fans.length < initialLen) {
    saveFans(fans);
    return json(req, res, { message: 'Xóa thành công' });
  }
  return json(req, res, { error: 'Không tìm thấy record' }, 404);
}
// ==========================================================

// --- END EXTRUDER API MOCKS ---`;

code = code.replace(targetStr, fanApiCode);
fs.writeFileSync('mock-api/server.js', code);
console.log('Fan API routes added to mock-api/server.js');
