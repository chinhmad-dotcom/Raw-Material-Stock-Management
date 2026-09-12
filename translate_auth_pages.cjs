const fs = require('fs');

function translateLoginPage() {
  let code = fs.readFileSync('frontend/src/pages/auth/LoginPage.tsx', 'utf8');
  if (!code.includes('useTranslation')) {
    code = code.replace(
      "import { Shield } from 'lucide-react';",
      "import { Shield } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
    );
    code = code.replace(
      "export default function LoginPage() {",
      "export default function LoginPage() {\n  const { t, i18n } = useTranslation();"
    );
    
    code = code.replace(/>StockRM Login</g, ">{t('auth.loginTitle', 'StockRM Login')}<");
    
    // Add language toggle to login page header
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
    code = code.replace(/<div className="relative z-10 flex min-h-screen items-center justify-center p-4">/, '<div className="relative z-10 flex min-h-screen items-center justify-center p-4">' + langToggle);
    
    fs.writeFileSync('frontend/src/pages/auth/LoginPage.tsx', code);
    console.log('LoginPage translated');
  }
}

function translateRegisterPage() {
  let code = fs.readFileSync('frontend/src/pages/auth/RegisterPage.tsx', 'utf8');
  if (!code.includes('useTranslation')) {
    code = code.replace(
      "import { Shield } from 'lucide-react';",
      "import { Shield } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
    );
    code = code.replace(
      "export default function RegisterPage() {",
      "export default function RegisterPage() {\n  const { t, i18n } = useTranslation();"
    );
    
    code = code.replace(/>Create Account</g, ">{t('auth.registerTitle', 'Create Account')}<");
    
    // Add language toggle to register page header
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
    code = code.replace(/<div className="relative z-10 flex min-h-screen items-center justify-center p-4">/, '<div className="relative z-10 flex min-h-screen items-center justify-center p-4">' + langToggle);
    
    fs.writeFileSync('frontend/src/pages/auth/RegisterPage.tsx', code);
    console.log('RegisterPage translated');
  }
}

translateLoginPage();
translateRegisterPage();
