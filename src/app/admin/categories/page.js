"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiMail, FiUser } from "react-icons/fi";
import Sidebar from "../components/sidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Category() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [type, setType] = useState("category");
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get(`${API}/api/subcategories`);
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
    }
  };

  const handleAdd = async () => {
    try {
      if (type === "category") {
        await axios.post(`${API}/api/categories`, { category_name: newName });
        fetchCategories();
      } else {
        await axios.post(`${API}/api/subcategories`, {
          sub_category_name: newName,
          description: newDescription,
          category_id: selectedCategory,
        });
        fetchSubcategories();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setNewName(type === "category" ? item.category_name : item.sub_category_name);
    setNewDescription(item.description || "");
    setSelectedCategory(item.category_id || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (type === "category") {
        await axios.put(`${API}/api/categories/${editItem.id}`, {
          category_name: newName,
        });
        fetchCategories();
      } else {
        await axios.put(`${API}/api/subcategories/${editItem.id}`, {
          sub_category_name: newName,
          description: newDescription,
          category_id: selectedCategory,
        });
        fetchSubcategories();
      }
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (type === "category") {
        await axios.delete(`${API}/api/categories/${deleteItem.id}`);
        fetchCategories();
      } else {
        await axios.delete(`${API}/api/subcategories/${deleteItem.id}`);
        fetchSubcategories();
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteItem(null);
  };

  const resetForm = () => {
    setNewName("");
    setNewDescription("");
    setSelectedCategory("");
    setEditItem(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="Categories" />
      <main className="flex-1 bg-[#FAF6EE] p-6 rounded-l-2xl">
        <div className="flex items-center justify-between mb-6">
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
                      alert("Go to Account"); // Replace with navigation later
                    }}
                  >
                    Account
                  </button>
                  <button
                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                    onClick={() => {
                      setShowUserMenu(false);
                      alert("Logging out..."); // Replace with logout logic
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type switch + Add button */}
        <div className="flex items-center justify-between mb-4">
          {/* Optional: Title (can uncomment if needed) */}
          {/* <h1 className="text-2xl font-bold capitalize">{type}s</h1> */}
          <div className="w-full">
            {/* Tab Header */}
            <div className="flex items-center border-b mb-4 space-x-8">
              <div
                onClick={() => setType("category")}
                className={`cursor-pointer pb-2 text-sm font-medium ${
                  type === "category"
                    ? "border-b-2 border-[#00D264] text-[#00D264] font-semibold"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Category
              </div>

              <div
                onClick={() => setType("subcategory")}
                className={`cursor-pointer pb-2 text-sm font-medium ${
                  type === "subcategory"
                    ? "border-b-2 border-[#00D264] text-[#00D264] font-semibold"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Sub-category
              </div>

              {/* Add button on the far right */}
              <div className="ml-auto">
                <div
                  onClick={() => setShowModal(true)}
                  className="bg-[#00D264] text-white px-4 py-1.5 rounded text-sm font-semibold cursor-pointer"
                >
                  Add {type === "category" ? "Category" : "Sub-category"}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-200 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">ID</th>
                <th className="px-4 py-2 font-semibold">
                  {type === "category"
                    ? "Category Name"
                    : "Sub-category Name"}
                </th>
                {type === "subcategory" && (
                  <th className="px-4 py-2 font-semibold">Category</th>
                )}
                {/* <th className="px-4 py-2 font-semibold">Stock</th> */}
                <th className="px-4 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
            {(type === "category" ? categories : subcategories).map((item) => (
              <tr key={type === "category" ? item.category_id : item.sub_category_id} className="border-t">
                <td className="px-4 py-2">{type === "category" ? item.category_id : item.sub_category_id}</td>
                <td className="px-4 py-2">
                  {type === "category" ? item.category_name : item.sub_category_name}
                </td>
                {type === "subcategory" && (
                  <td className="px-4 py-2">
                    {categories.find(category => category.category_id === item.category_id)?.category_name || "Unknown Category"}
                  </td>
                )}
                {/* <td className="px-4 py-2">{item.stock || 0}</td> */}
                <td className="px-4 py-2 flex gap-3 items-center text-lg">
                  <FiEye className="text-black cursor-pointer" />
                  <FiEdit className="text-blue-500 cursor-pointer" onClick={() => handleEdit(item)} />
                  <FiTrash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(item)} />
                </td>
              </tr>
            ))}
          </tbody>

          </table>
        </div>

        {/* Modals */}
        {showModal && (
          <ModalForm
            type={type}
            categories={categories}
            newName={newName}
            newDescription={newDescription}
            selectedCategory={selectedCategory}
            setNewName={setNewName}
            setNewDescription={setNewDescription}
            setSelectedCategory={setSelectedCategory}
            onCancel={() => setShowModal(false)}
            onSubmit={handleAdd}
          />
        )}

        {showEditModal && (
          <ModalForm
            type={type}
            categories={categories}
            newName={newName}
            newDescription={newDescription}
            selectedCategory={selectedCategory}
            setNewName={setNewName}
            setNewDescription={setNewDescription}
            setSelectedCategory={setSelectedCategory}
            onCancel={() => setShowEditModal(false)}
            onSubmit={handleEditSubmit}
            isEdit
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center p-8 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg relative">
              <h2 className="text-lg font-semibold text-red-600">
                Are you sure you want to delete {deleteItem?.category_name || deleteItem?.sub_category_name}?
              </h2>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={cancelDelete}
                  className="text-sm px-4 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="text-sm px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ModalForm
function ModalForm({
  type,
  categories,
  newName,
  newDescription,
  selectedCategory,
  setNewName,
  setNewDescription,
  setSelectedCategory,
  onCancel,
  onSubmit,
  isEdit,
}) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-end p-8 z-50">
      <div className="bg-white p-4 rounded-xl w-80 shadow-lg relative">
        <h2 className="text-sm font-semibold text-green-600 mb-3">
          {isEdit ? "Edit" : "Add"} {type === "category" ? "Category" : "Sub-category"}:
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 text-gray-700">Name:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          {type === "subcategory" && (
            <>
              <div>
                <label className="block mb-1 text-gray-700">Description:</label>
                <textarea
                  rows="3"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Select Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded"
            >
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
