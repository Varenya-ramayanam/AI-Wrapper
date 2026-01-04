import * as vscode from "vscode";
import { getAIPoweredBotResponse } from "./aiIntegration";
import { scanForVulnerabilities, SecurityIssue } from "./securityScanner";

// ==============================
// Detect if output is real code
// ==============================
function looksLikeCode(code: string): boolean {
  return /(import|export|const|let|var|function|class|\{|\};)/.test(code);
}

// ==============================
// Sanitize AI output completely
// ==============================
function sanitizeAIOutput(raw: string): string {
  let code = raw;

  // Remove markdown code fences
  code = code.replace(/```[\s\S]*?```/g, b => b.replace(/```/g, ""));

  // Remove markdown bullets / headings
  code = code.replace(/^[-*#].*$/gm, "");

  // Remove ALL block comments (even unterminated)
  code = code.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, "");

  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, "");

  // Remove LLM chatter
  code = code.replace(
    /\b(here is|this code|example|explanation|sure|below|note that)\b/gi,
    ""
  );

  code = code.trim();

  if (!code || code.includes("/*") || code.includes("```")) {
    throw new Error("Malformed AI output");
  }

  if (!looksLikeCode(code)) {
    throw new Error("Non-code AI response blocked");
  }

  return code;
}

// ==============================
// Critical pattern block
// ==============================
function containsCriticalPatterns(code: string): boolean {
  const dangerous = [
    "eval(",
    "Function(",
    "child_process.exec(",
    "document.write(",
    "innerHTML",
    "new Buffer("
  ];
  return dangerous.some(p => code.includes(p));
}

// ==============================
// Auto-fix vulnerable code
// ==============================
async function autoFixCode(
  code: string,
  issues: SecurityIssue[]
): Promise<string> {
  const prompt = `
Rewrite the following code securely.

STRICT RULES:
- ONLY executable code
- NO comments
- NO markdown
- NO explanations
- Follow OWASP Top 10
- Use secure defaults

Security issues:
${issues.map(i => `- ${i.message}`).join("\n")}
`;

  const fixed = await getAIPoweredBotResponse(prompt + "\n\n" + code);
  return sanitizeAIOutput(fixed);
}

// ==============================
// Main command handler
// ==============================
async function handleUserInput() {
  const userPrompt = await vscode.window.showInputBox({
    prompt: "Enter your prompt for AI code generation"
  });

  if (!userPrompt) return;

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  vscode.window.showInformationMessage("Generating secure code...");

  const aiPrompt = `
Generate executable code.

STRICT RULES:
- ONLY code
- NO comments
- NO markdown
- NO explanations
- Follow OWASP Top 10

Request:
${userPrompt}
`;

  let aiCode: string;

  try {
    aiCode = sanitizeAIOutput(
      await getAIPoweredBotResponse(aiPrompt)
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "❌ Unsafe AI output blocked: " + err.message
    );
    return;
  }

  if (containsCriticalPatterns(aiCode)) {
    vscode.window.showErrorMessage(
      "❌ Critical insecure patterns detected. Insertion blocked."
    );
    return;
  }

  let issues = scanForVulnerabilities(aiCode);

  let attempts = 0;
  while (issues.length > 0 && attempts < 2) {
    try {
      aiCode = await autoFixCode(aiCode, issues);
    } catch {
      vscode.window.showErrorMessage("❌ Auto-fix failed.");
      return;
    }

    if (containsCriticalPatterns(aiCode)) {
      vscode.window.showErrorMessage(
        "❌ Critical issues remain after auto-fix."
      );
      return;
    }

    issues = scanForVulnerabilities(aiCode);
    attempts++;
  }

  if (issues.some(i => i.severity === "CRITICAL")) {
    vscode.window.showErrorMessage(
      "❌ Critical security issues detected."
    );
    return;
  }

  const decision = await vscode.window.showInformationMessage(
    issues.length === 0
      ? "✅ Security scan passed. Insert code?"
      : "⚠️ Minor warnings found. Insert anyway?",
    "Insert",
    "Cancel"
  );

  if (decision !== "Insert") return;

  await editor.edit(editBuilder => {
    editBuilder.insert(editor.selection.active, aiCode);
  });

  vscode.window.showInformationMessage("✅ Secure code inserted");
}

// ==============================
// Activate extension
// ==============================
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.getAIPoweredBotResponse",
    handleUserInput
  );

  context.subscriptions.push(disposable);
}