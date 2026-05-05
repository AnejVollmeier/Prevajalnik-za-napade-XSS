const domXssRules = [
  {
    ruleId: "DOM_INNERHTML_TAINT",
    sinkPattern: /innerHTML\s*=/i,
    sourcePatterns: [
      /location\.search/i,
      /document\.location/i,
      /new URLSearchParams/i,
      /get\(/i,
    ],
    severity: "High",
    message: "Potential DOM XSS: user-controlled data flow into innerHTML.",
    recommendation: "Use textContent or escape/encode HTML before inserting.",
    points: 30,
  },
  {
    ruleId: "DOM_INSERTADJACENTHTML_TAINT",
    sinkPattern: /insertAdjacentHTML\s*\(/i,
    sourcePatterns: [
      /location\.search/i,
      /document\.location/i,
      /new URLSearchParams/i,
    ],
    severity: "High",
    message:
      "Potential DOM XSS: user-controlled data flow into insertAdjacentHTML.",
    recommendation: "Use insertAdjacentText or safely encode HTML.",
    points: 30,
  },
  {
    ruleId: "DOM_DOCUMENT_WRITE_TAINT",
    sinkPattern: /document\.write\s*\(/i,
    sourcePatterns: [
      /location\.search/i,
      /document\.location/i,
      /new URLSearchParams/i,
    ],
    severity: "Medium",
    message:
      "Potential DOM XSS: document.write used with user-controlled input.",
    recommendation:
      "Avoid document.write and use safe DOM manipulation methods.",
    points: 10,
  },
];

module.exports = { domXssRules };
