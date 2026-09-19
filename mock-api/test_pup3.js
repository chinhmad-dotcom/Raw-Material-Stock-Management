const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    document.querySelector('select[name="DropDownList4"]').value = 'User define';
    document.querySelector('select[name="DropDownList1"]').value = 'EXT1';
    document.querySelector('input[name="TextBox2"]').value = '01 September 2026';
    document.querySelector('input[name="TextBox3"]').value = '02 September 2026';
    document.querySelector('select[name="DropDownList5"]').value = '06:00';
    document.querySelector('select[name="DropDownList6"]').value = '06:00';
  });
  
  await page.click('input[name="Button2"]'); // Raw Data
  
  // Wait a few seconds for potential ajax or new tab
  await new Promise(r => setTimeout(r, 5000));
  
  const pages = await browser.pages();
  console.log('Total pages open:', pages.length);
  
  if(pages.length > 1) {
    const newPage = pages[pages.length - 1];
    await newPage.screenshot({ path: 'g:/App/StockRM/rawdata_popup.png' });
    const content = await newPage.content();
    console.log('Popup HTML length:', content.length);
    console.log(content.substring(0, 500));
  } else {
    await page.screenshot({ path: 'g:/App/StockRM/rawdata_inline.png' });
    console.log('No new page opened. Screenshot taken inline.');
  }

  await browser.close();
})();
