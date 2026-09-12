const fs = require('fs');

['DataEntryForm.tsx', 'ReportingTab.tsx'].forEach(file => {
  const filePath = 'frontend/src/components/truck/' + file;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace colors that don't already have dark: counterparts right after them
  // We can just replace the class name entirely
  
  // Backgrounds
  content = content.replace(/\bbg-white\b/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-slate-50 dark:bg-slate-800/50');
  
  // Borders and dividers
  content = content.replace(/\bborder-slate-200\b/g, 'border-slate-200 dark:border-white/10');
  content = content.replace(/\bborder-slate-300\b/g, 'border-slate-300 dark:border-white/10');
  content = content.replace(/\bdivide-slate-200\b/g, 'divide-slate-200 dark:divide-slate-700/50');
  
  // Text colors
  content = content.replace(/\btext-slate-900\b/g, 'text-slate-900 dark:text-slate-50');
  content = content.replace(/\btext-slate-800\b/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/\btext-slate-700\b/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/\btext-slate-600\b/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/\btext-slate-500\b/g, 'text-slate-500 dark:text-slate-400');
  
  // Inputs: Add dark:bg-slate-950 where standard borders are used
  // Just find common input classes
  content = content.replace(/\bfocus:ring-blue-500\b/g, 'focus:ring-blue-500 dark:bg-slate-950');

  // Remove duplicates if the regex ran into an already dark: modified class? 
  // Actually, \bbg-white\b doesn't match dark:bg-white. Wait, it DOES! \b matches the boundary between : and b.
  // So dark:bg-white -> dark:bg-white dark:bg-slate-900. But there is no dark:bg-white.
  
  // Clean up any double dark: additions in case they existed
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
  content = content.replace(/dark:bg-slate-950 dark:bg-slate-950/g, 'dark:bg-slate-950');

  fs.writeFileSync(filePath, content);
  console.log('Fixed ' + file);
});
