const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./firebaseConfig.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function migrateCollection(fileName, collectionName, idField = 'id') {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skip ${fileName}, not found.`);
    return;
  }
  
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(`Failed to parse ${fileName}`);
    return;
  }

  if (Array.isArray(data)) {
    console.log(`Migrating ${fileName} to collection ${collectionName} (${data.length} items)...`);
    const batchSize = 400;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = db.batch();
      const chunk = data.slice(i, i + batchSize);
      
      chunk.forEach((item, index) => {
        let docId = item[idField];
        if (!docId) {
          docId = `${Date.now()}-${i}-${index}`;
          item[idField] = docId;
        }
        const docRef = db.collection(collectionName).doc(String(docId));
        batch.set(docRef, item);
      });
      
      await batch.commit();
      console.log(`  Committed batch ${i} to ${i + chunk.length}`);
    }
  } else {
    // If it's an object, just save it as a single document
    console.log(`Migrating ${fileName} as single document...`);
    await db.collection('system').doc(collectionName).set(data);
  }
}

async function run() {
  console.log("Starting Migration...");

  // settingsData contains multiple arrays inside an object. Let's break it down.
  const settingsPath = path.join(__dirname, 'settingsData.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    
    if (settings.users) await migrateArray(settings.users, 'users');
    if (settings.materials) await migrateArray(settings.materials, 'materials');
    if (settings.silos) await migrateArray(settings.silos, 'silos');
    
    // settings could also just be stored as a single document for simplicity since it's highly read
    await db.collection('system').doc('settingsData').set(settings);
    console.log("Migrated settingsData");
  }

  await migrateCollection('queue-history.json', 'queueHistory', 'no'); // "no" or "licensePlate+time"
  await migrateCollection('energyData.json', 'energyData');
  await migrateCollection('energyDaily.json', 'energyDaily');
  await migrateCollection('extruderData.json', 'extruderData');
  await migrateCollection('fans.json', 'fans');
  await migrateCollection('fumigations.json', 'fumigations');
  await migrateCollection('records.json', 'records');
  await migrateCollection('kpiProduction.json', 'kpiProduction');
  await migrateCollection('kpiLoss.json', 'kpiLoss');
  await migrateCollection('kpiTargets.json', 'kpiTargets');
  await migrateCollection('kpiKaizen.json', 'kpiKaizen');
  await migrateCollection('dailyReceived.json', 'dailyReceived');

  console.log("Migration Complete!");
}

async function migrateArray(arr, collectionName) {
    const batchSize = 400;
    for (let i = 0; i < arr.length; i += batchSize) {
      const batch = db.batch();
      const chunk = arr.slice(i, i + batchSize);
      chunk.forEach(item => {
        let docId = item.id || String(Date.now() + Math.random());
        const docRef = db.collection(collectionName).doc(docId);
        batch.set(docRef, item);
      });
      await batch.commit();
    }
}

run().catch(console.error);
