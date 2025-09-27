
import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProducts,
  GetAllProductsResult,
} from '@/src/lib/actions/product.actions'
import {
  getProductsByTextSearch,
  GetProductsByTextSearchResult,
} from '@/src/lib/actions/search.action'
import { getCache, setCache } from '@/src/lib/cache/cache'
import { enhanceSuggestions, SearchableProduct } from '@/src/lib/utils/searchUtils'

// Define a product type (adjust to match DB schema)
export interface Product {
  _id: string
  name: string
  price?: number
  category?: string
  description?: string
  images?: string[]
  numSales?: number
  avgRating?: number
}

export type SortOption =
  | 'priceLowHigh'
  | 'priceHighLow'
  | 'newest'
  | 'bestSelling'

const allowedSorts: SortOption[] = [
  'priceLowHigh',
  'priceHighLow',
  'newest',
  'bestSelling',
]

const CACHE_TTL = 60 // cache in seconds

// 🔄 Normalize Product[] → SearchableProduct[]
function normalizeProducts(products: Product[]): SearchableProduct[] {
  return products.map((p) => ({
    _id: p._id,
    name: p.name,
    images: p.images ?? [],
    price: p.price ?? 0,
    category: p.category ?? '',
    description: p.description ?? '',
    numSales: p.numSales ?? 0,
    avgRating: p.avgRating ?? 0,
  }))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const query = searchParams.get('q')?.trim() || ''
  const category = searchParams.get('category') || 'all'
  const tag = searchParams.get('tag') || 'all'
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 12)
  const mode = searchParams.get('mode') || 'default'
  const price = searchParams.get('price') || 'all'

  const rawRating = searchParams.get('rating')
  const rating =
    rawRating && rawRating !== 'all' ? Number(rawRating) : undefined

  const rawSort = searchParams.get('sort') || 'newest'
  const sort: SortOption = allowedSorts.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'newest'

  const cacheKey = `products:${query}:${category}:${tag}:${page}:${limit}:${price}:${rating ?? ''}:${sort}:${mode}`

  // 1️⃣ Check cache
  const cached = getCache<GetAllProductsResult | GetProductsByTextSearchResult>(
    cacheKey
  )
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true })
  }

  try {
    // 2️⃣ Decide between broad browse vs text search
    const isBroadBrowse = !query || query === 'all' || query.length < 3
    let result: GetAllProductsResult | GetProductsByTextSearchResult

    if (isBroadBrowse) {
      result = await getAllProducts({
        query,
        category,
        tag,
        page,
        limit,
        price,
        rating,
        sort,
      })
    } else {
      // Try broad search first
      const catalog = await getAllProducts({
        query,
        category,
        tag,
        page,
        limit,
        price,
        rating,
        sort,
      })

      result =
        catalog?.products?.length
          ? catalog
          : await getProductsByTextSearch({
              query,
              category,
              tag,
              page,
              limit,
              price,
              rating,
              sort,
            })
    }

    // 3️⃣ If suggestions mode → return lightweight payload
    if (mode === 'suggestions') {
      const searchable = normalizeProducts(result.products as Product[])
      const enhanced = enhanceSuggestions(query, searchable, {
        shoes: ['sneaker', 'trainer'],
        phone: ['mobile', 'cellphone', 'smartphone'],
      })

      return NextResponse.json({
        suggestions: enhanced.map((p) => ({
          id: p._id,
          name: p.name,
          image: p.images?.[0] ?? null,
        })),
      })
    }

    // 4️⃣ Otherwise → full payload with pagination
    setCache(cacheKey, result, CACHE_TTL)
    return NextResponse.json({ ...result, fromCache: false })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

