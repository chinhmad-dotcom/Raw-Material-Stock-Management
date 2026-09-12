const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');

code = code.replace(
  "Truck } from 'lucide-react';",
  "Truck, Fan } from 'lucide-react';"
);

code = code.replace(
  "{ name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className=\"h-5 w-5\" /> },",
  "{ name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className=\"h-5 w-5\" /> },\n    { name: 'Silo Fans', path: '/silo-fans', icon: <Fan className=\"h-5 w-5\" /> },"
);

fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', code);
console.log('Sidebar fixed');
