export function scoreShortAnswer(response: string, keywords: string[]) {
  const normalized = response.toLowerCase();
  if (!keywords.length) return false;
  const hits = keywords.filter((k) => normalized.includes(k.toLowerCase()));
  return hits.length >= Math.ceil(keywords.length * 0.6);
}

export function scoreResponse(
  type: string,
  response: string,
  correctIndex: number | null,
  acceptedKeywordsJson: string | null
) {
  if (type === "multiple_choice") {
    const idx = Number(response);
    return Number.isFinite(idx) && idx === correctIndex;
  }
  const keywords = acceptedKeywordsJson
    ? (JSON.parse(acceptedKeywordsJson) as string[])
    : [];
  return scoreShortAnswer(response, keywords);
}
