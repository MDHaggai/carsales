import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaRegStar, FaShoppingCart, FaArrowLeft,
  FaPlay, FaUserCircle, FaCamera, FaMinus, FaPlus
} from 'react-icons/fa';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts';
import { backendUrl } from '../App';
import ReactGA from 'react-ga4';

ReactGA.initialize('G-M8WD1CFN81');

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Extract needed values from context
  const { products, currency, addToCart, token, user } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [media, setMedia] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Payment choice: "downPayment" or "completePayment"
  const [paymentChoice, setPaymentChoice] = useState('downPayment');

  // For brand info
  const [brandData, setBrandData] = useState(null);

  // For reviews
  const [reviews, setReviews] = useState([]);

  // For new review form
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewText, setReviewText]   = useState('');
  const [reviewFile, setReviewFile]   = useState(null);
  const [reviewRating, setReviewRating] = useState(5);

  const [customDownPayment, setCustomDownPayment] = useState(0);

  // *** Animation Variants for the Review Section ***
  const reviewContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // We'll do card-level animations (on scroll)
  const reviewCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchProductData();
    fetchProductReviews();
    ReactGA.send({ hitType: 'pageview', page: `/product/${productId}` });
    // eslint-disable-next-line
  }, [productId]);

  useEffect(() => {
    if (productData?.brand) {
      fetchBrandData(productData.brand);
    }
  }, [productData]);

  useEffect(() => {
    if (productData?.downPayment) {
      setCustomDownPayment(productData.downPayment);
    }
  }, [productData]);

  // Fetch product from context or backend
  const fetchProductData = async () => {
    let product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setMedia(product.images?.[0] || '');
      setCustomDownPayment(product.downPayment || 0);
      ReactGA.event('view_item', {
        items: [{ item_name: product.name, item_id: product._id, price: product.price }]
      });
    } else {
      try {
        const response = await axios.get(`${backendUrl}/api/product/${productId}`);
        if (response.data.success) {
          product = response.data.product;
          setProductData(product);
          setMedia(product.images?.[0] || '');
          setCustomDownPayment(product.downPayment || 0);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    }
  };

  // Fetch brand data
  const fetchBrandData = async (brandName) => {
    try {
      const response = await axios.get(`${backendUrl}/api/brand/list`);
      if (response.data.success) {
        const found = response.data.brands.find((b) => b.name === brandName);
        setBrandData(found || null);
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
    }
  };

  // Fetch product reviews
  const fetchProductReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/reviews/${productId}`);
      if (response.data.success) {
        const sorted = response.data.reviews.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setReviews(sorted);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Helper to check if media is an image
  const isImage = (url) => {
    return url && /\.(jpeg|jpg|gif|png)$/i.test(url);
  };

  if (!productData) {
    // Loading spinner while product data is null
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  // Combine images & video
  const imageArray = productData.images || [];
  const videoArray = productData.video ? [productData.video] : [];
  const combinedMedia = [...imageArray, ...videoArray];

  // Compute average rating
  const avgRating = reviews.length
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
    : 0;

  // Add to cart
  const handleAddToCart = () => {
    const costArg = paymentChoice === 'downPayment' 
      ? customDownPayment 
      : productData.price;
    if (!costArg || costArg <= 0) return;
    addToCart(productData._id, costArg);
  };

  // Star rating click
  const handleStarClick = (starValue) => {
    setReviewRating(starValue);
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error('You must be logged in to post a review');
        return;
      }
  
      if (!user) {
        toast.error('No user found. Please log in again');
        return;
      }
  
      const reviewData = new FormData();
      reviewData.append('productId', productId);
      reviewData.append('text', reviewText);
      reviewData.append('rating', String(reviewRating));
      reviewData.append('firstName', user.firstName);
      reviewData.append('lastName', user.lastName);
      reviewData.append('date', new Date().toISOString());
  
      if (reviewFile) {
        reviewData.append('profilePic', reviewFile);
      }
  
      const response = await axios.post(
        `${backendUrl}/api/reviews`, 
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.success) {
        const newReview = response.data.review;
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        setReviewText('');
        setReviewRating(5);
        setReviewFile(null);
        
        toast.success('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Error submitting review');
    }
  };

  const handleDownPaymentChange = (increment) => {
    const minDownPayment = productData?.downPayment || 0;
    const maxDownPayment = productData?.price || 0;
    
    setCustomDownPayment(prevPayment => {
      const newPayment = increment 
        ? prevPayment + 100 
        : prevPayment - 100;
      
      // Ensure payment stays within bounds
      if (newPayment < minDownPayment) return minDownPayment;
      if (newPayment > maxDownPayment) return maxDownPayment;
      return newPayment;
    });
  };

  // Some framer motion variants for the image slider
  const sliderVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // brand badge
  const brandBadge = brandData && (
    <div className="flex items-center gap-2">
      {brandData.logo && (
        <img
          src={brandData.logo}
          alt={brandData.name}
          className="w-8 h-8 object-contain"
        />
      )}
      <span className="text-sm font-medium text-gray-700">{brandData.name}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back link */}
        <motion.div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-black hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Collection
          </Link>
        </motion.div>

        {/* Two columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-4 lg:gap-12">
          {/* LEFT SIDE: Media + description */}
          <div className="flex flex-col">
            {/* Main media */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-2 sm:mb-4">
                <div className="h-96 relative">
                  <AnimatePresence initial={false} custom={activeImageIndex}>
                    <motion.div
                      key={activeImageIndex}
                      variants={sliderVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="w-full h-full"
                    >
                      {isImage(media) ? (
                        <motion.img
                          src={media}
                          alt={productData.name}
                          className="w-full h-full object-cover"
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      ) : (
                        <div className="w-full h-full">
                          <video
                            className="w-full h-full object-cover"
                            controls
                            src={media}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Thumbnails */}
              <motion.div
                className="grid grid-cols-4 gap-2 sm:gap-4"
                variants={{
                  show: { transition: { staggerChildren: 0.1 } },
                }}
                initial="hidden"
                animate="show"
              >
                {combinedMedia.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      media === item
                        ? 'border-blue-600 shadow-lg'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setMedia(item);
                      setActiveImageIndex(index);
                    }}
                  >
                    {isImage(item) ? (
                      <img
                        src={item}
                        className="w-full h-24 object-cover"
                        alt={`Thumbnail ${index}`}
                      />
                    ) : (
                      <div className="relative w-full h-24 bg-gray-100">
                        <video className="w-full h-full object-cover">
                          <source src={item} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <FaPlay className="text-white text-2xl" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Description block (only on large) */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 mt-4 hidden lg:block"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                Vehicle Description
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {productData.description}
              </p>
            </motion.div>
          </div>

          {/* RIGHT SIDE: brand, payment, etc. */}
          <motion.div
            className="flex flex-col gap-3 sm:gap-4 lg:gap-6 -mt-1 sm:mt-2 lg:mt-0" 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-col gap-1 sm:gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                {productData.brand ? (
                  <>
                    {productData.brand}
                    {productData.model ? ` ${productData.model}` : ''}
                  </>
                ) : (
                  productData.name
                )}
              </h1>
              {brandBadge}
            </div>

            {/* Condition, fuel, year, etc. */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 text-gray-700">
              {productData.condition && (
                <span className="font-medium capitalize">
                  Condition: {productData.condition}
                </span>
              )}
              {productData.transmission && (
                <span className="font-medium capitalize">
                  Transmission: {productData.transmission}
                </span>
              )}
              {productData.fuelType && (
                <span className="font-medium capitalize">
                  Fuel Type: {productData.fuelType}
                </span>
              )}
              {productData.year && (
                <span className="font-medium">Year: {productData.year}</span>
              )}
              <span className="font-medium">
                Mileage: {productData.mileage?.toLocaleString() || 0} km
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i < avgRating ? (
                    <FaStar className="text-yellow-400 text-xl" />
                  ) : (
                    <FaRegStar className="text-gray-300 text-xl" />
                  )}
                </motion.span>
              ))}
              <span className="text-gray-600 ml-2">
                ({reviews.length} reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold text-black">
                {currency}{(productData.price || 0).toLocaleString()}
              </div>
              <div className="flex gap-8 items-center text-gray-700 flex-wrap">
                <div>
                  <span className="text-sm text-gray-500 block">
                    Down Payment
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={customDownPayment}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="font-semibold"
                    >
                      {currency}{customDownPayment.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">
                    Monthly Payment
                  </span>
                  <span className="font-semibold">
                    {currency}{(productData.monthlyPayment || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Down Payment Adjuster */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Adjust Down Payment
              </label>
              <div className="flex items-center gap-4 mt-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownPaymentChange(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  disabled={customDownPayment <= (productData?.downPayment || 0)}
                >
                  <FaMinus className={customDownPayment <= (productData?.downPayment || 0) ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
                
                <div className="flex-1 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={customDownPayment}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="text-lg font-bold"
                    >
                      {currency}{customDownPayment.toLocaleString()}
                    </motion.div>
                  </AnimatePresence>
                  <div className="text-xs text-gray-500">
                    Min: {currency}{(productData?.downPayment || 0).toLocaleString()}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownPaymentChange(true)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  disabled={customDownPayment >= (productData?.price || 0)}
                >
                  <FaPlus className={customDownPayment >= (productData?.price || 0) ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
              </div>
            </div>

            {/* Payment selection */}
            <div className="flex items-center gap-4 mt-4">
              <h4 className="text-sm font-semibold text-black">
                Payment Selection:
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaymentChoice('downPayment')}
                className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-300
                  ${
                    paymentChoice === 'downPayment'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
              >
                Down Payment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaymentChoice('completePayment')}
                className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-300
                  ${
                    paymentChoice === 'completePayment'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
              >
                Complete Payment
              </motion.button>
            </div>

            {/* Add to cart + proceed to payment */}
            <div className="flex flex-col gap-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <FaShoppingCart className="text-xl" />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="w-full bg-white text-black border border-black py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
              >
                Proceed to Payment
              </motion.button>
            </div>

            {/* Guarantees */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Original product</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Easy return and exchange policy</span>
              </div>
            </div>

            {/* Description for mobile only */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 mt-4 block lg:hidden"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Vehicle Description</h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {productData.description}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* REVIEWS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mt-12"
        >
          <h2 className="text-2xl font-bold text-black mb-4">Customer Reviews</h2>

          <AnimatePresence>
            {reviews.length === 0 ? (
              <motion.p
                className="text-gray-600 mb-4"
                key="noReviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No reviews yet. Be the first to write a review!
              </motion.p>
            ) : (
              <motion.div
                variants={reviewContainerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                key="reviewList"
              >
                {reviews.map((review, index) => {
                  // Build a star display for each review:
                  const starIcons = [...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < review.rating ? (
                        <FaStar className="text-yellow-400 text-xl" />
                      ) : (
                        <FaRegStar className="text-gray-300 text-xl" />
                      )}
                    </span>
                  ));

                  return (
                    <motion.div
                      key={review._id || index}
                      className="relative bg-white rounded-lg shadow-md p-8 mb-6 text-xl text-gray-800 leading-relaxed
                                 border border-gray-100"
                      variants={reviewCardVariants}
                      initial="hidden"
                      whileInView="visible"
                      transition={{ duration: 0.7 }}
                      viewport={{ once: true }}
                    >
                      {/* Top line: profile pic & email on the same line */}
                      <div className="flex items-center gap-4 mb-3">
                        {review.profilePic ? (
                          <img
                            src={review.profilePic}
                            alt="Reviewer"
                            className="w-16 h-16 object-cover rounded-full border border-gray-300"
                          />
                        ) : (
                          <FaUserCircle className="w-16 h-16 text-gray-400" />
                        )}
                        <h4 className="text-2xl font-bold text-blue-600">
                          {review.firstName} {review.lastName}
                        </h4>
                      </div>

                      {/* The review text with quotes */}
                      <p className="italic mb-4">
                        &ldquo;{review.text}&rdquo;
                      </p>

                      {/* Star rating below text */}
                      <div className="flex items-center gap-1 mb-2">
                        {starIcons}
                      </div>

                      {/* Date in bottom-right */}
                      <span className="absolute bottom-2 right-4 text-sm text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* WRITE A REVIEW */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Write a Review</h3>

            {/* If user is NOT logged in => show message, hide form */}
            {!token || !user ? (
              <p className="text-red-600 text-base font-semibold">
                You must log in to post a review.
              </p>
            ) : (
              <>
                {/* If user is logged in, show user email & pic (read-only block) */}
                <div className="flex items-center gap-3 mb-4">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="User's profile"
                      className="w-10 h-10 object-cover rounded-full border"
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                  )}
                  <span className="text-gray-700 font-medium">{user.email}</span>
                </div>

                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-4"
                  encType="multipart/form-data"
                >
                  {/* Rating selection */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <span
                          key={val}
                          onClick={() => handleStarClick(val)}
                          className="cursor-pointer text-3xl"
                        >
                          {val <= reviewRating ? (
                            <FaStar className="text-yellow-400" />
                          ) : (
                            <FaRegStar className="text-black" />
                          )}
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {reviewRating} Star{reviewRating > 1 && 's'}
                      </span>
                    </div>
                  </div>

                  {/* Review text */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Review Text
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                      placeholder="Write your thoughts"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded font-medium hover:bg-blue-700 transition"
                  >
                    Submit Review
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Debug section for brand - add this right before RelatedProducts */}
        {console.log("Debug Product.jsx - brand:", productData.brand)}
        {console.log("Debug Product.jsx - product:", productData._id)}

        {/* Then your RelatedProducts component */}
        <RelatedProducts 
          brand={productData.brand} 
          currentProductId={productData._id}
        />
      </div>
    </motion.div>
  );
};

export default Product;
