const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/FanPlanForm.tsx', 'utf8');

if (!code.includes('useAuthStore')) {
  code = code.replace(
    "import { Save, RefreshCw } from 'lucide-react';",
    "import { Save, RefreshCw } from 'lucide-react';\nimport { useAuthStore } from '../../features/auth/store/authStore';"
  );
  
  code = code.replace(
    "const [error, setError] = useState('');",
    "const [error, setError] = useState('');\n  const { user } = useAuthStore();"
  );

  code = code.replace(
    "note: formData.note",
    "note: formData.note,\n        status: 'pending',\n        reporterName: user?.name || null,\n        reporterSignature: user?.id ? localStorage.getItem('userSignature_' + user.id) : null"
  );

  fs.writeFileSync('frontend/src/components/fans/FanPlanForm.tsx', code);
  console.log('FanPlanForm updated');
}
