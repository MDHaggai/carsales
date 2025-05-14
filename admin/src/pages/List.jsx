import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaTrash, FaStar, FaArrowUp, FaEdit, FaThLarge, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [groupedByBrand, setGroupedByBrand] = useState({});
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [movingId, setMovingId] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add view mode state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const brandTabVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.05,
      backgroundColor: "#3B82F6",
      color: "white",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const viewSwitcherVariants = {
    inactive: { scale: 1, backgroundColor: "#ffffff", color: "#3B82F6" },
    active: { 
      scale: 1.05,
      backgroundColor: "#3B82F6",
      color: "white",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        // Sort products by updatedAt
        const sortedProducts = response.data.products.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setList(sortedProducts);
        
        // Group products by brand
        const grouped = sortedProducts.reduce((acc, product) => {
          if (!acc[product.brand]) {
            acc[product.brand] = [];
          }
          acc[product.brand].push(product);
          return acc;
        }, {});
        setGroupedByBrand(grouped);
      }
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getDisplayList = () => {
    if (selectedBrand === 'all') return list;
    return groupedByBrand[selectedBrand] || [];
  };

  const togglePopular = async (id, isPopular) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/toggle-popular`,
        { id, isPopular },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating popular status:', error);
      toast.error(error.response?.data?.message || 'Error updating popular status');
    }
  };

  const bringToTop = async (productId) => {
    setMovingId(productId);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/bring-to-top`,
        { id: productId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Product moved to top successfully');
        fetchList(); // Refresh the list
      }
    } catch (error) {
      console.error('Error bringing product to top:', error);
      toast.error('Failed to move product to top');
    } finally {
      setMovingId(null);
    }
  };

  const removeProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/product/remove`,
          { id: productId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          toast.success('Vehicle removed successfully');
          fetchList(); // Refresh the list
        }
      } catch (error) {
        console.error('Error removing product:', error);
        toast.error('Failed to remove vehicle');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Vehicle Inventory</h1>
        <p className="text-gray-600">Manage your vehicle listings</p>
      </motion.div>

      {/* Filtering and View Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        {/* Brand Filter Tabs */}
        <motion.div 
          className="flex gap-2 overflow-x-auto pb-2 flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            variants={brandTabVariants}
            animate={selectedBrand === 'all' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedBrand('all')}
            className="px-4 py-2 rounded-full border shadow-sm"
          >
            All Vehicles
          </motion.button>
          {Object.keys(groupedByBrand).map(brand => (
            <motion.button
              key={brand}
              variants={brandTabVariants}
              animate={selectedBrand === brand ? 'active' : 'inactive'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBrand(brand)}
              className="px-4 py-2 rounded-full border shadow-sm"
            >
              {brand} ({groupedByBrand[brand].length})
            </motion.button>
          ))}
        </motion.div>
        
        {/* View Switcher */}
        <motion.div
          className="flex items-center gap-2 min-w-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm text-gray-500">View:</span>
          <motion.button
            variants={viewSwitcherVariants}
            animate={viewMode === 'grid' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-md border shadow-sm flex items-center gap-1"
          >
            <FaThLarge /> <span className="hidden sm:inline">Grid</span>
          </motion.button>
          <motion.button
            variants={viewSwitcherVariants}
            animate={viewMode === 'list' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className="p-2 rounded-md border shadow-sm flex items-center gap-1"
          >
            <FaList /> <span className="hidden sm:inline">List</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {getDisplayList().map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.images[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                      {item.isPopular && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">{item.brand}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{item.model}</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600 mb-4">
                        {currency}{item.price.toLocaleString()}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeProduct(item._id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                        >
                          <FaTrash />
                        </motion.button>
                        <div className="flex gap-2">
                          {index !== 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => bringToTop(item._id)}
                              className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                            >
                              <FaArrowUp />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/admin/list/${item._id}`)}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                            title="Edit Product"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => togglePopular(item._id, !item.isPopular)}
                            className={`p-2 rounded-full ${
                              item.isPopular 
                                ? 'text-purple-500 hover:bg-purple-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <FaStar />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              <AnimatePresence>
                {getDisplayList().map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 sm:h-auto sm:w-48 overflow-hidden">
                      <img 
                        src={item.images[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.isPopular && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-6 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">{item.brand}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{item.model}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{item.year}</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600 mb-2">
                          {currency}{item.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                          {item.mileage && `Mileage: ${item.mileage.toLocaleString()} km • `}
                          {item.transmission && `${item.transmission} • `}
                          {item.fuelType && item.fuelType}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeProduct(item._id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                        >
                          <FaTrash />
                        </motion.button>
                        <div className="flex gap-2">
                          {index !== 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => bringToTop(item._id)}
                              className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                            >
                              <FaArrowUp />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/admin/list/${item._id}`)}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                            title="Edit Product"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => togglePopular(item._id, !item.isPopular)}
                            className={`p-2 rounded-full ${
                              item.isPopular 
                                ? 'text-purple-500 hover:bg-purple-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <FaStar />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default List;
