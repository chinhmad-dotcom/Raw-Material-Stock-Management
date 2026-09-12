const fs = require('fs');
let k = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
if (!k.includes('useTranslation')) {
    k = "import { useTranslation } from 'react-i18next';\n" + k;
}
k = k.replace('const StockKho: React.FC = () => {', 'const StockKho: React.FC = () => {\n  const { t } = useTranslation();');
fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', k);
console.log('Fixed StockKho');
