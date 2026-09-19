const http = require('http');
const querystring = require('querystring');

http.get('http://172.21.36.245/energyreport/', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const vs = d.match(/id="__VIEWSTATE" value="([^"]+)"/);
    const ev = d.match(/id="__EVENTVALIDATION" value="([^"]+)"/);
    const vsg = d.match(/id="__VIEWSTATEGENERATOR" value="([^"]+)"/);
    console.log(vs ? 'vs ok' : 'vs fail', ev ? 'ev ok' : 'ev fail');
    
    if (vs && ev) {
      const postData = querystring.stringify({
        __VIEWSTATE: vs[1],
        __EVENTVALIDATION: ev[1],
        __VIEWSTATEGENERATOR: vsg ? vsg[1] : '',
        DropDownList1: 'EXT1',
        DropDownList2: 'User define',
        DropDownList3: 'Daily',
        DropDownList4: 'Minute',
        DropDownList5: '06:00',
        DropDownList6: '06:00',
        textbox1: '01 September 2026',
        textbox2: '20 September 2026',
        Button2: 'Raw Data'
      });
      
      const req = http.request('http://172.21.36.245/energyreport/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res2) => {
        let d2 = '';
        res2.on('data', c => d2 += c);
        res2.on('end', () => {
          console.log('POST Status:', res2.statusCode);
          console.log('POST Response length:', d2.length);
          console.log(d2.substring(0, 2000));
        });
      });
      req.write(postData);
      req.end();
    }
  });
});
