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
const fetchEnergyForDates = async (dateStrings) => {
  const energyData = loadEnergyData();
  let browser = null;
  
  try {
    const datesToFetch = dateStrings.filter(d => !energyData[d] || energyData[d].__incomplete);
    
    if (datesToFetch.length === 0) return energyData; // All cached
    
    browser = await puppeteer.launch({ headless: true });
    
    for (const dStr of datesToFetch) {
      console.log('[Energy Scraper] Fetching for', dStr);
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      const dObj = new Date(dStr);
      const nextDay = new Date(dObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const fromStr = formatDateForEnergy(dObj);
      const toStr = formatDateForEnergy(nextDay);
      
      await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
      
      await page.evaluate((fStr, tStr, fY, fM, fD, tY, tM, tD) => {
        const setVal = (sel, val) => { const el = document.querySelector(sel); if(el) el.value = val; };
        setVal('select[name="DropDownList4"]', 'User define');
        
        const energyRadio = document.querySelector('input[id="RadioButtonList2_1"]');
        if(energyRadio) energyRadio.checked = true;

        setVal('input[name="TextBox2"]', fStr);
        setVal('input[name="TextBox3"]', tStr);
        
        // Hidden fields required by ASP.NET DevExpress
        setVal('input[name="FromhY"]', fY);
        setVal('input[name="FromhM"]', fM);
        setVal('input[name="FromhD"]', fD);
        
        setVal('input[name="TohY"]', tY);
        setVal('input[name="TohM"]', tM);
        setVal('input[name="TohD"]', tD);
        
        setVal('select[name="DropDownList5"]', '06:00');
        setVal('select[name="DropDownList6"]', '06:00');
      }, fromStr, toStr, dObj.getFullYear().toString(), (dObj.getMonth()+1).toString(), dObj.getDate().toString(), nextDay.getFullYear().toString(), (nextDay.getMonth()+1).toString(), nextDay.getDate().toString());
      
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
        
        // Find Used column index
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
        energyData[dStr] = extracted;
      } else {
        energyData[dStr] = { __incomplete: true };
      }
      saveEnergyData(energyData);
      
      try { await page.close(); } catch(err){}
    }
  } catch(e) {
    console.error('[Energy Scraper] Error:', e);
  } finally {
    if(browser) {
      try { await browser.close(); } catch(err){}
    }
  }
  
  return loadEnergyData();
};

module.exports = { fetchEnergyForDates, loadEnergyData };
