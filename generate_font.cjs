const fs = require('fs');
try {
  const font = fs.readFileSync('C:/Windows/Fonts/times.ttf');
  const b64 = font.toString('base64');
  fs.writeFileSync('frontend/src/components/fans/timesFont.ts', 'export const timesBase64 = "' + b64 + '";\n');
  console.log('Font created successfully');
} catch (err) {
  console.error('Error generating font:', err);
}
