const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');

const oldZonesRegex = /const ZONES = \[[\s\S]*?\];/;

const newZones = `const ZONES = [
  {
    name: "KHU VỰC KHOÁNG CHẤT + SỮA + HP300",
    locations: ["B12.1", "B12.2", "B13.1", "B13.2", "B14.1", "B14.2", "B14.3", "B14.4", "B15.1", "B15.2", "B16.1", "B16.2", "B17.1", "B17.2", "B18.1", "B18.2", "B19.1"]
  },
  {
    name: "KHU VỰC KHOÁNG CHẤT",
    locations: ["A10.1", "A10.2", "A11.1", "A11.2", "A12.1", "A12.2", "A13.1", "A13.2"]
  },
  {
    name: "KHU VỰC ACID",
    locations: ["A15.1", "A15.2", "A16.1A", "A16.1B", "A16.2A", "A16.2B"]
  },
  {
    name: "KHO PHỤ GIA VÀ PREMIX",
    locations: [
      "V9.3", "V9.2", "V9.1", "V8.3", "V8.2", "V8.1", "V7.3", "V7.2", "V7.1", "V6.3", "V6.2", "V6.1", "V5.3", "V5.2", "V5.1", "V4.3", "V4.2", "V4.1", "V3.3", "V3.2", "V3.1", "V2.3", "V2.2", "V2.1", "V1.3", "V1.2", "V1.1",
      "Z7.1", "Z7.2", "Z7.3", "Z6.1", "Z6.2", "Z6.3", "Z5.1", "Z5.2", "Z5.3", "Z4.1", "Z4.2", "Z4.3", "Z3.1", "Z3.2", "Z3.3", "Z2.1", "Z2.2", "Z2.3", "Z1.1", "Z1.2", "Z1.3",
      "Y7.3", "Y7.2", "Y7.1", "Y6.3", "Y6.2", "Y6.1", "Y5.3", "Y5.2", "Y5.1", "Y4.3", "Y4.2", "Y4.1", "Y3.3", "Y3.2", "Y3.1", "Y2.3", "Y2.2", "Y2.1", "Y1.3", "Y1.2", "Y1.1",
      "X8.1", "X8.2", "X8.3", "X7.1", "X7.2", "X7.3", "X6.1", "X6.2", "X6.3", "X5.1", "X5.2", "X5.3", "X4.1", "X4.2", "X4.3", "X3.1", "X3.2", "X3.3", "X2.1", "X2.2", "X2.3", "X1.1", "X1.2", "X1.3",
      "A18.6", "A19.6", "A22.6", "A18.5", "A19.5", "A22.5", "A18.4", "A19.4", "A22.4", "A18.3", "A19.3", "A22.3", "A18.2", "A19.2", "A22.2", "A18.1", "A19.1", "A22.1"
    ]
  },
  {
    name: "KHU VỰC ĐẠM ĐỘNG VẬT",
    locations: ["B21.1", "B21.2", "B22.1", "B22.2", "B23.1", "B23.2", "B24.1", "B24.2", "B25.1", "B25.2", "C12", "C11", "C10", "C9", "C8", "C7", "C6", "C5", "C4", "C3", "C2", "C1", "H"]
  },
  {
    name: "KHO LẠNH",
    locations: ["D3", "D2", "D1", "E3", "E2", "E1"]
  },
  {
    name: "KHU VỰC SỮA + CAROMIC + HP300",
    locations: ["A8", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "B8", "B7", "B6", "B5", "B4", "B3", "B2", "B1"]
  }
];`;

content = content.replace(oldZonesRegex, newZones);
fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', content);
console.log('Updated ZONES successfully.');
