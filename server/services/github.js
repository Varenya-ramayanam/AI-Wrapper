import { Octokit } from "@octokit/rest";
import matter from "gray-matter";


const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function fetchAllSnippets() {
  const { data } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    path: ".",
  });

  const mdFiles = data.filter(f => f.name.endsWith(".md"));
  const results = [];

  for (const file of mdFiles) {
    const content = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: file.path,
    });

    const decoded = Buffer.from(
      content.data.content,
      "base64"
    ).toString("utf-8");

    const parsed = matter(decoded);

    results.push({
      id: parsed.data.id,
      tags: (parsed.data.tags || []).map(t => t.toLowerCase()),
      description: parsed.data.description || "",
      code: parsed.content.trim(),
    });
  }

  return results;
}
