const fs = require('fs');

let dp = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');
if (!dp.includes('UserMenu')) {
  dp = dp.replace("import { SearchableSelect } from './SearchableSelect';", "import { SearchableSelect } from './SearchableSelect';\nimport { UserMenu } from '../layout/UserMenu';");
  dp = dp.replace('</header>', '  <UserMenu />\n        </header>');
  fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', dp, 'utf8');
}

let sk = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');
if (!sk.includes('UserMenu')) {
  sk = sk.replace("import { useAuthStore } from '../../features/auth/store/authStore';", "import { useAuthStore } from '../../features/auth/store/authStore';\nimport { UserMenu } from '../../components/layout/UserMenu';");
  sk = sk.replace('        </div>\n\n        \n      </div>', '        </div>\n        <UserMenu />\n      </div>');
  fs.writeFileSync('src/pages/stock/StockKho.tsx', sk, 'utf8');
}
