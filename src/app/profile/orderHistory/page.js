"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/orderHistory.module.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchOrders(userData);
    } else {
      setLoading(false);
      setError("Please log in to view your order history.");
    }
  }, []);

  const fetchOrders = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:5000/api/orders/user/${userData.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
        }
      );
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.title}>Order History</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p>No orders found. Start shopping today!</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className={styles.orderListContainer}>
          <div className={styles.orderListHeader}>
            <div className={styles.headerItem}>Order #</div>
            <div className={styles.headerItem}>Date</div>
            <div className={styles.headerItem}>Total</div>
            <div className={styles.headerItem}>Status</div>
            <div className={styles.headerItem}></div>
          </div>
          <div className={styles.orderListScroll}>
            {orders.map((order) => (
              <div
                key={order.order_id}
                className={styles.orderRow}
                onClick={() => setSelectedOrder(order)}
              >
                <div className={styles.orderDataItem}>
                  <strong>{order.order_id}</strong>
                </div>
                <div className={styles.orderDataItem}>
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className={styles.orderDataItem}>
                  ${parseFloat(order.total_amount).toFixed(2)}
                </div>
                <div className={styles.orderDataItem}>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderDataItem}>
                  <span className={styles.viewDetail}>View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className={styles.modalOverlay}
          data-active="true"
          onClick={() => setSelectedOrder(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order #{selectedOrder.order_id} Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGroup}>
                <strong>Order Date:</strong>{" "}
                <span>
                  {new Date(selectedOrder.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className={styles.detailGroup}>
                <strong>Total Amount:</strong>{" "}
                <span>${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
              <div className={styles.detailGroup}>
                <strong>Payment Method:</strong>{" "}
                <span>{selectedOrder.payment_method}</span>
              </div>
              <div className={styles.detailGroup}>
                <strong>Shipping Address:</strong>{" "}
                <span>{selectedOrder.user_address}</span>
              </div>
              <div className={styles.detailGroup}>
                <strong>Status:</strong>{" "}
                <span
                  className={`${styles.status} ${styles[selectedOrder.status]}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <hr className={styles.modalSeparator} />
              <h4>Items in this Order:</h4>
              <div className={styles.itemList}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <p>
                      <strong>Product ID:</strong> {item.product_id}
                    </p>
                    <div className={styles.itemDetails}>
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
