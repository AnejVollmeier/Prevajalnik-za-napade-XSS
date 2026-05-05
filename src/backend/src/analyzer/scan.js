const { domXssRules } = require("./rules/domXssRules");

function scanCode({ code }) {
  const lines = code.split("\n");
  const findings = [];
  let scoreOverall = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    domXssRules.forEach((rule) => {
      if (rule.sinkPattern.test(trimmedLine)) {
        const hasSource = rule.sourcePatterns.some((pattern) =>
          pattern.test(trimmedLine),
        );

        if (hasSource) {
          findings.push({
            ruleId: rule.ruleId,
            severity: rule.severity,
            message: rule.message,
            recommendation: rule.recommendation,
            location: { line: index + 1 },
            snippet: trimmedLine,
          });

          scoreOverall += rule.points;
          if (rule.severity === "High") highCount++;
          if (rule.severity === "Medium") mediumCount++;
          if (rule.severity === "Low") lowCount++;
        }
      }
    });
  });

  return {
    scoreOverall: Math.min(100, scoreOverall),
    summary: { high: highCount, medium: mediumCount, low: lowCount },
    findings,
  };
}

module.exports = { scanCode };
