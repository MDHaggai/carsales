// components/Review.jsx

import React, { useState, useEffect } from 'react';
import { backendUrl } from '../App'; // Ensure this points correctly to your backend URL
import { FaStar, FaRegStar, FaCar } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle error state
  const [page, setPage] = useState(1); // Current page
  const [total, setTotal] = useState(0); // Total number of reviews
  const [limit] = useState(10); // Reviews per page

  const pages = Math.ceil(total / limit);

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/reviews/all?page=${page}&limit=${limit}`);
        
        if (response.data.success) {
          console.log('Fetched reviews data:', response.data.reviews); // Debug log
          setReviews(response.data.reviews);
          setTotal(response.data.total);
        } else {
          setError(response.data.message || 'Failed to fetch reviews.');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Server Error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, [page, limit]);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className='text-yellow-400 inline' />);
      } else {
        stars.push(<FaRegStar key={i} className='text-yellow-400 inline' />);
      }
    }
    return stars;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-4 md:px-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h2>
        <p className="text-center text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 md:px-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h2>
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div className="py-8 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800"
      >
        Customer Reviews
      </motion.h2>

      <AnimatePresence>
        {reviews.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-600"
          >
            No reviews available.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-8xl mx-auto">
            {reviews.map((review, index) => (
              <motion.div 
                key={review._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                layoutId={review._id}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between relative overflow-hidden"
                style={{ 
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Rating Banner */}
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg">
                  {review.rating}/5
                </div>

                {/* User Info Section */}
                <div className="flex items-center mb-6">
                  <motion.div whileHover={{ scale: 1.1 }}>
                    {review.profilePic ? (
                      <img 
                        src={review.profilePic} 
                        alt={`${review.firstName} ${review.lastName}`} 
                        className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-4 text-xl text-white font-bold">
                        {review.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">
                      {review.firstName} {review.lastName}
                    </h3>
                    <div className="flex mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {review.text}
                  </p>
                </div>

                {/* Footer Section */}
                <div className="space-y-3 mt-auto">
                  {/* Product Reference */}
                  <div className="text-sm text-gray-600 border-t pt-3">
                    <span className="text-gray-500">on </span>
                    <span className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      {review.productId ? (
                        <>
                          {review.productId.brand} {review.productId.model || review.productId.name}
                          {review.productId.year && ` (${review.productId.year})`}
                        </>
                      ) : (
                        'Product Unavailable'
                      )}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400">
                    Posted {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(review.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced Pagination Controls */}
      {pages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center mt-12 gap-4"
        >
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
            className={`
              px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300
              ${page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
              }
            `}
          >
            ← Previous
          </button>
          
          <span className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-600">
            Page {page} of {pages}
          </span>
          
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={page === pages}
            className={`
              px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300
              ${page === pages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
              }
            `}
          >
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Review;
