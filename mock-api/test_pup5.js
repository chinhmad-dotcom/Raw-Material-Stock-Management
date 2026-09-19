const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    document.querySelector('select[name="DropDownList4"]').value = 'User define';
    document.querySelector('select[name="DropDownList1"]').value = 'EXT1';
    
    // Check RadioButtonList2_1 (Energy)
    const energyRadio = document.querySelector('input[id="RadioButtonList2_1"]');
    if(energyRadio) energyRadio.checked = true;

    document.querySelector('input[name="TextBox2"]').value = '01 September 2026';
    document.querySelector('input[name="TextBox3"]').value = '02 September 2026';
    document.querySelector('select[name="DropDownList5"]').value = '06:00';
    document.querySelector('select[name="DropDownList6"]').value = '06:00';
  });
  
  await page.click('input[name="Button5"]'); // View Data
  
  await new Promise(r => setTimeout(r, 5000));
  
  const pages = await browser.pages();
  if(pages.length > 1) {
    const newPage = pages[pages.length - 1];
    console.log('Popup URL:', newPage.url());
    const data = await newPage.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 0);
    });
    console.log('Total popup rows:', data.length);
    if(data.length > 0) console.log('First 3 popup rows:', data.slice(0, 3));
  } else {
    console.log('No new page opened!');
    // Extract grid from inline page
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 0);
    });
    console.log('Total inline rows:', data.length);
    if(data.length > 0) {
      // Find the grid data (e.g. headers with Date, Time, etc)
      const dataRows = data.filter(row => row.length > 3);
      console.log('First 5 data rows:', dataRows.slice(0, 5));
    }
  }

  await browser.close();
})();
