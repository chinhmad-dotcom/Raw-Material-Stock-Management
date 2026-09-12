const fs = require('fs');
const path = require('path');

const badPatterns = [
  'á»‡', 'áº¡', 'Há»§', 'á»§', 'Ã¡', 'Ã¢', 'Ãª', 'Ã´', 'Ä‘', 'Ä\x90', 'á»', 'áº'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      const hasBad = badPatterns.some(p => content.includes(p));
      if (hasBad) {
        results.push(file);
      }
    }
  });
  return results;
}

const badFiles = walk('src');
console.log(JSON.stringify(badFiles, null, 2));
