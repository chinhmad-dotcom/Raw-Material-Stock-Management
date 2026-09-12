const fs = require('fs');

// LoginPage.tsx
let fLoginPage = 'frontend/src/pages/LoginPage.tsx';
let cLoginPage = fs.readFileSync(fLoginPage, 'utf8');
cLoginPage = cLoginPage.replace(/>\s*Industrial Dashboard\s*</g, ">{t('auth.industrialDashboard', 'Industrial Dashboard')}<");
cLoginPage = cLoginPage.replace(/>\s*Log In\s*</g, ">{t('auth.loginTab', 'Log In')}<");
cLoginPage = cLoginPage.replace(/>\s*Register\s*</g, ">{t('auth.registerTab', 'Register')}<");
fs.writeFileSync(fLoginPage, cLoginPage);

// LoginForm.tsx missing needAccount and createAccount
let fLoginForm = 'frontend/src/features/auth/components/LoginForm.tsx';
let cLoginForm = fs.readFileSync(fLoginForm, 'utf8');
cLoginForm = cLoginForm.replace(/>\s*Need an account\?\s*</g, ">{t('auth.needAccount', 'Need an account?')}<");
cLoginForm = cLoginForm.replace(/>\s*Create an account\s*</g, ">{t('auth.createAccount', 'Create an account')}<");
fs.writeFileSync(fLoginForm, cLoginForm);

// RegisterForm.tsx missing alreadyHaveAccount and backToLogin
let fRegisterForm = 'frontend/src/features/auth/components/RegisterForm.tsx';
let cRegisterForm = fs.readFileSync(fRegisterForm, 'utf8');
cRegisterForm = cRegisterForm.replace(/>\s*Already have an account\?\s*</g, ">{t('auth.alreadyHaveAccount', 'Already have an account?')}<");
cRegisterForm = cRegisterForm.replace(/>\s*Back to Login\s*</g, ">{t('auth.backToLogin', 'Back to Login')}<");
fs.writeFileSync(fRegisterForm, cRegisterForm);

// Sidebar.tsx
let fSidebar = 'frontend/src/components/layout/Sidebar.tsx';
let cSidebar = fs.readFileSync(fSidebar, 'utf8');
cSidebar = cSidebar.replace(/>\s*Menu\s*</g, ">{t('sidebar.menu', 'Menu')}<");
fs.writeFileSync(fSidebar, cSidebar);

console.log('Fixed whitespace-padded translations');
