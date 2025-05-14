import React, { useContext, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import {
  FaCheckCircle, FaTrash, FaStar, FaTimesCircle, FaCarSide, FaDollarSign, FaCalendarAlt, FaCreditCard, FaShoppingCart
} from 'react-icons/fa';
import { currency } from '../App';

const Cart = () => {
  const {
    cartItems,
    products,
    getCartAmount,
    navigate,
    token,
    removeFromCart,
    clearCart // Make sure this is included
  } = useContext(ShopContext);

  // Add debug logging
  useEffect(() => {
    console.log('Cart Items:', cartItems);
    console.log('Products:', products);
  }, [cartItems, products]);

  // Transform cart items into detailed cart data
  const cartData = useMemo(() => {
    if (!cartItems || !products) return [];

    const processedData = Object.entries(cartItems)
      .map(([productId, cost]) => {
        const productData = products.find(p => p._id === productId);
        console.log('Processing product:', productId, productData); // Debug log

        if (!productData) {
          console.log('Product not found:', productId); // Debug log
          return null;
        }
        
        return {
          productData,
          cost: Number(cost)
        };
      })
      .filter(item => item !== null);

    console.log('Processed cart data:', processedData); // Debug log
    return processedData;
  }, [cartItems, products]);

  // Highlight the item with the highest cost
  const maxCost = cartData.length
    ? Math.max(...cartData.map((item) => item.cost))
    : 0;

  // Update the interpretMethod function to handle custom down payments
  const interpretMethod = (product, cost) => {
    if (cost <= product.price && cost >= product.downPayment) return 'downPayment';
    if (cost === product.price) return 'completePayment';
    return 'unknown';
  };

  // Add a new function to calculate remaining payments
  const calculateRemainingPayments = (product, downPayment) => {
    const remainingAmount = product.price - downPayment;
    const monthsNeeded = Math.ceil(remainingAmount / product.monthlyPayment);
    const monthlyPayment = product.monthlyPayment;

    return {
      remainingAmount,
      monthsNeeded,
      monthlyPayment
    };
  };

  // Update the monthlyScheduleText function
  const monthlyScheduleText = (product, customDownPayment) => {
    if (!product) return '';
    
    const { remainingAmount, monthsNeeded, monthlyPayment } = calculateRemainingPayments(product, customDownPayment);
    if (remainingAmount <= 0) return 'Paid in full';

    const now = new Date();
    now.setDate(now.getDate() + 30);
    const startString = now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });

    const end = new Date(now);
    end.setMonth(end.getMonth() + monthsNeeded);
    const endString = end.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600">
          <FaCalendarAlt className="text-blue-500" />
          <span>Payment Schedule</span>
        </div>
        <div className="pl-6 space-y-1 text-sm">
          <p>• Monthly Payment: <span className="font-semibold">{currency}{monthlyPayment.toLocaleString()}</span></p>
          <p>• Duration: <span className="font-semibold">~{monthsNeeded} months</span></p>
          <p>• Start Date: <span className="font-semibold">{startString}</span></p>
          <p>• End Date: <span className="font-semibold">{endString}</span></p>
        </div>
      </div>
    );
  };

  // Cart item animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const handleProceedToCheckout = () => {
    if (!token) {
      navigate('/login', { state: { from: '/place-order' } });
      toast.info('Please log in to proceed to checkout.');
      return;
    }

    // Simplify the cart data structure
    const detailedCartData = cartData
      .filter(({ productData }) => productData && productData._id)
      .map(({ productData, cost }) => ({
        _id: productData._id,
        price: cost // Use the cart cost
      }));

    console.log('Cart data being passed:', detailedCartData);

    if (!detailedCartData.length) {
      toast.error('No valid items in cart');
      return;
    }

    navigate('/place-order', { 
      state: { 
        cartDetails: detailedCartData
      } 
    });
  };

  return (
    <div className="pt-14 pb-8 min-h-screen bg-gray-50">
      <div className="text-3xl mb-6">
        <Title text1="YOUR" text2="CART" />
      </div>

      {/* Debug display */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mb-4">
          Cart Items: {JSON.stringify(Object.keys(cartItems).length)}
          <br />
          Processed Items: {JSON.stringify(cartData.length)}
        </div>
      )}

      {cartItems && Object.keys(cartItems).length > 0 && cartData.length > 0 ? (
        <>
          {/* CLEAR ALL BUTTON */}
          <div className="flex justify-end mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => clearCart()}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md"
            >
              <FaTimesCircle />
              <span>Clear All</span>
            </motion.button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {cartData.map((item, index) => {
              const { productData, cost } = item;
              const method = interpretMethod(productData, cost);
              const isHighest = cost === maxCost && maxCost > 0;

              return (
                <motion.div
                  key={productData._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`relative p-6 border-2 rounded-xl shadow-lg flex flex-col sm:flex-row gap-6
                    ${isHighest 
                      ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200' 
                      : 'bg-white border-gray-100'
                    } hover:shadow-xl transition-all duration-300`}
                >
                  {/* Highest cost badge */}
                  {isHighest && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold py-2 px-4 rounded-full 
                        flex items-center gap-1 shadow-lg transform -rotate-12"
                    >
                      <FaStar className="text-yellow-900" />
                      BEST DEAL
                    </motion.div>
                  )}

                  {/* Vehicle Image with hover effect */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-md"
                  >
                    {productData.images?.[0] ? (
                      <img
                        src={productData.images[0]}
                        alt={productData.name}
                        className="w-full h-full object-cover transform transition-transform hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FaCarSide className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </motion.div>

                  {/* Main Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FaCarSide className="text-blue-500" />
                        {productData.brand
                          ? `${productData.brand} ${productData.model || ''}`
                          : productData.name}
                      </h2>
                      
                      {/* Vehicle Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Year:</span> {productData.year}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Mileage:</span> {productData.mileage?.toLocaleString()}km
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <FaDollarSign className="text-green-500" />
                        Payment Details
                      </div>

                      {method === 'downPayment' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg">
                              <p className="text-sm text-blue-600">Down Payment</p>
                              <p className="text-lg font-bold text-blue-700">{currency}{cost.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-lg">
                              <p className="text-sm text-green-600">Total Price</p>
                              <p className="text-lg font-bold text-green-700">{currency}{productData.price.toLocaleString()}</p>
                            </div>
                          </div>
                          {monthlyScheduleText(productData, cost)}
                        </div>
                      )}

                      {method === 'completePayment' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <FaCreditCard />
                          <span>Full payment - {currency}{productData.price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 self-start sm:self-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFromCart(productData._id)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded-lg
                        transition-colors duration-300"
                    >
                      <FaTrash />
                      <span>Remove</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Cart Total + Checkout */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:relative md:bg-transparent md:border-0 md:shadow-none"
          >
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">Total Items: {cartData.length}</p>
                <p className="text-2xl font-bold text-gray-900">
                  Total: {currency}{getCartAmount().toLocaleString()}
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToCheckout}
                className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold 
                  flex items-center justify-center gap-2 hover:bg-gray-800 transition-all
                  shadow-lg hover:shadow-xl"
              >
                <FaShoppingCart className="text-xl" />
                <span>Proceed to Checkout</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          {!cartItems || Object.keys(cartItems).length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <p>Loading cart items...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
