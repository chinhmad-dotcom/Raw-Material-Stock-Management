import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FanRecord } from '../../api/fanApi';
import { timesBase64 } from './timesFont';
import { useAuthStore } from '../../features/auth/store/authStore';

// Helper to format date
const formatDate = (isoString?: string | null) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.getDate() + '/' + (d.getMonth() + 1);
};

// Helper to format time
const formatTime = (isoString?: string | null) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return h + ':' + m;
};

export const generateFanPdf = (siloName: string, records: FanRecord[], currentUser?: any, currentUserSignature?: string | null) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Load Custom Font
  doc.addFileToVFS('times.ttf', timesBase64);
  doc.addFont('times.ttf', 'times', 'normal');
  doc.addFont('times.ttf', 'times', 'bold');
  doc.setFont('times', 'normal');
  
  // Title Header
  doc.setFontSize(13);
  doc.text('CÔNG TY CỔ PHẦN CHĂN NUÔI C.P VIỆT NAM', 10, 10);
  doc.text('NHÀ MÁY BÌNH DƯƠNG', 10, 16);
  doc.text('BỘ PHẬN / PHÒNG: KHO NGUYÊN LIỆU', 10, 22);
  
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('KẾ HOẠCH MỞ QUẠT THÔNG GIÓ', 148, 16, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setFont('times', 'normal');
  doc.text('Tên bồn: ...' + siloName + '...', 10, 30);
  
  const year = records.length > 0 && records[0].planStart ? new Date(records[0].planStart).getFullYear() : new Date().getFullYear();
  doc.text('Năm ...' + year + '...', 280, 30, { align: 'right' });

  // Table Body Data
  const bodyData = records.map((r, i) => [
    (i + 1).toString().padStart(2, '0'),
    r.reason,
    r.volumeTons,
    r.totalHoursRegulated,
    // Ke hoach mo
    formatTime(r.planStart),
    formatDate(r.planStart),
    // Ke hoach tat
    formatTime(r.planEnd),
    formatDate(r.planEnd),
    r.planTotalHours,
    // Thuc te mo
    formatTime(r.actualStart),
    formatDate(r.actualStart),
    // Thuc te tat
    formatTime(r.actualEnd),
    formatDate(r.actualEnd),
    r.actualTotalHours || '',
    // Nhan vien
    r.staffOpen || '',
    r.staffClose || '',
    // Kiem tra
    r.inspectorSilo || '',
    r.inspectorLab || '',
    r.note || ''
  ]);

  // Fill up to 12 rows minimum to save space at the bottom
  while (bodyData.length < 12) {
    bodyData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  // Draw Table
  autoTable(doc, {
    startY: 34,
    theme: 'grid',
    styles: { font: 'times', fontSize: 10 },
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: 0, 
      lineColor: 0, 
      lineWidth: 0.1, 
      halign: 'center', 
      valign: 'middle',
      fontSize: 11,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      textColor: 0, 
      lineColor: 0, 
      lineWidth: 0.1, 
      halign: 'center', 
      valign: 'middle',
      fontSize: 10
    },
    head: [
      [
        { content: 'STT', rowSpan: 2 },
        { content: 'Lý do mở\nquạt', rowSpan: 2 },
        { content: 'Số\nlượng\n(tấn)', rowSpan: 2 },
        { content: 'Tổng\ngiờ qui\nđịnh', rowSpan: 2 },
        { content: 'Thời gian ước tính mở quạt', colSpan: 5 },
        { content: 'Thời gian thực tế mở quạt', colSpan: 5 },
        { content: 'Nhân viên Silo', colSpan: 2 },
        { content: 'Người kiểm tra', colSpan: 2 },
        { content: 'Ghi Chú', rowSpan: 2 }
      ],
      [
        'Thời\ngian', 'Ngày', 'Thời\ngian', 'Ngày', 'Tổng\ngiờ',
        'Thời\ngian', 'Ngày', 'Thời\ngian', 'Ngày', 'Tổng\ngiờ',
        'Mở', 'Tắt', 'Silo', 'Lab'
      ]
    ],
    body: bodyData,
    margin: { top: 34, right: 10, left: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Notes
  doc.setFontSize(13);
  doc.text('1/ Mở quạt thông gió khi có hot spot', 60, finalY + 5);
  doc.text('2/ Mở quạt thông gió định kỳ mỗi tháng một lần', 60, finalY + 10);
  doc.text('3/ Mở quạt thông gió khi nhập mới nguyên liệu', 60, finalY + 15);
  doc.text('4/ Thời gian tắt quạt vào lúc 8h sáng', 60, finalY + 20);
  doc.text('5/ Tắt quạt khi trời mưa kéo dài hơn 4 giờ', 60, finalY + 25);
  
  doc.text('QT-NL-01/BM14', 10, finalY + 20);
  doc.text('Lần ban hành: ...03...', 10, finalY + 25);
  doc.text('Ngày hiệu lực: 05/04/2025', 10, finalY + 30);
  
  doc.setFont('times', 'bold');
  doc.text('Người báo cáo:', 150, finalY + 5);
  doc.text('Người thẩm tra:', 230, finalY + 5);

  // Handle Signatures BOUND to the record
  const currentRecord = records.length > 0 ? records[0] : null;

  // Determine Reporter Signature & Name
  let repName = currentRecord?.reporterName || '';
  let repSig = currentRecord?.reporterSignature || null;

  // If missing and current user is operator, use current user
  if (!repSig && currentUser?.role?.toLowerCase() === 'operator' && currentUserSignature) {
    repSig = currentUserSignature;
    repName = currentUser.name || repName;
  }

  if (repName) {
    doc.setFont('times', 'normal');
    doc.text(repName, 160, finalY + 30, { align: 'center' });
  }
  if (repSig) {
    try {
      doc.addImage(repSig, 'PNG', 145, finalY + 10, 30, 15);
    } catch (e) {
      console.warn("Invalid reporter signature image");
    }
  }

  // Determine Reviewer Signature & Name
  let revName = currentRecord?.reviewerName || '';
  let revSig = currentRecord?.reviewerSignature || null;

  if (revName) {
    doc.setFont('times', 'normal');
    doc.text(revName, 240, finalY + 30, { align: 'center' });
  }
  if (revSig) {
    try {
      doc.addImage(revSig, 'PNG', 225, finalY + 10, 30, 15);
    } catch (e) {
      console.warn("Invalid reviewer signature image");
    }
  }

  return doc;
};
