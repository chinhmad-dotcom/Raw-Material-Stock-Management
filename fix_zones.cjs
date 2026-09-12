const fs = require('fs');
const viPath = 'frontend/src/i18n/locales/vi.json';
const enPath = 'frontend/src/i18n/locales/en.json';

let vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

vi.pages.stockKho.zones = {
  '0': 'KHU VỰC KHOÁNG CHẤT + SỮA + HP300',
  '1': 'KHU VỰC KHOÁNG CHẤT',
  '2': 'KHU VỰC HÓA CHẤT',
  '3': 'KHO PHỤ GIA VÀ PREMIX',
  '4': 'KHU VỰC ĐẠM ĐỘNG VẬT',
  '5': 'KHO LẠNH',
  '6': 'KHU VỰC SỮA + CAROMIC + HP300'
};

en.pages.stockKho.zones = {
  '0': 'MINERALS + MILK + HP300 AREA',
  '1': 'MINERALS AREA',
  '2': 'CHEMICALS AREA',
  '3': 'ADDITIVES & PREMIX WAREHOUSE',
  '4': 'ANIMAL PROTEIN AREA',
  '5': 'COLD STORAGE',
  '6': 'MILK + CAROMIC + HP300 AREA'
};

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

let k = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
k = k.replace(/>\{zone\.name\}</g, ">{t('pages.stockKho.zones.' + idx, zone.name)}<");
fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', k);

console.log('Fixed Zone titles');
