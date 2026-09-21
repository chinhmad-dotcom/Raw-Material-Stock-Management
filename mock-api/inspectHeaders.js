const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://172.21.36.245/energyreport/', { waitUntil: 'domcontentloaded' });
    await page.click('input[name="Button5"]');
    await new Promise(r => setTimeout(r, 4000));
    const pages = await browser.pages();
    if(pages.length > 1) {
        const data = await pages[pages.length-1].evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tr'));
            return rows.map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())).filter(row => row.length > 3);
        });
        console.log('Headers:', JSON.stringify(data[0]));
        console.log('Row 1:', JSON.stringify(data[1]));
    }
    process.exit(0);
})();
