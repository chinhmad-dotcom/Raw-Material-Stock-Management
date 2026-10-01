const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

let bucket = null;

try {
  const serviceAccount = require('./firebaseConfig.json');
  // Initialize Firebase
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: serviceAccount.project_id + ".appspot.com"
  });
  bucket = getStorage().bucket();
  console.log("Firebase Storage initialized successfully.");
} catch (error) {
  console.warn("⚠️ Firebase is not configured yet. Using local files only.");
}

/**
 * Uploads a local file to Firebase Storage
 */
async function uploadToFirebase(localFilePath, destFileName) {
  if (!bucket) return;
  try {
    await bucket.upload(localFilePath, {
      destination: `database/${destFileName}`,
      metadata: { cacheControl: 'no-cache' }
    });
    console.log(`[Firebase] Uploaded ${destFileName} to Cloud Storage.`);
  } catch (err) {
    console.error(`[Firebase] Error uploading ${destFileName}:`, err.message);
  }
}

/**
 * Downloads a file from Firebase Storage to local disk
 */
async function downloadFromFirebase(destFileName, localFilePath) {
  if (!bucket) return false;
  try {
    const file = bucket.file(`database/${destFileName}`);
    const [exists] = await file.exists();
    if (exists) {
      await file.download({ destination: localFilePath });
      console.log(`[Firebase] Downloaded ${destFileName} to local.`);
      return true;
    }
  } catch (err) {
    console.error(`[Firebase] Error downloading ${destFileName}:`, err.message);
  }
  return false;
}

/**
 * Sync all JSON files from Firebase to Local at startup
 */
async function syncStartupFiles(filesList) {
  if (!bucket) return;
  console.log("[Firebase] Syncing files from Cloud Storage on startup...");
  for (const filename of filesList) {
    const localPath = path.join(__dirname, filename);
    await downloadFromFirebase(filename, localPath);
  }
  console.log("[Firebase] Startup sync complete.");
}

module.exports = {
  uploadToFirebase,
  downloadFromFirebase,
  syncStartupFiles
};
