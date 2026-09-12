const fs = require('fs');

// Sidebar
let sidebar = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebar.includes("import { useTranslation }")) {
    sidebar = "import { useTranslation } from 'react-i18next';\n" + sidebar;
    fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', sidebar);
}

// LoginForm
let login = fs.readFileSync('frontend/src/features/auth/components/LoginForm.tsx', 'utf8');
if (!login.includes("const { t } = useTranslation();")) {
    login = login.replace(/export function LoginForm\([^)]*\) \{/, (match) => {
        return match + "\n  const { t } = useTranslation();";
    });
    fs.writeFileSync('frontend/src/features/auth/components/LoginForm.tsx', login);
}

// RegisterForm
let register = fs.readFileSync('frontend/src/features/auth/components/RegisterForm.tsx', 'utf8');
if (!register.includes("const { t } = useTranslation();")) {
    register = register.replace(/export function RegisterForm\([^)]*\) \{/, (match) => {
        return match + "\n  const { t } = useTranslation();";
    });
    fs.writeFileSync('frontend/src/features/auth/components/RegisterForm.tsx', register);
}

console.log('Fixed imports and hooks');
