"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductItem from "../../components/ProductItem";

const API = "http://localhost:5000";

export default function WomenCategoryPage() {
  const [products, setProducts] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get dynamic params from [...params]
  const params = useParams();
  const pathSegments = params?.params || [];

  const selectedCollection = "women"; // fixed
  const selectedCategoryParam = pathSegments[0] || "";
  const selectedSubcategoryParam = pathSegments[1] || "";

  const [displayCategory, setDisplayCategory] = useState("");
  const [displaySubcategory, setDisplaySubcategory] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const productsRes = await fetch(`${API}/api/products/with-details`);
        if (!productsRes.ok)
          throw new Error(`Failed to fetch products: ${productsRes.statusText}`);
        const productsData = await productsRes.json();

        const formattedAll = Array.isArray(productsData)
          ? productsData.map((p) => {
              let imagePath = p.image;
              if (imagePath && !imagePath.startsWith("http")) {
                imagePath = `${API}/uploads/${imagePath}`;
              }
              return {
                id: p.product_id,
                imageSrc: imagePath || "/placeholder.jpg",
                title: p.name || p.product_name || "Unnamed Product",
                price: p.price ? `${p.price}` : "No Price",
                link: `/product/${p.product_id}`,
                discount: p.discount ? parseFloat(p.discount) : 0,
                collection: p.collection || "",
                category_name: p.category_name || "",
                sub_category_name: p.sub_category_name || "",
              };
            })
          : [];

        // ✅ Filter by category & subcategory
        const filtered = formattedAll.filter((p) => {
          const matchCollection = p.collection?.toLowerCase() === selectedCollection;
          const matchCategory = selectedCategoryParam
            ? p.category_name?.toLowerCase() === selectedCategoryParam.toLowerCase()
            : true;
          const matchSub = selectedSubcategoryParam
            ? p.sub_category_name?.toLowerCase() === selectedSubcategoryParam.toLowerCase()
            : true;
          return matchCollection && matchCategory && matchSub;
        });

        setProducts(filtered);

        // Determine display values
        let currentDisplayCategory = selectedCategoryParam;
        let currentDisplaySubcategory = selectedSubcategoryParam;

        if (!currentDisplayCategory && filtered.length > 0) {
          const uniqueCategories = [...new Set(filtered.map(p => p.category_name).filter(Boolean))];
          if (uniqueCategories.length === 1) currentDisplayCategory = uniqueCategories[0];
        }

        if (!currentDisplaySubcategory && filtered.length > 0) {
          const uniqueSubcategories = [...new Set(filtered.map(p => p.sub_category_name).filter(Boolean))];
          if (uniqueSubcategories.length === 1) currentDisplaySubcategory = uniqueSubcategories[0];
        }

        setDisplayCategory(currentDisplayCategory);
        setDisplaySubcategory(currentDisplaySubcategory);

        // ✅ Fetch colors and sizes
        const [colorsRes, sizesRes] = await Promise.all([
          fetch(`${API}/api/colors`),
          fetch(`${API}/api/sizes`)
        ]);
        if (!colorsRes.ok || !sizesRes.ok)
          throw new Error("Failed to fetch colors or sizes");
        const [colorsData, sizesData] = await Promise.all([
          colorsRes.json(),
          sizesRes.json(),
        ]);
        setColors(colorsData);
        setSizes(sizesData);

        // ✅ Fetch product variant details
        const productDetailsMapTemp = {};
        await Promise.all(filtered.map(async (product) => {
          const res = await fetch(`${API}/api/product-details/product/${product.id}`);
          productDetailsMapTemp[product.id] = res.ok ? await res.json() : [];
        }));
        setProductDetailsMap(productDetailsMapTemp);

      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedCategoryParam, selectedSubcategoryParam]);

  // ✅ Display breadcrumb title
  const pageTitle = useMemo(() => {
    const parts = [];
    if (selectedCollection) parts.push(<span key="collection" className="text-green-600">{selectedCollection}</span>);
    if (displayCategory) parts.push(<span key="cat" className="mx-2 text-gray-400">{'>'}</span>, <span key="category" className="text-green-600">{displayCategory}</span>);
    if (displaySubcategory) parts.push(<span key="sub" className="mx-2 text-gray-400">{'>'}</span>, <span key="subcategory" className="text-green-600">{displaySubcategory}</span>);
    return parts.length > 0 ? parts : <span className="text-gray-700">All Products</span>;
  }, [selectedCollection, displayCategory, displaySubcategory]);

  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-6 py-12">
        <p className="text-xl font-light capitalize mb-4 flex flex-wrap items-center">
          {pageTitle}
        </p>

        {error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No products found for this selection.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
      <Footer />
    </div>
  );
}
