
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { SearchIcon, Camera, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/src/components/ui/hover-card";
import { Button } from "@/src/components/ui/button";
import { APP_NAME } from "@/src/lib/constants";
import { getAllCategories } from "@/src/lib/actions/product.actions";
import Image from "next/image";
import ImageUpload from "./imageUpload";
import LoadingOverlay from "../../common/loading-overlay";

interface Suggestion {
  id: string;
  name: string;
  image?: string | null;
}

export default function SearchBar() {
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [image, setImage] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
  }, []);

  // 🔎 Handle search (text + image)
  const handleSearch = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();

      // 🖼 Image search
      if (image) {
        setLoading(true);
        setImageSearchOpen(false);
        try {
          const fd = new FormData();
          fd.append("file", image);

          const imgRes = await fetch("/api/products/image-search", {
            method: "POST",
            body: fd,
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData?.results?.length > 0) {
              sessionStorage.setItem("searchResults", JSON.stringify(imgData));
              router.push("/search?image=true");
            } else {
              router.push("/not-found");
            }
          } else {
            router.push("/not-found");
          }
        } catch (err) {
          console.error("Image search failed", err);
          router.push("/not-found");
        } finally {
          setLoading(false);
          setImage(null);
        }
        return;
      }

      // 🔤 Text search
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query);
      if (category !== "all") params.set("category", category);

      router.push(`/search?${params.toString()}`);
    },
    [image, query, category, router]
  );

  // 👀 Watch for image uploads → auto trigger search
  useEffect(() => {
    if (!image) return;
    handleSearch();
  }, [image, handleSearch]);

  // 🔎 Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/text-search?mode=suggestions&q=${query}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  // 🔑 Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev === -1
          ? suggestions.length - 1
          : (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeIndex];
        setQuery(selected.name);
        setSuggestions([]);
        router.push(`/search?q=${encodeURIComponent(selected.name)}`);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  // 👇 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <LoadingOverlay show={loading} text="Searching..." />

      <div className="relative w-full">
        <form
          onSubmit={handleSearch}
          className="flex items-stretch h-10 space-x-1"
        >
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
              className="w-full rounded-none bg-gray-100 text-black text-base h-full pr-10"
              placeholder={`Search ${APP_NAME}`}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {suggestions.length > 0 && (
              <ul
                ref={dropdownRef}
                className="absolute z-50 bg-white text-black border rounded-md shadow-md max-h-80 overflow-y-auto left-0 right-0 w-[90vw] max-w-3xl mx-auto top-[calc(100%+12px)]"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer text-base ${
                      i === activeIndex
                        ? "bg-gray-100"
                        : "hover:bg-green-500 hover:text-white"
                    }`}
                    onClick={() => {
                      setSuggestions([]);
                      router.push(`/search?q=${encodeURIComponent(s.name)}`);
                    }}
                  >
                    <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="flex-1">{s.name}</span>
                    {s.image && (
                      <Image
                        src={s.image}
                        alt={s.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-md border flex-shrink-0"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Image search */}
          <HoverCard open={imageSearchOpen} onOpenChange={setImageSearchOpen}>
            <HoverCardTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-gray-200 h-full"
              >
                <Camera className="w-5 h-5 text-gray-600" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="relative w-80">
              <button
                type="button"
                onClick={() => setImageSearchOpen(false)}
                className="absolute right-2 top-2 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-semibold text-sm mb-2">Search By Image</h3>
              <p className="text-sm mb-2">
                Search smarter. Shop faster. Turn pictures into products
                instantly with {APP_NAME}.
              </p>
              <ImageUpload
                onFileSelect={(file) => {
                  setImage(file);
                }}
              />
              <p className="text-xs mt-2 text-gray-500">
                *Fast track your search: just CTRL+V your image for quick
                results.
              </p>
            </HoverCardContent>
          </HoverCard>

          <button
            type="submit"
            aria-label="Search"
            className="bg-primary text-black rounded-r-md h-full px-3 py-2"
          >
            <SearchIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </>
  );
}

