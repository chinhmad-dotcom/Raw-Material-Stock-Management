const fs = require('fs');

const files = [
  'frontend/src/features/auth/components/LoginForm.tsx',
  'frontend/src/features/auth/components/RegisterForm.tsx',
  'frontend/src/features/auth/components/ForgotPasswordForm.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/className="space-y-5"/g, 'className="space-y-4"');
  c = c.replace(/className="space-y-6"/g, 'className="space-y-4"');
  c = c.replace(/py-3/g, 'py-2.5');
  c = c.replace(/mb-6/g, 'mb-4');
  
  fs.writeFileSync(file, c);
}
console.log('Optimized auth forms spacing');
