// src/app/components/checkout/CardPayPopup.js
import React from 'react';
import styles from '../../styles/cardPopup.module.css';

/**
 * Renders a popup containing an iframe for credit/debit card payments.
 *
 * @param {object} props
 * @param {function} props.onClose - Close handler.
 * @param {string} props.paymentHtml - The HTML string of the payment form.
 */
const CardPayPopup = ({ onClose, paymentHtml }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <button className={styles.backButton} onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Credit/Debit Card
          </button>
        </div>

        <div className={styles.popupContent}>
          {paymentHtml ? (
            <iframe
              srcDoc={paymentHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
              sandbox="allow-scripts allow-forms allow-same-origin"
              title="Credit/Debit Card Payment"
            />
          ) : (
            <p>Loading payment form...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPayPopup;
