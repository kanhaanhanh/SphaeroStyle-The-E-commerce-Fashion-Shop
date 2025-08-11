"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SubNavbar() {
  const [activeCategory, setActiveCategory] = useState("women"); // Default category is "Women"

  useEffect(() => {
    // Automatically set "Women" as the default category on page load
    setActiveCategory("women");
  }, []);

  const categories = [
    { id: "home", name: "Home" },
    { id: "clothing", name: "Clothing" },
    { id: "shoes", name: "Shoes" },
    { id: "accessories", name: "Accessories" },
    { id: "women", name: "Women" },
    { id: "men", name: "Men" },
  ];

  return (
    <div className="flex bg-[#12372A] text-white p-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`px-4 py-2 rounded 
            ${activeCategory === category.id ? "bg-green-500 text-white" : "bg-transparent text-white"} 
            hover:bg-gray-500 transition`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
