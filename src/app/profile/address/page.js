"use client";
import { useEffect, useState } from "react";
import styles from '../../styles/Address.module.css';

const UserAddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    user_address_id: null,
    username: "",
    address: "",
    city: "",
    phone_number: "",
    status: "",  // default empty here, set to "default" only if user selects
    country: "Cambodia"
  });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const res = await fetch(`http://localhost:5000/api/user-addresses/${user.user_id}`);
    if (res.ok) {
      const data = await res.json();
      setAddresses(data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      user_address_id: null,
      username: "",
      address: "",
      city: "",
      phone_number: "",
      status: "",
      country: "Cambodia"
    });
    setEditing(false);
    setShowForm(false);
    setErrorMessage("");
  };

  const checkDefaultExists = () => {
    // If user selects status = "default", check if default already exists (excluding editing address)
    if (form.status === "default") {
      return addresses.some(
        (addr) =>
          addr.status === "default" &&
          (!editing || addr.user_address_id !== form.user_address_id)
      );
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.username || !form.address || !form.city || !form.phone_number) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!editing && addresses.length >= 5) {
      setErrorMessage("You can only have up to 5 addresses.");
      return;
    }

    if (checkDefaultExists()) {
      setErrorMessage("You already have a default address. Only one default allowed.");
      return;
    }

    const url = editing
      ? `http://localhost:5000/api/user-addresses/${form.user_address_id}`
      : "http://localhost:5000/api/user-addresses";

    const method = editing ? "PUT" : "POST";
    const payload = editing ? form : { ...form, user_id: user.user_id };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchAddresses();
      resetForm();
    } else {
      const data = await res.json();
      setErrorMessage(data.message || "Something went wrong.");
    }
  };

  const handleEdit = (address) => {
    setForm(address);
    setEditing(true);
    setShowForm(true);
    setErrorMessage("");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await fetch(`http://localhost:5000/api/user-addresses/${id}`, { method: "DELETE" });
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id) => {
    if (addresses.some(addr => addr.status === "default" && addr.user_address_id !== id)) {
      alert("You already have a default address.");
      return;
    }
    await fetch(`http://localhost:5000/api/user-addresses/default/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id }),
    });
    fetchAddresses();
  };

  return (
    <div className={styles.address}>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12, fontWeight: "bold" }}>
          {errorMessage}
        </div>
      )}

      {!showForm && addresses.length < 5 && (
        <button
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Address
        </button>
      )}

{showForm && (
  <div
    style={{
      marginBottom: 20,
      border: "1px solid #ccc",
      padding: 20,
      borderRadius: 8,
      backgroundColor: "#f9f9f9",
    }}
  >
    <h3 style={{ marginBottom: 15 }}>Add New Address</h3>
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        placeholder="Full Name"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        required
      />
      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
        required
      />
      <input
        name="phone_number"
        placeholder="Phone Number"
        value={form.phone_number}
        onChange={handleChange}
        required
      />
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        style={{ marginTop: 10, padding: 8, borderRadius: 4 }}
      >
        <option value="">Select Status</option>
        <option value="default">Default</option>
      </select>
      <br />
      <button
        type="submit"
        className={styles.addButton}
        style={{ marginTop: 10 }}
      >
        {editing ? "Update" : "Add"}
      </button>
      <button
        type="button"
        onClick={resetForm}
        style={{
          marginLeft: 10,
          padding: "12px 25px",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </form>
  </div>
)}

      <div className={styles.addressListWrapper}>
        <div className={styles.addressHeader}>
          <div className={styles.headerItem}>Name</div>
          <div className={styles.headerItem}>Address</div>
          <div className={styles.headerItem}>City</div>
          <div className={styles.headerItem}>Phone</div>
          <div className={styles.headerItem}>Status</div>
          <div className={styles.headerItem}>Actions</div>
        </div>

        <div className={styles.scrollableList}>
          {addresses.length === 0 && <p>No addresses found.</p>}
          {addresses.map((addr) => (
            <div
              key={addr.user_address_id}
              className={`${styles.addressItem} ${
                addr.status === "default" ? styles.defaultHighlight : ""
              }`}
            >
              <div className={styles.addressDetails}>{addr.username}</div>
              <div className={styles.addressDetails}>{addr.address}</div>
              <div className={styles.addressDetails}>{addr.city}</div>
              <div className={styles.addressDetails}>{addr.phone_number}</div>
              <div className={styles.addressDetails}>
                {addr.status === "default" ? "Default" : ""}
              </div>
              <div className={styles.addressActions}>
                <button
                  className={styles.editIcon}
                  onClick={() => handleEdit(addr)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className={styles.editIcon}
                  onClick={() => handleDelete(addr.user_address_id)}
                  title="Delete"
                  style={{ color: "red" }}
                >
                  🗑️
                </button>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAddressManager;
