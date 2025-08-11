"use client";
import { useEffect, useState } from "react";
import styles from "../../styles/Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    city: ""
  });

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setMessage("Login data not found. Please log in.");
      setMessageType("error");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);

      if (parsed?.email) {
        setEmail(parsed.email);
        setUser({
          first_name: parsed.first_name || "",
          last_name: parsed.last_name || "",
          phone_number: parsed.phone_number || "", // optional
          city: parsed.city || "" // optional
        });
      } else {
        setMessage("Email not found. Please log in again.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Invalid user data:", err);
      setMessage("Corrupted login data. Please log in again.");
      setMessageType("error");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
  
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const hasChanges =
      user.first_name !== storedUser.first_name ||
      user.last_name !== storedUser.last_name ||
      user.phone_number !== storedUser.phone_number ||
      user.city !== storedUser.city;
  
    if (!hasChanges) {
      setMessage("No changes detected.");
      setMessageType("info");
      return;
    }
  
    const confirmUpdate = window.confirm("Are you sure you want to update your profile?");
    if (!confirmUpdate) return;
  
    try {
      console.log(storedUser)
      const res = await fetch(`http://localhost:5000/api/profile/${storedUser.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          city: user.city
        })
      });
  
      const result = await res.json();
  
      if (!res.ok) throw new Error(result.error || "Unknown error");
  
      const updatedUser = {
        ...storedUser,
        ...user
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
  
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage(`Error updating profile: ${err.message}`);
      setMessageType("error");
    }
  
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };
  
  

  return (
    <div className={styles.profile}>
      {message && <div className={`${styles.message} ${styles[messageType]}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" value={user.first_name} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" value={user.last_name} onChange={handleChange} />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="phone_number">Phone Number</label>
          <input id="phone_number" name="phone_number" value={user.phone_number} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="city">City/Province</label>
          <input id="city" name="city" value={user.city} onChange={handleChange} />
        </div>
        <button type="submit" className={styles.updateButton}>
          Update
        </button>
      </form>
    </div>
  );
};

export default Profile;
