"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/signin.module.css';
import Logo from "../assets/Logo.png";
import { FaFacebook, FaGoogle, FaTiktok } from 'react-icons/fa';
import image from "../assets/image.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { email, password } = formData;

    // Email validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
      setLoading(false);
      return;
    }

    try {
      console.log(email, password)
      const response = await fetch('http://localhost:5000/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (response.ok && data) {
        setSuccess('Logged in successfully!');
        localStorage.setItem('isLoggedIn', 'true');
        // Store user info inside localStorage under 'user'
        localStorage.setItem('user', JSON.stringify({
        user_id: data.user.user_id,
        accessToken: data.accessToken,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone_number: data.user.phone_number,
        city: data.user.city,
        role_id: data.user.role_id,
        }));
        localStorage.setItem('firstName', data.user.first_name);
        localStorage.setItem('lastName', data.user.last_name);
        localStorage.setItem('role_id', data.user.role_id); // ✅ Save role_id here
        localStorage.setItem('email', data.user.email); // Save email for profile page
        console.log('User Role ID:', localStorage.getItem('role_id'));

        // ✅ Now check role_id
        if (data.user.role_id === 2 || data.user.role_id === 3) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.log(email, password)
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.leftSide}>
          <Image src={image} alt="Sign In Image" width={500} height={500} />
        </div>
        <div className={styles.rightSide}>
          <div className={styles.logoWrapper}>
            <Link href="/" className={styles.logoContainer}>
              <div className={styles.roundLogo}>
                <Image
                  src={Logo}
                  alt="Logo"
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <span className={styles.brandName}>SphaeroStyle</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                aria-label="Email address"
                value={formData.email}
                required
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                aria-label="Password"
                value={formData.password}
                required
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.linkContainer}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className={styles.signinButton} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className={styles.signupLink}>
              <p>Don’t have an account? <Link href="/signup">Sign up</Link></p>
            </div>

            <div className={styles.orSignIn}>
              <p>__________ or sign in with __________</p>
            </div>

            <div className={styles.socialLogos}>
              <Link href="#" className={styles.google}><FaGoogle size={40} /></Link>
              <Link href="#" className={styles.facebook}><FaFacebook size={40} /></Link>
              <Link href="#" className={styles.tiktok}><FaTiktok size={40} /></Link>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
