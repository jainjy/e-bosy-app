import jsPDF from 'jspdf';

const generateExercisePDF = (assessment, userProgress, courseTitle) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Couleurs et polices
  const primaryColor = '#6B46C1'; // e-bosy-purple
  const secondaryColor = '#4B5563'; // gray-600
  doc.setFont('helvetica', 'bold');
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text('EXERCICE', 105, 20, { align: 'center' });
  
  // Informations sur le cours
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor);
  doc.text(`Cours: ${courseTitle}`, 20, 30);
  
  // Titre de l'exercice
  doc.setFontSize(16);
  doc.setTextColor('#1F2937'); // gray-900
  doc.text(assessment.title, 20, 40);
  
  // Détails de l'exercice
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor);
  
  const detailsY = 50;
  doc.text(`Points totaux: ${assessment.totalScore}`, 20, detailsY);
  doc.text(`Limite de temps: ${assessment.timeLimit || 'Non limité'} minutes`, 70, detailsY);
  doc.text(`Nombre de questions: ${assessment.questions?.length || 0}`, 130, detailsY);
  
  // Instructions
  doc.setFontSize(12);
  doc.setTextColor('#1F2937');
  doc.text('Instructions : Répondez aux questions suivantes en cochant les bonnes réponses.', 20, 65);
  
  // Liste des questions (si disponibles)
  if (assessment.questions?.length > 0) {
    let currentY = 75;
    assessment.questions.forEach((question, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      // Question
      doc.setFontSize(12);
      doc.setTextColor('#1F2937');
      doc.text(`${index + 1}. ${question.questionText}`, 20, currentY);
      currentY += 10;
      
      // Réponses si disponibles
      if (question.answers?.length > 0) {
        // Espace pour cocher les réponses
        question.answers.forEach((answer, ansIndex) => {
          // Case à cocher
          doc.setDrawColor('#6B7280');
          doc.rect(25, currentY - 2, 5, 5, 'S');
          
          // Texte de la réponse
          doc.setFontSize(10);
          doc.setTextColor('#1F2937');
          doc.text(` ${String.fromCharCode(97 + ansIndex)}. ${answer.answerText}`, 35, currentY + 1);
          
          currentY += 7;
        });
      }
      
      // Espace pour la réponse si question ouverte
      if (question.questionType === 'open-ended') {
        doc.setDrawColor('#E5E7EB');
        doc.setLineWidth(0.5);
        doc.line(25, currentY, 180, currentY);
        doc.line(25, currentY + 5, 180, currentY + 5);
        doc.line(25, currentY + 10, 180, currentY + 10);
        currentY += 15;
      }
      
      currentY += 10;
    });
  }
  
  // Correction (si exercice complété)
  const submission = userProgress[assessment.assessmentId];
  if (submission) {
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text('CORRECTION', 105, 20, { align: 'center'});
    
    let currentY = 40;
    assessment.questions.forEach((question, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor('#1F2937');
      doc.text(`${index + 1}. ${question.questionText}`, 20, currentY);
      currentY += 7;
      
      if (question.answers?.length > 0) {
        question.answers.forEach((answer, ansIndex) => {
          // Cocher la bonne réponse
          if (answer.isCorrect) {
            doc.setFontSize(14);
            doc.setTextColor('#10B981'); // vert
            doc.text('✓', 27, currentY + 1);
          }
          
          doc.setFontSize(10);
          doc.setTextColor(answer.isCorrect ? '#10B981' : secondaryColor);
          doc.text(` ${String.fromCharCode(97 + ansIndex)}. ${answer.answerText}`, 35, currentY + 1);
          
          currentY += 6;
        });
      }
      
      currentY += 10;
    });
  }
  
  // Pied de page
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`ID de l'exercice: ${assessment.assessmentId}`, 20, 290);
  doc.text(`Généré le ${new Date().toLocaleDateString()}`, 180, 290, { align: 'right' });
  
  // Bordure
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);
  
  return doc;
};

export default generateExercisePDF;