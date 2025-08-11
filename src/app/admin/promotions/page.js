"use client";
import Sidebar from "../components/sidebar";
import { FiSearch } from "react-icons/fi";

export default function Promotion() {
  return (
    <div className="flex min-h-screen bg-[#0C3B2E]">
      <Sidebar currentPage="Promotions" />

      <main className="flex-1 bg-[#F9F3E9] rounded-l-2xl border-t-8 border-r-8 border-b-8 border-[#0C3B2E] rounded-tr-2xl rounded-br-2xl">
        {/* Top bar (customizable per page) */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm">
          {/* Left: Search */}
          <div className="w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in dashboard..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F2E9DB] focus:outline-none text-sm"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>

          {/* Right: Mail + Profile */}
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full bg-[#F2E9DB] flex items-center justify-center">
              <img src="/mail.svg" alt="Mail" className="w-5 h-5" />
            </button>
            <img
              src="/profile.jpg"
              alt="User"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
        </div>


        {/* Dashboard content */}
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to your Promotion</h1>
          {/* Add your dashboard widgets or cards here */}
        </div>
      </main>
    </div>
  );
}
