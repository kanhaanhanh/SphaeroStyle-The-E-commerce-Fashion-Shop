"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import axios from "axios";
import { FiSearch, FiMail, FiUser } from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [totalOutOfStock, setTotalOutOfStock] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchProductStats();
    fetchOrderStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      const res = await axios.get(`${API}/api/products`);
      const products = res.data;

      setTotalProducts(products.length);

      let stockCount = 0;
      let outOfStockCount = 0;

      products.forEach((p) => {
        stockCount += p.stock || 0;
        if (p.stock <= 0) outOfStockCount++;
      });

      setTotalStock(stockCount);
      setTotalOutOfStock(outOfStockCount);
    } catch (err) {
      console.error("Failed to fetch product stats", err);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.accessToken) return;

      const res = await axios.get(`${API}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      setTotalOrders(res.data.orders.length);
    } catch (err) {
      console.error("Failed to fetch order stats", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0C3B2E]">
      <Sidebar currentPage="Dashboard" />

      <main className="flex-1 bg-[#F9F3E9] rounded-l-2xl border-t-8 border-r-8 border-b-8 border-[#0C3B2E] rounded-tr-2xl rounded-br-2xl">
        {/* Top bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex items-center w-1/2 bg-[#F2E9DB] rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Search ..."
              className="bg-transparent flex-grow focus:outline-none text-sm"
            />
            <FiSearch className="text-gray-500 text-xl" />
          </div>

          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full bg-[#F2E9DB] flex items-center justify-center">
              <FiMail className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-[#F2E9DB] flex items-center justify-center"
              >
                <FiUser className="w-5 h-5 text-gray-600" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md text-sm z-50">
                  <button
                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                    onClick={() => {
                      setShowUserMenu(false);
                      alert("Go to Account");
                    }}
                  >
                    Account
                  </button>
                  <button
                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                    onClick={() => {
                      setShowUserMenu(false);
                      alert("Logging out...");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
              <p className="text-3xl font-bold text-green-800 mt-2">{totalProducts}</p>
            </div>

            <div className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700">Stock Available</h2>
              <p className="text-3xl font-bold text-green-800 mt-2">{totalStock}</p>
            </div>

            <div className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700">Out of Stock</h2>
              <p className="text-3xl font-bold text-red-700 mt-2">{totalOutOfStock}</p>
            </div>

            <div className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
              <p className="text-3xl font-bold text-blue-800 mt-2">{totalOrders}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
