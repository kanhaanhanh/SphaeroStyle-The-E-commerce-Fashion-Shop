"use client";

import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import {
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from "./FavoriteButton";
import {
  addToCart,
  removeFromCart,
  checkCartItem,
} from "./cartService";

const API = "http://localhost:5000";

const ProductItem = ({
  product_id,
  imageSrc,
  title,
  price,
  link,
  discount,
  variants = [],
  colors = [],
  sizes = [],
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const productIdNumeric = Number(product_id);

  const getColorById = (id) => colors.find((c) => c.color_id === id);
  const getSizeById = (id) => sizes.find((s) => s.size_id === id);

  const finalImageSrc =
    imageSrc && !imageSrc.startsWith("http")
      ? `${API}/uploads/${imageSrc}`
      : imageSrc || "https://placehold.co/400x400/E0E0E0/424242?text=No+Image";

  const originalPrice = parseFloat(price);
  const discountValue = parseFloat(discount);
  const discountedPrice =
    originalPrice > 0 && discountValue > 0
      ? originalPrice * (1 - discountValue / 100)
      : originalPrice;

  useEffect(() => {
    if (!productIdNumeric) return;

    const checkStatus = async () => {
      try {
        const [fav, cart] = await Promise.all([
          checkFavorite(product_id),
          checkCartItem(productIdNumeric),
        ]);
        setIsFavorite(fav);
        setIsInCart(cart);
      } catch (error) {
        console.error("Error checking product status:", error);
      }
    };

    checkStatus();
  }, [productIdNumeric]);

  const handleFavoriteClick = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(productIdNumeric, null);
        setIsFavorite(false);
      } else {
        await addToFavorites(productIdNumeric, null);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCartClick = async () => {
    if (variants.length > 1 && !selectedVariant) {
      setShowVariantModal(true);
      return;
    }

    setLoading(true);
    try {
      if (isInCart) {
        await removeFromCart(productIdNumeric, null);
        setIsInCart(false);
      } else {
        const variant = selectedVariant || variants[0];
        await addToCart(
          productIdNumeric,
          null,
          variant.price || originalPrice,
          1,
          variant.size_id,
          variant.color_id,
          discountValue
        );
        setIsInCart(true);
      }
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setLoading(false);
      setShowVariantModal(false);
    }
  };

  return (
    <>
      <div className="w-[300px] h-[480px] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col font-sans">
        <a href={link || "/default-product-link"} className="w-full h-3/5 relative block">
          <img
            src={finalImageSrc}
            alt={title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x400/E0E0E0/424242?text=No+Image";
            }}
          />
          {discountValue > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-bl-[15px]">
              -{discountValue}%
            </div>
          )}
        </a>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-gray-800 truncate">{title}</h3>
          <div className="mt-2 text-lg font-bold flex items-baseline">
            {discountValue > 0 && originalPrice > 0 ? (
              <>
                <p className="text-green-600 mr-2">${discountedPrice.toFixed(2)}</p>
                <p className="text-gray-500 line-through text-base">${originalPrice.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-green-600">${originalPrice.toFixed(2)}</p>
            )}
          </div>

          {variants.length > 0 ? (
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex space-x-2">
                {[...new Set(variants.map((v) => v.color_id))].map((colorId) => {
                  const color = getColorById(colorId);
                  return (
                    <div
                      key={colorId}
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: color?.color_name || "#ccc" }}
                      title={color?.color_name || "Unknown"}
                    />
                  );
                })}
              </div>
              <span className="text-gray-400 font-bold">|</span>
              <div className="flex space-x-2 text-sm font-medium text-gray-700">
                {[...new Set(variants.map((v) => v.size_id))].map((sizeId) => {
                  const size = getSizeById(sizeId);
                  return <span key={sizeId}>{size?.size_name || "-"}</span>;
                })}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-500 text-sm">No variants available</p>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleFavoriteClick}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              className="transition-colors duration-200"
              disabled={loading}
            >
              <Heart
                className="w-5 h-5"
                color={isFavorite ? "red" : "gray"}
                fill={isFavorite ? "red" : "none"}
              />
            </button>

            <button
              type="button"
              onClick={handleCartClick}
              title={isInCart ? "Remove from Cart" : "Add to Cart"}
              className={`flex items-center px-3 py-1 ${
                isInCart ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              } text-white text-sm rounded-lg transition-colors duration-200`}
              disabled={loading}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Remove
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Choose Variant</h2>

            <div className="mb-4">
              <label className="block mb-2">Color:</label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const colorId = Number(e.target.value);
                  const sizeId = selectedVariant?.size_id || variants[0].size_id;
                  const matched = variants.find(
                    (v) => v.color_id === colorId && v.size_id === sizeId
                  );
                  setSelectedVariant(matched);
                }}
              >
                <option value="">-- Choose Color --</option>
                {[...new Set(variants.map((v) => v.color_id))].map((colorId) => {
                  const color = getColorById(colorId);
                  return (
                    <option key={colorId} value={colorId}>
                      {color?.color_name || "Unknown"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Size:</label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const sizeId = Number(e.target.value);
                  const colorId = selectedVariant?.color_id || variants[0].color_id;
                  const matched = variants.find(
                    (v) => v.size_id === sizeId && v.color_id === colorId
                  );
                  setSelectedVariant(matched);
                }}
              >
                <option value="">-- Choose Size --</option>
                {[...new Set(variants.map((v) => v.size_id))].map((sizeId) => {
                  const size = getSizeById(sizeId);
                  return (
                    <option key={sizeId} value={sizeId}>
                      {size?.size_name || "Unknown"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowVariantModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleCartClick}
                disabled={!selectedVariant}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductItem;
