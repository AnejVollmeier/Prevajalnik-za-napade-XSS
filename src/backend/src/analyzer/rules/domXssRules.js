const domXssRules = [

    // ============================================================
    // DOM-BASED XSS RULES (JavaScript)
    // ============================================================
    {
        ruleId: "DOM_INNERHTML_ASSIGNMENT",
        sinkPattern: /\.innerHTML\s*=/i,
        sourcePatterns: [
            /location\.search/i,
            /location\.hash/i,
            /location\.href/i,
            /document\.location/i,
            /new URLSearchParams/i,
            /getUserInput/i,
            /getParameter/i,
            /request\./i,
            /query\./i,
            /params\./i,
            /localStorage\.getItem/i,
            /sessionStorage\.getItem/i,
        ],
        severity: "High",
        message: "DOM-based XSS: innerHTML with unsanitized input can execute scripts.",
        recommendation: "Use textContent instead, or sanitize HTML using DOMPurify before inserting.",
        points: 35,
    },
    {
        ruleId: "DOM_INNERHTML_CONCAT",
        sinkPattern: /\.innerHTML\s*\+=/i,
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
            /\w+Input/i,
        ],
        severity: "High",
        message: "DOM-based XSS: innerHTML modified with += and unsanitized input.",
        recommendation: "Use textContent or createElement instead of HTML concatenation.",
        points: 35,
    },

    // NOVO: manjkalo je outerHTML
    {
        ruleId: "DOM_OUTERHTML_ASSIGNMENT",
        sinkPattern: /\.outerHTML\s*=/i,
        sourcePatterns: [
            /location\.search/i,
            /location\.hash/i,
            /location\.href/i,
            /document\.location/i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
            /params\./i,
        ],
        severity: "High",
        message: "DOM-based XSS: outerHTML with unsanitized input replaces element with injected HTML.",
        recommendation: "Use safe DOM methods. Sanitize with DOMPurify if HTML is required.",
        points: 35,
    },
    {
        ruleId: "DOM_INSERTADJACENTHTML",
        sinkPattern: /insertAdjacentHTML\s*\(/i,
        sourcePatterns: [
            /location\.search/i,
            /location\.hash/i,
            /location\.href/i,
            /document\.location/i,
            /getUserInput/i,
            /getParameter/i,
            /request\./i,
            /query\./i,
            /params\./i,
        ],
        severity: "High",
        message: "DOM-based XSS: insertAdjacentHTML executes HTML and can run scripts.",
        recommendation: "Use insertAdjacentText or createElement with appendChild instead.",
        points: 35,
    },
    {
        ruleId: "DOM_WRITE_HTML",
        sinkPattern: /document\.write\s*\(/i,
        sourcePatterns: [
            /location\.search/i,
            /location\.hash/i,
            /location\.href/i,
            /document\.location/i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
            /\w+Input/i,
            /\w+Data/i,
            /\w+Param/i,
        ],
        severity: "High",
        message: "DOM-based XSS: document.write with user input can inject malicious scripts.",
        recommendation: "Avoid document.write. Use safe DOM methods like appendChild instead.",
        points: 35,
    },
    {
        ruleId: "DOM_EVAL_DANGEROUS",
        sinkPattern: /\beval\s*\(/i,
        sourcePatterns: [
            /./i, // eval je vedno nevaren ne glede na vir
        ],
        severity: "Critical",
        message: "CRITICAL: eval() detected — can execute arbitrary code and enable XSS.",
        recommendation: "Never use eval(). Use JSON.parse() for JSON data or Function references instead of strings.",
        points: 40,
    },
    {
        ruleId: "DOM_FUNCTION_CONSTRUCTOR",
        sinkPattern: /new\s+Function\s*\(/i,
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
        ],
        severity: "High",
        message: "Dangerous: Function constructor with user input can execute arbitrary code.",
        recommendation: "Use safer alternatives like JSON.parse or pre-defined named functions.",
        points: 35,
    },
    {
        ruleId: "DOM_SETTIMEOUT_STRING",
        sinkPattern: /setTimeout\s*\(\s*[`'"]/i, // FIX: samo ko je 1. arg niz/template literal
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
        ],
        severity: "High",
        message: "DOM-based XSS: setTimeout with a string argument executes code like eval.",
        recommendation: "Pass a function reference, not a string: setTimeout(() => fn(), 1000).",
        points: 35,
    },
    {
        ruleId: "DOM_SETINTERVAL_STRING",
        sinkPattern: /setInterval\s*\(\s*[`'"]/i, // FIX: samo ko je 1. arg niz
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /request\./i,
        ],
        severity: "High",
        message: "DOM-based XSS: setInterval with a string argument executes code like eval.",
        recommendation: "Pass a function reference instead of a string.",
        points: 35,
    },
    {
        ruleId: "DOM_INNERTEXT_ASSIGNMENT",
        sinkPattern: /\.innerText\s*=/i,
        sourcePatterns: [
            /location\.search/i,
            /location\.hash/i,
            /location\.href/i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
        ],
        severity: "Medium",
        message: "Low-risk but verify: innerText with user input. Safer than innerHTML but validate anyway.",
        recommendation: "Prefer textContent. Validate all user input before display.",
        points: 15,
    },

    // ============================================================
    // REFLECTED XSS RULES (Server-side output)
    // ============================================================
    {
        ruleId: "REFLECTED_XSS_PHP_GET",
        sinkPattern: /echo\s+/i, // FIX: popravljeno iz pokvarjenega /echo\s+|\$_\[/i
        sourcePatterns: [
            /\$_GET\s*\[/i,
            /\$_POST\s*\[/i,
            /\$_REQUEST\s*\[/i,
        ],
        severity: "High",
        message: "Reflected XSS: User input from GET/POST/REQUEST echoed without sanitization.",
        recommendation: "Use htmlspecialchars($_GET['x'], ENT_QUOTES, 'UTF-8') to escape output.",
        points: 35,
    },
    {
        ruleId: "REFLECTED_XSS_PYTHON_FLASK",
        sinkPattern: /render_template_string\s*\(|Markup\s*\(/i, // FIX: render_template z auto-escape je večinoma varen
        sourcePatterns: [
            /request\.args\./i,
            /request\.form\./i,
            /request\.values\./i,
        ],
        severity: "High",
        message: "Reflected XSS: Flask render_template_string or Markup() with unsanitized user input.",
        recommendation: "Use render_template (ne render_template_string). Nikoli ne vstavljaj request podatkov direktno v Markup().",
        points: 35,
    },
    {
        ruleId: "REFLECTED_XSS_JAVA_SERVLET",
        sinkPattern: /response\.getWriter\s*\(\)|out\.print\b|out\.println\b/i,
        sourcePatterns: [
            /request\.getParameter\s*\(/i,
            /request\.getQueryString/i,
            /request\.getAttribute\s*\(/i,
        ],
        severity: "High",
        message: "Reflected XSS: Servlet output with unsanitized request parameter.",
        recommendation: "Use ESAPI.encoder().encodeForHTML() or Apache Commons Lang StringEscapeUtils.escapeHtml4().",
        points: 35,
    },
    {
        ruleId: "REFLECTED_XSS_ASP_NET",
        sinkPattern: /Response\.Write\s*\(|<%=\s*|@Html\.Raw\s*\(/i,
        sourcePatterns: [
            /Request\[/i,
            /Request\.QueryString\[/i,
            /Request\.Form\[/i,
        ],
        severity: "High",
        message: "Reflected XSS: ASP.NET output without proper HTML encoding.",
        recommendation: "Use @Html.Encode() or HttpUtility.HtmlEncode(). Never use @Html.Raw with user input.",
        points: 35,
    },
    {
        ruleId: "REFLECTED_XSS_RUBY_ERB",
        sinkPattern: /<%=\s+(?!h\s)/i, // FIX: <%=h je varno, <%=  brez h ni
        sourcePatterns: [
            /params\[/i,
            /request\.query_parameters/i,
            /request\.parameters/i,
        ],
        severity: "High",
        message: "Reflected XSS: ERB template output without HTML escaping.",
        recommendation: "Use <%=h variable %> or <%= html_escape(variable) %> instead of <%= variable %>.",
        points: 35,
    },

    // ============================================================
    // STORED XSS RULES (Database to output)
    // ============================================================
    {
        ruleId: "STORED_XSS_DB_ECHO",
        sinkPattern: /echo\s+|print\s+/i,
        sourcePatterns: [
            /fetch_assoc\s*\(\)/i,
            /fetch\s*\(\)/i,
            /\->name|\->title|\->content|\->comment|\->description/i,
            /\['name'\]|\['title'\]|\['content'\]|\['comment'\]|\['description'\]/i,
        ],
        severity: "High",
        message: "Stored XSS: Database content echoed without HTML sanitization.",
        recommendation: "Escape on output: htmlspecialchars($row['field'], ENT_QUOTES, 'UTF-8'). Sanitize also on input.",
        points: 35,
    },
    {
        ruleId: "STORED_XSS_DIRECT_DISPLAY",
        sinkPattern: /\.innerHTML\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/i,
        sourcePatterns: [
            /\.json\(\)/i,
            /response\.\w+/i,
            /axios\./i,
            /fetch\(/i,
        ],
        severity: "High",
        message: "Stored XSS: API response data inserted into DOM without sanitization.",
        recommendation: "Use textContent instead of innerHTML. Sanitize API data with DOMPurify if HTML is needed.",
        points: 35,
    },
    {
        ruleId: "STORED_XSS_DATABASE_JSON",
        sinkPattern: /res\.json\s*\(|res\.send\s*\(/i,
        sourcePatterns: [
            /db\.all|db\.get|db\.query/i,
            /\.find\(|\.exec\(/i,
            /SELECT.*FROM/i,
        ],
        severity: "High",
        message: "Stored XSS: Database content returned directly to client without sanitization.",
        recommendation: "Sanitize all database output before sending to client. Escape HTML fields.",
        points: 35,
    },

    // ============================================================
    // ADDITIONAL XSS PATTERNS
    // ============================================================
    {
        ruleId: "XSS_ATTRIBUTE_INJECTION",
        sinkPattern: /setAttribute\s*\(\s*['"][^'"]*on\w+['"]/i, // FIX: samo event handler atributi so nevarni
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /request\./i,
            /query\./i,
        ],
        severity: "High",
        message: "XSS: Event handler attribute injection with user input.",
        recommendation: "Never set event handler attributes (onclick, onerror...) from user input. Use addEventListener instead.",
        points: 30,
    },
    {
        ruleId: "XSS_ANCHOR_HREF_JAVASCRIPT",
        sinkPattern: /\.href\s*=|setAttribute\s*\(\s*['"]href['"]/i,
        sourcePatterns: [
            /location\.hash/i,
            /location\.search/i,
            /getUserInput/i,
            /urlParam/i,
            /query\./i,
            /params\./i,
        ],
        severity: "Medium",
        message: "Potential XSS: User-controlled href can use javascript: protocol.",
        recommendation: "Validate URLs. Reject any URL starting with javascript:. Use URL() constructor for parsing.",
        points: 25,
    },
    {
        ruleId: "XSS_SRC_ATTRIBUTE",
        sinkPattern: /\.src\s*=/i,
        sourcePatterns: [
            /location\./i,
            /getUserInput/i,
            /imageUrl/i,
            /srcParam/i,
            /query\./i,
            /params\./i,
        ],
        severity: "Medium",
        message: "XSS Risk: Image/script src with user-controlled URL.",
        recommendation: "Whitelist allowed domains. Validate URLs before assigning to src.",
        points: 25,
    },
    {
        ruleId: "XSS_DANGEROUSLYSETHTML",
        sinkPattern: /dangerouslySetInnerHTML/i,
        sourcePatterns: [
            /./i, // Vsaka uporaba je potencialno nevarna
        ],
        severity: "High",
        message: "React Security: dangerouslySetInnerHTML bypasses React's XSS protection.",
        recommendation: "Use DOMPurify.sanitize() on the value. Never pass raw user input.",
        points: 35,
    },

    // ============================================================
    // SERVER-SIDE NODE.JS/EXPRESS XSS RULES
    // ============================================================
    {
        ruleId: "SERVER_TEMPLATE_LITERAL_HTML",
        // FIX: bil preširok — zdaj samo ko res.send dobi template literal z HTML tagom
        sinkPattern: /res\.send\s*\(`[^`]*</i,
        sourcePatterns: [
            /req\.body/i,
            /req\.query/i,
            /req\.params/i,
        ],
        severity: "High",
        message: "Server-side XSS: res.send with HTML template literal containing request data.",
        recommendation: "Never build HTML strings from user input. Use a template engine with auto-escaping.",
        points: 40,
    },
    {
        ruleId: "SERVER_RES_JSON_HTML_CONTENT",
        sinkPattern: /res\.json\s*\(\s*\{[\s\S]{0,200}html\s*:/i,
        sourcePatterns: [
            /req\.body/i,
            /req\.query/i,
            /req\.params/i,
        ],
        severity: "High",
        message: "Server-side XSS: HTML content in JSON response with user-controlled data.",
        recommendation: "Don't embed raw HTML in JSON responses. Sanitize if necessary.",
        points: 35,
    },
];

module.exports = { domXssRules };