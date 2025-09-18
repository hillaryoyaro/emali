'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/src/components/ui/input'
import { SearchIcon, ImageIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { APP_NAME } from '@/src/lib/constants'
import { getAllCategories } from '@/src/lib/actions/product.actions'

export default function SearchBar() {
  const [categories, setCategories] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {
        /* optional toast */
      })
  }, [])

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // --- If image is selected → always use image search API ---
    if (image) {
      const fd = new FormData()
      fd.append('file', image)
      const imgRes = await fetch('/api/products/image-search', {
        method: 'POST',
        body: fd,
      })
      if (imgRes.ok) {
        const imgData = await imgRes.json()
        sessionStorage.setItem('searchResults', JSON.stringify(imgData))
        router.push('/search?image=true')
      }
      return
    }

    // --- Build query string for text search ---
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query)
    if (category !== 'all') params.set('category', category)

    const searchUrl = `/search?${params.toString()}`

    try {
      // 1️⃣ Try SSR (navigate directly → Next.js will render on server)
      router.push(searchUrl)
    } catch (err) {
      console.warn('SSR search navigation failed, falling back to API', err)

      // 2️⃣ Fallback → call text-search API
      const apiRes = await fetch(`/api/products/text-search?${params.toString()}`)
      if (apiRes.ok) {
        const results = await apiRes.json()
        sessionStorage.setItem('searchResults', JSON.stringify(results))
        router.push(searchUrl)
      } else {
        console.error('Text-search API also failed')
      }
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-stretch h-10 space-x-1">
      {/* Category select */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-auto h-full bg-gray-100 text-black border-r rounded-l-md">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">All</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Text field */}
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-none bg-gray-100 text-black text-base h-full"
        placeholder={`Search ${APP_NAME}`}
      />

      {/* Image picker */}
      <label className="bg-gray-200 px-3 flex items-center cursor-pointer">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </label>

      {/* Submit */}
      <button
        type="submit"
        aria-label="Search"
        className="bg-primary text-black rounded-r-md h-full px-3 py-2"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  )
}
