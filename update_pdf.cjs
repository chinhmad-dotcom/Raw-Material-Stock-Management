const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/fanPdfGenerator.ts', 'utf8');

const targetStr = `
  // Handle Signatures
  const { user } = useAuthStore.getState();
  const signature = localStorage.getItem('userSignature_' + user?.id);
  
  if (signature) {
    // Add image signature based on role
    const role = user?.role?.toLowerCase() || '';
    if (role === 'operator') {
      doc.addImage(signature, 'PNG', 145, finalY + 35, 30, 15);
      doc.setFont('times', 'normal');
      doc.text(user?.name || '', 160, finalY + 55, { align: 'center' });
    } else if (role === 'manager' || role === 'admin') {
      doc.addImage(signature, 'PNG', 225, finalY + 35, 30, 15);
      doc.setFont('times', 'normal');
      doc.text(user?.name || '', 240, finalY + 55, { align: 'center' });
    }
  }
`;

const replacementStr = `
  // Handle Signatures BOUND to the record
  const currentRecord = records.length > 0 ? records[0] : null;

  if (currentRecord?.reporterSignature) {
    try {
      doc.addImage(currentRecord.reporterSignature, 'PNG', 145, finalY + 35, 30, 15);
      doc.setFont('times', 'normal');
      doc.text(currentRecord.reporterName || '', 160, finalY + 55, { align: 'center' });
    } catch (e) {
      console.warn("Invalid reporter signature image");
    }
  }

  if (currentRecord?.reviewerSignature) {
    try {
      doc.addImage(currentRecord.reviewerSignature, 'PNG', 225, finalY + 35, 30, 15);
      doc.setFont('times', 'normal');
      doc.text(currentRecord.reviewerName || '', 240, finalY + 55, { align: 'center' });
    } catch (e) {
      console.warn("Invalid reviewer signature image");
    }
  }
`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('frontend/src/components/fans/fanPdfGenerator.ts', code);
console.log('PDF generator updated to use bound signatures');
