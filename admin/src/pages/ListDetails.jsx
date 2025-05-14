import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaVideo } from 'react-icons/fa';

const ListDetails = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  // All fields we can edit
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    description: '',
    price: '',
    downPayment: '',
    monthlyPayment: '',
    mileage: '',
    condition: 'New',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: [],
    isPopular: false,
    brandLogo: '',
    date: '',
    images: [],
    videos: []
  });

  // New file uploads
  const [newImages, setNewImages] = useState(Array(4).fill(null));
  const [newVideos, setNewVideos] = useState(Array(2).fill(null));

  // For display
  const [currentImages, setCurrentImages] = useState([]);
  const [currentVideos, setCurrentVideos] = useState([]);

  // Common features
  const commonFeatures = [
    'Leather Seats', 'Sunroof', 'Navigation System',
    'Bluetooth', 'Backup Camera', 'Parking Sensors',
    'Heated Seats', 'Third Row Seating', 'Apple CarPlay',
    'Android Auto', 'Blind Spot Monitor', 'Lane Departure Warning'
  ];

  // Add state for timer
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchBrands();
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/brand/list`);
      if (res.data.success) setBrands(res.data.brands);
    } catch (error) {
      toast.error('Failed to load brands');
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/product/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const product = res.data.product;
        setFormData({
          name: product.name || '',
          brand: product.brand || '',
          model: product.model || '',
          year: product.year || new Date().getFullYear(),
          description: product.description || '',
          price: product.price || '',
          downPayment: product.downPayment || '',
          monthlyPayment: product.monthlyPayment || '',
          mileage: product.mileage || '',
          condition: product.condition || 'New',
          transmission: product.transmission || 'Automatic',
          fuelType: product.fuelType || 'Petrol',
          features: product.features || [],
          isPopular: product.isPopular || false,
          brandLogo: product.brandLogo || '',
          date: product.date || '',
          images: product.images || [],
          videos: product.videos || []
        });
        setCurrentImages(product.images || []);
        setCurrentVideos(product.videos || []);
      }
    } catch (error) {
      toast.error('Error fetching product details');
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for countdown
  useEffect(() => {
    let timer;
    
    if (formData.shipping?.movementStatus === 'moving') {
      timer = setInterval(() => {
        setTimeLeft(current => {
          if (current <= 0) {
            clearInterval(timer);
            return 0;
          }
          return current - (1/60); // Decrease by 1 second
        });
      }, 1000);
  
      // Initialize timeLeft when movement starts
      if (formData.shipping.timeLeft) {
        setTimeLeft(formData.shipping.timeLeft);
      }
    }
  
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [formData.shipping?.movementStatus, formData.shipping?.timeLeft]);

  // Field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'number') {
      // Numeric
      const numVal = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numVal }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Toggle a feature in the array
  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Choose new images
  const handleImageChange = (e, i) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...newImages];
      updated[i] = file;
      setNewImages(updated);
    }
  };

  // Choose new videos
  const handleVideoChange = (e, i) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...newVideos];
      updated[i] = file;
      setNewVideos(updated);
    }
  };

  // The main "save changes" function
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const multipart = new FormData();

      // text fields
      multipart.append('name', formData.name);
      multipart.append('brand', formData.brand);
      multipart.append('model', formData.model);
      multipart.append('description', formData.description);
      multipart.append('condition', formData.condition);
      multipart.append('transmission', formData.transmission);
      multipart.append('fuelType', formData.fuelType);

      // numeric => strings
      multipart.append('year', formData.year === '' ? '' : String(formData.year));
      multipart.append('price', formData.price === '' ? '' : String(formData.price));
      multipart.append('downPayment', formData.downPayment === '' ? '' : String(formData.downPayment));
      multipart.append('monthlyPayment', formData.monthlyPayment === '' ? '' : String(formData.monthlyPayment));
      multipart.append('mileage', formData.mileage === '' ? '' : String(formData.mileage));

      // features
      multipart.append('features', JSON.stringify(formData.features));
      // isPopular
      multipart.append('isPopular', formData.isPopular);

      // images
      newImages.forEach((img, idx) => {
        if (img) {
          multipart.append(`image${idx + 1}`, img);
        }
      });
      // videos
      newVideos.forEach((vid, idx) => {
        if (vid) {
          multipart.append(`video${idx + 1}`, vid);
        }
      });

      // Debug
      const debugObj = {};
      for (let [k,v] of multipart.entries()) debugObj[k] = v;
      console.log('Sending update => ', debugObj);

      // Send update request
      const res = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        multipart,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success) {
        toast.success('Product updated successfully');
        // re-fetch data so we can see updated fields
        await fetchProduct();
      } else {
        toast.error(res.data.message || 'Error updating product');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function inside the component
  const formatTime = (minutes) => {
    if (!minutes || minutes <= 0) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => navigate('/list')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft /> Back to List
        </button>
        <h1 className="text-3xl font-bold">Edit Vehicle Details</h1>
      </motion.div>

      {/* We use a div with a custom button => no page reload */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 bg-white p-6 rounded-lg shadow-lg"
      >
        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Vehicle Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mileage (km)</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Down Payment ($)</label>
            <input
              type="number"
              name="downPayment"
              value={formData.downPayment}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Payment ($)</label>
            <input
              type="number"
              name="monthlyPayment"
              value={formData.monthlyPayment}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
        </div>

        {/* Condition, Transmission, Fuel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Certified Pre-Owned">Certified Pre-Owned</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-32"
            required
          />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {commonFeatures.map((feature) => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="mr-2"
                />
                <label className="text-sm">{feature}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Current Images + New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {currentImages.map((url, i) => (
              <div key={i} className="relative h-32">
                <img
                  src={url}
                  alt={`Vehicle ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newImages.map((_, i) => (
              <div key={i}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`image-${i}`}
                  onChange={(e) => handleImageChange(e, i)}
                />
                <label
                  htmlFor={`image-${i}`}
                  className="block w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                >
                  <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Current Videos + New Videos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Videos</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {currentVideos.map((url, i) => (
              <div key={i} className="relative">
                <video src={url} controls className="w-full rounded-lg" />
              </div>
            ))}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Videos</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newVideos.map((_, i) => (
              <div key={i}>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id={`video-${i}`}
                  onChange={(e) => handleVideoChange(e, i)}
                />
                <label
                  htmlFor={`video-${i}`}
                  className="block w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                >
                  <FaVideo className="w-8 h-8 text-gray-400" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save button => no page reload */}
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
          </button>
        </div>

        {/* Add this inside your JSX where you want to display the timer */}
        {formData.shipping?.movementStatus === 'moving' && (
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-2">Delivery Time Remaining</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ListDetails;
