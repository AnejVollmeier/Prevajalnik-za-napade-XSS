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
      /document\.location/i,
      /location\.href/i,
      /new URLSearchParams/i,
      /getUserInput/i,
      /getParameter/i,
      /\$\(/i,           // jQuery selector with variable
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
  {
    ruleId: "DOM_INSERTADJACENTHTML",
    sinkPattern: /insertAdjacentHTML\s*\(/i,
    sourcePatterns: [
      /location\.search/i,
      /location\.hash/i,
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
      /document\.location/i,
      /getUserInput/i,
      /request\./i,
      /query\./i,
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
      /./i, // eval is always dangerous
    ],
    severity: "Critical",
    message: "CRITICAL: eval() detected - can execute arbitrary code and XSS.",
    recommendation: "Never use eval(). Use JSON.parse() for JSON data.",
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
    message: "Dangerous: Function constructor with user input can execute code.",
    recommendation: "Use safer alternatives like JSON.parse or pre-defined functions.",
    points: 35,
  },
  {
    ruleId: "DOM_INNERTEXT_ASSIGNMENT",
    sinkPattern: /\.innerText\s*=/i,
    sourcePatterns: [
      /location\.search/i,
      /location\.hash/i,
      /document\.location/i,
      /getUserInput/i,
      /request\./i,
      /query\./i,
    ],
    severity: "Medium",
    message: "Potential XSS: innerText assignment with user input.",
    recommendation: "Use textContent which is safer, and validate input.",
    points: 20,
  },
  {
    ruleId: "DOM_TEXTCONTENT_EVAL",
    sinkPattern: /textContent\s*=/i,
    sourcePatterns: [
      /eval\(/i,
      /Function\(/i,
      /JSON\.parse.*eval/i,
    ],
    severity: "High",
    message: "XSS Risk: textContent set with evaluated/exec code.",
    recommendation: "Avoid eval. Use JSON.parse for data parsing.",
    points: 30,
  },
  {
    ruleId: "DOM_SETTIMEOUT_EVAL",
    sinkPattern: /setTimeout\s*\(/i,
    sourcePatterns: [
      /location\./i,
      /getUserInput/i,
      /request\./i,
      /query\./i,
    ],
    severity: "High",
    message: "DOM-based XSS: setTimeout with user input can execute code.",
    recommendation: "Pass a function reference, not a string. Or use named functions.",
    points: 35,
  },
  {
    ruleId: "DOM_SETINTERVAL_EVAL",
    sinkPattern: /setInterval\s*\(/i,
    sourcePatterns: [
      /location\./i,
      /getUserInput/i,
      /request\./i,
    ],
    severity: "High",
    message: "DOM-based XSS: setInterval with user input executes code.",
    recommendation: "Pass function reference instead of string.",
    points: 35,
  },

  // ============================================================
  // REFLECTED XSS RULES (Server-side output)
  // ============================================================
  {
    ruleId: "REFLECTED_XSS_PHP_GET",
    sinkPattern: /echo\s+|\$_\[/i,
    sourcePatterns: [
      /\$_GET\s*\[/i,
      /\$_REQUEST\s*\[/i,
      /\$_POST\s*\[/i,
    ],
    severity: "High",
    message: "Reflected XSS: User input from GET/POST/REQUEST echoed without sanitization.",
    recommendation: "Use htmlspecialchars() or htmlentities() to escape output.",
    points: 35,
  },
  {
    ruleId: "REFLECTED_XSS_PYTHON_FLASK",
    sinkPattern: /render_template\s*\(|f\s*['\"].*\{/i,
    sourcePatterns: [
      /request\.args\./i,
      /request\.form\./i,
      /request\.values\./i,
      /request\.GET/i,
      /request\.POST/i,
    ],
    severity: "High",
    message: "Reflected XSS: Flask template rendering with unsanitized user input.",
    recommendation: "Use Jinja2 auto-escaping or manually escape with |escape filter.",
    points: 35,
  },
  {
    ruleId: "REFLECTED_XSS_JAVA_SERVLET",
    sinkPattern: /response\.getWriter\s*\(|out\.print|out\.println/i,
    sourcePatterns: [
      /request\.getParameter\s*\(/i,
      /request\.getQueryString/i,
      /request\.getAttribute\s*\(/i,
    ],
    severity: "High",
    message: "Reflected XSS: Servlet output with unsanitized request parameter.",
    recommendation: "Use ESAPI encoder or Apache Commons Lang StringEscapeUtils.",
    points: 35,
  },
  {
    ruleId: "REFLECTED_XSS_ASP_NET",
    sinkPattern: /Response\.Write|<%= |@Html\.Raw/i,
    sourcePatterns: [
      /Request\[/i,
      /Request\.QueryString\[/i,
      /Request\.Form\[/i,
    ],
    severity: "High",
    message: "Reflected XSS: ASP.NET output without proper encoding.",
    recommendation: "Use HttpUtility.HtmlEncode() or asp:Label in markup.",
    points: 35,
  },
  {
    ruleId: "REFLECTED_XSS_RUBY_ERB",
    sinkPattern: /<%=\s+|puts\s+|print\s+/i,
    sourcePatterns: [
      /params\[/i,
      /request\.query_parameters/i,
      /request\.parameters/i,
    ],
    severity: "High",
    message: "Reflected XSS: ERB template output without HTML escaping.",
    recommendation: "Use <%=h safely_encoded_content %> or tag helpers.",
    points: 35,
  },

  // ============================================================
  // STORED XSS RULES (Database to output)
  // ============================================================
  {
    ruleId: "STORED_XSS_DB_ECHO",
    sinkPattern: /echo\s+|print\s+/i,
    sourcePatterns: [
      /\$db\[/i,
      /\$database\[/i,
      /fetch_assoc\s*\(\)|fetch\s*\(\)|query\s*\(/i,
      /\->name|\->title|\->content|\->description/i,
      /\['name'\]|\['title'\]|\['content'\]|\['description'\]/i,
    ],
    severity: "High",
    message: "Stored XSS: Database content echoed without HTML sanitization.",
    recommendation: "Sanitize user input when storing in DB. Escape on output with htmlspecialchars().",
    points: 40,
  },
  {
    ruleId: "STORED_XSS_TEMPLATE_RENDER",
    sinkPattern: /render_template|template\.render|Handlebars\.compile/i,
    sourcePatterns: [
      /\$data\[|user\.|db_result\.|row\.|result\./i,
      /getItem\(|select.*FROM|fetch\(/i,
    ],
    severity: "High",
    message: "Stored XSS: Template rendering with DB-sourced data without escaping.",
    recommendation: "Enable auto-escaping in templates. Sanitize on input to database.",
    points: 40,
  },
  {
    ruleId: "STORED_XSS_DIRECT_DISPLAY",
    sinkPattern: /innerHTML\s*=|insertAdjacentHTML|document\.write/i,
    sourcePatterns: [
      /fetch\(.*then\(|\.json\(\)|response\./i,
      /axios\.|\.get\(|\.post\(/i,
      /readFileSync|fs\.read/i,
    ],
    severity: "High",
    message: "Stored XSS: Data from API/file displayed in HTML without escaping.",
    recommendation: "Always escape HTML. Use textContent instead of innerHTML.",
    points: 40,
  },

  // ============================================================
  // ADDITIONAL XSS PATTERNS (Advanced)
  // ============================================================
  {
    ruleId: "XSS_ATTRIBUTE_INJECTION",
    sinkPattern: /setAttribute\s*\(|\.on\w+\s*=/i,
    sourcePatterns: [
      /location\./i,
      /getUserInput/i,
      /request\./i,
      /query\./i,
    ],
    severity: "High",
    message: "XSS: Element attribute injection with user input.",
    recommendation: "Validate and escape attribute values. Use safe methods like classList.",
    points: 30,
  },
  {
    ruleId: "XSS_ANCHOR_HREF",
    sinkPattern: /\.href\s*=|href=['\"]/i,
    sourcePatterns: [
      /location\.hash|location\.search/i,
      /getUserInput|userUrl|urlParam/i,
      /request\.query|params\./i,
    ],
    severity: "Medium",
    message: "Potential XSS: javascript: protocol in href with user input.",
    recommendation: "Validate URLs. Use URLSearchParams. Disallow javascript: protocol.",
    points: 25,
  },
  {
    ruleId: "XSS_SRC_ATTRIBUTE",
    sinkPattern: /\.src\s*=|src=['\"]/i,
    sourcePatterns: [
      /location\./i,
      /getUserInput|imageUrl|srcParam/i,
      /request\.query|params\./i,
    ],
    severity: "Medium",
    message: "XSS Risk: Image/script src with user-controlled URL.",
    recommendation: "Whitelist allowed domains. Validate URLs before using.",
    points: 25,
  },
  {
    ruleId: "XSS_DANGEROUSLYSETHTML",
    sinkPattern: /dangerouslySetInnerHTML/i,
    sourcePatterns: [
      /./i, // Any use is risky
    ],
    severity: "High",
    message: "React Security: dangerouslySetInnerHTML can allow XSS.",
    recommendation: "Use sanitized HTML libraries or avoid HTML rendering.",
    points: 35,
  },
];

module.exports = { domXssRules };
