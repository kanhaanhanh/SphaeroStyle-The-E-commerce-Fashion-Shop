//src/app/pages/my_bag.js
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { FaTrashAlt, FaHeart } from "react-icons/fa";
import PaymentModal from "../components/PaymentModal";
import AbaPayPopup from "../components/checkout/AbaPayPopup";

const API = "http://localhost:5000"; // Update API URL

export default function MyBagPage() {
  const [bagItems, setBagItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showAbaPopup, setShowAbaPopup] = useState(false);

  // Get user from localStorage once on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      if (!user?.accessToken) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // 1️⃣ Fetch cart items
      const cartRes = await axios.get(`${API}/api/add-to-carts`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const cartData = cartRes.data;

      // 2️⃣ Fetch product details
      const productDetailsRes = await axios.get(`${API}/api/product-details`);
      const allProductDetails = productDetailsRes.data;

      // 3️⃣ Fetch products (for name & discount)
      const productsRes = await axios.get(`${API}/api/products`);
      const allProducts = productsRes.data;

      // 5️⃣ Fetch colors
      const colorsRes = await axios.get(`${API}/api/colors`);
      const allColors = colorsRes.data;

      // 6️⃣ Fetch sizes
      const sizesRes = await axios.get(`${API}/api/sizes`);
      const allSizes = sizesRes.data;

      // 4️⃣ Merge cart items with product name & details
      const mergedCartItems = cartData.map((cartItem) => {
        const productDetails = allProductDetails.find(
          (p) => p.product_id === cartItem.product_id
        );
        const product = allProducts.find(
          (p) => p.product_id === cartItem.product_id
        );
        const color = allColors.find((c) => c.color_id === cartItem.color_id);
        const size = allSizes.find((s) => s.size_id === cartItem.size_id);

        return {
          ...cartItem,
          productDetails,
          productName: product?.product_name || "Unknown Product",
          discount: product?.discount || 0,
          color_name: color?.color_name || "",
          size_name: size?.size_name || "",
          name: product?.product_name || "Unknown Product", // add 'name' for display
        };
      });

      setBagItems(mergedCartItems);
      setError("");
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchCartItems();

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API}/api/user-addresses/${user.user_id}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
        } else {
          console.error("Failed to fetch addresses, status:", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };

    fetchAddresses();
  }, [user]);

  const removeItem = async (productId, accessoryId) => {
    try {
      if (!user?.accessToken) {
        setError("Authentication required");
        return;
      }

      await axios.delete(`${API}/api/add-to-carts`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        data: { product_id: productId, product_accessory_id: accessoryId },
      });

      setBagItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(item.product_id === productId && item.product_accessory_id === accessoryId)
        )
      );
      setError("");
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError("Failed to remove item.");
    }
  };

  const updateQuantity = async (productId, accessoryId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent negative quantities

    try {
      if (!user?.accessToken) {
        setError("Authentication required");
        return;
      }

      await axios.put(
        `${API}/api/add-to-carts`,
        {
          product_id: productId,
          product_accessory_id: accessoryId,
          quantity: newQuantity,
        },
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );

      setBagItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId && item.product_accessory_id === accessoryId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setError("");
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity.");
    }
  };

  const subtotal = bagItems.reduce(
    (sum, item) =>
      sum + (item.price - item.price * (item.discount / 100)) * Number(item.quantity),
    0
  );
  const delivery = 2.0;
  const total = subtotal + delivery;

//aba pay
const openPaymentModal = () => {
  if (!selectedAddressId) {
    alert("Please select a delivery address before checkout.");
    return;
  }
  setSelectedTotal(total);
  setShowModal(true);
};

  const handleSelectPayment = (method) => {
    setSelectedPaymentMethod(method);
    setShowModal(false);

    if (method === "ABA PAY") {
      setShowAbaPopup(true);
    }
    // Future: handle other payment methods here
  };

  // Add a helper to find full address string from selectedAddressId
