import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner, FaTruck, FaMapMarkerAlt, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
const Reviews = () => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    email: '',
    text: '',
    rating: 0,
    date: '',
    profilePic: null,  // Profile picture field
  });
  const imageInputRef = useRef(null); // Reference to reset image input
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/reviews/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchReviews(product._id);
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
  };

  const handleDeleteClick = async (reviewId) => {
    try {
      await axios.delete(`${backendUrl}/api/reviews/${reviewId}`);
      fetchReviews(selectedProduct._id);
    } catch (error) {
      console.error('Error deleting review:', error);
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
    const formData = new FormData();
    let profilePicUrl = editingReview?.profilePic || newReview.profilePic;

    if (profilePicUrl instanceof File) {
      profilePicUrl = await uploadImageToCloudinary(profilePicUrl); // Upload the image to Cloudinary
    }

    if (editingReview) {
      formData.append('email', editingReview.email);
      formData.append('text', editingReview.text);
      formData.append('rating', editingReview.rating);
      formData.append('date', editingReview.date);
      if (profilePicUrl) {
        formData.append('profilePic', profilePicUrl);
      }
      await axios.put(`${backendUrl}/api/reviews/${editingReview._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      formData.append('email', newReview.email);
      formData.append('text', newReview.text);
      formData.append('rating', newReview.rating);
      formData.append('date', newReview.date);
      formData.append('productId', selectedProduct._id);
      if (profilePicUrl) {
        formData.append('profilePic', profilePicUrl);
      }
      await axios.post(`${backendUrl}/api/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Notify success and reset image input
    toast.success('Review successfully added with profile picture!');
    if (imageInputRef.current) {
      imageInputRef.current.value = null; // Reset the image input field
    }

    fetchReviews(selectedProduct._id);
    setEditingReview(null);
    setNewReview({
      email: '',
      text: '',
      rating: 0,
      date: '',
      profilePic: null,  // Reset profile picture
    });
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
    <div className='container mx-auto p-4'>
      {!selectedProduct ? (
        <>
          <h2 className='text-2xl font-bold mb-4'>Select a Product to Manage Reviews</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {products.map((product) => (
              <div
                key={product._id}
                className='border p-4 cursor-pointer hover:bg-gray-100'
                onClick={() => handleProductClick(product)}
              >
                <img className='w-full h-32 object-cover' src={product.image[0]} alt={product.name} />
                <h3 className='text-lg font-semibold mt-2'>{product.name}</h3>
                <p>{currency}{product.price}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedProduct(null)}
            className='bg-gray-500 text-white px-4 py-2 mb-4'
          >
            Back to Product List
          </button>

          <h2 className='text-2xl font-bold mb-4'>Manage Reviews for {selectedProduct.name}</h2>

          <div className='mb-8'>
            <h3 className='text-xl font-semibold mb-2'>{editingReview ? 'Edit Review' : 'Add New Review'}</h3>
            <div className='flex flex-col gap-4'>
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={editingReview ? editingReview.email : newReview.email}
                onChange={handleChange}
                className='border px-4 py-2'
              />
              <textarea
                name='text'
                placeholder='Review'
                value={editingReview ? editingReview.text : newReview.text}
                onChange={handleChange}
                className='border px-4 py-2'
              />
              <input
                type='number'
                name='rating'
                placeholder='Rating (1-5)'
                value={editingReview ? editingReview.rating : newReview.rating}
                onChange={handleChange}
                className='border px-4 py-2'
              />
              <input
                type='datetime-local'
                name='date'
                placeholder='Date and Time'
                value={editingReview ? editingReview.date : newReview.date}
                onChange={handleChange}
                className='border px-4 py-2'
              />
              <input
                type='file'
                name='profilePic'
                accept='image/*'
                ref={imageInputRef}  // Attach ref to reset image input
                onChange={handleChange}
                className='border px-4 py-2'
              />
              <button onClick={handleSaveClick} className='bg-blue-500 text-white px-4 py-2'>
                {editingReview ? 'Save Changes' : 'Add Review'}
              </button>
            </div>
          </div>

          <h3 className='text-xl font-semibold mb-4'>Existing Reviews</h3>
          {reviews.length > 0 ? (
            <ul className='space-y-4'>
              {reviews.map((review) => (
                <li key={review._id} className='border p-4 flex items-start'>
                  {review.profilePic && (
                    <img 
                      src={getProfilePicUrl(review.profilePic)} 
                      alt="Profile" 
                      className='w-16 h-16 rounded-full mr-4' 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/path-to-your-default-avatar-image'; }}
                    />
                  )}
                  <div>
                    <p><strong>Email:</strong> {review.email}</p>
                    <p><strong>Review:</strong> {review.text}</p>
                    <p><strong>Rating:</strong> {review.rating}</p>
                    <p><strong>Date:</strong> {new Date(review.date).toLocaleString()}</p>
                    <div className='flex gap-2 mt-2'>
                      <button onClick={() => handleEditClick(review)} className='bg-yellow-500 text-white px-4 py-2'>Edit</button>
                      <button onClick={() => handleDeleteClick(review._id)} className='bg-red-500 text-white px-4 py-2'>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews found for this product.</p>
          )}
        </>
      )}
    </div>
  );
};



const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      toast.error('Please login first');
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Transform the orders data to include calculated totals
        const transformedOrders = response.data.orders.map(order => ({
          ...order,
          totalAmount: order.items?.reduce((total, item) => 
            total + (item.price * item.quantity), 0) || 0,
          itemCount: order.items?.length || 0
        }));
        setOrders(transformedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
      } else {
        toast.error('Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
  
    try {
      const response = await axios.delete(
        `${backendUrl}/api/order/delete/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        toast.success('Order deleted successfully');
        setOrders(orders.filter(order => order._id !== orderId));
      } else {
        toast.error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };
  

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Order Management</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : orders.length > 0 ? (
        <div className="grid gap-4 sm:gap-6">
          {orders.map((order) => (
            <motion.div 
              key={order._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 sm:p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Order #{order._id?.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.items?.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <img 
                        src={item.productImage || item.image?.[0]} 
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/64?text=Product';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        <p className="text-blue-600 font-semibold">
                          {currency}{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-red-500 hover:text-red-600 transition-colors p-2"
                      title="Delete Order"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <p className="text-lg font-bold text-blue-600">
                      Total: {currency}{order.totalAmount?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => navigate(`/admin/order/${order._id}`)}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center"
                    >
                      <FaEye />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
