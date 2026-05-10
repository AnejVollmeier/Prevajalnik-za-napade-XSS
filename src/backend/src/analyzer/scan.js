const { domXssRules } = require("./rules/domXssRules");

// Viri ki "okužijo" spremenljivko
const TAINT_SOURCES = [
    /getUserInput\s*\(/i,
    /location\.search/i,
    /location\.hash/i,
    /location\.href/i,
    /document\.location/i,
    /new URLSearchParams/i,
    /req\.body/i,
    /req\.query/i,
    /req\.params/i,
    /request\./i,
    /query\./i,
    /params\./i,
    /localStorage\.getItem/i,
    /sessionStorage\.getItem/i,
    /document\.cookie/i,
    /\$_GET\s*\[/i,
    /\$_POST\s*\[/i,
    /\$_REQUEST\s*\[/i,
];

const SANITIZERS = [
    /DOMPurify\.sanitize/i,
    /htmlspecialchars/i,
    /htmlentities/i,
    /encodeURIComponent/i,
    /encodeURI\(/i,
    /sanitize\s*\(/i,
    /stripTags\s*\(/i,
    /html_escape/i,
    /ESAPI\.encoder/i,
    /StringEscapeUtils/i,
    /HttpUtility\.HtmlEncode/i,
];

function isSanitized(line) {
    return SANITIZERS.some((s) => s.test(line));
}

function collectTaintedVars(lines) {
    const tainted = new Set();
    lines.forEach((line) => {
        const isTaintSource = TAINT_SOURCES.some((src) => src.test(line));
        if (!isTaintSource) return;
        if (isSanitized(line)) return;
        const match =
            line.match(/(?:const|let|var)\s+(\w+)\s*=/) ||
            line.match(/^\s*(\w+)\s*=/);
        if (match) tainted.add(match[1]);
    });
    return tainted;
}

function lineContainsTainted(line, taintedVars) {
    for (const v of taintedVars) {
        const re = new RegExp(`\\b${v}\\b`);
        if (re.test(line)) return true;
    }
    return false;
}

function scanCode({ code }) {
    const lines = code.split("\n");
    const findings = [];
    let scoreOverall = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    const taintedVars = collectTaintedVars(lines);

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        if (isSanitized(trimmedLine)) return;

        domXssRules.forEach((rule) => {
            if (!rule.sinkPattern.test(trimmedLine)) return;

            const directSource = rule.sourcePatterns.some((p) =>
                p.test(trimmedLine)
            );
            const taintedSource = lineContainsTainted(trimmedLine, taintedVars);

            if (!directSource && !taintedSource) return;

            const isDuplicate = findings.some(
                (f) => f.ruleId === rule.ruleId && f.location.line === index + 1
            );
            if (isDuplicate) return;

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
        });
    });

    return {
        scoreOverall: Math.min(100, scoreOverall),
        summary: { high: highCount, medium: mediumCount, low: lowCount },
        findings,
    };
}

module.exports = { scanCode };