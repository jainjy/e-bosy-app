import jsPDF from 'jspdf';

const generateInvoicePDF = (payment) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Couleurs et polices
  const primaryColor = '#6B46C1'; // e-bosy-purple
  doc.setFont('helvetica', 'bold');

  // En-tête
  doc.setTextColor(primaryColor);
  doc.setFontSize(24);
  doc.text('FACTURE', 105, 30, { align: 'center' });

  // Informations de l'entreprise
  doc.setFontSize(14);
  doc.text('e-BoSy', 20, 50);
  doc.setFontSize(12);
  doc.text('110 Antsirabe, Madagascar', 20, 57);

  // Informations du client
  doc.setFontSize(12);
  doc.text(`Facturé à:`, 20, 75);
  doc.text(`N° Facture: ${payment.paymentId}`, 150, 75, { align: 'right' });
  doc.text(`${payment.user.firstName} ${payment.user.lastName}`, 20, 82);
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 150, 82, { align: 'right' });

  // Détails du paiement
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 100, 170, 10, 'F');
  doc.setTextColor(0);
  doc.text('Description', 25, 107);
  doc.text('Quantité', 100, 107);
  doc.text('Montant', 150, 107);

  doc.text('Abonnement Premium', 25, 120);
  doc.text('1', 100, 120);
  doc.text(`${payment.amount.toLocaleString()} ${payment.currency}`, 150, 120);

  // Total
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${payment.amount.toLocaleString()} ${payment.currency}`, 150, 140, { align: 'right' });

  // Pied de page
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text('Merci de votre confiance !', 105, 270, { align: 'center' });

  // Bordure
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  return doc;
};

export default generateInvoicePDF;
