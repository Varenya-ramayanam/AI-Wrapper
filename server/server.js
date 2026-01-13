import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

import { fetchAllSnippets } from "./services/github.js";
import { matchSnippets } from "./services/snippetMatcher.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({ message: "Server running with AI-wrapper logic" });
});

// helper: call local LLaMA
async function callLlama(prompt, label = "LLM") {
  console.log(`[${label}] Sending prompt to LLaMA...`);
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  console.log(`[${label}] Received response from LLaMA`);
  return data.response;
}

// safe JSON parser for tag extraction
function safeParseJSON(raw) {
  try {
    // first try normal JSON parse
    return JSON.parse(raw);
  } catch {
    // try to extract array-like string
    const match = raw.match(/\[.*\]/s); // matches content between [ ]
    if (match) {
      try {
        // convert single quotes to double quotes and parse
        return JSON.parse(match[0].replace(/'/g, '"'));
      } catch {}
    }
    // fallback to empty array
    console.warn("[Tags] Could not parse JSON from raw LLaMA output:", raw);
    return [];
  }
}

// extract tags
async function extractTags(userPrompt) {
  console.log("[Tags] Extracting technical tags from user prompt...");
  const tagPrompt = `
Extract 1–3 concise technical tags from this prompt.
Return ONLY a JSON array of lowercase strings.
DO NOT write any text before or after the JSON array.

Prompt: "${userPrompt}"
`;

  const raw = await callLlama(tagPrompt, "Tags LLM");
  const tags = safeParseJSON(raw);

  console.log("[Tags] Extracted tags:", tags);
  return tags;
}

app.post("/", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    console.log("\n=== New Request ===");
    console.log("[User Prompt]", userPrompt);

    // 1️⃣ extract intent
    const keywords = await extractTags(userPrompt);

    // 2️⃣ load repo snippets
    console.log("[GitHub] Fetching all code snippets from repository...");
    const snippets = await fetchAllSnippets();
    console.log(`[GitHub] Found ${snippets.length} snippets in the repo`);

    // 3️⃣ match
    console.log("[Matcher] Matching snippets with extracted tags...");
    const matches = matchSnippets(snippets, keywords);
    console.log(`[Matcher] ${matches.length} matching snippets found:`, matches.map(m => m.id));

    // 4️⃣ prepare final LLM prompt
    const context = matches
      .map(m => `--- ${m.id} ---\n${m.code}`)
      .join("\n\n");

    const finalPrompt = `
User wants:
${userPrompt}

Relevant existing code:
${context || "None found"}

Modify or generate code to satisfy the request.
Return only the final code.
`;
    console.log("[LLM] Sending final prompt to generate/modify code...");

    const result = await callLlama(finalPrompt, "Final LLM");

    console.log("[LLM] Code generation completed. Sending response to client.");

    res.status(200).send({ bot: result, keywords, matched: matches.map(m => m.id) });
  } catch (error) {
    console.error("[Server] Error processing request:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
