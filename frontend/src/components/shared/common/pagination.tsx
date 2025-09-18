'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  totalPages: number
  queryParams?: Record<string, string | number | undefined>
}

export default function Pagination({ page, totalPages, queryParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  // helper to generate new URLs with query params
  const createUrl = (newPage: number) => {
    const params = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== 'all' && value !== '') {
        params.set(key, String(value))
      }
    })

    params.set('page', String(newPage))
    return `/search?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previous */}
      {page > 1 && (
        <Link
          href={createUrl(page - 1)}
          className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-accent"
        >
          <ChevronLeft size={18} /> Previous
        </Link>
      )}

      <span>
        Page {page} of {totalPages}
      </span>

      {/* Next */}
      {page < totalPages && (
        <Link
          href={createUrl(page + 1)}
          className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-accent"
        >
          Next <ChevronRight size={18} />
        </Link>
      )}
    </div>
  )
}
