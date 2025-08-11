"use client"; // ✅ Add this line

import React from "react";
import styles from '../styles/successPage.module.css';

const SuccessfullyPay = () => {
  return (
    <div className={styles.container}>
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase.</p>

      <button className={styles.homeButton} onClick={() => window.location.href = "/"}>
        Continue to Shopping
      </button>
    </div>
  );
};

export default SuccessfullyPay;
