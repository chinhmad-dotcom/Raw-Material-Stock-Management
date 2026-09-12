const fs = require('fs');

const viPath = 'frontend/src/i18n/locales/vi.json';
const enPath = 'frontend/src/i18n/locales/en.json';

let vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Provide proper English translations for the Vietnamese keys and proper VI translations for EN keys
const dictionary = {
  t1: { vi: 'Hồ sơ cá nhân', en: 'My Profile' },
  t2: { vi: 'Tên hiển thị', en: 'Display Name' },
  t3: { vi: 'Vai trò', en: 'Role' },
  t4: { vi: 'Chữ ký điện tử', en: 'Digital Signature' },
  t5: { vi: 'Chữ ký này sẽ được tự động điền vào các file báo cáo PDF (ví dụ: Kế hoạch mở quạt). Dùng nền trong suốt (PNG) để có kết quả tốt nhất.', en: 'This signature will be auto-filled in PDF reports (e.g. Fan Plans). Use transparent PNG for best results.' },
  t6: { vi: 'Đã lưu chữ ký', en: 'Signature saved' },
  t7: { vi: 'Chưa có chữ ký', en: 'No signature yet' },
  t10: { vi: 'Quản lý Người dùng', en: 'User Management' },
  t11: { vi: 'Thêm Người dùng', en: 'Add User' },
  t12: { vi: 'Họ Tên Đầy Đủ', en: 'Full Name' },
  t13: { vi: 'Email', en: 'Email' },
  t14: { vi: 'Vai trò', en: 'Role' },
  t15: { vi: 'Trạng thái', en: 'Status' },
  t16: { vi: 'Hành động', en: 'Actions' },
  t17: { vi: 'Yêu cầu Reset', en: 'Reset Requested' },
  t18: { vi: 'Tên', en: 'Name' },
  t19: { vi: 'Admin', en: 'Admin' },
  t20: { vi: 'Quản lý', en: 'Manager' },
  t21: { vi: 'Vận hành', en: 'Operator' },
  t22: { vi: 'Hoạt động', en: 'Active' },
  t23: { vi: 'Chờ duyệt', en: 'Pending' },
  t24: { vi: 'Ngừng H.Động', en: 'Inactive' },
  t25: { vi: 'Hủy', en: 'Cancel' },
  t26: { vi: 'Lưu', en: 'Save' },
  t28: { vi: 'Vị trí', en: 'Loc' },
  t29: { vi: 'Nguyên liệu', en: 'Material' },
  t30: { vi: 'Tối đa (T)', en: 'Max (T)' },
  t31: { vi: 'Màu', en: 'Color' },
  t32: { vi: 'Thao tác', en: 'Act' },
  t33: { vi: 'Nguyên liệu hiện tại:', en: 'Current material:' },
  t34: { vi: 'Sức chứa Tối đa (Tấn)', en: 'Max Capacity (Tons)' },
  t35: { vi: 'Màu Silo', en: 'Silo Color' },
  t36: { vi: 'Chọn Mã Màu Hex', en: 'Choose Hex Color' },
  t37: { vi: 'Lưu Cấu Hình', en: 'Save Config' },
  t39: { vi: 'Nguyên liệu & Quy tắc', en: 'Raw Materials & Rules' },
  t40: { vi: 'Thêm Nguyên liệu', en: 'Add Material' },
  t41: { vi: 'SKU', en: 'SKU' },
  t42: { vi: 'Tên Nguyên liệu', en: 'Material Name' },
  t43: { vi: 'ĐVT', en: 'Unit' },
  t44: { vi: 'Tỷ trọng (t/m³)', en: 'Density (t/m³)' },
  t45: { vi: 'Ngày tuổi tiêu chuẩn', en: 'Standard Age (Days)' },
  t46: { vi: 'DOH cảnh báo', en: 'Alert DOH' },
  t47: { vi: 'Mã SKU', en: 'SKU Code' },
  t48: { vi: 'Màu (Hiển thị trên Silo)', en: 'Color (Silo Display)' },
  t49: { vi: 'Tuổi Lưu Kho Tối Đa (Ngày)', en: 'Max Storage Age (Days)' },
  t50: { vi: 'DOH Tối thiểu (Ngày)', en: 'Min DOH (Days)' },
  t51: { vi: 'Tìm nguyên liệu...', en: 'Search materials...' },
  t52: { vi: 'NHẬT KÝ HỆ THỐNG & MAIL', en: 'SYSTEM AUDIT & MAIL LOGS' },
  t53: { vi: 'Theo dõi trực tiếp', en: 'Live Stream' },
  t54: { vi: '_đang đợi tín hiệu...', en: '_waiting for incoming signals...' },
  t55: { vi: 'Kế Hoạch Mở Quạt', en: 'Fan Operation Plan' },
  t56: { vi: 'Silo', en: 'Silo' },
  t57: { vi: 'Lý do', en: 'Reason' },
  t58: { vi: 'Tấn', en: 'Tons' },
  t59: { vi: 'Giờ Quy Định', en: 'Required Hours' },
  t60: { vi: 'Mở (K.Hoạch)', en: 'Start (Plan)' },
  t61: { vi: 'Tắt (K.Hoạch 8h)', en: 'End (Plan 8h)' },
  t62: { vi: 'T.Tế Mở', en: 'Actual Start' },
  t63: { vi: 'T.Tế Tắt', en: 'Actual End' },
  t64: { vi: 'T.Gian Thực(h)', en: 'Actual Hrs' },
  t65: { vi: 'NV Mở', en: 'Started By' },
  t66: { vi: 'NV Tắt', en: 'Ended By' },
  t67: { vi: 'KT Silo', en: 'Silo QC' },
  t68: 'KT Lab',
  t69: { vi: 'Ghi chú', en: 'Notes' },
  t71: { vi: 'Danh sách & Báo cáo', en: 'List & Reports' },
  t72: { vi: 'Xem Trước', en: 'Preview' },
  t73: { vi: 'Tải PDF', en: 'Download PDF' },
  t74: { vi: 'H (QĐ)', en: 'H (Req)' },
  t75: { vi: 'Kế Hoạch', en: 'Plan' },
  t76: { vi: 'Thực Tế', en: 'Actual' },
  t77: { vi: 'TT', en: 'ST' },
  t78: { vi: 'T.Tác', en: 'Act' },
  t79: { vi: 'Mở', en: 'On' },
  t80: { vi: 'Tắt', en: 'Off' },
  t81: { vi: 'H', en: 'H' },
  t82: { vi: 'Đang tải...', en: 'Loading...' },
  t84: { vi: 'Chưa có dữ liệu cho năm và bồn này', en: 'No data for this year and silo' },
  t85: { vi: 'Đã duyệt', en: 'Approved' },
  t86: { vi: 'Chờ duyệt', en: 'Pending' },
  t87: { vi: 'Tải xuống', en: 'Download' }
};

for (const key of Object.keys(dictionary)) {
  const val = dictionary[key];
  if (typeof val === 'string') {
     vi.auto[key] = val;
     en.auto[key] = val;
  } else {
     vi.auto[key] = val.vi;
     en.auto[key] = val.en;
  }
}

// Clean up junk keys
['t0', 't8', 't9', 't27', 't38', 't70', 't83'].forEach(k => {
  delete vi.auto[k];
  delete en.auto[k];
});

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

console.log('Fixed auto translations');
