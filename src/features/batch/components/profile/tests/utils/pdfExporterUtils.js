/**
 * @file pdfExporterUtils.js
 * @module PDFExporterUtils
 * @description Generates and downloads branded PDF report documents for the Consolidated Batch Marksheet using jsPDF and jspdf-autotable,
 * supporting device-aware strategies for mobile native sharing and desktop WhatsApp Web integration.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Detects if the current user agent/viewport is a mobile device (phone / tablet).
 * @returns {boolean} True if mobile device.
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(userAgent) || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

/**
 * Generates a jsPDF instance and returns a JavaScript File object containing the PDF binary payload.
 * 
 * @param {Object} batch - Batch entity record.
 * @param {Object} matrixData - Calculated matrix payload from calculateConsolidatedBatchMarksheet.
 * @returns {File} Instantiated File object containing PDF binary data with explicit metadata.
 */
export function generateConsolidatedMarksheetFile(batch = {}, matrixData = {}) {
  const { studentRows = [], testColumns = [], batchKPIs = {} } = matrixData;
  const batchName = batch?.batch_name || batch?.name || 'Batch';

  // Instantiate jsPDF in Landscape orientation for wide matrix layout
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // 1. Header Banner & Title
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('DAZZLING ACADEMY — CONSOLIDATED MARKSHEET REPORT', 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `Batch: ${batchName}  |  Total Tests: ${batchKPIs.totalTestsConducted || 0}  |  Class Avg: ${batchKPIs.overallClassAvg || 0}%  |  Batch Topper: ${batchKPIs.batchTopperName || '-'} (${batchKPIs.batchTopperScore || '0%'})`,
    14,
    22
  );

  // 2. Table Column Headers
  const tableHeaders = [
    ['#', 'Student Name', ...testColumns.map(t => `${t.title}\n(Max: ${t.totalMarks})`), 'Total Scored', 'Overall %', 'Rank']
  ];

  // 3. Table Rows Data
  const tableRows = studentRows.map(s => {
    const perTestScores = testColumns.map(t => {
      const scoreObj = s.testScores[t.id];
      if (!scoreObj || scoreObj.status === 'NOT_EVALUATED') return '-';
      if (scoreObj.isAbsent) return 'ABS';
      return String(scoreObj.score);
    });

    return [
      s.batchRank,
      s.studentName,
      ...perTestScores,
      `${s.totalObtained}/${s.totalMaxPossible}`,
      `${s.cumulativePercentage}%`,
      `#${s.batchRank}`
    ];
  });

  // 4. Render Table via jspdf-autotable
  autoTable(doc, {
    startY: 26,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 42, halign: 'left', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // 5. Output Blob & create File with explicit metadata for Android/iOS share intent validation
  const pdfBlob = doc.output('blob');
  const fileName = `${batchName.replace(/\s+/g, '_')}_Consolidated_Marksheet.pdf`;
  return new File([pdfBlob], fileName, {
    type: 'application/pdf',
    lastModified: Date.now()
  });
}

/**
 * Direct file download helper for PDF report.
 * 
 * @param {Object} batch - Batch entity record.
 * @param {Object} matrixData - Calculated matrix payload.
 */
export function exportConsolidatedMarksheetPDF(batch = {}, matrixData = {}) {
  const file = generateConsolidatedMarksheetFile(batch, matrixData);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Shares the generated consolidated marksheet PDF using W3C-compliant Web Share API:
 * - Synchronous User Gesture Preservation: Executes navigator.share within the active user click stack.
 * - Secure Context Verification: Verifies window.isSecureContext before attempting native share.
 * - Desktop/Browser Fallback: Executes download + WhatsApp Web navigation when non-HTTPS or unsupported.
 * 
 * @param {Object} batch - Batch entity record.
 * @param {Object} matrixData - Calculated matrix payload.
 * @param {Function} notify - Callback function `(config) => void` to trigger FlashAlert toasts.
 * @returns {void}
 */
export function shareConsolidatedMarksheetPDFToWhatsApp(batch = {}, matrixData = {}, notify) {
  // 1. Generate PDF file synchronously within active user click gesture stack
  const pdfFile = generateConsolidatedMarksheetFile(batch, matrixData);
  const batchName = batch?.batch_name || batch?.name || 'Batch';

  // Desktop / Non-HTTPS Fallback Runner
  const runFallbackStrategy = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfFile);
    link.download = pdfFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const isMobile = isMobileDevice();
    const targetUrl = isMobile
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`📄 *Consolidated Marksheet PDF Report*\nBatch: ${batchName}\n\nPDF report saved to device downloads. Select file to attach in chat.`)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(`📄 *Consolidated Marksheet PDF Report*\nBatch: ${batchName}\n\nI have saved the PDF report to my downloads folder. Attaching document now...`)}`;

    if (isMobile) {
      window.location.href = targetUrl;
    } else {
      window.open(targetUrl, '_blank');
    }

    if (notify) {
      notify({
        isOpen: true,
        variant: 'info',
        title: 'PDF Downloaded & WhatsApp Opened',
        description: 'WhatsApp web links cannot auto-attach local files. PDF saved to Downloads folder — click 📎 Attachment in WhatsApp to send!',
        autoDismissMs: 7000
      });
    }
  };

  // 2. Check W3C Web Share API Capability & Secure Context
  const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const canShareFiles = isSecure && Boolean(navigator.canShare) && navigator.canShare({ files: [pdfFile] });

  if (canShareFiles) {
    // 3. Execute W3C Web Share method with title, text, and files
    navigator.share({
      title: `${batchName} Consolidated Marksheet`,
      text: `Attached is the consolidated test marksheet PDF report for ${batchName}.`,
      files: [pdfFile]
    }).then(() => {
      if (notify) {
        notify({
          isOpen: true,
          variant: 'success',
          title: 'PDF Shared Successfully',
          description: 'Consolidated marksheet PDF sent directly to WhatsApp.',
          autoDismissMs: 3500
        });
      }
    }).catch((err) => {
      if (err.name === 'AbortError') return; // User explicitly cancelled OS share dialog
      console.warn('[pdfExporterUtils] Native Web Share failed, running fallback strategy:', err);
      runFallbackStrategy();
    });
  } else {
    // Fallback for Non-HTTPS or Unsupported Desktop Browsers
    runFallbackStrategy();
  }
}
