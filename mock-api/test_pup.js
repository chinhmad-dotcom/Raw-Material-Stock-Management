const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'networkidle0' });
  
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tagName: el.tagName,
      name: el.name,
      id: el.id,
      type: el.type,
      value: el.value
    }));
  });
  
  console.log(inputs);
  await browser.close();
})();
