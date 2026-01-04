export type SecurityIssue = {
  message: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM"
}

// OWASP-aligned rules (regex-based, fast, local)
const rules: { pattern: RegExp; issue: SecurityIssue }[] = [
  {
    pattern: /eval\s*\(/,
    issue: {
      message: "OWASP A03: Use of eval() can lead to code injection",
      severity: "CRITICAL"
    }
  },
  {
    pattern: /child_process|exec\s*\(/,
    issue: {
      message: "OWASP A03: OS command execution detected",
      severity: "CRITICAL"
    }
  },
  {
    pattern: /innerHTML\s*=/,
    issue: {
      message: "OWASP A03: innerHTML can lead to XSS",
      severity: "HIGH"
    }
  },
  {
    pattern: /password\s*=\s*["'`]/i,
    issue: {
      message: "OWASP A02: Hardcoded password detected",
      severity: "HIGH"
    }
  },
  {
    pattern: /SELECT\s+.*\+.*FROM/i,
    issue: {
      message: "OWASP A03: Possible SQL injection via string concatenation",
      severity: "HIGH"
    }
  },
  {
    pattern: /axios\.get\(\s*req\.body\.url/i,
    issue: {
      message: "OWASP A10: Possible SSRF vulnerability",
      severity: "MEDIUM"
    }
  }
]

// Run scan
export function scanForVulnerabilities(code: string): SecurityIssue[] {
  return rules
    .filter(rule => rule.pattern.test(code))
    .map(rule => rule.issue)
}