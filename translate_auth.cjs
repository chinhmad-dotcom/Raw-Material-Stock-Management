const fs = require('fs');

function translateLoginForm() {
  let code = fs.readFileSync('frontend/src/features/auth/components/LoginForm.tsx', 'utf8');
  if (!code.includes('useTranslation')) {
    code = code.replace(
      "import { useNavigate } from 'react-router-dom';",
      "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
    );
    code = code.replace(
      "export function LoginForm() {",
      "export function LoginForm() {\n  const { t } = useTranslation();"
    );
    
    // Replace labels and placeholders
    code = code.replace(/>Email</g, ">{t('auth.emailLabel', 'Email')}<");
    code = code.replace(/placeholder="name@company.com"/g, "placeholder={t('auth.emailPlaceholder', 'name@company.com')}");
    code = code.replace(/>Password</g, ">{t('auth.passwordLabel', 'Password')}<");
    code = code.replace(/placeholder="••••••••"/g, "placeholder={t('auth.passwordPlaceholder', '••••••••')}");
    
    code = code.replace(/>Remember me</g, ">{t('auth.rememberMe', 'Remember me')}<");
    code = code.replace(/>Forgot password\?</g, ">{t('auth.forgotPassword', 'Forgot password?')}<");
    
    code = code.replace(/>AUTHENTICATING\.\.\.</g, ">{t('auth.loginLoading', 'AUTHENTICATING...')}<");
    code = code.replace(/>SIGN IN</g, ">{t('auth.loginButton', 'SIGN IN')}<");
    
    code = code.replace(/>Need an account\?</g, ">{t('auth.needAccount', 'Need an account?')}<");
    code = code.replace(/>Create an account</g, ">{t('auth.createAccount', 'Create an account')}<");

    fs.writeFileSync('frontend/src/features/auth/components/LoginForm.tsx', code);
    console.log('LoginForm translated');
  }
}

function translateRegisterForm() {
  let code = fs.readFileSync('frontend/src/features/auth/components/RegisterForm.tsx', 'utf8');
  if (!code.includes('useTranslation')) {
    code = code.replace(
      "import { useNavigate } from 'react-router-dom';",
      "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
    );
    code = code.replace(
      "export function RegisterForm() {",
      "export function RegisterForm() {\n  const { t } = useTranslation();"
    );
    
    code = code.replace(/>Họ Tên Đầy Đủ</g, ">{t('auth.fullNameLabel', 'Full Name')}<");
    code = code.replace(/placeholder="Nhập họ tên đầy đủ để in vào báo cáo"/g, "placeholder={t('auth.fullNamePlaceholder', 'Enter your full name')}");
    
    code = code.replace(/>Email</g, ">{t('auth.emailLabel', 'Email')}<");
    code = code.replace(/placeholder="Enter company email"/g, "placeholder={t('auth.emailPlaceholder', 'name@company.com')}");
    
    code = code.replace(/>Password</g, ">{t('auth.passwordLabel', 'Password')}<");
    code = code.replace(/placeholder="••••••••"/g, "placeholder={t('auth.passwordPlaceholder', '••••••••')}");
    
    code = code.replace(/>Confirm Password</g, ">{t('auth.confirmPasswordLabel', 'Confirm Password')}<");
    
    code = code.replace(/>REGISTERING\.\.\.</g, ">{t('auth.registerLoading', 'REGISTERING...')}<");
    code = code.replace(/>CREATE ACCOUNT</g, ">{t('auth.registerButton', 'CREATE ACCOUNT')}<");
    
    fs.writeFileSync('frontend/src/features/auth/components/RegisterForm.tsx', code);
    console.log('RegisterForm translated');
  }
}

translateLoginForm();
translateRegisterForm();
