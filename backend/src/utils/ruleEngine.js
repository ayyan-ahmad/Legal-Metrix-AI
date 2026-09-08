const Rule = require('../models/Rule');

// Confidence threshold - isse kam confidence wale fields "review needed" honge
const CONFIDENCE_THRESHOLD = 0.7;

async function checkCompliance(extractedData) {
  const rules = await Rule.find({}); // database se sab rules le aao

  const violations = [];
  let needsReview = false;
  let passedCount = 0;

  for (const rule of rules) {
    const fieldValue = extractedData[rule.field];
    const fieldConfidence = extractedData.confidence?.[rule.field] ?? 0;

    // Case 1: Field required hai aur missing/null hai -> violation
    if (rule.required && (!fieldValue || fieldValue === 'null')) {
      violations.push({
        field: rule.field,
        message: `${rule.label} not found on the package`,
        severity: rule.severity,
      });
      continue; // agla rule check karo
    }

    // Case 2: Field mili hai, lekin confidence kam hai -> human review chahiye
    if (fieldValue && fieldConfidence < CONFIDENCE_THRESHOLD) {
      needsReview = true;
    }

    // Case 3: Sab theek hai
    passedCount++;
  }

  const totalRules = rules.length;
  const complianceScore = totalRules > 0
    ? Math.round((passedCount / totalRules) * 100)
    : 0;

  // Final status decide karna
  let status;
  if (violations.length > 0) {
    status = 'fail';
  } else if (needsReview) {
    status = 'review';
  } else {
    status = 'pass';
  }

  return { complianceScore, violations, status };
}

module.exports = { checkCompliance };