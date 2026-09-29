const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/truck/QueueDashboard.tsx', 'utf8');

const regex = /const delayedTrucks = data\.filter\(d => \{[\s\S]*?return totalMinutes > 60;\s*\}\);/;

const newCode = `const delayedTrucks = data.filter(d => {
    const parts = (d.timing || '').split(':').map(Number);
    if (parts.length < 3) return false;
    const totalMinutes = (parts[0] * 24 * 60) + (parts[1] * 60) + parts[2];
    return totalMinutes > 60;
  }).sort((a, b) => {
    const parseTime = (dateStr: string) => {
      if (!dateStr) return 0;
      const parts = dateStr.split(' ');
      if (parts.length < 2) return 0;
      const [d, m, y] = parts[0].split('/');
      return new Date(\`\${y}-\${m}-\${d}T\${parts[1]}:00\`).getTime();
    };
    return parseTime(b.weight2 || b.weight1 || b.arrive) - parseTime(a.weight2 || a.weight1 || a.arrive);
  });`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('frontend/src/components/truck/QueueDashboard.tsx', content);
    console.log('Replaced successfully.');
} else {
    console.log('Could not find the exact code block.');
}