const getSelectedAddressString = () => {
  const addr = addresses.find(a => a.user_address_id === selectedAddressId);
  if (!addr) return "";
  return `${addr.username}, ${addr.phone_number}, ${addr.address}, ${addr.city}, ${addr.country}`;
};

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#12372A] mb-6">My Bag</h1>

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : bagItems.length === 0 ? (
        <p className="text-gray-600 text-center">Your bag is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Bag Items */}
          <div className="lg:col-span-2 space-y-4">
            {bagItems.map((item) => (
              <div
                key={`${item.product_id}-${item.product_accessory_id}`}
                className="flex items-start gap-4 border rounded-xl p-4 bg-white"
              >
                <img
                  src={item.productDetails?.image_urls?.[0] || "/default-placeholder.jpg"}
                  alt={item.name}
                  className="w-42 h-60 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-red-500 font-bold">
                    $
                    {Number(item.price - (item.price * item.discount) / 100).toFixed(2)}
                    <span className="text-gray-400 text-sm">
                      {" "}
                      (Original: ${Number(item.price).toFixed(2)} - {item.discount}% off)
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    {item.productName}
                    {item.color_name && (
                      <>
                        |{" "}
                        <span
                          className="w-4 h-4 rounded-full inline-block border"
                          style={{ backgroundColor: item.color_name }}
                          title={item.color_name || "Color"}
                        />
                      </>
                    )}
                    {item.size_name && `| ${item.size_name}`}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-gray-700 hover:text-black text-sm">
                      <FaHeart className="text-black" /> Add to favorite
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.product_accessory_id, item.quantity - 1)
                        }
                        className="border px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <p className="text-sm">{item.quantity}</p>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.product_accessory_id, item.quantity + 1)
                        }
                        className="border px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id, item.product_accessory_id)}
                      className="text-red-500 text-lg"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Section - Summary */}
          <div className="border p-4 rounded-xl bg-white shadow space-y-4">
            <h2 className="text-xl font-bold">Summary</h2>
            <div className="space-y-1">
              <p>
                Subtotal: <span className="float-right">${subtotal.toFixed(2)}</span>
              </p>
              <p>
                Delivery fee: <span className="float-right">${delivery.toFixed(2)}</span>
              </p>
              <hr />
              <p className="font-bold">
                Total: <span className="float-right">${total.toFixed(2)}</span>
              </p>
            </div>
            <button onClick={openPaymentModal} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              CHECK OUT
            </button>
            {/* <p className="text-sm text-gray-600 text-center">WE ACCEPT:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Image src="/visa.png" alt="Visa" width={40} height={25} />
              <Image src="/paypal.png" alt="PayPal" width={40} height={25} />
              <Image src="/amex.png" alt="AMEX" width={40} height={25} />
            </div> */}
          </div>

       {/* Delivery Address Section */}
<div className="mt-10 w-full max-w-xl mx-auto bg-white border rounded-2xl p-5 shadow-sm">
  <h3 className="text-lg font-semibold mb-4">Delivery</h3>

  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
    <div className="flex-1">
    <select
  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
  value={selectedAddressId || ""}
  onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}

>
  <option value="">Select Delivery Address</option>
  {addresses.map((addr) => (
    <option key={addr.user_address_id} value={addr.user_address_id}>
      {addr.username}, {addr.phone_number}, {addr.address}, {addr.city}, {addr.country}
    </option>
  ))}
</select>

    </div>
    <button
      className="text-green-600 text-2xl font-bold px-3 py-1 hover:scale-110 transition"
      title="Add new address"
    >
      +
    </button>
  </div>

  <div className="text-sm text-gray-700 mb-1">
    Contact for delivery: <span className="font-semibold">097 7878 934</span>
  </div>
  <div className="text-sm text-gray-700">
    Delivery Fee: <strong>${delivery.toFixed(2)}</strong>
  </div>

  {/* <div className="mt-5">
    <p className="text-sm font-medium mb-2 text-gray-800">Pay via:</p>
    <div className="flex gap-3 items-center">
      <Image src="/visa.png" alt="Visa" width={40} height={25} />
      <Image src="/paypal.png" alt="PayPal" width={40} height={25} />
      <Image src="/amex.png" alt="Amex" width={40} height={25} />
    </div>
  </div> */}
</div>


          {showModal && (
        <PaymentModal
        total={total}
        userId={user?.user_id}
        userAddress={getSelectedAddressString()}
        items={bagItems.map(item => ({
          product_id: item.product_id,
          size: item.size_name,
          color: item.color_name,
          quantity: item.quantity,
          price: Number(item.price),
          discount: Number(item.discount || 0),
        }))}
        onClose={() => setShowModal(false)}
        onSelectPayment={handleSelectPayment}
      />
      )}
      {showAbaPopup && (
        <AbaPayPopup
        total={total}                          // pass total amount
        userId={user?.user_id}                 // user id
        userAddress={getSelectedAddressString()} // full selected address string
        items={bagItems.map(item => ({        // map cart items to expected structure
          product_id: item.product_id,
          size: item.size_name,
          color: item.color_name,
          quantity: item.quantity,
          price: Number(item.price),           // make sure number
          discount: Number(item.discount || 0),
        }))}
        qrUrl={null}                          // initially no qrUrl, will be set in AbaPayPopup via PaymentModal
        onExpire={() => {
          // You can implement re-fetching QR code here or just close popup
          setShowAbaPopup(false);
          alert("Payment session expired, please try again.");
        }}
        onClose={() => setShowAbaPopup(false)}
      />
      )}
        </div>
        
      )}
    </div>
  );
}
