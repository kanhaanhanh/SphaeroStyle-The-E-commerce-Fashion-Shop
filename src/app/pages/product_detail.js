"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  AiOutlineSwapRight,
  AiOutlineSwapLeft,
  AiOutlineHeart,
} from "react-icons/ai";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductItem from "../components/ProductItem"; // Adjust path if needed
import { addToFavorites, checkFavorite, removeFromFavorites } from "../components/FavoriteButton";
import { addToCart, checkCartItem, removeFromCart } from "../components/cartService"; // Import cart functions

const API = "http://localhost:5000";

export default function ProductDetailPage() {
  const { id: productID } = useParams();
  const [product, setProduct] = useState(null);
  const [details, setDetails] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');


  useEffect(() => {
  if (!productID) return;

  const fetchData = async () => {
    setLoading(true); // optional, you can set global loading here too
    try {
      // 1. Fetch product info + details
      const [detailsRes, productRes] = await Promise.all([
        axios.get(`${API}/api/product-details/product/${productID}`),
        axios.get(`${API}/api/products/${productID}`),
      ]);

      const parsedDetails = detailsRes.data.map((d) => ({
        ...d,
        image_urls: Array.isArray(d.image_urls)
          ? d.image_urls
          : (() => {
              try {
                return JSON.parse(d.image || "[]");
              } catch {
                return [];
              }
            })(),
      }));

      setDetails(parsedDetails);
      setProduct(productRes.data);

      // 2. Check if this product is favorited
      const isFav = await checkFavorite(productID);
      console.log(`🔍 Checking if product ${productID} is favorited:`, isFav);
      setIsFavorite(isFav);

      // 3️⃣ Check if product is in cart
      const isCartItem = await checkCartItem(productID);
      console.log(`🛒 Cart Check - Product ${productID}:`, isCartItem);
      setIsInCart(isCartItem);

      // 3. Fetch all products for related suggestion
      const relatedRes = await axios.get(`${API}/api/products/with-details`);
      const allProducts = relatedRes.data;

      const filtered = allProducts.filter(
        (p) =>
          p.product_id !== parseInt(productID) &&
          (p.collection === productRes.data.collection_name ||
            parseFloat(p.discount) === parseFloat(productRes.data.discount))
      );

      setRelatedProducts(filtered.slice(0, 4));

      // 4. Get unique colors & sizes
      const uniqueColorIDs = [
        ...new Set(parsedDetails.map((d) => d.color_id)),
      ];
      const uniqueSizeIDs = [...new Set(parsedDetails.map((d) => d.size_id))];

      const [colorsData, sizesData] = await Promise.all([
        Promise.all(
          uniqueColorIDs.map((id) => axios.get(`${API}/api/colors/${id}`))
        ),
        Promise.all(
          uniqueSizeIDs.map((id) => axios.get(`${API}/api/sizes/${id}`))
        ),
      ]);

      setColors(colorsData.map((res) => res.data));
      setSizes(sizesData.map((res) => res.data));
    } catch (error) {
      console.error("⚠️ Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [productID]);


  if (!product)
    return <p className="p-6 text-center text-gray-600">Loading...</p>;
  if (!details.length)
    return <p className="p-6 text-center text-gray-600">No variants found.</p>;

  const currentDetail = details[currentIndex];
  const colorData = colors.find((c) => c.color_id === currentDetail.color_id);
  const sizeData = sizes.find((s) => s.size_id === currentDetail.size_id);
  const colorName = colorData?.color_name || "N/A";
  const sizeName = sizeData?.size_name || currentDetail.size_id;

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? details.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === details.length - 1 ? 0 : prev + 1));

  const addToFavorite = async () => {
  const message = await addToFavorites(product.currentDetail.product_detail_id , null); // assuming accessoryId is null or not used here

  if (message === 'Authentication required') {
    alert('Please log in to add favorites.');
  } else if (message === 'Error adding to favorites') {
    alert('Failed to add to favorites. Please try again later.');
  } else {
    setIsFavorite(true);
    alert(message); // or you can set a message state to display nicely
  }
};


const handleFavoriteClick = async () => {
  setLoading(true);

  try {
    if (isFavorite) {
      const message = await removeFromFavorites(productID, null); // null if no accessory
      console.log("💔 Removed from favorites:", message);
      setIsFavorite(false);
    } else {
      const message = await addToFavorites(productID, null);
      console.log("❤️ Added to favorites:", message);
      setIsFavorite(true);
    }
  } catch (error) {
    console.error("❗ Favorite toggle error:", error);
  }

  setLoading(false);
};


const handleCartClick = async () => {
    setLoading(true);
    try {
      if (isInCart) {
        const message = await removeFromCart(product.product_id, null);
        console.log("❌ Removed from cart:", message);
        setIsInCart(false);
      } else {
        const message = await addToCart(
          product.product_id, 
          null, 
          currentDetail.price, 
          1, // Default quantity
          currentDetail.size_id, 
          currentDetail.color_id, 
          product.discount
        );
        console.log("🛒 Added to cart:", message);
        setIsInCart(true);
      }
    } catch (error) {
      console.error("❗ Cart toggle error:", error);
    }
    setLoading(false);
  };


  return (
    <>
      <Navbar />

      {/* Main Product Section */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="container mx-auto max-w-5xl bg-white rounded-lg shadow-lg p-3">
          <div className="flex justify-end mb-2">
            <p className="text-sm text-gray-400">{product.collection_name}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 min-h-[500px]">
            {/* Image Section */}
            <div className="relative w-full flex justify-center items-center flex-col">
              <p className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {currentIndex + 1}/{details.length}
              </p>
              <div className="relative w-full flex justify-center items-center flex-col px-2">
                {currentDetail.image_urls.length > 0 ? (
                  <img
                    src={
                      currentDetail.image_urls[0].startsWith("http")
                        ? currentDetail.image_urls[0]
                        : `${API}/uploads/${currentDetail.image_urls[0]}`
                    }
                    alt="Main Variant"
                    className="w-100 h-130 object-cover rounded-lg"
                  />
                ) : (
                  <p>No image</p>
                )}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4">
                <button
                  onClick={handlePrev}
                  className="text-2xl px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
                >
                  <AiOutlineSwapLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="text-2xl px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
                >
                  <AiOutlineSwapRight size={16} />
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="md:w-3/5 w-full flex flex-col justify-start px-2 pt-6">
              <h1 className="text-4xl font-extrabold mb-2">
                {product.product_name}
              </h1>
              {product.discount > 0 && (
                <p className="text-xl text-green-600 font-semibold mb-4">
                  Discount: {product.discount}%
                </p>
              )}
              {product.description && (
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Colors */}
              <div className="mb-4">
                <p className="text-gray-800 font-medium mb-1">Colors:</p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((color) => {
                    const isSelected =
                      color.color_id === currentDetail.color_id;
                    return (
                      <div
                        key={color.color_id}
                        onClick={() => {
                          const matchedIndex = details.findIndex(
                            (d) =>
                              d.color_id === color.color_id &&
                              d.size_id === currentDetail.size_id
                          );
                          if (matchedIndex !== -1) {
                            setCurrentIndex(matchedIndex);
                          } else {
                            alert(
                              "This color is not available in the selected size."
                            );
                          }
                        }}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer transition ${
                          isSelected
                            ? "ring-2 ring-green-500"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.color_name }}
                        title={color.color_name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-4">
                <p className="text-gray-800 font-medium mb-1">Sizes:</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => {
                    const isSelected =
                      size.size_id === currentDetail.size_id;
                    return (
                      <div
                        key={size.size_id}
                        onClick={() => {
                          const matchedIndex = details.findIndex(
                            (d) =>
                              d.size_id === size.size_id &&
                              d.color_id === currentDetail.color_id
                          );
                          if (matchedIndex !== -1) {
                            setCurrentIndex(matchedIndex);
                          } else {
                            alert(
                              "This size is not available in the selected color."
                            );
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-600 text-white border-2 border-blue-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {size.size_name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price & Buttons */}
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">
                  Price: <span className="font-normal">${currentDetail.price}</span>
                </p>
                <p className="text-gray-800 font-medium">
                  Quantity:{" "}
                  <span className="font-normal">{currentDetail.quantity}</span>
                </p>

                <div className="flex gap-4 mt-24">
                  <button
                    onClick={handleCartClick} // Calls the cart function
                    className={`font-bold w-3/4 py-3 px-8 rounded-lg transition ${
                      isInCart ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : isInCart ? "Remove from Cart" : "Add to Cart"}
                  </button>
                  <button
                      onClick={handleFavoriteClick} // Handles click event
                      className="flex items-center justify-center w-11 h-11 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                      disabled={loading}
                  >
                      {loading ? "Checking..." : <AiOutlineHeart className={`text-xl ${isFavorite ? "text-red-500" : "text-gray-400"}`} />}
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

          {relatedProducts.length === 0 ? (
            <p className="text-center text-gray-500">No related products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-12">
              {relatedProducts.map((p) => {
                let imagePath = p.image;
                if (imagePath && !imagePath.startsWith("http")) {
                  imagePath = `${API}/uploads/${imagePath}`;
                }

                return (
                  <ProductItem
                    key={p.product_id}
                    imageSrc={imagePath || "/placeholder.jpg"}
                    title={p.product_name || p.name || "Unnamed Product"}
                    price={p.price ? `${p.price}` : "No Price"}
                    link={`/product/${p.product_id}`}
                    discount={p.discount ? `${p.discount}` : "No Discount"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
