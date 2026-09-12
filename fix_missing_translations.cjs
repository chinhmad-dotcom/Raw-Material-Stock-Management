const fs = require('fs');

// UserMenu.tsx
let fUserMenu = 'frontend/src/components/layout/UserMenu.tsx';
let cUserMenu = fs.readFileSync(fUserMenu, 'utf8');
cUserMenu = cUserMenu.replace(/>Theme</, ">{t('usermenu.theme', 'Theme')}<");
// We previously messed up the Settings/Logout, let's inject it cleanly using regex.
// Find the Link for settings:
cUserMenu = cUserMenu.replace(/<Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" \/> Settings/, "<Settings className=\"h-4 w-4 text-slate-500 dark:text-slate-400\" /> {t('sidebar.settings', 'Settings')}");
cUserMenu = cUserMenu.replace(/<LogOut className="h-4 w-4" \/> Logout/, "<LogOut className=\"h-4 w-4\" /> {t('sidebar.logout', 'Logout')}");
fs.writeFileSync(fUserMenu, cUserMenu);

// Sidebar.tsx
let fSidebar = 'frontend/src/components/layout/Sidebar.tsx';
let cSidebar = fs.readFileSync(fSidebar, 'utf8');
cSidebar = cSidebar.replace(/>Menu</, ">{t('sidebar.menu', 'Menu')}<");
cSidebar = cSidebar.replace(/name: 'Stock Kho'/g, "name: t('sidebar.stockKho', 'Stock Kho')");
cSidebar = cSidebar.replace(/name: 'Stock Silo'/g, "name: t('sidebar.stockSilo', 'Stock Silo')");
cSidebar = cSidebar.replace(/name: 'Extruder'/g, "name: t('sidebar.extruder', 'Extruder')");
fs.writeFileSync(fSidebar, cSidebar);

// LoginForm.tsx
let fLoginForm = 'frontend/src/features/auth/components/LoginForm.tsx';
let cLoginForm = fs.readFileSync(fLoginForm, 'utf8');
cLoginForm = cLoginForm.replace(/>\s*Forgot password\?\s*</, ">{t('auth.forgotPassword', 'Forgot password?')}<");
cLoginForm = cLoginForm.replace(/\{isLoading \? 'LOGGING IN\.\.\.' : 'LOG IN'\}/, "{isLoading ? t('auth.loginLoading', 'LOGGING IN...') : t('auth.loginButton', 'LOG IN')}");
fs.writeFileSync(fLoginForm, cLoginForm);

// RegisterForm.tsx
let fRegisterForm = 'frontend/src/features/auth/components/RegisterForm.tsx';
let cRegisterForm = fs.readFileSync(fRegisterForm, 'utf8');
cRegisterForm = cRegisterForm.replace(/\{isLoading \? 'REGISTERING\.\.\.' : 'CREATE ACCOUNT'\}/, "{isLoading ? t('auth.registerLoading', 'REGISTERING...') : t('auth.registerButton', 'CREATE ACCOUNT')}");
fs.writeFileSync(fRegisterForm, cRegisterForm);

// LoginPage.tsx
let fLoginPage = 'frontend/src/pages/LoginPage.tsx';
let cLoginPage = fs.readFileSync(fLoginPage, 'utf8');
cLoginPage = cLoginPage.replace(/>Industrial Dashboard</, ">{t('auth.industrialDashboard', 'Industrial Dashboard')}<");
cLoginPage = cLoginPage.replace(/>Log In</g, ">{t('auth.loginTab', 'Log In')}<");
cLoginPage = cLoginPage.replace(/>Register</g, ">{t('auth.registerTab', 'Register')}<");
fs.writeFileSync(fLoginPage, cLoginPage);

console.log('Fixed missing translations');
