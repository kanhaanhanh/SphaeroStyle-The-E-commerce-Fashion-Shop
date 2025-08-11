"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import ProductForm from "./productForm";
import Link from "next/link";

import {
  FiSearch,
  FiFileText,
  FiEdit,
  FiTrash2,
  FiMail,
  FiUser,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Layout() {
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editProduct, setEditProduct] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [productRes, subcatRes, catRes] = await Promise.all([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/subcategories`),
        axios.get(`${API}/api/categories`),
      ]);

      const productList = productRes.data;
      const subcatList = subcatRes.data;
      const catList = catRes.data;

      const enrichedProducts = productList
        .sort((a, b) => (b.product_id || 0) - (a.product_id || 0))
        .map((product) => {
          const subcat = subcatList.find(
            (s) => s.sub_category_id === product.sub_category_id
          );
          const cat = subcat
            ? catList.find((c) => c.category_id === subcat.category_id)
            : null;

          const available = product.stock > 0;

          return {
            ...product,
            sub_category_name: subcat?.sub_category_name || "Unknown Subcategory",
            category_name: cat?.category_name || "Unknown Category",
            available,
          };
        });

      setProducts(enrichedProducts);
      setSubcategories(subcatList);
      setCategories(catList);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handleSuccessMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const confirmDelete = (productId) => {
    setConfirmDeleteId(productId);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`${API}/api/products/${confirmDeleteId}`);
      fetchAllData();
      setSuccessMessage("Product deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === "available" && !product.available) return false;
    if (filter === "outOfStock" && product.available) return false;
    if (
      searchTerm &&
      !product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex">
      <Sidebar currentPage="Products" />
      <main className="flex-1 p-6 shadow-inner border-t-8 border-r-8 border-b-8 border-[#0C3B2E] rounded-tr-2xl rounded-br-2xl">
        {/* Delete Confirmation Dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
              <p className="mb-4">Are you sure you want to delete this product?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Product Form Dialog */}
        {showForm && (
          <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={closeForm}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                aria-label="Close"
              >
                ✕
              </button>
              <ProductForm
                onProductChange={fetchAllData}
                onSuccessMessage={handleSuccessMessage}
                onClose={closeForm}
                product={editProduct}
                subcategories={subcategories}
                categories={categories}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center w-1/2 bg-[#F2E9DB] rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent flex-grow focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        <h1 className="text-2xl font-bold mb-4">Product Management</h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <select
            className="bg-[#F2E9DB] rounded-full px-4 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          <button
            onClick={() => {
              setShowForm(true);
              setEditProduct(null);
            }}
            className="px-4 py-2 bg-green-900 text-white rounded-full"
          >
            {showForm ? "Close Form" : "Add Product"}
          </button>
        </div>

        <div className="p-4 rounded-lg shadow-md bg-gray-50 mb-4 overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-green-900 text-white">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category &gt; Sub-category</th>
                <th className="px-4 py-2">Collection</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Discount</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="text-center border-t">
                  <td className="px-4 py-2">{product.product_id}</td>
                  <td className="px-4 py-2">{product.product_name}</td>
                  <td className="px-4 py-2">
                    {product.category_name} &gt; {product.sub_category_name}
                  </td>
                  <td className="px-4 py-2">{product.collection_name}</td>
                  <td className="px-4 py-2">
                    {product.stock}{" "}
                    <span
                      className={
                        product.available ? "text-green-600" : "text-red-600"
                      }
                    >
                      {product.available ? "Available" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{product.discount}%</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link href={`/admin/productDetail?id=${product.product_id}`} title="View">
                      <button><FiFileText /></button>
                    </Link>
                    <button title="Edit" onClick={() => { setEditProduct(product); setShowForm(true); }}>
                      <FiEdit />
                    </button>
                    <button title="Delete" className="text-red-500" onClick={() => confirmDelete(product.product_id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500 font-semibold">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={closeForm}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                aria-label="Close"
              >
                ✕
              </button>
              <ProductForm
                onProductChange={fetchAllData}
                onSuccessMessage={handleSuccessMessage}
                onClose={closeForm}
                product={editProduct}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
