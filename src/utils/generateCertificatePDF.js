import jsPDF from 'jspdf';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5173';

const generateCertificatePDF = (certificate, courseId, qrCodeDataUrl) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Colors and fonts
  const primaryColor = '#6B46C1'; // e-bosy-purple
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);

  // Title
  doc.setTextColor(primaryColor);
  doc.text('CERTIFICAT DE RÉUSSITE', 148.5, 30, { align: 'center' });

  // Recipient
  doc.setFontSize(16);
  doc.setTextColor('#374151'); // Gray-700
  doc.text('DÉCERNÉ À', 148.5, 50, { align: 'center' });
  doc.setFontSize(36);
  doc.setTextColor('#1F2937'); // Gray-900
  doc.text(certificate.studentName, 148.5, 70, { align: 'center' });

  // Course
  doc.setFontSize(16);
  doc.setTextColor('#374151');
  doc.text('POUR AVOIR TERMINÉ AVEC SUCCÈS LE COURS', 148.5, 90, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor('#1F2937');
  doc.text(`"${certificate.courseTitle}"`, 148.5, 110, { align: 'center' });

  // Details
  doc.setFontSize(12);
  doc.setTextColor('#4B5563'); // Gray-600
  doc.text(`Date de Délivrance: ${certificate.issueDate}`, 40, 140);
  doc.text(`Date d'Achèvement: ${certificate.completionDate}`, 40, 150);
  doc.text(`Durée du Cours: ${certificate.duration}`, 40, 160);
  doc.text(`Instructeur: ${certificate.instructor}`, 40, 170);
  if (certificate.grade) {
    doc.text(`Note Obtenue: ${certificate.grade}`, 40, 180);
  }

  // Verification Section
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('Vérifiez l’authenticité', 220, 130, { align: 'right' });
  doc.setFontSize(16);
  doc.setTextColor('#1F2937');
  doc.text(certificate.verificationCode, 220, 140, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor('#6B7280'); // Gray-500
  doc.text(`Visitez ${BASE_URL.replace('http://', '').replace('https://', '')}/verify pour vérifier`, 220, 150, { align: 'right' });

  // Add QR Code
  if (qrCodeDataUrl) {
    try {
      doc.addImage(qrCodeDataUrl, 'PNG', 190, 155, 30, 30); // 30mm x 30mm QR code
      doc.setFontSize(10);
      doc.setTextColor('#6B7280');
      doc.text('Scannez pour vérifier', 205, 190, { align: 'center' });
    } catch (err) {
      console.error('Erreur lors de l’ajout du QR code au PDF:', err);
    }
  }

  // Border
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  // Save PDF
  const filename = `certificate-${certificate.verificationCode}-${courseId}.pdf`;
  doc.save(filename);
};

export default generateCertificatePDF;