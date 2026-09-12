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

const viPath = 'frontend/src/i18n/locales/vi.json';
const enPath = 'frontend/src/i18n/locales/en.json';

let vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

vi.auto = vi.auto || {};
en.auto = en.auto || {};

let counter = Object.keys(vi.auto).length;

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add useTranslation import if not present
  if (!content.includes('useTranslation')) {
    content = "import { useTranslation } from 'react-i18next';\n" + content;
  }

  // Inject const { t } = useTranslation(); into the component if not present
  const componentMatch = content.match(/export (?:default )?function ([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/);
  if (componentMatch && !content.includes('const { t } = useTranslation();')) {
      content = content.replace(componentMatch[0], componentMatch[0] + "\n  const { t } = useTranslation();\n");
      changed = true;
  }

  // Find all text inside JSX tags
  // This regex looks for > text < where text has word characters
  const jsxTextRegex = />([^<>{}]*[A-Za-zĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÊẾỀỂỄỆÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰÍÌỈĨỊÚÙỦŨỤÝỲỶỸỴđáàảãạâấầẩẫậăắằẳẵặêếềểễệôốồổỗộơớờởỡợưứừửữựíìỉĩịúùủũụýỳỷỹỵ]+[^<>{}]*)</g;
  
  content = content.replace(jsxTextRegex, (match, text) => {
    let trimmed = text.trim();
    if (!trimmed || trimmed.match(/^[0-9\W]+$/)) return match;
    
    // Skip if it looks like code or too complex
    if (trimmed.includes('=>') || trimmed.includes('&&') || trimmed.includes('state.') || trimmed.includes('data.')) return match;
    
    // Check if it already exists in our dictionary to reuse keys
    let key = Object.keys(vi.auto).find(k => vi.auto[k] === trimmed || en.auto[k] === trimmed);
    if (!key) {
      key = `t${counter++}`;
      // Just put the string in both for now, the user can refine later, but we will guess English/Vietnamese based on characters
      const isVietnamese = /[ĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÊẾỀỂỄỆÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰÍÌỈĨỊÚÙỦŨỤÝỲỶỸỴđáàảãạâấầẩẫậăắằẳẵặêếềểễệôốồổỗộơớờởỡợưứừửữựíìỉĩịúùủũụýỳỷỹỵ]/.test(trimmed);
      if (isVietnamese) {
        vi.auto[key] = trimmed;
        en.auto[key] = trimmed + ' (EN)'; // placeholder
      } else {
        en.auto[key] = trimmed;
        vi.auto[key] = trimmed + ' (VI)'; // placeholder
      }
    }
    
    changed = true;
    return match.replace(trimmed, `{t('auto.${key}', '${trimmed.replace(/'/g, "\\'")}')}`);
  });
  
  // also handle standard placeholders
  const placeholderRegex = /placeholder=["']([^"']+[A-Za-zĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÊẾỀỂỄỆÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰÍÌỈĨỊÚÙỦŨỤÝỲỶỸỴđáàảãạâấầẩẫậăắằẳẵặêếềểễệôốồổỗộơớờởỡợưứừửữựíìỉĩịúùủũụýỳỷỹỵ]+[^"']*)["']/g;
  content = content.replace(placeholderRegex, (match, text) => {
    let trimmed = text.trim();
    if (!trimmed || trimmed.match(/^[0-9\W]+$/)) return match;
    
    let key = Object.keys(vi.auto).find(k => vi.auto[k] === trimmed || en.auto[k] === trimmed);
    if (!key) {
      key = `t${counter++}`;
      vi.auto[key] = trimmed;
      en.auto[key] = trimmed;
    }
    changed = true;
    return `placeholder={t('auto.${key}', '${trimmed.replace(/'/g, "\\'")}')}`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log('Done mapping auto translations');
