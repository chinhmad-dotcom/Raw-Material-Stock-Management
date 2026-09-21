const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const energyDataPath = path.join(__dirname, 'energyData.json');

const loadEnergyData = () => {
  if(fs.existsSync(energyDataPath)) {
    try { return JSON.parse(fs.readFileSync(energyDataPath, 'utf8')); } catch(e){}
  }
  return {}; // { "2026-09-01": { EXT1: 123, EXT2: 456, ... }, ... }
};

const saveEnergyData = (data) => {
  fs.writeFileSync(energyDataPath, JSON.stringify(data, null, 2));
};

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// dateObj is a JS Date object
const formatDateForEnergy = (dateObj) => {
  const d = dateObj.getDate().toString().padStart(2, '0');
  const m = monthNames[dateObj.getMonth()];
  const y = dateObj.getFullYear();
  return `${d} ${m} ${y}`;
};

// dates is an array of date strings 'YYYY-MM-DD'
// We will find the min and max date, and fetch ONE single date range!
const fetchEnergyRange = async (dateStrings) => {
  if (!dateStrings || dateStrings.length === 0) return {};
  
  const dates = dateStrings.map(d => new Date(d));
  let maxDate = new Date(Math.max(...dates));
  const minDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  
  // The Excel report might contain padded future dates (e.g., up to 31)
  // Clamp maxDate to today so we don't query a future date
  const today = new Date();
  today.setHours(0,0,0,0);
  if (maxDate > today) {
    maxDate = new Date(today);
  }
  
  // Add 1 day to maxDate to get the end boundary (e.g. 6h ngày 1 đến 6h ngày 16h)
  // But if that boundary is still in the future (tomorrow), clamp it to today!
  maxDate.setDate(maxDate.getDate() + 1);
  if (maxDate > today) {
    maxDate = new Date(today);
  }

  const monthKey = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}`;
  
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: true });
    console.log(`[Energy Scraper] Fetching ONE range for ${monthKey}: ${formatDateForEnergy(minDate)} to ${formatDateForEnergy(maxDate)}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    await page.evaluate((fStr, tStr, fY, fM, fD, tY, tM, tD) => {
      const setVal = (sel, val) => { const el = document.querySelector(sel); if(el) el.value = val; };
      setVal('select[name="DropDownList4"]', 'User define');
      
      const energyRadio = document.querySelector('input[id="RadioButtonList2_1"]');
      if(energyRadio) energyRadio.checked = true;

      setVal('input[name="TextBox2"]', fStr);
      setVal('input[name="TextBox3"]', tStr);
      
      setVal('input[name="FromhY"]', fY);
      setVal('input[name="FromhM"]', fM);
      setVal('input[name="FromhD"]', fD);
      
      setVal('input[name="TohY"]', tY);
      setVal('input[name="TohM"]', tM);
      setVal('input[name="TohD"]', tD);
      
      setVal('select[name="DropDownList5"]', '06:00');
      setVal('select[name="DropDownList6"]', '06:00');
    }, formatDateForEnergy(minDate), formatDateForEnergy(maxDate), 
       minDate.getFullYear().toString(), (minDate.getMonth()+1).toString(), minDate.getDate().toString(), 
       maxDate.getFullYear().toString(), (maxDate.getMonth()+1).toString(), maxDate.getDate().toString());
    
    await page.click('input[name="Button5"]'); // View Data
    await new Promise(r => setTimeout(r, 4000)); // wait for popup
    
    const pages = await browser.pages();
    let extracted = {};
    
    if(pages.length > 1) {
      const newPage = pages[pages.length - 1];
      const data = await newPage.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 3);
      });
      
      if(data.length > 0) {
        const header = data[0];
        const usedIdx = header.findIndex(h => h.includes('Used'));
        if (usedIdx >= 0) {
          for(let i = 1; i < data.length; i++) {
            const meterName = data[i][0];
            let usedVal = parseFloat((data[i][usedIdx] || '0').replace(/,/g, ''));
            if(meterName) {
              if (isNaN(usedVal) || usedVal < 0) usedVal = 0;
              extracted[meterName] = usedVal;
            }
          }
        }
      }
      try { await newPage.close(); } catch(err){}
    }
    
    if (Object.keys(extracted).length > 0) {
      const energyData = loadEnergyData();
      energyData[monthKey] = extracted;
      saveEnergyData(energyData);
    }
    
    try { await page.close(); } catch(err){}
  } catch(e) {
    console.error('[Energy Scraper] Error:', e);
  } finally {
    if(browser) {
      try { await browser.close(); } catch(err){}
    }
  }
  
  return loadEnergyData();
};

const energyDailyPath = path.join(__dirname, 'energyDaily.json');

