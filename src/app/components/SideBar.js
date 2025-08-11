// components/Sidebar.js (fixed)
import Link from 'next/link';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ setActiveTab, activeTab }) => {
  return (
    <div className={styles.sidebar}>
      <h2>Account Setting</h2>
      <ul>
        <li>
          <Link href="#" onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? styles.active : ''}>
            👤 Profile
          </Link>
        </li>
        <li>
          <Link href="#" onClick={() => setActiveTab('address')} className={activeTab === 'address' ? styles.active : ''}>
            📍 Address
          </Link>
        </li>
        <li>
          <Link href="#" onClick={() => setActiveTab('history')} className={activeTab === 'history' ? styles.active : ''}>
            🛒 My Order History
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
