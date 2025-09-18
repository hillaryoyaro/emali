'use server'

import { connectToDatabase } from '@/src/lib/db'
import Product, { IProduct } from '@/src/lib/db/models/product.model'

// =========================
//      TYPES & CONSTANTS
// =========================
export interface GetAllProductsParams {
  query?: string
  category?: string
  tag?: string
  page: number
  limit?: number
  price?: string        // e.g. "10-50"
  rating?: number       // numeric value (e.g. 4)
  sort?: string
  filters?: Record<string, unknown>// <-- add this
}

export interface GetAllProductsResult {
  products: IProduct[]
  totalPages: number
  totalProducts: number
  from: number
  to: number
}

const PAGE_SIZE = 10

// =========================
//      ACTIONS
// =========================

// ADMIN: all products
export async function getAllProductsForAdmin() {
  await connectToDatabase()
  return Product.find({ isPublished: true }).distinct('category')
}

// all categories
export async function getAllCategories() {
  await connectToDatabase()
  return Product.find({ isPublished: true }).distinct('category')
}

// products for card
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ['/product/', '$slug'] },
      image: { $arrayElemAt: ['$images', 0] },
    }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as {
    name: string
    href: string
    image: string
  }[]
}

// products by tag
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)

  return JSON.parse(JSON.stringify(products)) as IProduct[]
}

// product by slug
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true })
  if (!product) throw new Error('Product not found')
  return JSON.parse(JSON.stringify(product)) as IProduct
}

// related products
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = PAGE_SIZE,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  await connectToDatabase()
  const skipAmount = (page - 1) * limit
  const conditions = { isPublished: true, category, _id: { $ne: productId } }

  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)

  const total = await Product.countDocuments(conditions)
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(total / limit),
  }
}

// =========================
//   MAIN SEARCH ACTION
// =========================
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: GetAllProductsParams): Promise<GetAllProductsResult> {
  const perPage = limit ?? PAGE_SIZE
  await connectToDatabase()

  // filters
  const queryFilter =
    query && query !== 'all'
      ? { name: { $regex: query, $options: 'i' } }
      : {}

  const categoryFilter =
    category && category !== 'all' ? { category } : {}

  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const ratingFilter =
    typeof rating === 'number'
      ? { avgRating: { $gte: rating } }
      : {}

  const priceFilter =
    price && price !== 'all'
      ? (() => {
          const [min, max] = price.split('-').map((p) => Number(p))
          return { price: { $gte: min, $lte: max } }
        })()
      : {}

  // sort options
  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
      ? { price: 1 }
      : sort === 'price-high-to-low'
      ? { price: -1 }
      : sort === 'avg-customer-review'
      ? { avgRating: -1 }
      : { _id: -1 }

  const isPublished = { isPublished: true }

  // query db
  const products = await Product.find({
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(order)
    .skip(perPage * (page - 1))
    .limit(perPage)
    .lean<IProduct[]>()

  const count = await Product.countDocuments({
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(count / perPage),
    totalProducts: count,
    from: perPage * (page - 1) + 1,
    to: perPage * (page - 1) + products.length,
  }
}

// =========================
//      TAGS
// =========================
export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ])

  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      ) as string[]) || []
  )
}
