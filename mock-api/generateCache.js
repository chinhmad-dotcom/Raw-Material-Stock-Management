const fs = require('fs');
const path = require('path');
const { parseExcelReport, getAvailableDates, getFilePathForDate } = require('./server.js');

const dailyCachePath = path.join(__dirname, 'dailyReceived.json');
const dailyCache = {};

const dates = getAvailableDates();
console.log('Processing dates:', dates);
for (const date of dates) {
  const p = getFilePathForDate(date);
  console.log('Parsing', p);
  const data = parseExcelReport(p);
  if (data && data.materials) {
    dailyCache[date] = data.materials.map(m => ({ name: m.materialName, received: m.totalReceiveKg || 0 }));
  }
}

fs.writeFileSync(dailyCachePath, JSON.stringify(dailyCache, null, 2));
console.log('Done generating dailyReceived.json');
process.exit(0);
