const admin = require('firebase-admin');
const serviceAccount = require('./firebaseConfig.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "stock-rm-bdg.appspot.com" // default bucket name
  });

  const bucket = admin.storage().bucket();
  console.log("Firebase initialized.");

  bucket.getFiles().then(() => {
    console.log("Storage bucket exists and is accessible.");
  }).catch(err => {
    console.error("Storage Error:", err.message);
  });
} catch (error) {
  console.error("Firebase init error:", error);
}
