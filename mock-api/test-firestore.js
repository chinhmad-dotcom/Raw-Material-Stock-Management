const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebaseConfig.json');

try {
  initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();
  console.log("Firebase initialized.");

  db.collection('test').doc('testDoc').set({ works: true }).then(() => {
    console.log("Firestore exists and is accessible.");
    process.exit(0);
  }).catch(err => {
    console.error("Firestore Error:", err.message);
    process.exit(1);
  });
} catch (error) {
  console.error("Firebase init error:", error);
}
