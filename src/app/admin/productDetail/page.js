"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import { FiMail, FiSearch, FiUser, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import { AiOutlineSwapRight, AiOutlineSwapLeft } from "react-icons/ai";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const productID = searchParams.get("id");

  const [details, setDetails] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [productData, setProductData] = useState(null);
  const [colorData, setColor] = useState(null);
  const [colorsData, setAllColors] = useState(null);
  const [sizeData, setSize] = useState(null);
  const [sizesData, setAllSizes] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    color_id: "",
    size_id: "",
    quantity: "",
    price: "",
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageAction, setImageAction] = useState({ show: false, index: null });
  const [showConfirmImageDelete, setShowConfirmImageDelete] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // New state for success messages
  const [successMessage, setSuccessMessage] = useState("");
  // State for delete alert popup
  const [deleteAlert, setDeleteAlert] = useState("");

  useEffect(() => {
    if (!productID) return;

    // Fetch product details
    axios.get(`${API}/api/product-details`).then((res) => {
      const filtered = res.data
        .filter((d) => d.product_id == productID)
        .map((d) => ({
          ...d,
          image_urls: Array.isArray(d.image_urls)
            ? d.image_urls
            : JSON.parse(d.image || "[]"),
        }));

      setDetails(filtered);

      // Unique color_ids and size_ids
      const colorIDs = [...new Set(filtered.map((item) => item.color_id))];
      const sizeIDs = [...new Set(filtered.map((item) => item.size_id))];

      // Fetch colors for those color IDs
      Promise.all(
        colorIDs.map((colorID) => axios.get(`${API}/api/colors/${colorID}`))
      ).then((colorResponses) => {
        const colors = colorResponses.map((r) => r.data);
        setColors(colors);
      });

      // Fetch sizes for those size IDs
      Promise.all(
        sizeIDs.map((sizeID) => axios.get(`${API}/api/sizes/${sizeID}`))
      ).then((sizeResponses) => {
        const sizes = sizeResponses.map((r) => r.data);
        setSizes(sizes);
      });
    });

    // Fetch main product info
    axios.get(`${API}/api/products/${productID}`).then((res) => {
      setProductData(res.data);
    });

    // Fetch all colors for dropdown
    axios.get(`${API}/api/colors`).then((res) => {
      setAllColors(res.data);
    });

    // Fetch all sizes for dropdown
    axios.get(`${API}/api/sizes`).then((res) => {
      setAllSizes(res.data);
    });
  }, [productID]);

  // react-select options for colors
  const colourOptions = colorsData?.map((color) => ({
    value: color.color_id,
    label: color.color_name,
    color: color.color_name, // or color hex code
  }));

  // Custom render for selected color (single value)
  const customSingleValue = ({ data }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          backgroundColor: data.color,
          width: 16,
          height: 16,
          borderRadius: 8,
          display: "inline-block",
          marginRight: 8,
          border: "1px solid #ccc",
        }}
      />
      {data.label}
    </div>
  );

  // Custom render for dropdown option
  const customOption = (props) => {
    const { data, innerRef, innerProps, isFocused } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          alignItems: "center",
          padding: 10,
          cursor: "pointer",
          backgroundColor: isFocused ? "#eee" : "white",
        }}
      >
        <span
          style={{
            backgroundColor: data.color,
            width: 16,
            height: 16,
            borderRadius: 8,
            display: "inline-block",
            marginRight: 8,
            border: "1px solid #ccc",
          }}
        />
        {data.label}
      </div>
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`${file.name} exceeds 5MB size.`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    const formDataUpload = new FormData();
    validFiles.forEach((file) => formDataUpload.append("images", file));

    try {
      setUploading(true);
      const res = await axios.post(`${API}/api/upload`, formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const filenames = res.data.urls;
      setUploadedImages((prev) => [...prev, ...filenames]);
    } catch (err) {
      console.error("Image upload failed:", err?.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };


  

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        product_id: productID,
        image_urls: uploadedImages,
      };
  
      if (editData) {
        await axios.put(`${API}/api/product-details/${editData.product_detail_id}`, payload);
      } else {
        await axios.post(`${API}/api/product-details`, payload);
      }
  

  
      // Refresh UI
      const res = await axios.get(`${API}/api/product-details`);
      const filtered = res.data
        .filter((d) => d.product_id == productID)
        .map((d) => ({
          ...d,
          image_urls: Array.isArray(d.image_urls)
            ? d.image_urls
            : JSON.parse(d.image || "[]"),
        }));
      setDetails(filtered);
  
      setSuccessMessage(
        editData
          ? "Product detail updated successfully!"
          : "Product detail added successfully!"
      );
  
      setFormData({
        color_id: "",
        size_id: "",
        quantity: "",
        price: "",
      });
      setUploadedImages([]);
      setEditData(null);
  
      setTimeout(() => {
        setShowForm(false);
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/product-details/${showDeleteId}`);
    

      // Refresh details
      const res = await axios.get(`${API}/api/product-details`);
      const filtered = res.data
        .filter((d) => d.product_id == productID)
        .map((d) => ({
          ...d,
          image_urls: Array.isArray(d.image_urls)
            ? d.image_urls
            : JSON.parse(d.image || "[]"),
        }));
      setDetails(filtered);

      // Show delete success alert
      setDeleteAlert("Product detail deleted successfully!");
      setShowDeleteId(null);

      // Hide delete alert after 2 seconds
      setTimeout(() => setDeleteAlert(""), 2000);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const nextDetail = () => {
    setActiveIndex((prev) => (prev + 1) % details.length);
  };

  const prevDetail = () => {
    setActiveIndex((prev) => (prev - 1 + details.length) % details.length);
  };

  const handleImageDelete = (index) => {
    setShowConfirmImageDelete(index);
  };

  const confirmImageDelete = () => {
    setUploadedImages((prev) =>
      prev.filter((_, i) => i !== showConfirmImageDelete)
    );
    setShowConfirmImageDelete(null);
  };

  const handleImageClick = (index) => {
    setImageAction({ show: true, index });
  };

  const currentDetail = details[activeIndex];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="Products" />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            Product - {productData?.product_name || "Loading..."}
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditData(null);
              setFormData({
                color_id: "",
                size_id: "",
                quantity: "",
                price: "",
              });
              setUploadedImages([]);
            }}
            className="bg-green-700 hover:bg-green-800 transition text-white px-5 py-2 rounded-full"
          >
            Add New Product Detail
          </button>
        </div>

        {currentDetail && (
          <div
            key={currentDetail.product_detail_id}
            className="flex flex-col md:flex-row border rounded-lg shadow bg-white overflow-hidden w-full h-[80%]"
          >
            <div className="w-full md:w-1/3 h-full bg-gray-100 relative overflow-hidden">
              {currentDetail.image_urls?.length ? (
                <>
                  <img
                    src={currentDetail.image_urls[0]}
                    alt={`Detail ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {activeIndex + 1} / {details.length}
                  </span>
                  {details.length > 1 && (
                    <>
                      <button
                        onClick={prevDetail}
                        className="absolute bottom-2 left-1/4 transform -translate-x-1/2 bg-white bg-opacity-70 text-black px-3 py-1 text-sm rounded-full shadow-md hover:bg-opacity-90 transition"
                      >
                        <AiOutlineSwapLeft size={16} />
                      </button>
                      <button
                        onClick={nextDetail}
                        className="absolute bottom-2 right-1/4 transform translate-x-1/2 bg-white bg-opacity-70 text-black px-3 py-1 text-sm rounded-full shadow-md hover:bg-opacity-90 transition"
                      >
                        <AiOutlineSwapRight size={16} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="flex flex-col p-6 w-full md:w-2/3">
              <h2 className="text-lg font-bold mb-4">
                Product Detail Information
              </h2>

              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <strong>Size:</strong>
                  <div className="flex gap-2">
                    {sizes && sizes.length > 0 ? (
                      sizes.map((size) => {
                        const isCurrent =
                          currentDetail && size.size_id === currentDetail.size_id;

                        return (
                          <span
                            key={size.size_id || size.size_name}
                            className={`w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer
                              ${
                                isCurrent
                                  ? "border-blue-500 bg-blue-100 font-bold"
                                  : "border-gray-300"
                              }`}
                          >
                            {size.size_name}
                          </span>
                        );
                      })
                    ) : (
                      "No size data"
                    )}
                  </div>
                </div>
              </div>

              <p className="mb-1 flex items-center gap-2">
                <strong>Quantity:</strong> {currentDetail.quantity || "N/A"}
              </p>
              <p className="mb-1 flex items-center gap-2">
                <strong>Price:</strong> {currentDetail.price || "N/A"}
              </p>

              <div className="mb-2 flex items-center gap-2">
  <strong>Color:</strong>
  {colors && colors.length > 0 ? (
    colors.map((color) => {
      const isCurrent = currentDetail && color.color_id === currentDetail.color_id;
      return (
        isCurrent && (
          <div key={color.color_id} className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: color.color_name,
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "1px solid #ccc",
                display: "inline-block",
              }}
            />
            <span>{color.color_name}</span>
          </div>
        )
      );
    })
  ) : (
    "No color data"
  )}
</div>


              <div className="mt-auto flex gap-3">
                <button
                  className="btn bg-yellow-400 hover:bg-yellow-500 transition text-white px-4 py-2 rounded-md flex items-center gap-2"
                  onClick={() => {
                    setEditData(currentDetail);
                    setShowForm(true);
                    setFormData({
                      color_id: currentDetail.color_id,
                      size_id: currentDetail.size_id,
                      quantity: currentDetail.quantity,
                      price: currentDetail.price,
                    });
                    setUploadedImages(currentDetail.image_urls || []);
                  }}
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  className="btn bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-md flex items-center gap-2"
                  onClick={() => setShowDeleteId(currentDetail.product_detail_id)}
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Popup in form */}
        {successMessage && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow z-50 text-center">
    {successMessage}
  </div>
)}


        {/* Delete Alert Popup */}
        {deleteAlert && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow z-50 text-center">
    {deleteAlert}
  </div>
)}


        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editData ? "Edit Product Detail" : "Add Product Detail"}
              </h2>

              {/* Color Input with react-select */}
              <label className="block mb-2 font-semibold">
                Color
                <Select
                  options={colourOptions}
                  components={{ Option: customOption, SingleValue: customSingleValue }}
                  value={
                    colourOptions?.find((c) => c.value === formData.color_id) ||
                    null
                  }
                  onChange={(selected) =>
                    setFormData({ ...formData, color_id: selected.value })
                  }
                  placeholder="Select Color"
                  className="mt-1"
                />
              </label>

              {/* Size Input */}
              <label className="block mb-2 font-semibold">
                Size
                <select
                  value={formData.size_id}
                  onChange={(e) =>
                    setFormData({ ...formData, size_id: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select Size</option>
                  {sizesData?.map((size) => (
                    <option key={size.size_id} value={size.size_id}>
                      {size.size_name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Quantity Input */}
              <label className="block mb-2 font-semibold">
                Quantity
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Enter quantity"
                  min={0}
                />
              </label>

              {/* Price Input */}
              <label className="block mb-2 font-semibold">
                Price
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Enter price"
                  min={0}
                  step="0.01"
                />
              </label>

              {/* Image Upload */}
              <label className="block mb-2 font-semibold">
                Upload Images (max 5MB each)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mt-1"
                />
              </label>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${idx}`}
                        className="w-full h-20 object-cover rounded"
                        onClick={() => handleImageClick(idx)}
                      />
                      <button
                        onClick={() => handleImageDelete(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Image Delete */}
              {showConfirmImageDelete !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
                  <div className="bg-white p-4 rounded shadow">
                    <p className="mb-4">Delete this image?</p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowConfirmImageDelete(null)}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmImageDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                {uploading ? "Uploading..." : editData ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 border border-gray-300">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete this product detail?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteId(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
