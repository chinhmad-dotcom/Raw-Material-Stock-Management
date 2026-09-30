const fs = require('fs');

const file = 'mock-api/settingsData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!data.locations) {
    data.locations = [];
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Added locations to settingsData.json');
} else {
    console.log('Already has locations');
}
