import axios from 'axios';

export const addToFavorites = async (productId, accessoryId) => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accessToken = user?.accessToken || '';

    if (!accessToken) {
      return 'Authentication required';
    }

    const response = await axios.post(
      'http://localhost:5000/api/favorites',
      {
        product_id: productId,
        product_accessory_id: accessoryId,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.message;
  } catch (error) {
    console.error("Add to favorites error:", error);
    return 'Error adding to favorites';
  }
};

export const removeFromFavorites = async (productId, accessoryId) => {
    try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const accessToken = user?.accessToken || '';

        if (!accessToken) {
            console.warn("Authentication required");
            return 'Authentication required';
        }

        const response = await axios.delete('http://localhost:5000/api/favorites', {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { product_id: productId, product_accessory_id: accessoryId } // Send data in request body
        });

        return response.data.message;
    } catch (error) {
        console.error("Error removing favorite:", error);
        return 'Error removing favorite';
    }
};

export const checkFavorite = async (productId) => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accessToken = user?.accessToken || '';

    if (!accessToken) {
      console.warn('Authentication required');
      return false;
    }

    const response = await axios.get('http://localhost:5000/api/favorites', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = response.data; // Should be array of favorites
    console.log("Favorites Data:", data);

    return Array.isArray(data) && data.some((item) => item.product_id === Number(productId));
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
};
