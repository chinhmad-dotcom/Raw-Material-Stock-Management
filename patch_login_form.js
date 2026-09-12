const fs = require('fs');

let code = fs.readFileSync('frontend/src/features/auth/components/LoginForm.tsx', 'utf8');

code = code.replace(
  'export function LoginForm() {',
  'export function LoginForm({ onForgotPassword }: { onForgotPassword?: () => void }) {'
);

code = code.replace(
  '<a href="#" className="font-medium text-sky-400 transition hover:text-sky-300 text-xs">',
  '<button type="button" onClick={onForgotPassword} className="font-medium text-sky-400 transition hover:text-sky-300 text-xs">'
);

code = code.replace(
  'Forgot password?\n          </a>',
  'Forgot password?\n          </button>'
);

fs.writeFileSync('frontend/src/features/auth/components/LoginForm.tsx', code);
console.log('LoginForm updated');
