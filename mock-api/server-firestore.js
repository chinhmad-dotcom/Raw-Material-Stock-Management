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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 200 requests per windowMs
});
app.use('/api/', limiter);

// -----------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({ status: 'Healthy', database: 'Firestore' });
});

// Example: Get Queue History with Filtering
app.get('/api/trucks/queue-history', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = db.collection('queueHistory');
    
    // Note: To filter by date in Firestore, the field needs to be stored as a Timestamp.
    // Assuming 'weight1' is stored in a comparable format for now, or we fetch top 100.
    const snapshot = await query.limit(500).get(); 
    
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings (Silos)
app.get('/api/settings/silos', async (req, res) => {
  try {
    const doc = await db.collection('system').doc('settingsData').get();
    if (!doc.exists) return res.json([]);
    const settings = doc.data();
    res.json(settings.silos || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Firestore Backend running at http://localhost:${PORT}`);
});
