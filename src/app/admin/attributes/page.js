"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiMail, FiUser } from "react-icons/fi";
import Sidebar from "../components/sidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ColorSize() {
  const [type, setType] = useState("color");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [newName, setNewName] = useState("#000000"); // default black color for color type

  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchItems();
    // Reset input when switching type
    setNewName(type === "color" ? "#000000" : "");
  }, [type]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/api/${type}s`);
      setItems(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${type}s:`, err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API}/api/${type}s`, { [`${type}_name`]: newName });
      fetchItems();
      setShowModal(false);
      setNewName(type === "color" ? "#000000" : "");
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setNewName(item[`${type}_name`] || (type === "color" ? "#000000" : ""));
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API}/api/${type}s/${editItem[`${type}_id`]}`, {
        [`${type}_name`]: newName,
      });
      fetchItems();
      setShowEditModal(false);
      setNewName(type === "color" ? "#000000" : "");
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
      await axios.delete(`${API}/api/${type}s/${deleteItem[`${type}_id`]}`);
      fetchItems();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="Attributes" />
      <main className="flex-1 bg-[#FAF6EE] p-6 rounded-l-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center w-1/2 bg-[#F2E9DB] rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Search..."
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
                    onClick={() => alert("Go to Account")}
                  >
                    Account
                  </button>
                  <button
                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                    onClick={() => alert("Logging out...")}
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
          <div className="w-full">
            {/* Tab Header */}
            <div className="flex items-center border-b mb-4 space-x-8">
              <div
                onClick={() => setType("color")}
                className={`cursor-pointer pb-2 text-sm font-medium ${
                  type === "color"
                    ? "border-b-2 border-[#00D264] text-[#00D264] font-semibold"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Color
              </div>

              <div
                onClick={() => setType("size")}
                className={`cursor-pointer pb-2 text-sm font-medium ${
                  type === "size"
                    ? "border-b-2 border-[#00D264] text-[#00D264] font-semibold"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Size
              </div>

              {/* Add button */}
              <div className="ml-auto">
                <div
                  onClick={() => setShowModal(true)}
                  className="bg-[#00D264] text-white px-4 py-1.5 rounded text-sm font-semibold cursor-pointer"
                >
                  Add {type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-200 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">ID</th>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={`${type}-${item[`${type}_id`] ?? index}`}
                  className="border-t"
                >
                  <td className="px-4 py-2">{item[`${type}_id`] ?? "-"}</td>

                  <td className="px-4 py-2 flex items-center gap-2">
                    {type === "color" && (
                      <span
                        style={{ backgroundColor: item.color_name || "#ccc" }}
                        className="inline-block w-5 h-5 rounded-full border border-gray-300"
                        title={item.color_name}
                      />
                    )}
                    <span>{item[`${type}_name`] ?? "-"}</span>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-column justify-center gap-3 text-lg items-center">
                    <FiEye className="text-black cursor-pointer" />
                    <FiEdit
                      className="text-blue-500 cursor-pointer"
                      onClick={() => handleEdit(item)}
                    />
                    <FiTrash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDelete(item)}
                    />
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showModal && (
          <ModalForm
            title={`Add ${type}`}
            newName={newName}
            setNewName={setNewName}
            onCancel={() => setShowModal(false)}
            onSubmit={handleAdd}
            type={type}
          />
        )}

        {showEditModal && (
          <ModalForm
            title={`Edit ${type}`}
            newName={newName}
            setNewName={setNewName}
            onCancel={() => setShowEditModal(false)}
            onSubmit={handleEditSubmit}
            type={type}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center p-8 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg relative">
              <h2 className="text-lg font-semibold text-red-600">
                Are you sure you want to delete {deleteItem?.[`${type}_name`]}?
              </h2>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
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

// ModalForm component with color picker support
function ModalForm({ title, newName, setNewName, onCancel, onSubmit, type }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-end p-8 z-50">
      <div className="bg-white p-4 rounded-xl w-80 shadow-lg relative">
        <h2 className="text-sm font-semibold text-green-600 mb-3">{title}</h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 text-gray-700">
              {type === "color" ? "Color Code:" : "Name:"}
            </label>
            {type === "color" ? (
              <input
                type="color"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-16 h-8 p-0 border border-gray-300 rounded cursor-pointer"
              />
            ) : (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onCancel} className="px-3 py-1 text-sm bg-gray-200 rounded">
              Cancel
            </button>
            <button onClick={onSubmit} className="px-3 py-1 text-sm bg-green-500 text-white rounded">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
