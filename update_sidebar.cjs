const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');

if (!code.includes("path: '/silo-fans'")) {
  code = code.replace(
    "import { LayoutDashboard, Database, Activity, Package, Settings, Truck, ChevronLeft, Menu } from 'lucide-react';",
    "import { LayoutDashboard, Database, Activity, Package, Settings, Truck, Fan, ChevronLeft, Menu } from 'lucide-react';"
  );
  
  const newItem = `
  { path: '/truck-tracking', label: 'Truck Tracking', icon: Truck },
  { path: '/silo-fans', label: 'Silo Fans', icon: Fan },`;

  code = code.replace(
    "{ path: '/truck-tracking', label: 'Truck Tracking', icon: Truck },",
    newItem
  );

  fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', code);
  console.log('Sidebar.tsx updated');
}
