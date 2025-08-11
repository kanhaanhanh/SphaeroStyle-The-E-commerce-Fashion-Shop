"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";

const validStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function Layout() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.accessToken) {
      axios
        .get("http://localhost:5000/api/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        })
        .then((res) => {
          // Add a localStatus field to keep track of changes before sending to backend
          const ordersWithStatus = res.data.orders.map((order) => ({
            ...order,
            localStatus: order.status,
          }));
          setOrders(ordersWithStatus);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error("Admin fetch orders failed:", err);
          setLoadingOrders(false);
          setErrorMessage("Failed to load orders.");
        });
    } else {
      setLoadingOrders(false);
      setErrorMessage("You must be logged in as admin.");
    }
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, localStatus: newStatus } : order
      )
    );
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setErrorMessage(null);
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      // Update the actual status on success
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === orderId ? { ...order, status, localStatus: status } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      setErrorMessage("Failed to update status. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders based on filterStatus
  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="Orders" />
      <main className="flex-1 bg-white p-6 shadow-inner border-t-8 border-r-8 border-b-8 border-[#0C3B2E] rounded-tr-2xl rounded-br-2xl overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        {/* Status filter dropdown */}
        <div className="mb-6">
          <label htmlFor="filterStatus" className="font-semibold mr-3">
            Filter by Status:
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded p-1"
          >
            <option value="All">All</option>
            {validStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loadingOrders && <p>Loading orders...</p>}
        {errorMessage && (
          <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
        )}

        {!loadingOrders && filteredOrders.length === 0 && <p>No orders found.</p>}

        {filteredOrders.map((order) => (
          <div
            key={order.order_id}
            className="mb-5 p-4 border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold mb-1">Order #{order.order_id}</p>
            <p>User: {order.email}</p>
            <p>Total: ${order.total_amount}</p>
            <p>Date: {new Date(order.created_at).toLocaleString()}</p>
            <p>
              <strong>Current Status:</strong> {order.status}
            </p>

            <p className="mt-2 font-medium">Items:</p>
            <ul className="ml-5 list-disc mb-3">
              {order.items.map((item, index) => (
                <li key={index}>
                  Product #{item.product_id} – {item.quantity} × ${item.price}
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-3">
              <label htmlFor={`status-${order.order_id}`} className="font-medium">
                Change Status:
              </label>
              <select
                id={`status-${order.order_id}`}
                value={order.localStatus}
                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                disabled={updatingOrderId === order.order_id}
                className="border rounded p-1"
              >
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={() => updateStatus(order.order_id, order.localStatus)}
                disabled={updatingOrderId === order.order_id}
                className={`px-3 py-1 rounded ${
                  updatingOrderId === order.order_id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {updatingOrderId === order.order_id ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
