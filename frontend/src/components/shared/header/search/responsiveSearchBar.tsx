
"use client";

import React, { useEffect, useState } from "react";
import SearchBarMobile from "./searchBarMobile";
import SearchBarDesktop from "./searchBarDesktop";


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

