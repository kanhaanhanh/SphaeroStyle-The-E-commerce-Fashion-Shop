import axios from 'axios';

const API_URL = 'http://localhost:5000/api/add-to-carts';

// Add to cart
export const addToCart = async (productId, accessoryId, price, quantity, sizeId, colorId, discount) => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accessToken = user?.accessToken || '';

    if (!accessToken) {
      return 'Authentication required';
    }

    const response = await axios.post(
      API_URL,
      {
        product_id: productId,
        product_accessory_id: accessoryId,
        price,
        quantity,
        size_id: sizeId,
        color_id: colorId,
        discount,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.message;
  } catch (error) {
    console.error('Add to cart error:', error);
    return 'Error adding to cart';
  }
};

// Remove from cart
export const removeFromCart = async (productId, accessoryId) => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accessToken = user?.accessToken || '';

    if (!accessToken) {
      return 'Authentication required';
    }

    const response = await axios.delete(API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { product_id: productId, product_accessory_id: accessoryId },
    });

    return response.data.message;
  } catch (error) {
    console.error('Remove from cart error:', error);
    return 'Error removing from cart';
  }
};

// Check if item is in cart
export const checkCartItem = async (productId) => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accessToken = user?.accessToken || '';

    if (!accessToken) {
      return false;
    }

    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = response.data;
    return Array.isArray(data) && data.some((item) => item.product_id === Number(productId));
  } catch (error) {
    console.error('Check cart item error:', error);
    return false;
  }
};
