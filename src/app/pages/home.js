"use client";

import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../pages/heroSection";
import ProductItem from "../components/ProductItem";
import dayjs from "dayjs";

const API = "http://localhost:5000";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topDiscounts, setTopDiscounts] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
  const fetchAllData = async () => {
    try {
      // 1️⃣ Fetch products (with details)
      const productsRes = await fetch(`${API}/api/products/with-details`);
      if (!productsRes.ok)
        throw new Error(`Failed to fetch products, status: ${productsRes.status}`);
      const productsData = await productsRes.json();

      // 2️⃣ Fetch raw product list (for created_at)
      const productsListRes = await fetch(`${API}/api/products`);
      if (!productsListRes.ok)
        throw new Error(`Failed to fetch raw product list, status: ${productsListRes.status}`);
      const productsList = await productsListRes.json();

      // 3️⃣ Create a map of product_id → created_at
      const createdAtMap = new Map();
      if (Array.isArray(productsList)) {
        productsList.forEach((p) => {
          if (p.product_id && p.created_at) {
            createdAtMap.set(p.product_id, new Date(p.created_at));
          }
        });
      }

      // 4️⃣ Format products with image path + created_at injected
      const formattedProducts = Array.isArray(productsData)
        ? productsData.map((p) => {
            let imagePath = p.image;
            if (imagePath && !imagePath.startsWith("http")) {
              imagePath = `${API}/uploads/${imagePath}`;
            }

            return {
              id: p.product_id,
              imageSrc: imagePath || "/placeholder.jpg",
              title: p.name || "Unnamed Product",
              price: p.price ? `${p.price}` : "No Price",
              link: `/product/${p.product_id}`,
              discount: p.discount ? parseFloat(p.discount) : 0,
              createdAt: createdAtMap.get(p.product_id) || new Date(), // fallback
            };
          })
        : [];

      // 5️⃣ Sort for new arrivals
      const sortedByDate = [...formattedProducts].sort(
        (a, b) => b.createdAt - a.createdAt
      );
      setNewArrivals(sortedByDate.slice(0, 8));

      // 6️⃣ Sort for top discounts
      const sortedByDiscount = [...formattedProducts]
        .filter((p) => p.discount > 0)
        .sort((a, b) => b.discount - a.discount);
      setTopDiscounts(sortedByDiscount.slice(0, 8));

      setProducts(formattedProducts);

      // 7️⃣ Fetch color list
      const colorsRes = await fetch(`${API}/api/colors`);
      if (!colorsRes.ok)
        throw new Error(`Failed to fetch colors, status: ${colorsRes.status}`);
      const colorsData = await colorsRes.json();
      setColors(colorsData);

      // 8️⃣ Fetch size list
      const sizesRes = await fetch(`${API}/api/sizes`);
      if (!sizesRes.ok)
        throw new Error(`Failed to fetch sizes, status: ${sizesRes.status}`);
      const sizesData = await sizesRes.json();
      setSizes(sizesData);

      // 9️⃣ Fetch product details per product
      const productDetailsMapTemp = {};
      for (const product of formattedProducts) {
        const detailsRes = await fetch(`${API}/api/product-details/product/${product.id}`);
        if (!detailsRes.ok) {
          productDetailsMapTemp[product.id] = [];
          continue;
        }
        const detailsData = await detailsRes.json();
        productDetailsMapTemp[product.id] = detailsData || [];
      }
      setProductDetailsMap(productDetailsMapTemp);

    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load products and related data. Please try again later.");
    }
  };

  fetchAllData();
}, []);


  const renderSection = (title, items, moreLink) => (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <a href={moreLink} className="text-blue-500 hover:underline">
          More →
        </a>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.slice(0, 8).map((product) => (
            <ProductItem
              key={product.id}
              product_id={product.id}
              imageSrc={product.imageSrc}
              title={product.title}
              price={product.price}
              discount={product.discount}
              link={product.link}
              variants={productDetailsMap[product.id] || []}
              colors={colors}
              sizes={sizes}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <NavBar />
      <HeroSection />

      <div className="container mx-auto px-6 py-12">
        {error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : (
          <>
            {renderSection("🆕 New Arrivals", newArrivals, "/products/new-arrivals")}
            {renderSection("🔥 Top Discounts", topDiscounts, "/products/top-discounts")}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
