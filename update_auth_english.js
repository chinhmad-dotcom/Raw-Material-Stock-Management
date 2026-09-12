const fs = require('fs');

// 1. LoginPage.tsx
let loginPage = fs.readFileSync('frontend/src/pages/LoginPage.tsx', 'utf8');
loginPage = loginPage.replace('Đăng nhập', 'Log In');
loginPage = loginPage.replace('Đăng ký', 'Register');
loginPage = loginPage.replace('Đăng nhập vào hệ thống quản lý kho', 'Log in to the warehouse management system');
loginPage = loginPage.replace('Đăng ký tài khoản mới để truy cập', 'Register a new account to access the system');
fs.writeFileSync('frontend/src/pages/LoginPage.tsx', loginPage);

// 2. LoginForm.tsx
let loginForm = fs.readFileSync('frontend/src/features/auth/components/LoginForm.tsx', 'utf8');
loginForm = loginForm.replace('Đăng nhập thất bại.', 'Login failed.');
loginForm = loginForm.replace('Lỗi kết nối máy chủ.', 'Server connection error.');
loginForm = loginForm.replace('Nhập email công ty', 'Enter company email');
loginForm = loginForm.replace('Ghi nhớ đăng nhập', 'Remember me');
loginForm = loginForm.replace('Quên mật khẩu?', 'Forgot password?');
loginForm = loginForm.replace('ĐANG ĐĂNG NHẬP...', 'LOGGING IN...');
loginForm = loginForm.replace('ĐĂNG NHẬP', 'LOG IN');
fs.writeFileSync('frontend/src/features/auth/components/LoginForm.tsx', loginForm);

// 3. RegisterForm.tsx
let registerForm = fs.readFileSync('frontend/src/features/auth/components/RegisterForm.tsx', 'utf8');
registerForm = registerForm.replace(
  `const [globalError, setGlobalError] = useState<string | null>(null);`,
  `const [globalError, setGlobalError] = useState<string | null>(null);\n  const [successMsg, setSuccessMsg] = useState<string | null>(null);`
);

registerForm = registerForm.replace(
  `setGlobalError(null);`,
  `setGlobalError(null);\n    setSuccessMsg(null);`
);

registerForm = registerForm.replace(
  `if (!response.ok) {
        throw new Error(result.error || 'Đăng ký thất bại.');
      }

      // Đăng ký thành công, tự động đăng nhập và lưu token
      login(result.token, result.user, false);
      navigate('/');`,
  `if (!response.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      setSuccessMsg(result.message || 'Registration successful. Account is pending admin approval.');`
);

registerForm = registerForm.replace('Lỗi kết nối máy chủ.', 'Server connection error.');
registerForm = registerForm.replace('Họ và Tên', 'Full Name');
registerForm = registerForm.replace('Nhập họ và tên', 'Enter your full name');
registerForm = registerForm.replace('Nhập email công ty', 'Enter company email');
registerForm = registerForm.replace('Mật khẩu', 'Password');
registerForm = registerForm.replace('Xác nhận mật khẩu', 'Confirm Password');
registerForm = registerForm.replace('ĐANG ĐĂNG KÝ...', 'REGISTERING...');
registerForm = registerForm.replace('TẠO TÀI KHOẢN', 'CREATE ACCOUNT');

registerForm = registerForm.replace(
  `{globalError && (`,
  `{successMsg && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}
      {globalError && (`
);

fs.writeFileSync('frontend/src/features/auth/components/RegisterForm.tsx', registerForm);

// 4. Update Schemas
let regSchema = fs.readFileSync('frontend/src/features/auth/schemas/registerSchema.ts', 'utf8');
regSchema = regSchema.replace('Tên phải có ít nhất 2 ký tự', 'Name must be at least 2 characters');
regSchema = regSchema.replace('Địa chỉ email không hợp lệ', 'Invalid email address');
regSchema = regSchema.replace('Mật khẩu phải có ít nhất 6 ký tự', 'Password must be at least 6 characters');
regSchema = regSchema.replace('Mật khẩu xác nhận không khớp', 'Passwords do not match');
fs.writeFileSync('frontend/src/features/auth/schemas/registerSchema.ts', regSchema);

console.log('Translated Auth pages to English and updated registration flow.');
