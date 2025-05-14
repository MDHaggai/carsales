import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStar, FaSearch, FaFilter, FaComments, FaSpinner, FaTimes, FaChevronLeft, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const Reviews = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    firstName: '',
    lastName: '',
    text: '',
    rating: 0,
    date: '',
    profilePic: null
  });
  
  // New state for filtering and searching
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState(['All Brands']);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  
  const imageInputRef = useRef(null);
  const navigate = useNavigate();
  const [productReviewCounts, setProductReviewCounts] = useState({});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const pageTransition = {
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchProducts();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      fetchReviewCounts();
      
      // Extract unique brands for filtering
      const uniqueBrands = ['All Brands', ...new Set(products.map(product => product.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    }
  }, [products]);

  // Filter products when search term or brand filter changes
  useEffect(() => {
    filterProducts();
  }, [searchTerm, brandFilter, products]);

  const filterProducts = () => {
    let result = [...products];
    
    // Apply brand filter
    if (brandFilter !== 'All Brands') {
      result = result.filter(product => product.brand === brandFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
        (product.model && product.model.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredProducts(result);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        const productsData = response.data.products.reverse();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message);
    }
  };

  const fetchReviewCounts = async () => {
    try {
      const promises = products.map(product => 
        axios.get(`${backendUrl}/api/reviews/${product._id}`)
      );
      const responses = await Promise.all(promises);
      const counts = {};
      responses.forEach((response, index) => {
        if (response.data.success) {
          counts[products[index]._id] = response.data.reviews.length;
        }
      });
      setProductReviewCounts(counts);
    } catch (error) {
      console.error('Error fetching review counts:', error);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/reviews/${productId}`);
      if (response.data.success) {
        // Ensure reviews have firstName and lastName
        const formattedReviews = response.data.reviews.map(review => ({
          ...review,
          firstName: review.firstName || 'Anonymous',
          lastName: review.lastName || 'User'
        }));
        setReviews(formattedReviews);
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchReviews(product._id);
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    // Smooth scroll to edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (reviewId) => {
    try {
      await axios.delete(`${backendUrl}/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews(selectedProduct._id);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const uploadImageToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'review'); // Use your actual upload preset

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dc1twaujd/image/upload', formData); // Using your Cloudinary cloud name
      return response.data.secure_url; // Return the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSaveClick = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      let profilePicUrl = editingReview?.profilePic || newReview.profilePic;

      if (profilePicUrl instanceof File) {
        profilePicUrl = await uploadImageToCloudinary(profilePicUrl);
      }

      const reviewData = {
        firstName: editingReview ? editingReview.firstName : newReview.firstName,
        lastName: editingReview ? editingReview.lastName : newReview.lastName,
        text: editingReview ? editingReview.text : newReview.text,
        rating: Number(editingReview ? editingReview.rating : newReview.rating),
        date: editingReview ? editingReview.date : newReview.date || new Date().toISOString(),
        productId: selectedProduct._id,
        profilePic: profilePicUrl
      };

      if (editingReview) {
        await axios.put(`${backendUrl}/api/reviews/${editingReview._id}`, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await axios.post(`${backendUrl}/api/reviews`, reviewData);
        toast.success('Review added successfully!');
      }

      // Reset form and refresh reviews
      if (imageInputRef.current) {
        imageInputRef.current.value = null;
      }

      await fetchReviews(selectedProduct._id);
      setEditingReview(null);
      setNewReview({
        firstName: '',
        lastName: '',
        text: '',
        rating: 0,
        date: '',
        profilePic: null,
      });
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error(error.response?.data?.message || 'Failed to save review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (editingReview) {
      setEditingReview((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    } else {
      setNewReview((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const getProfilePicUrl = (profilePic) => {
    return profilePic ? profilePic : '/path-to-your-default-avatar-image'; // Adjusted to use the Cloudinary URL directly
  };

  return (
    <div className='container mx-auto p-6'>
      {!selectedProduct ? (
        <>
          <h2 className='text-3xl font-bold text-gray-800 mb-6'>Product Reviews Management</h2>
          <div className='flex justify-between items-center mb-4'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search products...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <FaSearch className='absolute right-3 top-3 text-gray-400' />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2'
            >
              <FaFilter />
              Filters
            </button>
          </div>
          {showFilters && (
            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className='bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center gap-2'
                  >
                    {sortOrder === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setBrandFilter('All Brands');
                    setSearchTerm('');
                    setShowFilters(false);
                  }}
                  className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-2'
                >
                  <FaTimes />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className='bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer'
                onClick={() => handleProductClick(product)}
              >
                <div className="relative h-48 overflow-hidden group">
                  <img 
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' 
                    src={product.images?.[0] || product.image?.[0]} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">View Reviews</span>
                  </div>
                  {product.bestseller && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Bestseller
                    </div>
                  )}
                </div>
                <div className='p-4'>
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{product.brand}</span>
                    <span className="text-lg font-bold text-blue-600">{currency}{product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <FaComments className="text-blue-500" />
                      <span className="text-sm font-medium">
                        {productReviewCounts[product._id] || 0} Reviews
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-sm font-medium">
                        {product.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={() => setSelectedProduct(null)}
            className='bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 mb-6 flex items-center gap-2'
          >
            ← Back to Products
          </button>

          <h2 className='text-2xl font-bold mb-6 text-gray-800'>
            Reviews for {selectedProduct.name}
          </h2>

          <div className='mb-8 bg-gray-50 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold mb-4'>{editingReview ? 'Edit Review' : 'Add New Review'}</h3>
            <div className='grid gap-4'>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type='text'
                  name='firstName'
                  placeholder='First Name'
                  value={editingReview ? editingReview.firstName : newReview.firstName}
                  onChange={handleChange}
                  className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                />
                <input
                  type='text'
                  name='lastName'
                  placeholder='Last Name'
                  value={editingReview ? editingReview.lastName : newReview.lastName}
                  onChange={handleChange}
                  className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                />
              </div>
              <textarea
                name='text'
                placeholder='Write your review here...'
                value={editingReview ? editingReview.text : newReview.text}
                onChange={handleChange}
                className='border rounded-lg px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <input
                type='number'
                name='rating'
                placeholder='Rating (1-5)'
                min="1"
                max="5"
                value={editingReview ? editingReview.rating : newReview.rating}
                onChange={handleChange}
                className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <input
                type='datetime-local'
                name='date'
                value={editingReview ? editingReview.date : newReview.date}
                onChange={handleChange}
                className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <input
                type='file'
                name='profilePic'
                accept='image/*'
                ref={imageInputRef}
                onChange={handleChange}
                className='border rounded-lg px-4 py-2'
              />
              <button 
                onClick={handleSaveClick} 
                className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300'
              >
                {editingReview ? 'Save Changes' : 'Add Review'}
              </button>
            </div>
          </div>

          <h3 className='text-xl font-semibold mb-4'>Existing Reviews</h3>
          {reviews.length > 0 ? (
            <div className='space-y-4'>
              {reviews.map((review) => (
                <div key={review._id} className='bg-white border rounded-lg p-6 shadow-sm'>
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      <img 
                        src={getProfilePicUrl(review.profilePic)} 
                        alt="Profile" 
                        className='w-16 h-16 rounded-full object-cover border-2 border-gray-200' 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/64?text=User';
                        }}
                      />
                    </div>
                    <div className='flex-grow'>
                      <p className="font-semibold text-gray-800">
                        {review.firstName} {review.lastName}
                      </p>
                      <div className="flex gap-1 my-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <p className="text-gray-600 my-2">{review.text}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleString()}
                      </p>
                      <div className='flex gap-2 mt-4'>
                        <button 
                          onClick={() => handleEditClick(review)} 
                          className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors'
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(review._id)} 
                          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No reviews found for this product.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
