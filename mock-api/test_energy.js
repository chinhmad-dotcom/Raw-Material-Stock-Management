const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
    
    // Select user define
    await page.select('select[name="DropDownList4"]', 'User define');
    await new Promise(r => setTimeout(r, 1000));
    
    const energyRadio = await page.$('input[id="RadioButtonList2_1"]');
    if (energyRadio) await energyRadio.evaluate(b => b.click());
    
    // Clear and type From Date
    await page.evaluate(() => document.querySelector('input[name="TextBox2"]').value = '');
    await page.type('input[name="TextBox2"]', '01 September 2026');
    
    // Clear and type To Date
    await page.evaluate(() => document.querySelector('input[name="TextBox3"]').value = '');
    await page.type('input[name="TextBox3"]', '02 September 2026');
    
    await page.select('select[name="DropDownList5"]', '06:00');
    await page.select('select[name="DropDownList6"]', '06:00');
    
    await page.screenshot({ path: 'energy_before_click.png' });
    
    await page.click('input[name="Button5"]');
    await new Promise(r => setTimeout(r, 5000));
    
    const pages = await browser.pages();
    if(pages.length > 1) {
        const newPage = pages[pages.length - 1];
        await newPage.screenshot({ path: 'energy_popup_test.png' });
        
        const data = await newPage.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tr'));
          return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 3);
        });
        
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
    }
    
    await browser.close();
})();