'use server'

import { connectToDatabase } from '@/src/lib/db'
import Product, { IProduct } from '@/src/lib/db/models/product.model'
import { FilterQuery, SortOrder, FlattenMaps, Types } from 'mongoose'

type SortOption = 'priceLowHigh' | 'priceHighLow' | 'newest' | 'bestSelling'

/** ---------------------------------------------------
 *  INTERFACE: Returned shape of getProductsByTextSearch
 *  --------------------------------------------------- */
export interface GetProductsByTextSearchResult {
  products: (FlattenMaps<IProduct> & { _id: string })[]
  totalProducts: number
  from: number
  to: number
  totalPages: number
}

/** ---------------------------------------------------
 *  GET PRODUCTS BY TEXT SEARCH
 *  --------------------------------------------------- */
export async function getProductsByTextSearch({
  query,
  category,
  tag,
  price,
  rating,
  sort = 'bestSelling',
  page = 1,
  limit = 12,
}: {
  query: string
  category?: string
  tag?: string
  price?: string
  rating?: number
  sort?: SortOption
  page?: number
  limit?: number
}): Promise<GetProductsByTextSearchResult> {
  await connectToDatabase()

  const filters: FilterQuery<IProduct> = {}
  if (query) filters.$text = { $search: query }
  if (category && category !== 'all') filters.category = category
  if (tag && tag !== 'all') filters.tags = tag
  if (price && price.includes('-')) {
    const [min, max] = price.split('-').map(Number)
    filters.price = { $gte: min, $lte: max }
  }
  if (rating) filters.avgRating = { $gte: rating }

  // Sorting
  let sortOption: Record<string, SortOrder> = {}
  switch (sort) {
    case 'priceLowHigh':
      sortOption = { price: 1 }
      break
    case 'priceHighLow':
      sortOption = { price: -1 }
      break
    case 'newest':
      sortOption = { createdAt: -1 }
      break
    case 'bestSelling':
      sortOption = { numSales: -1 }
      break
  }

  const totalProducts = await Product.countDocuments(filters)
  const totalPages = Math.ceil(totalProducts / limit)
  const skip = (page - 1) * limit

  const rawProducts = await Product.find(filters)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean<FlattenMaps<IProduct>[]>()

  const products = rawProducts.map((p) => ({
    ...p,
    _id: (p._id as unknown as Types.ObjectId).toString(),
  }))

  return {
    products,
    totalProducts,
    from: skip + 1,
    to: skip + products.length,
    totalPages,
  }
}

/** Optional: keep your existing params interface */
export interface GetProductsByTextSearchParams {
  products: IProduct[]
  total: number
  page: number
  pages: number
}


// ✅ DRY helper to handle image search through API route
export async function getImageSearchResults(): Promise<IProduct[]> {
  try {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem("lastUploadedImage")
    if (!stored) return []

    const blob = await (await fetch(stored)).blob()
    const formData = new FormData()
    formData.append("image", blob, "upload.png")

    const res = await fetch("/api/products/image-search", {
      method: "POST",
      body: formData,
    })

    localStorage.removeItem("lastUploadedImage")

    if (!res.ok) return []
    return await res.json()
  } catch (err) {
    console.error("Image search error", err)
    return []
  }
}
