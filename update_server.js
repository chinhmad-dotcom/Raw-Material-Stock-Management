const fs = require('fs');
const path = require('path');

const serverFile = 'mock-api/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

if (!content.includes('locations')) {
    // Modify loadSettings to initialize locations
    content = content.replace(
        /return JSON\.parse\(fs\.readFileSync\(SETTINGS_FILE_PATH, 'utf8'\)\);/,
        `const data = JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, 'utf8'));
    if (!data.locations) data.locations = [];
    return data;`
    );

    fs.writeFileSync(serverFile, content);
    console.log('Added locations array support.');
} else {
    console.log('locations already supported?');
}
