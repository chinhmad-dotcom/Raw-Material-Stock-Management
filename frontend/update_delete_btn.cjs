const fs = require('fs');
let code = fs.readFileSync('src/features/settings/components/SiloTab.tsx', 'utf8');

// 1. Update the deleteLocation function
const deleteFuncRegex = /const deleteLocation = async \(item: MergedLocation\) => \{[^]*?const fetchData = async \(\) => \{/m;
const newDeleteFunc = `const deleteLocation = async (item: MergedLocation) => {
    if (confirm(\`Bạn có chắc chắn muốn xóa (ẩn) \${item.siloCode} chứa \${item.materialName} không?\\n(Thao tác này sẽ loại bỏ dữ liệu sai thực tế từ file Excel khỏi hệ thống)\`)) {
      try {
        const payload = {
          siloCode: item.siloCode,
          materialName: item.materialName,
          isHidden: true
        };
        await fetch(\`http://localhost:5147/api/settings/silos\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        fetchData();
      } catch (error) {
        console.error('Lỗi xóa location:', error);
      }
    }
  };

  const fetchData = async () => {`;
code = code.replace(deleteFuncRegex, newDeleteFunc);

// 2. Update fetchData logic for silos
const siloProcessRegex = /\/\/ Process Silos from Excel\s*summaryData\.silos\?\.forEach\(\(s: any\) => \{\s*const conf = configs\.find\(c => c\.siloCode === s\.siloCode\);\s*merged\.push\(\{/m;
const newSiloProcess = `// Process Silos from Excel
      summaryData.silos?.forEach((s: any) => {
        const hideRule = configs.find(c => c.siloCode === s.siloCode && c.materialName === s.materialName && c.isHidden);
        if (hideRule) return;

        const conf = configs.find(c => c.siloCode === s.siloCode && !c.isHidden);
        merged.push({`;
code = code.replace(siloProcessRegex, newSiloProcess);

// 3. Update fetchData logic for additives
const additiveProcessRegex = /\/\/ Process Additives\/Liquids\s*summaryData\.additives\?\.forEach\(\(a: any\) => \{\s*const siloCode = a\.warehouseLocation \|\| 'WH';\s*const groupType = a\.groupType === 'Liquid' \? 'Liquid' : 'Phụ gia';\s*if \(groupType === 'Phụ gia'\) \{/m;
const newAdditiveProcess = `// Process Additives/Liquids
      summaryData.additives?.forEach((a: any) => {
        const siloCode = a.warehouseLocation || 'WH';
        const groupType = a.groupType === 'Liquid' ? 'Liquid' : 'Phụ gia';
        
        const hideRule = configs.find(c => c.siloCode === siloCode && c.materialName === a.materialName && c.isHidden);
        if (hideRule) return;

        if (groupType === 'Phụ gia') {`;
code = code.replace(additiveProcessRegex, newAdditiveProcess);

// 4. Update the conf finding in additives
const additiveConfRegex = /const conf = configs\.find\(c => c\.siloCode === siloCode\);\s*merged\.push\(\{/m;
const newAdditiveConf = `const conf = configs.find(c => c.siloCode === siloCode && !c.isHidden);
        merged.push({`;
code = code.replace(additiveConfRegex, newAdditiveConf);

fs.writeFileSync('src/features/settings/components/SiloTab.tsx', code, 'utf8');
console.log('Updated delete logic to hide specific material-location pairs');
