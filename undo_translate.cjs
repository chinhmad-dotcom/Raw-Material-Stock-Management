const fs = require('fs');

const filesToProcess = [
  'frontend/src/features/settings/components/ProfileTab.tsx',
  'frontend/src/features/settings/components/AccountTab.tsx',
  'frontend/src/features/settings/components/SiloTab.tsx',
  'frontend/src/features/settings/components/MaterialsTab.tsx',
  'frontend/src/features/settings/components/LogsTab.tsx',
  'frontend/src/components/fans/FanPlanForm.tsx',
  'frontend/src/components/fans/FanPlanList.tsx'
];

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Undo {t('auto.t...', 'LITERAL')}
  // But wait! If the original string had newlines, my regex won't match if it doesn't span newlines.
  // We can just match \{t\('auto\.t\d+',\s*'([\s\S]*?)'\)\}
  
  content = content.replace(/\{t\('auto\.t\d+',\s*'([\s\S]*?)'\)\}/g, (match, literal) => {
    return literal.replace(/\\'/g, "'");
  });
  
  // Undo placeholder={t(...)}
  // Wait, the above already replaced {t(...)} with literal, so now it might be placeholder=LITERAL
  // Let's fix that. Actually, let's run a second pass to fix placeholder=LITERAL if it doesn't have quotes.
  // Actually, placeholder={t(..)} was replaced by placeholder=LITERAL in the first step?
  // Yes! If the original was placeholder="LITERAL", my script did: placeholder={t('auto...', 'LITERAL')}
  // So the undo step above changes it to: placeholder=LITERAL (without quotes!)
  // Oh no! Let's handle placeholders carefully.
  
  let c2 = fs.readFileSync(file, 'utf8');
  
  // First, undo placeholder={t('auto.t...', 'LITERAL')}
  c2 = c2.replace(/placeholder=\{t\('auto\.t\d+',\s*'([\s\S]*?)'\)\}/g, (match, literal) => {
      return `placeholder="${literal.replace(/\\'/g, "'")}"`;
  });
  
  // Then undo the rest {t('auto.t...', 'LITERAL')}
  c2 = c2.replace(/\{t\('auto\.t\d+',\s*'([\s\S]*?)'\)\}/g, (match, literal) => {
      return literal.replace(/\\'/g, "'");
  });

  // Remove import
  c2 = c2.replace("import { useTranslation } from 'react-i18next';\n", "");
  // Remove hook
  c2 = c2.replace("  const { t } = useTranslation();\n", "");

  fs.writeFileSync(file, c2);
  console.log(`Reverted ${file}`);
});
