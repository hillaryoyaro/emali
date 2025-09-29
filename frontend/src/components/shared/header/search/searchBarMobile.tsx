
"use client";

import React, { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBarMobile() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-stretch h-10 w-full">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-l-md bg-gray-100 text-black"
        placeholder="Search..."
      />
      <Button type="submit" className="rounded-r-md bg-primary text-black px-3">
        <SearchIcon className="w-5 h-5" />
      </Button>
    </form>
  );
}

