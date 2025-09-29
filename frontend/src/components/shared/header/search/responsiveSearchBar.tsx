
"use client";

import React, { useEffect, useState } from "react";

import SearchBarDesktop from "./searchBarDesktop";
import SearchBarMobile from "./searchBarMobile";


export default function ResponsiveSearchBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile ? <SearchBarMobile /> : <SearchBarDesktop />;
}

