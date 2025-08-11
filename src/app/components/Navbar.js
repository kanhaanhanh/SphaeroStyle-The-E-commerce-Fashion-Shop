"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "../assets/Logo.png";
import { FaSearch, FaUserAlt, FaHeart, FaShoppingBag } from "react-icons/fa";

const Navbar = () => {
  const pathname = usePathname();
  const [category, setCategory] = useState("women"); // collection: "women" or "men"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [categories, setCategories] = useState([]); // categories + filtered subcategories
  const [visibleDropdown, setVisibleDropdown] = useState(null);

  // Helper to normalize strings for matching
  const normalize = (str) => str?.toLowerCase().trim() || "";

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    if (loggedInStatus === "true") {
      const firstName = localStorage.getItem("firstName") || "";
      const lastName = localStorage.getItem("lastName") || "";
      setIsLoggedIn(true);
      setUserName(`${firstName} ${lastName}`.trim());
    }
  }, []);

  useEffect(() => {
    // Fetch categories, subcategories, and products with details
    const fetchData = async () => {
      try {
        const [catRes, subRes, productsRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/subcategories"),
          fetch("http://localhost:5000/api/products/with-details"),
        ]);

        if (!catRes.ok || !subRes.ok || !productsRes.ok)
          throw new Error("Failed to fetch");

        const categoriesData = await catRes.json();
        const subcategoriesData = await subRes.json();
        const productsData = await productsRes.json();

        // Normalize collection filter (women or men)
        const currentCollection = normalize(category);

        // Filter products by current collection only
        const filteredProducts = productsData.filter(
          (p) => normalize(p.collection) === currentCollection
        );

        // Build a map of categories to subcategories that have products in this collection
        // Use normalized category and subcategory names for matching
        const categoryMap = {};

        filteredProducts.forEach((product) => {
          const catName = normalize(product.category_name);
          const subName = normalize(product.sub_category_name);

          if (!categoryMap[catName]) categoryMap[catName] = new Set();
          if (subName) categoryMap[catName].add(subName);
        });

        // Combine categories and only include subcategories that exist in products for this collection
        const combined = categoriesData.map((cat) => {
          const catNameNorm = normalize(cat.category_name);

          // Filter subcategories for this category
          const filteredSubs = subcategoriesData
            .filter(
              (sub) =>
                parseInt(sub.category_id) === parseInt(cat.category_id) &&
                categoryMap[catNameNorm] &&
                categoryMap[catNameNorm].has(normalize(sub.sub_category_name))
            )
            .map((sub) => ({
              id: sub.sub_category_id,
              name: sub.sub_category_name, // display original name
            }));

          return {
            ...cat,
            subcategories: filteredSubs,
          };
        });

        setCategories(combined);
      } catch (err) {
        console.error("Failed to fetch categories, subcategories, or products:", err);
      }
    };

    fetchData();
  }, [category]); // refetch when collection changes (women/men)

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    window.location.href = "/";
  };

  const toggleDropdown = (categoryName) => {
    setVisibleDropdown((prev) => (prev === categoryName ? null : categoryName));
  };

  // Determine active category based on current path
  const activeCategoryFromPath = categories.find((cat) =>
    pathname?.toLowerCase().includes(`/${category}/${cat.category_name.toLowerCase()}`)
  )?.category_name;

  return (
    <header>
      {/* Top Navbar */}
      <div className="bg-[#12372A] text-white px-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 py-2">
            <Image
              src={Logo}
              alt="SphaeroStyle Logo"
              className="h-10 w-10 rounded-full"
            />
            <span className="text-xl font-semibold">SphaeroStyle</span>
          </div>

          {/* Women & Men Buttons */}
          <div className="relative flex ml-4 font-bold">
            <button
              className={`px-4 py-4 ${
                category === "women"
                  ? "bg-[#436850]"
                  : "bg-[#12372A] hover:bg-[#436850]"
              }`}
              onClick={() => setCategory("women")}
            >
              Women
            </button>
            <button
              className={`px-8 py-4 ${
                category === "men"
                  ? "bg-[#436850]"
                  : "bg-[#12372A] hover:bg-[#436850]"
              }`}
              onClick={() => setCategory("men")}
            >
              Men
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center flex-grow">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search products"
              className="bg-white text-gray-700 px-3 py-2 pl-10 rounded-lg w-full focus:outline-none"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile/account">
                {/* <FaUserAlt className="h-10 w-10 text-white rounded-full p-2 bg-gray-600 cursor-pointer" /> */}
              
              <span>{userName}</span>
              </Link>
              <button onClick={handleLogout} className="underline cursor-pointer">
                Logout
              </button>
              <Link href="/favorites">
                <FaHeart className="h-6 w-6 cursor-pointer" />
              </Link>
              <Link href="/cart">
                <FaShoppingBag className="h-6 w-6 cursor-pointer" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <FaUserAlt className="h-10 w-10 text-white rounded-full p-2 bg-gray-600" />
              <div className="flex space-x-2">
                <Link href="/login" className="underline">
                  Login
                </Link>
                <span>/</span>
                <Link href="/signup" className="underline">
                  Signup
                </Link>
              </div>
              <Link href="/favorites">
                <FaHeart className="h-6 w-6 cursor-pointer" />
              </Link>
              <Link href="/cart">
                <FaShoppingBag className="h-6 w-6 cursor-pointer" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navbar */}
      <nav className="bg-[#436850] text-white px-6 py-2">
        <ul className="flex space-x-6 items-center">
          <li>
            <Link
              href="/"
              onClick={() => setVisibleDropdown(null)}
              className={`hover:text-[#12372A] px-3 font-bold ${
                pathname === "/" ? "text-[#12372A]" : "text-white"
              }`}
            >
              HOME
            </Link>
          </li>

          {categories.map((cat) => (
            <li key={cat.category_id} className="relative">
              <button
                onClick={() => toggleDropdown(cat.category_name)}
                className={`hover:text-[#12372A] font-bold ${
                  activeCategoryFromPath === cat.category_name
                    ? "text-[#12372A]"
                    : ""
                }`}
              >
                {cat.category_name.charAt(0).toUpperCase() +
                  cat.category_name.slice(1)}
              </button>

              {visibleDropdown === cat.category_name && cat.subcategories.length > 0 && (
                <div
                  className="fixed left-6 top-24 bg-white text-gray-700 shadow-lg rounded-md z-[9999] overflow-hidden px-4"
                  style={{ minWidth: "300px" }}
                >
                  <div className="grid grid-cols-5 gap-2 p-4">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${category}/${cat.category_name.toLowerCase()}/${sub.name.toLowerCase()}`}
                        className="block px-2 py-1 hover:bg-gray-100 font-normal text-sm"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
