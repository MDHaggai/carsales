// components/LatestCollection.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { backendUrl, currency } from '../App';
import { FaCar, FaChevronRight, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LatestCollection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const MOBILE_LIMIT = 4;  // Show 4 cars on mobile
  const DESKTOP_LIMIT = 6; // Show 6 cars on desktop

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      backgroundColor: "#3B82F6",
      color: "#ffffff",
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the same endpoint as Collection component
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          const allProducts = response.data.products;
          console.log('Total products fetched:', allProducts.length); // Debug log
          
          // Store all products
          setProducts(allProducts);
          
          // Set initial visible products based on screen size
          const initialLimit = window.innerWidth <= 768 ? MOBILE_LIMIT : DESKTOP_LIMIT;
          console.log('Initial limit:', initialLimit); // Debug log
          
          setVisibleProducts(allProducts.slice(0, initialLimit));
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      
      if (!showAll) {
        const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
        console.log('Resize limit:', limit); // Debug log
        setVisibleProducts(products.slice(0, limit));
      }
    };

    handleResize(); // Call it once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products, showAll]);

  const handleShowMore = () => {
    console.log('Show more clicked, showing all products:', products.length);
    setVisibleProducts(products);
    setShowAll(true);
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-gray-800"
        >
          Latest Collection
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-t-2xl"></div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-200 h-6 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 w-full rounded"></div>
                    <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Latest Collection</h2>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 p-4 rounded-lg text-red-500"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3"
      >
        <FaCar className="text-blue-600" />
        <span>Premium Auto Collection</span>
      </motion.h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {visibleProducts.map((product) => (
          <motion.div
            key={product._id}
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-[600px]"
            whileHover={{ y: -8 }}
          >
            {/* Image Section - Increased height */}
            <div className="relative h-[350px] overflow-hidden"> {/* Increased from h-64 */}
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {product.condition}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 justify-between">
              {/* Vehicle Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-1">{product.brand} {product.model} {product.year}</p>
              </div>

              {/* Price and Actions */}
              <div className="mt-auto">
                {/* Price Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Price</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currency}{product.price.toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleViewDetails(product._id)}
                    className="flex-1 py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold 
                             hover:bg-blue-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </button>
                  <button className="p-3 border-2 border-red-400 text-red-400 rounded-lg hover:bg-red-50 
                           transition-colors duration-300">
                    <FaHeart className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Show More Button */}
      {!showAll && products.length > visibleProducts.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <motion.button
            onClick={handleShowMore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white px-8 py-4 rounded-full font-semibold shadow-lg 
                     hover:shadow-xl transition-all duration-300"
          >
            <span>Discover More</span>
            <FaChevronRight className="group-hover:translate-x-2 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default LatestCollection;
