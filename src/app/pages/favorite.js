"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { removeFromFavorites } from "../components/FavoriteButton";

const API = "http://localhost:5000";

export default function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchFavoritesData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const accessToken = user?.accessToken || "";

      if (!accessToken) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Fetch favorites
      const favoritesRes = await axios.get(`${API}/api/favorites`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const favoritesData = favoritesRes.data;

      // Fetch product-details
      const productsDetailsRes = await axios.get(`${API}/api/product-details`);
      const allProductDetails = productsDetailsRes.data;

      // Fetch products (for product_name)
      const productsRes = await axios.get(`${API}/api/products`);
      const allProducts = productsRes.data;

      // Merge favorites with productDetails and productName
      const mergedFavorites = favoritesData.map((favItem) => {
        const productDetails = allProductDetails.find(
          (p) => p.product_id === favItem.product_id
        );
        const product = allProducts.find((p) => p.product_id === favItem.product_id);
        return {
          ...favItem,
          productDetails,
          productName: product?.product_name || "Unknown Product",
        };
      });

      setFavorites(mergedFavorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  };

  fetchFavoritesData();
}, []);

  // Remove favorite handler
  const handleRemoveFavorite = async (e, productId) => {
    e.preventDefault();
    const msg = await removeFromFavorites(productId, null);
    console.log(msg);
    setFavorites((prev) => prev.filter((f) => f.productDetails?.product_id !== productId));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h2 className="text-3xl font-bold mb-6 text-[#12372A] text-start">Your Favorites</h2>

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-600 text-center">No favorite items yet.</p>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-56 max-w-[900px]">
            {favorites.map((item) => (
              <div key={item.product_id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl w-[250px] relative">
                {/* Wrap the product info in Link */}
                <Link href={`/product/${item.product_id}`}>
                  <div>
                    <div className="relative w-full h-[300px] rounded-t-2xl overflow-hidden">
                      <Image
                        src={item.productDetails?.image_urls?.[0] || "/default-placeholder.jpg"}
                        alt={item.productDetails?.name || "Favorite Item"}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="p-3">
                      <h2 className="text-sm font-semibold">{item.productName}</h2>
                      <p className="text-[#12372A] font-bold text-sm">{item.productDetails?.price || "Unknown Price"}</p>

                      <button
                        onClick={() => handleAddToCart(item.productDetails?.product_id)}
                        className="mt-2 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 transition"
                        aria-label={`Add ${item.productName} to cart`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Remove favorite icon button, outside Link */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, item.productDetails?.product_id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  title="Remove from Favorites"
                  aria-label="Remove from Favorites"
                >
                  <AiOutlineHeart size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
