'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/src/components/ui/input'
import { SearchIcon, CameraIcon } from 'lucide-react'
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
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {
        /* optional toast */
      })
  }, [])

  // 🔎 Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(`/api/products/text-search?mode=suggestions&q=${query}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
          setActiveIndex(-1)
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()

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

    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query)
    if (category !== 'all') params.set('category', category)

    router.push(`/search?${params.toString()}`)
  }

  // 🔑 Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === -1 ? suggestions.length - 1 : (prev - 1 + suggestions.length) % suggestions.length
      )
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault()
        const selected = suggestions[activeIndex]
        setQuery(selected.name)
        setSuggestions([])
        router.push(`/search?q=${encodeURIComponent(selected.name)}`)
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  // 👇 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full">
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
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-none bg-gray-100 text-black text-base h-full"
            placeholder={`Search ${APP_NAME}`}
          />

          {/* 🔽 Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul
              ref={dropdownRef}
              className="absolute z-50 bg-white text-black border rounded-md mt-1 w-full shadow-md max-h-60 overflow-y-auto"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                    i === activeIndex ? 'bg-white text-black' : 'hover:bg-green-500'
                  }`}
                  onClick={() => {
                    setQuery(s.name)
                    setSuggestions([])
                    router.push(`/search?q=${encodeURIComponent(s.name)}`)
                  }}
                >
                  <SearchIcon className="w-4 h-4 text-gray-500" />
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Camera picker */}
        <label className="bg-gray-200 px-3 flex items-center cursor-pointer">
          <CameraIcon className="w-5 h-5 text-gray-600" />
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
    </div>
  )
}
