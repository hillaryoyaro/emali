// src/lib/utils/searchUtils.ts

// Keep this aligned with what your API really returns
export interface SearchableProduct {
  _id: string
  name: string
  images?: string[]
  price?: number
  category?: string
  description?: string
  numSales?: number
  avgRating?: number
}

/**
 * Enhance search suggestions with Amazon-like logic
 */
export function enhanceSuggestions(
  query: string,
  products: SearchableProduct[],
  synonymsMap: Record<string, string[]> = {}
): Array<SearchableProduct & { _score: number }> {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const expandedQueries = new Set<string>([q])
  if (q.endsWith('s')) expandedQueries.add(q.slice(0, -1))
  for (const syn of synonymsMap[q] || []) {
    expandedQueries.add(syn.toLowerCase())
  }

  const scored = products.map((p) => {
    const name = p.name.toLowerCase()
    let score = 0

    for (const eq of expandedQueries) {
      if (name.includes(eq)) score += 5
      if (name.startsWith(eq)) score += 3
      if (name.split(/\s+/).some((w) => w.startsWith(eq))) score += 2
      if (levenshtein(name, eq) <= 2) score += 1
    }

    if (typeof p.numSales === 'number') {
      score += Math.min(p.numSales, 100) / 50
    }
    if (typeof p.avgRating === 'number') {
      score += p.avgRating * 0.5
    }

    return { ...p, _score: score }
  })

  return scored
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 10)
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  )

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[a.length][b.length]
}
