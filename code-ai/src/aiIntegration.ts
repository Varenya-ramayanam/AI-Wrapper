import axios from "axios";
import * as vscode from "vscode";

// ==============================
// Detect if output is real code
// ==============================
function looksLikeCode(code: string): boolean {
  return /(import|export|const|let|var|function|class|\{|\};)/.test(code);
}

// ==============================
// Detect CRITICAL unsafe patterns
// ==============================
function containsCriticalPatterns(code: string): boolean {
  const dangerous = [
    "eval(",
    "Function(",
    "child_process.exec(",
    "innerHTML",
    "document.write(",
    "new Buffer(",
  ];
  return dangerous.some(p => code.includes(p));
}

// ==============================
// Sanitize AI output completely
// ==============================
function sanitizeAIOutput(raw: string): string {
  let code = raw;

  // Remove markdown code fences
  code = code.replace(/```[\s\S]*?```/g, block =>
    block.replace(/```/g, "")
  );

  // Remove markdown bullets & headings
  code = code.replace(/^[-*#].*$/gm, "");

  // Remove ALL block comments (even unterminated)
  code = code.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, "");

  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, "");

  // Remove common LLM chatter
  code = code.replace(
    /\b(here is|this code|example|sure|below|explanation|note that)\b/gi,
    ""
  );

  code = code.trim();

  // Fail closed
  if (!code) {
    throw new Error("Empty AI output");
  }

  if (!looksLikeCode(code)) {
    throw new Error("Non-code AI response blocked");
  }

  if (code.includes("/*") || code.includes("```")) {
    throw new Error("Malformed AI output");
  }

  if (containsCriticalPatterns(code)) {
    throw new Error("Critical insecure patterns detected");
  }

  return code;
}

// ==============================
// Fetch code from local LLM
// ==============================
async function getAIPoweredBotResponse(prompt: string): Promise<string> {
  const apiUrl = "http://localhost:3000";

  try {
    const response = await axios.post(apiUrl, { prompt });

    if (!response.data || typeof response.data.bot !== "string") {
      throw new Error("Invalid AI response format");
    }

    return sanitizeAIOutput(response.data.bot);
  } catch (error: any) {
    console.error("AI fetch error:", error?.message || error);
    throw new Error("AI request failed or returned unsafe output");
  }
}

// ==============================
// Insert sanitized code into editor
// ==============================
async function insertCodeIntoEditor(code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error("No active editor found");
  }

  await editor.edit(editBuilder => {
    editBuilder.insert(editor.selection.active, code);
  });
}

// ==============================
// Command entry point
// ==============================
export async function runAICodeAssistant(prompt: string) {
  try {
    const aiCode = await getAIPoweredBotResponse(prompt);
    await insertCodeIntoEditor(aiCode);

    vscode.window.showInformationMessage(
      "✅ Secure, sanitized AI code inserted"
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "❌ Blocked unsafe AI code: " + err.message
    );
  }
}

export { getAIPoweredBotResponse };