const loadEnergyDailyData = () => {
  if(fs.existsSync(energyDailyPath)) {
    try { return JSON.parse(fs.readFileSync(energyDailyPath, 'utf8')); } catch(e){}
  }
  return {}; 
};

const saveEnergyDailyData = (data) => {
  fs.writeFileSync(energyDailyPath, JSON.stringify(data, null, 2));
};

const fetchEnergyDaily = async (dateStrings) => {
  if (!dateStrings || dateStrings.length === 0) return {};
  
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: true });
    console.log(`[Energy Scraper] Starting daily fetch for ${dateStrings.length} dates.`);
    for (const dStr of dateStrings) {
      const minDate = new Date(dStr);
      // Skip if future date
      const today = new Date();
      today.setHours(0,0,0,0);
      if (minDate >= today) {
        console.log(`[Energy Scraper] Skipping future/today date: ${dStr}`);
        continue;
      }
      
      console.log(`[Energy Scraper] Creating new page for: ${dStr}`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      const maxDate = new Date(minDate);
      maxDate.setDate(maxDate.getDate() + 1);

      console.log(`[Energy Scraper] Fetching daily data for: ${dStr} (${formatDateForEnergy(minDate)} to ${formatDateForEnergy(maxDate)})`);
      
      await page.evaluate((fStr, tStr, fY, fM, fD, tY, tM, tD) => {
        const setVal = (sel, val) => { const el = document.querySelector(sel); if(el) el.value = val; };
        setVal('select[name="DropDownList4"]', 'User define');
        
        const energyRadio = document.querySelector('input[id="RadioButtonList2_1"]');
        if(energyRadio) energyRadio.checked = true;

        setVal('input[name="TextBox2"]', fStr);
        setVal('input[name="TextBox3"]', tStr);
        
        setVal('input[name="FromhY"]', fY);
        setVal('input[name="FromhM"]', fM);
        setVal('input[name="FromhD"]', fD);
        
        setVal('input[name="TohY"]', tY);
        setVal('input[name="TohM"]', tM);
        setVal('input[name="TohD"]', tD);
        
        setVal('select[name="DropDownList5"]', '06:00');
        setVal('select[name="DropDownList6"]', '06:00');
      }, formatDateForEnergy(minDate), formatDateForEnergy(maxDate), 
         minDate.getFullYear().toString(), (minDate.getMonth()+1).toString(), minDate.getDate().toString(), 
         maxDate.getFullYear().toString(), (maxDate.getMonth()+1).toString(), maxDate.getDate().toString());
      
      await page.click('input[name="Button5"]'); // View Data
      await new Promise(r => setTimeout(r, 4000)); // wait for popup
      
      const pages = await browser.pages();
      let extracted = {};
      
      if(pages.length > 1) {
        const newPage = pages[pages.length - 1];
        const data = await newPage.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tr'));
          return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 3);
        });
        
        if(data.length > 0) {
          const header = data[0];
          const usedIdx = header.findIndex(h => h.toLowerCase().includes('used') || h.toLowerCase().includes('tiêu thụ'));
          
          let beforeIdx = -1;
          let afterIdx = -1;
          
          if (header.length >= 4 && usedIdx >= 2) {
             beforeIdx = usedIdx - 2;
             afterIdx = usedIdx - 1;
          }
          
          if (usedIdx >= 0) {
            for(let i = 1; i < data.length; i++) {
              const meterName = data[i][0];
              if(meterName) {
                let usedVal = parseFloat((data[i][usedIdx] || '0').replace(/,/g, ''));
                if (isNaN(usedVal) || usedVal < 0) usedVal = 0;
                
                let beforeVal = 0;
                if (beforeIdx >= 0) beforeVal = parseFloat((data[i][beforeIdx] || '0').replace(/,/g, ''));
                
                let afterVal = 0;
                if (afterIdx >= 0) afterVal = parseFloat((data[i][afterIdx] || '0').replace(/,/g, ''));
                
                extracted[meterName] = { before: beforeVal || 0, after: afterVal || 0, used: usedVal };
              }
            }
          }
        }
        try { await newPage.close(); } catch(err){}
      }
      
      try { await page.close(); } catch(err){}
      
      if (Object.keys(extracted).length > 0) {
        const energyDailyData = loadEnergyDailyData();
        const dateKey = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
        energyDailyData[dateKey] = extracted;
        saveEnergyDailyData(energyDailyData);
      }
    }
  } catch(e) {
    console.error('[Energy Scraper] Error during daily fetch:', e);
  } finally {
    if(browser) {
      try { await browser.close(); } catch(err){}
    }
  }
  
  return loadEnergyDailyData();
};

module.exports = { fetchEnergyRange, fetchEnergyDaily, loadEnergyData, loadEnergyDailyData };
