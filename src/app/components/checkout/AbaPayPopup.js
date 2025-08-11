import React, { useEffect, useState } from "react";
import styles from '../../styles/abaPopup.module.css';
import axios from "axios";

const AbaPayPopup = ({
  onClose,
  onExpire,
  total,
  qrUrl,
  userId,
  userAddress, // full address string
  items = [], // Each item: { product_id, size, color, quantity, price, discount }
}) => {
  const deliveryFee = 2;
  const subtotal = total - deliveryFee;

  const [secondsLeft, setSecondsLeft] = useState(180);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      setSecondsLeft(180);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handlePaymentSuccess = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.accessToken) {
        alert("Please login again");
        return;
      }
  
      const orderData = {
        user_address: userAddress, // full string address
        total: total,
        payment_method: "ABA PAY",
        items: items, // passed from props
      };
  
      // Add this to log items sent to backend
      console.log("Sending orderData to backend:", orderData);
  
      const res = await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
  
      if (res.status === 201) {
        window.location.href = "/successfully";
      } else {
        alert("Order creation failed!");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Order creation failed: " + error.message);
    }
  };
  

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <button className={styles.backButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ABA PAY
          </button>
          <div className={styles.time}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formattedTime}
          </div>
        </div>

        <div className={styles.popupContent}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.shoppingHeader}>
              <img src="../../assets/Logo.png" alt="Shopping Bag Icon" width={24} height={24} />
              <h3>Sphaerostyle</h3>
            </div>

            <div className={styles.amountToPay}>
              <p>Amount to pay</p>
              <h2>{total.toFixed(2)} USD</h2>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>{subtotal.toFixed(2)} USD</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Delivery Fee:</span>
                <span className={styles.summaryValue}>{deliveryFee.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className={styles.right}>
            <div className={styles.qrCodeContainer}>
              {qrUrl ? (
                <img src={qrUrl} alt="ABA QR Code" />
              ) : (
                <p>Loading QR Code...</p>
              )}
            </div>
            <p className={styles.scanInstruction}>Scan</p>

            <button className={styles.payButton} onClick={handlePaymentSuccess}>
              Click to Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbaPayPopup;
