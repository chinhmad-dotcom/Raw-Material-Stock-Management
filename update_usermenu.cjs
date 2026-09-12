const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/layout/UserMenu.tsx', 'utf8');

if (!code.includes('useTranslation')) {
  code = code.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
  );
  
  code = code.replace(
    "const { theme, toggleTheme } = useThemeStore();",
    "const { theme, toggleTheme } = useThemeStore();\n  const { t, i18n } = useTranslation();"
  );
  
  const langToggle = `
          <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('header.language', 'Ngôn ngữ')}</span>
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
            </button>
          </div>
  `;

  code = code.replace(
    /<\/button>\s*<\/div>\s*<div className="py-1">/,
    `</button>\n          </div>` + langToggle + `\n          <div className="py-1">`
  );

  code = code.replace('Settings', "{t('sidebar.settings', 'Cài đặt')}");
  code = code.replace('Logout', "{t('sidebar.logout', 'Đăng xuất')}");

  fs.writeFileSync('frontend/src/components/layout/UserMenu.tsx', code);
  console.log('UserMenu updated');
}
