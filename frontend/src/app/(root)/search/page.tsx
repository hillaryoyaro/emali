
import Link from "next/link"

import Pagination from "@/src/components/shared/common/pagination"
import ProductCard from "@/src/components/shared/product/product-card"
import { Button } from "@/src/components/ui/button"
import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from "@/src/lib/actions/product.actions"
import { IProduct } from "@/src/lib/db/models/product.model"
import ProductSortSelector from "@/src/components/shared/product/product-sort-selector"
import { getFilterUrl, toSlug } from "@/src/lib/utils/utils"
import Rating from "@/src/components/shared/product/rating"
import CollapsibleOnMobile from "@/src/components/shared/common/collapsible-on-mobile"
import { getImageSearchResults } from "@/src/lib/actions/search.action"

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
]

const prices = [
  { name: "$1 to $20", value: "1-20" },
  { name: "$21 to $50", value: "21-50" },
  { name: "$51 to $1000", value: "51-1000" },
]



export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
    mode?: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    q = "all",
    category = "all",
    tag = "all",
    price = "all",
    rating = "all",
  } = searchParams

  if (
    (q !== "all" && q !== "") ||
    category !== "all" ||
    tag !== "all" ||
    rating !== "all" ||
    price !== "all"
  ) {
    return {
      title: `Search ${q !== "all" ? q : ""}${
        category !== "all" ? ` : Category ${category}` : ""
      }${tag !== "all" ? ` : Tag ${tag}` : ""}${
        price !== "all" ? ` : Price ${price}` : ""
      }${rating !== "all" ? ` : Rating ${rating}` : ""}`,
    }
  }
  return { title: "Search Products" }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
    mode?: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    q = "all",
    category = "all",
    tag = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
    mode = "text",
  } = searchParams

    // ✅ Convert rating to number or undefined
  const ratingNumber =
    rating !== "all" && rating.trim() !== "" ? Number(rating) : undefined

  const params = { q, category, tag, price, rating, sort, page }

  const categories = await getAllCategories()
  const tags = await getAllTags()

  let data: {
    products: IProduct[]
    totalPages: number
    totalProducts: number
    from: number
    to: number
  }

  if (mode === "image") {
    const imageResults = await getImageSearchResults()
    data = {
      products: imageResults,
      totalPages: 1,
      totalProducts: imageResults.length,
      from: 1,
      to: imageResults.length,
    }
  } else {
    data = await getAllProducts({
      category,
      tag,
      query: q,
      price,
      rating: ratingNumber,
      page: Number(page),
      sort,
    })
  }

  return (
    <div>
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row">
        <div className="flex items-center">
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          results
          {(q !== "all" && q !== "") ||
          category !== "all" ||
          tag !== "all" ||
          rating !== "all" ||
          price !== "all"
            ? ` for `
            : null}
          {q !== "all" && q !== "" && `"${q}"`}
          {category !== "all" && ` Category: ${category}`}
          {tag !== "all" && ` Tag: ${tag}`}
          {price !== "all" && ` Price: ${price}`}
          {rating !== "all" && ` Rating: ${rating} & up`}
          &nbsp;
          {(q !== "all" && q !== "") ||
          category !== "all" ||
          tag !== "all" ||
          rating !== "all" ||
          price !== "all" ? (
            <Button variant="link" asChild>
              <Link href="/search">Clear</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector sortOrders={sortOrders} sort={sort} params={params} />
        </div>
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-4">
        <CollapsibleOnMobile title="Filters">
          {/* Filters (Categories, Price, Rating, Tags) */}
          <div className="space-y-4">
            <div>
              <div className="font-bold">Department</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      category === "all" || category === "" ? "text-primary" : ""
                    }`}
                    href={getFilterUrl({ category: "all", params })}
                  >
                    All
                  </Link>
                </li>
                {categories.map((c: string) => (
                  <li key={c}>
                    <Link
                      className={`${c === category ? "text-primary" : ""}`}
                      href={getFilterUrl({ category: c, params })}
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-bold">Price</div>
              <ul>
                <li>
                  <Link
                    className={`${price === "all" ? "text-primary" : ""}`}
                    href={getFilterUrl({ price: "all", params })}
                  >
                    All
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      href={getFilterUrl({ price: p.value, params })}
                      className={`${p.value === price ? "text-primary" : ""}`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-bold">Customer Review</div>
              <ul>
                <li>
                  <Link
                    href={getFilterUrl({ rating: "all", params })}
                    className={`${rating === "all" ? "text-primary" : ""}`}
                  >
                    All
                  </Link>
                </li>
                <li>
                  <Link
                    href={getFilterUrl({ rating: "4", params })}
                    className={`${rating === "4" ? "text-primary" : ""}`}
                  >
                    <div className="flex">
                      <Rating size={4} rating={4} /> & Up
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold">Tag</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      tag === "all" || tag === "" ? "text-primary" : ""
                    }`}
                    href={getFilterUrl({ tag: "all", params })}
                  >
                    All
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link
                      className={`${toSlug(t) === tag ? "text-primary" : ""}`}
                      href={getFilterUrl({ tag: t, params })}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        <div className="md:col-span-4 space-y-4">
          <div>
            <div className="font-bold text-xl">Results</div>
            <div>Check each product page for other buying options</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.products.length === 0 && <div>No product found</div>}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <Pagination page={Number(page)} totalPages={data.totalPages} queryParams={params} />
          )}
        </div>
      </div>
    </div>
  )
}

