const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/dashboard/DashboardPage.tsx', 'utf8');

// Restore allItems and materialsInGroup
const insertion = `  // Combine all items from silos and additives
  const allItems = [
    ...(summary?.silos ?? []),
    ...(summary?.additives ?? [])
  ];

  // Materials list according to selected group
  const materialsInGroup = allItems.filter((item) => {
    let ig = (item as any).groupType;
    if (ig === 'Phụ gia') ig = 'Additives';
    return selectedGroup === 'All' || ig === selectedGroup;
  });

  const allMaterialNames = Array.from(
    new Set(materialsInGroup.map((i) => i.materialName))
  ).filter(Boolean);
`;

code = code.replace('  // Filtered items based on group and material selection', insertion + '\n  // Filtered items based on group and material selection');

// Fix filteredItems
code = code.replace("const itemGroup = (item as any).groupType || ('siloCode' in item ? 'Silo' : 'Additives');", "let itemGroup = (item as any).groupType || ('siloCode' in item ? 'Silo' : 'Additives');\n      if (itemGroup === 'Phụ gia') itemGroup = 'Additives';");

// Fix filteredMaterials
code = code.replace("const itemGroup = item.groupType || 'Additives';", "let itemGroup = item.groupType || 'Additives';\n      if (itemGroup === 'Phụ gia') itemGroup = 'Additives';");

fs.writeFileSync('frontend/src/components/dashboard/DashboardPage.tsx', code);
console.log('Fixed DashboardPage');
