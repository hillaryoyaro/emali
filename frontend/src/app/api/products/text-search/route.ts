// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProducts,
  GetAllProductsResult,
} from '@/src/lib/actions/product.actions';
import {
  getProductsByTextSearch,
  GetProductsByTextSearchResult,
} from '@/src/lib/actions/search.action';
import { getCache, setCache } from '@/src/lib/cache/cache';

export type SortOption =
  | 'priceLowHigh'
  | 'priceHighLow'
  | 'newest'
  | 'bestSelling';

const allowedSorts: SortOption[] = [
  'priceLowHigh',
  'priceHighLow',
  'newest',
  'bestSelling',
];

// Cache entries live for 60 seconds
const CACHE_TTL = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q')?.trim() || '';
  const category = searchParams.get('category') || 'all';
  const tag = searchParams.get('tag') || 'all';
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 12);
  const price = searchParams.get('price') || 'all';

  const rawRating = searchParams.get('rating');
  const rating =
    rawRating && rawRating !== 'all' ? Number(rawRating) : undefined;

  const rawSort = searchParams.get('sort') || 'newest';
  const sort: SortOption = allowedSorts.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'newest';

  // Build a unique cache key
  const cacheKey = `products:${query}:${category}:${tag}:${page}:${limit}:${price}:${rating ?? ''}:${sort}`;

  // 1️⃣ Try cache first
  const cached = getCache<GetAllProductsResult | GetProductsByTextSearchResult>(
    cacheKey
  );
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true });
  }

  try {
    // 2️⃣ Choose which data source
    const isBroadBrowse = !query || query === 'all' || query.length < 3;
    let result: GetAllProductsResult | GetProductsByTextSearchResult;

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
      });
    } else {
      // Try catalog first (cheaper) then fallback to text search
      const catalog = await getAllProducts({
        query,
        category,
        tag,
        page,
        limit,
        price,
        rating,
        sort,
      });

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
            });
    }

    // 3️⃣ Store in cache
    setCache(cacheKey, result, CACHE_TTL);

    return NextResponse.json({ ...result, fromCache: false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
