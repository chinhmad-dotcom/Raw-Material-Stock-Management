const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
  
  // Set values
  await page.evaluate(() => {
    document.querySelector('select[name="DropDownList4"]').value = 'User define'; // Mode
    document.querySelector('select[name="DropDownList1"]').value = 'EXT1'; // Meter
    
    // Check RadioButtonList2_1 (Energy)
    const energyRadio = document.querySelector('input[id="RadioButtonList2_1"]');
    if(energyRadio) energyRadio.checked = true;

    document.querySelector('input[name="TextBox2"]').value = '01 September 2026'; // From Date
    document.querySelector('input[name="TextBox3"]').value = '16 September 2026'; // To Date
    
    document.querySelector('select[name="DropDownList5"]').value = '06:00';
    document.querySelector('select[name="DropDownList6"]').value = '06:00';
  });
  
  // Wait for the "Raw Data" table to load after clicking
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('input[name="Button2"]') // Click Raw Data
  ]);
  
  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 0);
  });
  
  console.log('Result rows:', data.length);
  if(data.length > 0) {
    console.log('Header:', data[0]);
    console.log('First row:', data[1]);
    console.log('Last row:', data[data.length-1]);
  }
  
  await browser.close();
})();
