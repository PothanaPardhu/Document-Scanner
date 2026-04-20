import { jsPDF } from 'jspdf';

export function generateStyledPDF(notesData, mode = 'full') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let cursorY = 20;

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo-600
  const textColor = [31, 41, 55]; // Gray-800
  const lightBgColor = [243, 244, 246]; // Gray-100

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Focus-Flow Study Notes', margin, cursorY);
  
  cursorY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Mode: ${mode === 'full' ? 'Full Notes' : 'Quick Revision'}`, margin, cursorY);
  
  cursorY += 15;
  
  // Separator Line
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY - 5, pageWidth - margin, cursorY - 5);

  const writeText = (text, type = 'normal') => {
    // Basic page break logic
    if (cursorY > 270) {
      doc.addPage();
      cursorY = 20;
    }

    if (type === 'heading') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text(text, margin, cursorY);
      cursorY += 8;
    } else if (type === 'subheading') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.text(text, margin, cursorY);
      cursorY += 6;
    } else if (type === 'normal') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, cursorY);
      cursorY += (lines.length * 5) + 4;
    } else if (type === 'bullet') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      const lines = doc.splitTextToSize(`• ${text}`, pageWidth - margin * 2 - 5);
      doc.text(lines, margin + 5, cursorY);
      cursorY += (lines.length * 5) + 3;
    } else if (type === 'highlightBox') {
      doc.setFillColor(...lightBgColor);
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 10);
      const boxHeight = (lines.length * 5) + 10;
      
      // Check page break for box
      if (cursorY + boxHeight > 280) {
        doc.addPage();
        cursorY = 20;
      }
      
      doc.roundedRect(margin, cursorY, pageWidth - margin * 2, boxHeight, 3, 3, 'FD');
      doc.text(lines, margin + 5, cursorY + 7);
      cursorY += boxHeight + 8;
    }
  };

  if (!notesData) {
    writeText('No notes generated yet.', 'normal');
    doc.save(`FocusFlow_Notes.pdf`);
    return;
  }

  // Summary (Highlight Box)
  if (notesData.summary) {
    writeText('Executive Summary', 'heading');
    writeText(notesData.summary, 'highlightBox');
  }

  // Key Points
  if (notesData.key_points && notesData.key_points.length > 0) {
    writeText('Key Concepts', 'heading');
    notesData.key_points.forEach(kp => writeText(kp, 'bullet'));
    cursorY += 4;
  }

  // If Full Mode, include tasks and quiz
  if (mode === 'full') {
    if (notesData.tasks && notesData.tasks.length > 0) {
      writeText('Actionable Micro-Tasks', 'heading');
      notesData.tasks.forEach(t => {
        writeText(`[ ] ${t}`, 'normal');
      });
      cursorY += 4;
    }

    if (notesData.quiz && notesData.quiz.length > 0) {
      writeText('Self-Assessment Quiz', 'heading');
      notesData.quiz.forEach((q, idx) => {
        writeText(`Q${idx + 1}: ${q}`, 'subheading');
      });
    }
  }

  doc.save(`FocusFlow_${mode === 'full' ? 'StudyNotes' : 'QuickRevision'}.pdf`);
}
