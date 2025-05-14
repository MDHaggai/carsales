import React, { useState, useEffect } from 'react';
import { backendUrl } from '../App';
import { FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ReviewAdvert = () => {
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch all reviews on component mount
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/reviews/all`, {
          params: {
            limit: 10 // Get enough reviews to rotate through
          }
        });
        
        if (response.data.success) {
          console.log('Fetched reviews data:', response.data.reviews); // Debug log
          setReviews(response.data.reviews);
          setDisplayedReviews(getRandomReviews(response.data.reviews));
        } else {
          console.error('Failed to fetch reviews:', response.data.message);
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  // Function to get three unique random reviews
  const getRandomReviews = (allReviews) => {
    if (allReviews.length <= 3) return allReviews;
    const shuffled = [...allReviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Update displayed reviews every 3 seconds
  useEffect(() => {
    if (reviews.length <= 3) return;
    const interval = setInterval(() => {
      setDisplayedReviews(getRandomReviews(reviews));
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [reviews]);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 inline" />);
      }
    }
    return stars;
  };

  // Updated animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.8,
      rotateY: 45
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      rotateY: -45,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    hover: { opacity: 1, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="py-8 px-4 md:px-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 md:px-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-2xl text-red-500">Failed to load reviews. Please try again later.</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 px-4 md:px-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">No reviews available.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="py-16 px-4 md:px-8 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Customer Experiences
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={displayedReviews.map(r => r._id).join('-')}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {displayedReviews.map((review, index) => (
              <motion.div
                key={`${review._id}-${index}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 relative overflow-hidden border border-white/20"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
                <FaQuoteLeft className="text-4xl text-white/20 absolute top-4 right-4" />

                {/* Updated User Info Section */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    {review.profilePic ? (
                      <img
                        src={review.profilePic}
                        alt={`${review.firstName} ${review.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl text-white font-bold">
                        {review.firstName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <motion.div 
                      className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-[150px]">
                      {review.firstName} {review.lastName}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {i < review.rating ? (
                            <FaStar className="text-yellow-400" />
                          ) : (
                            <FaRegStar className="text-yellow-400/50" />
                          )}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <motion.p 
                  className="text-white/90 leading-relaxed mb-6 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  "{review.text}"
                </motion.p>

                {/* Product and Date Info */}
                <div className="border-t border-white/10 pt-4 mt-auto">
                  <p className="text-white/70 text-sm mb-1">
                    <span className="text-gray-400">on </span>
                    <span className="font-semibold text-purple-300">
                      {review.productId ? (
                        <>
                          {review.productId.brand} {review.productId.model || review.productId.name}
                          {review.productId.year && ` (${review.productId.year})`}
                        </>
                      ) : (
                        'Product Unavailable'
                      )}
                    </span>
                  </p>
                  <p className="text-white/50 text-xs">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReviewAdvert;