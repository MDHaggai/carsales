// ShopContext.js
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode'; // Using default export from jwt-decode@3.1.2

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '$';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // For search bar control
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Cart: each key is productId, value is the numeric cost (accumulated)
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : {};
  });

  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Verify token format
        const decoded = jwt_decode(storedToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          return storedToken;
        } else {
          localStorage.removeItem('token');
          return null;
        }
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');

  const navigate = useNavigate();

  // Persist cartItems to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // --------------------
  // CART METHODS
  // --------------------
  const addToCart = async (itemId, costArg) => {
    costArg = parseFloat(costArg); // Ensure costArg is a number
    if (isNaN(costArg) || costArg < 0) {
      toast.error('Invalid cost – cannot add to cart');
      return;
    }
    
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId] = parseFloat(cartData[itemId]) + costArg;
    } else {
      cartData[itemId] = costArg;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, cost: costArg },
          { headers: { token } }
        );
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message);
      }
    }
    toast.success('Item added to cart!');
  };

  const removeFromCart = async (itemId) => {
    let cartData = { ...cartItems };
    if (cartData[itemId] !== undefined) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.info('Item removed from cart.');

      if (token) {
        try {
          await axios.post(
            `${backendUrl}/api/cart/remove`,
            { itemId },
            { headers: { token } }
          );
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || error.message);
        }
      }
    }
  };

  const clearCart = async () => {
    setCartItems({});
    toast.info('All items cleared from cart.');
    if (token) {
      try {
        await axios.post(`${backendUrl}/api/cart/clear`, {}, { headers: { token } });
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  // Returns the count of distinct items
  const getCartCount = () => {
    return Object.keys(cartItems).length;
  };

  // Returns the total cost (summing numeric values)
  const getCartAmount = () => {
    return Object.values(cartItems).reduce((total, cost) => {
      const numCost = parseFloat(cost);
      return total + (isNaN(numCost) ? 0 : numCost);
    }, 0);
  };

  // --------------------
  // PRODUCTS METHODS
  // --------------------
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // --------------------
  // USER + CART SYNC METHODS
  // --------------------
  const getUserCart = async (tokenToUse) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: tokenToUse } }
      );
      if (response.data.success) {
        const backendCart = response.data.cartData;
        const mergedCart = { ...cartItems };
        for (const itemId in backendCart) {
          mergedCart[itemId] = (mergedCart[itemId] || 0) + backendCart[itemId];
        }
        setCartItems(mergedCart);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchCurrentUser = async (tokenToUse) => {
    console.log('Fetching user /me with token:', tokenToUse);
    const meResp = await axios.get(`${backendUrl}/api/user/me`, {
      headers: { Authorization: `Bearer ${tokenToUse}` },
    });
    if (meResp.data.success) {
      setUser(meResp.data.user);
    } else {
      setUser(null);
    }
  };

  // Initialize user if token exists
  useEffect(() => {
    const initializeUser = async () => {
      if (token) {
        try {
          if (token.split('.').length === 3) {
            const decodedToken = jwt_decode(token);
            if (decodedToken.id) {
              setUserId(decodedToken.id);
              await fetchCurrentUser(token);
              await getUserCart(token);
            } else {
              console.log('Decoded token has no .id => logging out');
              localStorage.removeItem('token');
              setToken('');
              setUser(null);
              setUserId('');
            }
          } else {
            console.log('Token not valid => removing it');
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
            setUserId('');
          }
        } catch (error) {
          console.error('Error initializing user:', error);
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
          setUserId('');
        }
      } else {
        setUser(null);
        setUserId('');
      }
    };
    initializeUser();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    getProductsData();
  }, []);

  const value = {
    products,
    currency,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,  // Make sure this is included
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartAmount,
    token,
    setToken,
    user,
    userId,
    navigate,
    backendUrl,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
