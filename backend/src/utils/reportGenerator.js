const PDFDocument = require('pdfkit');
const axios = require('axios');

const PAGE = { left: 50, right: 545, bottom: 735 };

function formatLabel(field = '') {
  const result = String(field).replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function formatDate(date) {
  return date ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available';
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (Array.isArray(value)) return value.join(', ') || 'Not available';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function addFooter(doc) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i += 1) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#64748B').text(
      `LegalMetrix AI | Inspection report | Page ${i + 1} of ${pages.count}`,
      PAGE.left,
      770,
      { width: PAGE.right - PAGE.left, align: 'center' }
    );
  }
}

function ensureSpace(doc, height = 45) {
  if (doc.y + height > PAGE.bottom) doc.addPage();
}

function sectionTitle(doc, title) {
  ensureSpace(doc, 38);
  doc.moveDown(0.5).fontSize(13).fillColor('#162447').font('Helvetica-Bold').text(title);
  doc.moveDown(0.25).strokeColor('#CBD5E1').lineWidth(0.7)
    .moveTo(PAGE.left, doc.y).lineTo(PAGE.right, doc.y).stroke().moveDown(0.45);
}

function labelValue(doc, label, value, options = {}) {
  ensureSpace(doc, options.height || 36);
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text(`${label}:`, { continued: true });
  doc.font('Helvetica').fillColor('#1E293B').text(` ${displayValue(value)}`, { width: PAGE.right - PAGE.left });
  doc.moveDown(0.28);
}

async function fetchReportImage(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
    const contentType = response.headers['content-type'] || '';
    return /image\/(jpeg|jpg|png)/i.test(contentType) ? Buffer.from(response.data) : null;
  } catch {
    return null;
  }
}

async function generateInspectionPDF(inspection, res) {
  const doc = new PDFDocument({ margin: 50, bufferPages: true, size: 'A4' });
  const status = inspection.status || 'review';
  const statusText = { pass: 'COMPLIANT', fail: 'NON-COMPLIANT', review: 'NEEDS REVIEW' }[status] || status.toUpperCase();
  const statusColor = status === 'pass' ? '#0F766E' : status === 'fail' ? '#B91C1C' : '#B45309';
  const submission = inspection.submission || {};
  const fields = inspection.extractedData || {};

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=inspection-${inspection._id}.pdf`);
  doc.pipe(res);

  // Report header and audit summary
  doc.font('Helvetica-Bold').fontSize(21).fillColor('#162447').text('LegalMetrix AI');
  doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Legal Metrology Inspection Report');
  doc.moveDown(0.7).strokeColor('#0F766E').lineWidth(2).moveTo(PAGE.left, doc.y).lineTo(PAGE.right, doc.y).stroke();
  doc.moveDown(0.65);
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#162447').text(inspection.productName || 'Inspection Record');
  doc.fontSize(11).fillColor(statusColor).text(`${statusText}  |  Compliance score: ${inspection.complianceScore ?? 0}%`);
  doc.moveDown(0.55);
  labelValue(doc, 'Audit ID', inspection._id);
  labelValue(doc, 'Inspection date', formatDate(inspection.createdAt));
  labelValue(doc, 'Officer', inspection.officer?.name || 'Not available');
  labelValue(doc, 'Officer email', inspection.officer?.email || 'Not available');
  labelValue(doc, 'Case number', submission.caseNumber);

  // Submission and review status
  sectionTitle(doc, 'Submission & Review');
  const submissionLabels = { draft: 'Not submitted', submitted: 'Pending review', approved: 'Approved', sent_back: 'Sent back for correction' };
  labelValue(doc, 'Record status', submissionLabels[submission.status] || 'Not submitted');
  labelValue(doc, 'Submitted at', formatDate(submission.submittedAt));
  labelValue(doc, 'Reviewed at', formatDate(submission.reviewedAt));
  labelValue(doc, 'Reviewed by', submission.reviewedBy?.name || submission.reviewedBy);
  if (submission.adminRemarks) labelValue(doc, 'Admin remarks', submission.adminRemarks, { height: 55 });

  // Product image is included when a compatible image can be retrieved.
  const image = await fetchReportImage(inspection.images?.[0]);
  if (image) {
    sectionTitle(doc, 'Product Image');
    ensureSpace(doc, 215);
    try {
      doc.image(image, PAGE.left, doc.y, { fit: [300, 190], align: 'left', valign: 'top' });
      doc.y += 198;
    } catch {
      doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Product image could not be embedded in this report.');
    }
  }

  // Every extracted field and its confidence is retained in the report.
  sectionTitle(doc, 'Evidence — Field by Field');
  const evidenceFields = Object.keys(fields).filter((key) => key !== 'confidence');
  if (evidenceFields.length === 0) {
    labelValue(doc, 'Evidence', 'No extracted field data is available.');
  } else {
    evidenceFields.forEach((field, index) => {
      const confidence = fields.confidence?.[field];
      const violation = (inspection.violations || []).find((item) => item.field === field);
      ensureSpace(doc, 48);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(violation ? '#B91C1C' : '#0F766E')
        .text(`${index + 1}. ${formatLabel(field)}${violation ? ' — Missing / violation' : ''}`);
      doc.font('Helvetica').fontSize(10).fillColor('#1E293B')
        .text(displayValue(fields[field]), { indent: 12, width: PAGE.right - PAGE.left - 12 });
      if (confidence !== undefined) {
        doc.fontSize(8.5).fillColor('#64748B').text(`Confidence: ${Math.round(Number(confidence) * 100)}%`, { indent: 12 });
      }
      doc.moveDown(0.4);
    });
  }

  sectionTitle(doc, 'Compliance Findings');
  labelValue(doc, 'Overall result', `${statusText} (${inspection.complianceScore ?? 0}% compliance)`);
  if (!inspection.violations?.length) {
    labelValue(doc, 'Violations', 'No violations found.');
  } else {
    inspection.violations.forEach((violation, index) => {
      labelValue(doc, `Violation ${index + 1}`, `${formatLabel(violation.field)} | ${violation.message || 'No description'} | Severity: ${violation.severity || 'Not specified'}`, { height: 48 });
    });
  }

  if (inspection.seizureMemo?.samplesSeized != null) {
    sectionTitle(doc, 'Seizure Memo');
    labelValue(doc, 'Samples seized', inspection.seizureMemo.samplesSeized);
    labelValue(doc, 'Samples released', inspection.seizureMemo.samplesReleased);
    labelValue(doc, 'Disposal note', inspection.seizureMemo.disposalNote, { height: 48 });
    labelValue(doc, 'Reasons to believe', inspection.seizureMemo.reasonsToBelieve, { height: 48 });
    labelValue(doc, 'Memo generated at', formatDate(inspection.seizureMemo.generatedAt));
    labelValue(doc, 'Memo generated by', inspection.seizureMemo.generatedBy?.name || inspection.seizureMemo.generatedBy);
  }

  doc.moveDown(1).font('Helvetica').fontSize(8.5).fillColor('#64748B')
    .text('This document is generated from the LegalMetrix AI inspection record.', { align: 'center' });
  addFooter(doc);
  doc.end();
}

module.exports = { generateInspectionPDF };
