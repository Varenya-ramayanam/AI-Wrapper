export function matchSnippets(snippets, keywords, topN = 2) {
  return snippets
    .map(s => {
      const score = s.tags.filter(t => keywords.includes(t)).length;
      return { ...s, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
