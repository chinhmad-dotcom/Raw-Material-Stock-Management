const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/auth/components/RegisterForm.tsx', 'utf8');
code = code.replace('>Full Name<', '>Họ Tên Đầy Đủ<');
code = code.replace('placeholder="Enter your full name"', 'placeholder="Nhập họ tên đầy đủ để in vào báo cáo"');
fs.writeFileSync('frontend/src/features/auth/components/RegisterForm.tsx', code);
console.log('RegisterForm updated');
