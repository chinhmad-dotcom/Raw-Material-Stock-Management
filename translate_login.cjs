const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/LoginPage.tsx', 'utf8');
if (!code.includes('useTranslation')) {
  code = code.replace(
    "import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';",
    "import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';\nimport { useTranslation } from 'react-i18next';"
  );
  code = code.replace(
    "export function LoginPage() {",
    "export function LoginPage() {\n  const { i18n } = useTranslation();"
  );
  
  const langToggle = `
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
          className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-300 hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
        >
          {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
        </button>
      </div>
  `;
  code = code.replace(/<div className="relative flex min-h-screen items-center justify-center bg-\[#0b0f19\] text-slate-900 dark:text-slate-100 overflow-hidden">/, '<div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden">' + langToggle);
  
  fs.writeFileSync('frontend/src/pages/LoginPage.tsx', code);
  console.log('LoginPage translated');
}
