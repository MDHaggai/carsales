import React, { useContext, useEffect, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';

// Update the PAYMENT_METHODS configuration
const PAYMENT_METHODS = [
  {
    id: 'chime',
    name: 'Chime',
    image: assets.chime
  },
  {
    id: 'zelle',
    name: 'Zelle',
    image: assets.zelle
  },
  {
    id: 'paypal',
    name: 'PayPal',
    image: 'https://www.paypalobjects.com/webstatic/icon/pp258.png'
  },
  {
    id: 'bitcoin',
    name: 'BTC',
    image: 'https://bitcoin.org/img/icons/opengraph.png'
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    image: assets.cashapp
  },
  {
    id: 'venmo',
    name: 'Venmo',
    image: 'https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg'
  },
  {
    id: 'other',
    name: 'Other Payment Method',
    image: 'https://cdn-icons-png.flaticon.com/512/4021/4021708.png'
  }
];

const PlaceOrder = () => {
  const location = useLocation();
  const cartDetails = location.state?.cartDetails || [];

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,  // Make sure this is included
    getCartAmount,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
    paymentMethod: '' // Add this line
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      toast.info('Please log in to place an order.');
      navigate('/login');
    }
  }, [token, navigate]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Validate all required fields
      const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'street',
        'city',
        'zipcode',
        'country',
        'phone'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }

      if (!token) {
        toast.error('Please log in to place an order');
        navigate('/login');
        return;
      }

      // Validate cart items
      if (Object.keys(cartItems).length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      // Simplify order items structure to match model
      const orderItems = cartDetails.map(item => ({
        _id: item._id,
        price: Number(item.price),
        quantity: 1
      }));

      // Validate if we have items
      if (orderItems.length === 0) {
        toast.error('No valid items in cart');
        return;
      }

      // Get total amount directly from context
      const totalAmount = getCartAmount();

      let orderData = {
        address: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state?.trim() || '',
          zipcode: formData.zipcode.trim(),
          country: formData.country.trim(),
          phone: formData.phone.trim()
        },
        items: orderItems,
        amount: totalAmount,
        paymentMethod: formData.paymentMethod // Update this line
      };

      // Debug logging
      console.log('Submitting order data:', orderData);

      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        try {
          await setCartItems({}); // Handle this carefully
          toast.success('Order placed successfully!');
          navigate('/order-confirmation');
        } catch (clearCartError) {
          console.error('Error clearing cart:', clearCartError);
          // Still navigate since order was placed
          navigate('/order-confirmation');
        }
      }
    } catch (error) {
      console.error('Order error details:', {
        message: error.message,
        response: error.response?.data
      });
      
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Please check your order details');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to place an order');
        navigate('/login');
      } else if (error.message === 'setCartItems is not a function') {
        // Handle cart clearing error but assume order was placed
        toast.warning('Order placed but error clearing cart');
        navigate('/order-confirmation');
      } else {
        toast.error('Error placing order. Please try again.');
      }
    }
  };

  // Remove the complex validation in useEffect
  useEffect(() => {
    if (!location.state?.cartDetails || cartDetails.length === 0) {
      toast.error('No items in cart');
      navigate('/cart');
      return;
    }

    // Simpler validation - just check for _id and price
    const missingDetails = cartDetails.some(item => 
      !item._id || typeof item.price !== 'number'
    );

    if (missingDetails) {
      toast.error('Invalid product details');
      navigate('/cart');
    }
  }, [cartDetails, navigate, location.state]);

  // Add this new component for the payment selector
  const PaymentMethodSelector = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="relative">
          <button
            type="button"
            className="w-full p-3 border rounded-lg bg-white flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selected ? (
              <div className="flex items-center gap-2">
                <img 
                  src={PAYMENT_METHODS.find(p => p.id === selected)?.image} 
                  alt={selected}
                  className="w-6 h-6 object-contain"
                />
                <span>{PAYMENT_METHODS.find(p => p.id === selected)?.name}</span>
              </div>
            ) : (
              <span className="text-gray-500">Select Payment Method</span>
            )}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
  
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 ${
                    selected === method.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onChange(method.id);
                    setIsOpen(false);
                  }}
                >
                  <img 
                    src={method.image} 
                    alt={method.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span>{method.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-8 pb-16 px-4 sm:px-8">
      <form
        onSubmit={onSubmitHandler}
        className="
          flex flex-col sm:flex-row justify-between gap-6
          max-w-7xl mx-auto
          border-t border-gray-200 pt-6
        "
      >
        {/* Left Side (Form Fields) */}
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px] shadow-sm p-4 rounded bg-white">
          <div className="text-xl sm:text-2xl my-3 font-semibold text-gray-800">
            <Title text1="DELIVERY" text2="INFORMATION" />
          </div>

          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="First name"
            />
            <input
              required
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="Last name"
            />
          </div>
          <input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
            type="email"
            placeholder="Email address"
          />
          <input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
            type="text"
            placeholder="Street"
          />
          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="City"
            />
            <input
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="State"
            />
          </div>
          <div className="flex gap-3">
            <input
              required
              onChange={onChangeHandler}
              name="zipcode"
              value={formData.zipcode}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="Zipcode"
            />
            <input
              required
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
              type="text"
              placeholder="Country"
            />
          </div>
          <input
            required
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-blue-400"
            type="number"
            placeholder="Phone"
          />
          <div className="mb-6">
            <PaymentMethodSelector
              selected={formData.paymentMethod}
              onChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            />
          </div>
        </div>

        {/* Right Side (Summary + Submit) */}
        <div className="flex flex-col w-full sm:w-auto">
          <div className="shadow-sm rounded bg-white p-4 h-fit">
            <CartTotal />
          </div>
          <div className="w-full text-end mt-6">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm rounded hover:bg-gray-800 transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
