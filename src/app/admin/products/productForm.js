"use client";

import { useState, useEffect } from "react";

export default function ProductForm({ onProductChange, onSuccessMessage, onClose, product }) {
  const isEdit = !!product;

  const [productType, setProductType] = useState(product?.product_type || "");

  const [name, setName] = useState(product?.product_name || "");
  const [discount, setDiscount] = useState(product?.discount || "");
  const [collectionName, setCollectionName] = useState(product?.collection_name || "women");
  const [sub_category_id, setSubcategories] = useState(product?.sub_category_id || "");
  const [description, setDescription] = useState(product?.product_description || "");

  const [price, setPrice] = useState("");
  const [subcategories, setSubcategoriesData] = useState([]);

  useEffect(() => {
    async function fetchSubcategories() {
      try {
        const res = await fetch("http://localhost:5000/api/subcategories");
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const data = await res.json();
        setSubcategoriesData(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    }

    fetchSubcategories();
  }, []);

  const handleProductTypeChange = (e) => {
    setProductType(e.target.value);
  };

  const renderFormFields = () => {
    switch (productType) {
      case "Clothes":
        return (
          <>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Collection Name *</label>
              <select
                className="p-2 border rounded w-full"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required
              >
                <option value="">Select Collection</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Subcategory *</label>
              <select
                className="p-2 border rounded w-full"
                value={sub_category_id}
                onChange={(e) => setSubcategories(e.target.value)}
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.sub_category_id} value={sub.sub_category_id}>
                    {sub.sub_category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Product Name *</label>
              <input
                type="text"
                placeholder="Enter Product Name"
                className="p-2 border rounded w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Discount</label>
              <input
                type="text"
                placeholder="e.g. 10%"
                className="p-2 border rounded w-full"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Product Description</label>
              <textarea
                placeholder="Write product description here..."
                className="p-2 border rounded w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      collection_name: collectionName,
      sub_category_id,
      product_name: name,
      product_description: description,
      discount,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/products${isEdit ? `/${product.product_id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        alert(isEdit ? "Failed to update product." : "Failed to create product.");
        return;
      }

      const result = await response.json();

      if (onSuccessMessage) {
        onSuccessMessage(`${isEdit ? "Updated" : "Created"} product successfully: ${result.product_name}`);
      }

      if (onProductChange) {
        onProductChange();
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Product" : "Add New Product"}</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <select
          className="p-2 border rounded"
          value={productType}
          onChange={handleProductTypeChange}
          required
        >
          <option value="">Select Product Type</option>
          <option value="Clothes">Clothes</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">Accessories</option>
          <option value="Bag">Bag</option>
        </select>

        {renderFormFields()}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-900 text-white rounded-full"
          >
            {isEdit ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </>
  );
}
