"use client";

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Sidebar from '../../components/SideBar';
import Profile from '../profile/page';
import Address from '../address/page';
import styles from '../../styles/Account.module.css';
import OrderHistory from '../orderHistory/page';

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'address':
        return <Address />;
      case 'history':
        return <OrderHistory />;
      default:
        return <Profile />;
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
        <div className={styles.content}>{renderContent()}</div>
      </div>
      <Footer />
    </>
  );
};

export default Account;
