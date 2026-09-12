const fs = require('fs');
['DataEntryForm.tsx', 'ReportingTab.tsx'].forEach(f => {
  const content = fs.readFileSync('frontend/src/components/truck/' + f, 'utf8');
  console.log('--- ' + f + ' ---');
  console.log(content.match(/className="[^"]*bg-white[^"]*"/g));
  console.log(content.match(/className="[^"]*text-slate-[789]00[^"]*"/g)?.slice(0,5));
});
