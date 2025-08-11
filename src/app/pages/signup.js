"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/SignUp.module.css';
import { useRouter } from 'next/navigation';
import Logo from "../assets/Logo.png";
import { FaFacebook, FaGoogle, FaTiktok } from 'react-icons/fa';
import image from "../assets/image.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true); // Disable form submission while processing

    try {
      // Send the data to the backend
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // sending email as username
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
      
        // Save all user data in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify({
          user_id: user.user_id,
          accessToken: data.token,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          city: user.city,
          role_id: user.role_id,
        }));
        localStorage.setItem('firstName', user.first_name);
        localStorage.setItem('lastName', user.last_name);
        localStorage.setItem('role_id', user.role_id);
        localStorage.setItem('email', user.email);
        
      
        setSuccess(data.message);
        setError('');
      
        // Redirect by role
        if (user.role_id === 2 || user.role_id === 3) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }      
    } catch (error) {
      console.error(error);
      setError('An error occurred. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.leftSide}>
          <Image src={image} alt="SignUp Image" width={500} height={500} />
        </div>

        <div className={styles.rightSide}>
          <div className={styles.logoWrapper}>
            <Link href="/" className={styles.logoContainer}>
              <div className={styles.roundLogo}>
                <Image src={Logo} alt="Logo" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <span className={styles.brandName}>SphaeroStyle</span> {/* Brand name next to it */}
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" required onChange={handleInputChange} />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" required onChange={handleInputChange} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required onChange={handleInputChange} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required onChange={handleInputChange} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required onChange={handleInputChange} />
            </div>

            <button type="submit" className={styles.signUpButton} disabled={isSubmitting}>Sign Up</button>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.loginLink}>
              <p>Already have an account? <Link href="/login">Sign In</Link></p>
            </div>

            <div className={styles.orSignUp}>
              <p>__________ or sign up with __________</p>
            </div>

            <div className={styles.socialLogos}>
              {/* Google Icon */}
              <Link href="#" className={styles.google}>
                <FaGoogle size={40} />
              </Link>
              {/* Facebook Icon */}
              <Link href="#" className={styles.facebook}>
                <FaFacebook size={40} />
              </Link>
              {/* TikTok Icon */}
              <Link href="#" className={styles.tiktok}>
                <FaTiktok size={40} />
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
