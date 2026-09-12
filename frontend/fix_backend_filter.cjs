const fs = require('fs');
let code = fs.readFileSync('../mock-api/server.js', 'utf8');

const oldAdditivesFilter = `additives = additives.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      if (finalGroup === 'Silo' && item.groupType !== 'Silo') return false; 
      if (finalGroup === 'Liquid' && item.groupType !== 'Liquid') {
          item.groupType = 'Liquid'; 
      }
      return true;
  });`;
const newAdditivesFilter = `additives = additives.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      if (finalGroup === 'Silo' && item.groupType !== 'Silo') return false; 
      if (finalGroup === 'Liquid' && item.groupType !== 'Liquid') {
          item.groupType = 'Liquid'; 
      }
      return item.currentStockTons > 0;
  });`;
code = code.replace(oldAdditivesFilter, newAdditivesFilter);

const oldSilosFilter = `silos = silos.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      return finalGroup === 'Silo';
  });`;
const newSilosFilter = `silos = silos.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      return finalGroup === 'Silo' && item.currentStockTons > 0;
  });`;
code = code.replace(oldSilosFilter, newSilosFilter);

fs.writeFileSync('../mock-api/server.js', code, 'utf8');
console.log('Fixed backend filters');
