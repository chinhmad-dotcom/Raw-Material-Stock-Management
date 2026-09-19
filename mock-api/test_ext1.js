const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
    
    await page.select('select[name="DropDownList4"]', 'User define');
    await new Promise(r => setTimeout(r, 1000));
    
    const energyRadio = await page.$('input[id="RadioButtonList2_1"]');
    if (energyRadio) await energyRadio.evaluate(b => b.click());
    
    await page.evaluate(() => {
      document.querySelector('input[name="TextBox2"]').value = '01 September 2026';
      document.querySelector('input[name="FromhY"]').value = '2026';
      document.querySelector('input[name="FromhM"]').value = '9';
      document.querySelector('input[name="FromhD"]').value = '1';
      
      document.querySelector('input[name="TextBox3"]').value = '02 September 2026';
      document.querySelector('input[name="TohY"]').value = '2026';
      document.querySelector('input[name="TohM"]').value = '9';
      document.querySelector('input[name="TohD"]').value = '2';
    });
    
    await page.select('select[name="DropDownList5"]', '06:00');
    await page.select('select[name="DropDownList6"]', '06:00');
    
    await page.click('input[name="Button5"]');
    await new Promise(r => setTimeout(r, 5000));
    
    const pages = await browser.pages();
    if(pages.length > 1) {
        const newPage = pages[pages.length - 1];
        const data = await newPage.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tr'));
          return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 3);
        });
        console.log("ALL DATA:");
        console.log(JSON.stringify(data.filter(row => row.includes('EXT1') || row.includes('Extruder') || row[0] === 'Meter'), null, 2));
    }
    await browser.close();
})();