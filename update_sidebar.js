const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');

c = c.replace(
  '          </nav>\n        </aside>\n      </div>\n    </div>',
  `          </nav>
          <div className="mt-auto mb-2 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold tracking-widest text-slate-800 dark:text-slate-400 uppercase">StockRM Web App</span>
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">{import.meta.env.VITE_APP_VERSION || 'v1.0.1'}</span>
          </div>
        </aside>
      </div>
    </div>`
);

fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', c);
console.log('Updated Sidebar.tsx');
