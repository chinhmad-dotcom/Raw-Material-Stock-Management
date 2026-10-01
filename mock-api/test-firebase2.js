const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./firebaseConfig.json');

try {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "stock-rm-bdg.appspot.com"
  });

  const bucket = getStorage().bucket();
  console.log("Firebase initialized.");

  bucket.getFiles().then(() => {
    console.log("Storage bucket exists and is accessible.");
  }).catch(err => {
    console.error("Storage Error:", err.message);
  });
} catch (error) {
  console.error("Firebase init error:", error);
}
