// src/app/components/PaymentModal.js
import React, { useState } from "react";
import styles from "../styles/paymentModal.module.css";
import Image from "next/image";
import AbaPayPopup from "./checkout/AbaPayPopup";

import aba from "../assets/ft-abapay.png";
import khqr from "../assets/khqr-5.png";
import wechat from "../assets/wechat pay.png";
import visa from "../assets/visa.jpg";
import alipay from "../assets/alipay.png";

const PaymentModal = ({ onClose, onSelectPayment, total, userId, userAddress, items }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tranId, setTranId] = useState(null); // store transaction id

  const paymentMethods = [
    { label: "ABA PAY", value: "abapay", desc: "Scan to pay with ABA Mobile", icon: aba },
    { label: "Credit/Debit Card", value: "cards", desc: "Visa / MasterCard / JCB", icon: visa },
    { label: "KHQR", value: "khqr", desc: "Scan to pay with member bank app", icon: khqr },
    { label: "Alipay", value: "alipay", desc: "Scan to pay with Alipay", icon: alipay },
    { label: "WeChat", value: "wechat", desc: "Scan to pay with WeChat", icon: wechat },
  ];

  // Handle payment method selection
  const handleSelectPaymentMethod = async (methodValue) => {
    if (methodValue === "abapay") {
      if (!userId) {
        alert("Please log in again.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/payway/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            amount: total,
            payment_option: methodValue,
            view_type: "popup",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Payment request failed");
        }

        const data = await res.json();

        setQrCodeUrl(data.qrImage);
        setTranId(data.tran_id);
        setSelectedPaymentMethod(methodValue);
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      onSelectPayment(methodValue);
      onClose();
    }
  };

  // Refresh QR code on expire
  const refreshQrCode = async () => {
    if (!userId) {
      alert("Please log in again.");
      setSelectedPaymentMethod(null);
      setQrCodeUrl(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payway/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          amount: total,
          payment_option: "abapay",
          view_type: "popup",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to refresh QR code");
      }

      const data = await res.json();

      if (data.status?.code === "00" && data.qrImage) {
        setQrCodeUrl(data.qrImage);
        setSelectedPaymentMethod("abapay");
        setTranId(data.tran_id);
      } else {
        alert("Failed to refresh QR code: " + (data.status?.message || "Unknown error"));
        setSelectedPaymentMethod(null);
        setQrCodeUrl(null);
      }
    } catch (error) {
      alert("Error refreshing QR code: " + error.message);
      setSelectedPaymentMethod(null);
      setQrCodeUrl(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Loading...</h3>
            <button onClick={onClose} className={styles.closeBtn}>×</button>
          </div>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Preparing payment gateway...</p>
          </div>
        </div>
      </div>
    );
  }

  if (qrCodeUrl && selectedPaymentMethod === "abapay") {
    return (
      <AbaPayPopup
        onClose={() => {
          setSelectedPaymentMethod(null);
          setQrCodeUrl(null);
          onClose();
        }}
        total={total}
        userId={userId}
        userAddress={userAddress}
        items={items}
        qrUrl={qrCodeUrl}
        onExpire={refreshQrCode}
      />
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Choose way to pay</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.paymentList}>
          {paymentMethods.map((method) => (
            <div
              key={method.value}
              className={styles.paymentOption}
              onClick={() => handleSelectPaymentMethod(method.value)}
            >
              <div className={styles.icon}>
                <Image src={method.icon} alt={method.label} width={24} height={24} />
              </div>
              <div>
                <div className={styles.title}>{method.label}</div>
                <div className={styles.desc}>{method.desc}</div>
              </div>
              <div className={styles.arrow}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
