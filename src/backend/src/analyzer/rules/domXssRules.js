const domXssRules = [
  {
    ruleId: "DOM_INNERHTML_ASSIGNMENT",
    sinkPattern: /\.innerHTML\s*=/i,
    sourcePatterns: [
      /location\.search/i,
      /document\.location/i,
      /new URLSearchParams/i,
      /get\(/i,
      /getUserInput/i,
      /getParameter/i,
      /\w+Input/i,           // matches userInput, formInput, etc.
      /\w+Data['\"]?\s*\)/i,  // matches getData(), user.data, etc.
      /request\./i,
      /query\./i,
      /params\./i,
    ],
    severity: "High",
    message: "Potential DOM XSS: innerHTML with unsanitized input.",
    recommendation: "Use textContent instead, or sanitize HTML using DOMPurify or similar library before inserting.",
    points: 30,
  },
  {
    ruleId: "DOM_INNERHTML_OPERATOR",
    sinkPattern: /\.innerHTML\s*\+=/i,
    sourcePatterns: [
      /./i, // Match any characters (any operations with += are risky)
    ],
    severity: "High",
    message: "Potential DOM XSS: innerHTML modified with += operator.",
    recommendation: "Use textContent or create elements safely with createElement.",
    points: 25,
  },
  {
    ruleId: "DOM_INSERTADJACENTHTML_TAINT",
    sinkPattern: /insertAdjacentHTML\s*\(/i,
    sourcePatterns: [
      /location\.search/i,
      /document\.location/i,
      /new URLSearchParams/i,
      /getUserInput/i,
      /getParameter/i,
      /\w+Input/i,
      /request\./i,
      /query\./i,
      /params\./i,
    ],
    severity: "High",
    message:
      "Potential DOM XSS: insertAdjacentHTML with unsanitized input.",
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
      /getUserInput/i,
      /request\./i,
      /query\./i,
    ],
    severity: "High",
    message:
      "Potential DOM XSS: document.write used with user-controlled input.",
    recommendation:
      "Avoid document.write and use safe DOM manipulation methods instead.",
    points: 25,
  },
  {
    ruleId: "DOM_EVAL_USAGE",
    sinkPattern: /\beval\s*\(/i,
    sourcePatterns: [
      /./i, // eval() is always risky regardless of input
    ],
    severity: "High",
    message: "Critical: eval() detected. This is extremely dangerous.",
    recommendation:
      "Never use eval(). Use JSON.parse() for JSON or Function constructor as last resort.",
    points: 40,
  },
  {
    ruleId: "DOM_INNERTEXT_ASSIGNMENT",
    sinkPattern: /\.innerText\s*=/i,
    sourcePatterns: [
      /location\.search/i,
      /getUserInput/i,
      /\w+Input/i,
      /request\./i,
    ],
    severity: "Low",
    message: "innerText assignment with potentially unsanitized input.",
    recommendation: "Prefer textContent which is safer, and validate input.",
    points: 5,
  },
];

module.exports = { domXssRules };
