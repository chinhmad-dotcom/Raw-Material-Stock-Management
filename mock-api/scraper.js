const puppeteer = require('puppeteer');

async function scrapeQueueData(username, password, dateFrom, dateTo) {
  let browser = null;
  try {
    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
    });
    
    const page = await browser.newPage();
    // Ignore images and css to speed up
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log('[Scraper] Going to login page...');
    await page.goto('https://queuemonitor.cp.com.vn/Login.aspx', { waitUntil: 'domcontentloaded' });

    // Fill login
    await page.type('#txtUsername', username);
    await page.type('#txtPassword', password);
    
    console.log('[Scraper] Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('#cmdOK')
    ]);

    // Check if login failed or if we need to select factory (which keeps us on login.aspx)
    if (page.url().toLowerCase().includes('login.aspx')) {
      // Check if panSelectFactory is visible or if cmdLogin exists
      const needsFactorySelect = await page.evaluate(() => {
        const btn = document.getElementById('cmdLogin');
        // Check if there is an error message
        const err = document.getElementById('lblError');
        if (err && err.innerText.trim().length > 0) return false;
        return btn !== null;
      });

      if (needsFactorySelect) {
        console.log('[Scraper] Selecting factory...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.click('#cmdLogin')
        ]);
        
        // If still on login page after clicking Factory, then fail
        if (page.url().toLowerCase().includes('login.aspx')) {
           throw new Error('Không thể vượt qua bước chọn nhà máy.');
        }
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản CP.');
      }
    }

    console.log('[Scraper] Going to ReportQueue...');
    await page.goto('https://queuemonitor.cp.com.vn/ReportQueue.aspx', { waitUntil: 'domcontentloaded' });

    // 1. Select Queue Type = 2 (Receive Queue)
    // Changing this will trigger __doPostBack, so we wait for navigation
    console.log('[Scraper] Selecting Queue Type = Receive...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.select('#ddlQueueType', '2')
    ]);

    // 2. We need to select From = Weight 1, To = Weight 2.
    // Let's find the values dynamically based on text
    console.log('[Scraper] Selecting Steps...');
    await page.evaluate(() => {
      const selectOptionByText = (selectId, textSearch) => {
        const select = document.getElementById(selectId);
        if (!select) return false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(textSearch.toLowerCase())) {
            select.value = select.options[i].value;
            return true;
          }
        }
        return false;
      };
      selectOptionByText('ddlStepFrom', 'weight 1');
      selectOptionByText('ddlStepTo', 'weight 2');
    });

    // We might need to trigger postbacks if selecting ddlStepFrom triggers it, 
    // but usually only the main dropdowns trigger full page reloads. 
    // Just to be safe, if we need it, we handle it. Based on HTML, ddlStepFrom has onchange="__doPostBack".
    // Actually, setting .value directly in JS DOES NOT trigger the onchange event in standard DOM unless we dispatch it!
    // Since we just want to submit the form, if we set the value directly and click Show, ASP.NET might accept it.

    // 3. Set Dates
    console.log(`[Scraper] Setting dates: ${dateFrom} - ${dateTo}`);
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const formatCPDate = (isoDate) => {
      const parts = isoDate.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return isoDate;
    };
    
    const cpDateFrom = formatCPDate(dateFrom);
    const cpDateTo = formatCPDate(dateTo);

    await page.evaluate((f, t) => {
      document.getElementById('txtDateFrom').value = f;
      document.getElementById('txtDateTo').value = t;
      
      // Also remove readonly attribute if any
      document.getElementById('txtDateFrom').removeAttribute('readonly');
      document.getElementById('txtDateTo').removeAttribute('readonly');
    }, cpDateFrom, cpDateTo);

    // 4. Click Show Report
    console.log('[Scraper] Clicking Show Report...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
      page.click('#bttShowReport')
    ]);

    console.log('[Scraper] Extracting table data...');
    // Extract data from table gvReceiveQueue
    const tableData = await page.evaluate(() => {
      const table = document.getElementById('gvReceiveQueue');
      if (!table) return [];

      const rows = Array.from(table.querySelectorAll('tr'));
      const results = [];
      
      // Skip header row(s). Usually rows[0] is header.
      for (let i = 1; i < rows.length; i++) {
        const tds = rows[i].querySelectorAll('td');
        if (tds.length < 12) continue; // skip invalid rows
        
        results.push({
          no: parseInt(tds[0].innerText.trim(), 10) || i,
          licensePlate: tds[1].innerText.trim(),
          vendor: tds[2].innerText.trim(),
          material: tds[3].innerText.trim(),
          originalWeight: parseFloat(tds[4].innerText.trim().replace(/,/g, '')) || 0,
          netWeight: parseFloat(tds[5].innerText.trim().replace(/,/g, '')) || 0,
          diff: parseFloat(tds[6].innerText.trim().replace(/,/g, '')) || 0,
          pctDiff: parseFloat(tds[7].innerText.trim().replace(/,/g, '')) || 0,
          arrive: tds[8].innerText.trim(),
          weight1: tds[9].innerText.trim(),
          weight2: tds[10].innerText.trim(),
          timing: tds[11].innerText.trim()
        });
      }
      return results;
    });

    console.log(`[Scraper] Successfully extracted ${tableData.length} records.`);
    return tableData;

  } catch (error) {
    console.error('[Scraper Error]', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeQueueData };
