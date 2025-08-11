"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiMail, FiUser } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";

export default function StaffManagementLayout() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      setIsLoggedIn(true);
      setUserName(`${firstName} ${lastName}`);
    }
  }, []);


  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    social_account_id: "",
    user_role_id: "",
    password: "",
  });

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    const res = await fetch("http://localhost:5000/api/users");
    const data = await res.json();
    setStaffList(data);
  };

  

  const handleLogout = () => {
    // Clear localStorage when logging out
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    setIsLoggedIn(false);
    setUserName('');
    router.push('/'); // Optionally redirect to home page after logout
  };

  const handleAddOrUpdate = async () => {
    const url = editStaff
      ? `http://localhost:5000/api/users/${editStaff.user_id}`
      : "http://localhost:5000/api/users";
    const method = editStaff ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setEditStaff(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      social_account_id: "",
      user_role_id: "",
      password: "",
    });
    fetchStaffList();
  };

  const handleEdit = (staff) => {
    setEditStaff(staff);
    setFormData({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      phone_number: staff.phone_number,
      social_account_id: staff.social_account_id,
      user_role_id: staff.user_role_id,
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:5000/api/users/${selectedStaffId}`, {
      method: "DELETE",
    });
    setShowDeleteConfirm(false);
    setSelectedStaffId(null);
    fetchStaffList();
  };

  const handleViewDetail = (staff) => {
    setViewStaff(staff);
  };

  const filteredStaff = selectedRole
    ? staffList.filter((staff) => String(staff.user_role_id) === selectedRole)
    : staffList;

  return (
    <div className="flex min-h-screen bg-[#0C3B2E] text-black">
      <Sidebar currentPage="Staff Management" />
      <main className="flex-1 bg-[#F9F3E9] p-6 rounded-l-2xl border-t-8 border-r-8 border-b-8 border-[#0C3B2E] rounded-tr-2xl rounded-br-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex items-center w-1/2 bg-[#F2E9DB] rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Search users..."
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
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Staff Management</h1>

        <div className="flex justify-between mb-4">
          <select
            className="bg-[#F2E9DB] px-4 py-2 rounded-full text-sm"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="1">User</option>
            <option value="2">Staff</option>
            <option value="3">Owner</option>
          </select>
          <button
            onClick={() => {
              setEditStaff(null);
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                social_account_id: "",
                user_role_id: "",
                password: "",
              });
              setShowModal(true);
            }}
            className="bg-[#00D264] text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
          >
            <FaUserPlus /> Add User
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full bg-[#F2E9DB] rounded-lg text-sm">
            <thead>
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2">FULL NAME</th>
                <th className="px-4 py-2">EMAIL</th>
                <th className="px-4 py-2">PHONE</th>
                <th className="px-4 py-2">ROLE</th>
                <th className="px-4 py-2">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.user_id}
                  className="border-t border-[#e0d6c6] hover:bg-[#e9e0d2]"
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    {/* <img src="/avatar.png" className="w-6 h-6 rounded-full" /> */}
                    {staff.first_name} {staff.last_name}
                  </td>
                  <td className="px-4 py-2">{staff.email}</td>
                  <td className="px-4 py-2">{staff.phone_number}</td>
                  <td className="px-4 py-2 font-semibold">
                    {staff.user_role_id === 1
                      ? "User"
                      : staff.user_role_id === 2
                      ? "Staff"
                      : "Owner"}
                  </td>
                  <td className="px-4 py-2 flex gap-2 text-[#0C3B2E]">
                    <FiEye
                      className="cursor-pointer"
                      onClick={() => handleViewDetail(staff)}
                    />
                    <FiEdit
                      className="cursor-pointer text-blue-500"
                      onClick={() => handleEdit(staff)}
                    />
                    <FiTrash2
                      className="cursor-pointer text-red-500"
                      onClick={() => {
                        setSelectedStaffId(staff.user_id);
                        setShowDeleteConfirm(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center p-8 z-50">
          <div className="bg-white p-4 rounded-xl w-80 shadow-lg relative">
            <h2 className="text-sm font-semibold text-green-600 mb-3">
              {editStaff ? "Edit Staff" : "Add Staff"}
            </h2>
            <div className="space-y-3 text-sm">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Social Account ID"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.social_account_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_account_id: e.target.value,
                  })
                }
              />
              <select
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.user_role_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_role_id: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="1">User</option>
                <option value="2">Staff</option>
                <option value="3">Owner</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-full bg-[#F2E9DB]"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-full text-sm"
                onClick={handleAddOrUpdate}
              >
                {editStaff ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center p-8 z-50">
          <div className="bg-white p-4 rounded-xl w-80 shadow-lg">
            <h2 className="text-sm font-semibold text-red-500 mb-3">
              Are you sure you want to delete this user?
            </h2>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {viewStaff && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center p-8 z-50">
          <div className="bg-white p-4 rounded-xl w-80 shadow-lg">
            <h2 className="text-sm font-semibold text-blue-600 mb-3">
              Staff Details
            </h2>
            <p className="text-sm">
              <strong>Name:</strong> {viewStaff.first_name} {viewStaff.last_name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {viewStaff.email}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {viewStaff.phone_number}
            </p>
            <p className="text-sm">
              <strong>Role:</strong>{" "}
              {viewStaff.user_role_id === 1
                ? "User"
                : viewStaff.user_role_id === 2
                ? "Staff"
                : "Owner"}
            </p>
            <button
              onClick={() => setViewStaff(null)}
              className="mt-4 text-sm font-semibold text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
