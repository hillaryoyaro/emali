// /types/product.ts

import { IProduct } from "@/src/lib/db/models/product.model"

export interface GetAllProductsParams {
  query: string
  category: string
  tag: string
  page: number
  limit: number
}

export interface GetAllProductsResult {
  products: IProduct[]
  total: number
  page: number
  pages: number
}

export interface GetProductsByTextSearchParams {
  products: IProduct[]
  total: number
  page: number
  pages: number
}


export interface LeanProduct {
  _id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  listPrice?: number
  avgRating: number
  numReviews: number
  tags: string[]
  images: string[]
  sizes: string[]
  colors: string[]
  countInStock: number
}
