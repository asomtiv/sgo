/**
 * Normalize a product name for comparison/uniqueness:
 * 1. Trim whitespace
 * 2. Collapse multiple spaces to single space
 * 3. Lowercase
 * 4. Remove diacritical marks (accents): "résina" -> "resina"
 */
export function normalizeProductName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Standard Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Find similar product names from a list.
 * Returns products where normalized name matches via substring or Levenshtein <= 2.
 */
export function findSimilarProducts(
  input: string,
  existingNames: { id: string; name: string; normalizedName: string }[],
  excludeId?: string
): { id: string; name: string }[] {
  const normalized = normalizeProductName(input);
  if (!normalized) return [];

  return existingNames
    .filter((p) => (excludeId ? p.id !== excludeId : true))
    .filter((p) => {
      if (p.normalizedName === normalized) return true;
      if (
        p.normalizedName.includes(normalized) ||
        normalized.includes(p.normalizedName)
      )
        return true;
      return levenshteinDistance(p.normalizedName, normalized) <= 2;
    })
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name }));
}
