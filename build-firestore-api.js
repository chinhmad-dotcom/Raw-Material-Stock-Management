const fs = require('fs');

const code = `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebaseConfig.json');

// Initialize Firebase
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 5147;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://stockrm.web.app', 'https://stockrm.firebaseapp.com'],
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300 
});
app.use('/api/', limiter);

// ==========================================
// GENERIC HELPER FOR SINGLE DOCUMENT JSON
// ==========================================
async function getSystemDoc(docName) {
  const doc = await db.collection('system').doc(docName).get();
  return doc.exists ? doc.data() : {};
}
async function saveSystemDoc(docName, data) {
  await db.collection('system').doc(docName).set(data);
}

// ==========================================
// ROUTES
// ==========================================

app.get('/health', (req, res) => res.json({ status: 'Healthy', database: 'Firestore' }));

// 1. SETTINGS API (users, silos, materials, logs) -> Stored in system/settingsData
const SETTINGS_RES = ['users', 'silos', 'materials', 'logs'];

app.get('/api/settings/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    if (!SETTINGS_RES.includes(resource)) return res.status(404).json({ error: 'Not found' });
    const data = await getSystemDoc('settingsData');
    res.json(data[resource] || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/settings/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    await db.runTransaction(async (t) => {
      const docRef = db.collection('system').doc('settingsData');
      const doc = await t.get(docRef);
      let data = doc.exists ? doc.data() : {};
      if (!data[resource]) data[resource] = [];
      const newItem = req.body;
      newItem.id = Date.now().toString();
      data[resource].push(newItem);
      t.set(docRef, data);
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/settings/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    await db.runTransaction(async (t) => {
      const docRef = db.collection('system').doc('settingsData');
      const doc = await t.get(docRef);
      let data = doc.exists ? doc.data() : {};
      if (!data[resource]) data[resource] = [];
      
      const updatedItem = req.body;
      const index = data[resource].findIndex(i => i.id === updatedItem.id || (resource === 'silos' && i.siloCode === updatedItem.siloCode));
      if (index !== -1) {
        data[resource][index] = { ...data[resource][index], ...updatedItem };
      } else {
        if (!updatedItem.id) updatedItem.id = Date.now().toString();
        data[resource].push(updatedItem);
      }
      t.set(docRef, data);
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/settings/:resource/:id', async (req, res) => {
  try {
    const { resource, id } = req.params;
    await db.runTransaction(async (t) => {
      const docRef = db.collection('system').doc('settingsData');
      const doc = await t.get(docRef);
      let data = doc.exists ? doc.data() : {};
      if (data[resource]) {
        data[resource] = data[resource].filter(i => i.id !== id);
        t.set(docRef, data);
      }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// 2. AUTH API
app.post('/api/auth/register', async (req, res) => {
  try {
    const docRef = db.collection('system').doc('settingsData');
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      let data = doc.exists ? doc.data() : {};
      if (!data.users) data.users = [];
      
      const existing = data.users.find(u => u.email === req.body.email);
      if (existing) throw new Error('Email đã tồn tại');

      const newUser = {
        id: Date.now().toString(),
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        status: 'pending'
      };
      data.users.push(newUser);
      t.set(docRef, data);
    });
    res.json({ message: 'Registration successful. Account is pending admin approval.' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const data = await getSystemDoc('settingsData');
    const users = data.users || [];
    const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
    
    if (user) {
      if (user.status === 'pending') return res.status(403).json({ error: 'Tài khoản của bạn đang chờ Admin duyệt.' });
      return res.json({ message: 'Login successful', token: 'mock-jwt-token-' + user.id, user });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// 3. GENERIC COLLECTIONS API (queueHistory, fans, fumigations, records, kpiKaizen, extruderData)
// Defines standard CRUD for these native collections
const NATIVE_COLLECTIONS = ['queueHistory', 'fans', 'fumigations', 'records', 'kpiKaizen', 'extruderData'];

app.get('/api/collection/:col', async (req, res) => {
  try {
    const { col } = req.params;
    if (!NATIVE_COLLECTIONS.includes(col)) return res.status(404).json({ error: 'Not found' });
    
    // Fetch all for now (Can add query params later)
    const snapshot = await db.collection(col).limit(500).get();
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/collection/:col', async (req, res) => {
  try {
    const { col } = req.params;
    const newItem = req.body;
    if (!newItem.id) newItem.id = Date.now().toString();
    await db.collection(col).doc(String(newItem.id)).set(newItem);
    res.json({ success: true, item: newItem });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/collection/:col/:id', async (req, res) => {
  try {
    const { col, id } = req.params;
    await db.collection(col).doc(String(id)).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/collection/:col/:id', async (req, res) => {
  try {
    const { col, id } = req.params;
    await db.collection(col).doc(String(id)).delete();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// 4. REPORTS API (Energy, KPI single documents)
app.get('/api/reports/energyData', async (req, res) => res.json(await getSystemDoc('energyData')));
app.get('/api/reports/energyDaily', async (req, res) => res.json(await getSystemDoc('energyDaily')));
app.get('/api/kpi/production', async (req, res) => res.json(await getSystemDoc('kpiProduction')));
app.get('/api/kpi/loss', async (req, res) => res.json(await getSystemDoc('kpiLoss')));
app.get('/api/kpi/targets', async (req, res) => res.json(await getSystemDoc('kpiTargets')));
app.get('/api/kpi/dailyReceived', async (req, res) => res.json(await getSystemDoc('dailyReceived')));

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Firestore Express Backend running at http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync('mock-api/server-firestore.js', code.trim());
console.log('Created extensive server-firestore.js');
