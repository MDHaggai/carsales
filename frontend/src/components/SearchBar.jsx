import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { 
    search, 
    setSearch, 
    showSearch, 
    setShowSearch,
    products 
  } = useContext(ShopContext);
  
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle search functionality
  useEffect(() => {
    if (search.trim()) {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase()) ||
        product.model?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setSearchResults([]);
    }
  }, [search, products]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSearch]);

  // Clear search when changing location
  useEffect(() => {
    setSearch('');
    setSearchResults([]);
  }, [location.pathname, setSearch]);

  const handleProductClick = (productId) => {
    setShowSearch(false);
    setSearch('');
    navigate(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 pt-20"
        >
          <div 
            ref={searchRef}
            className="bg-white mx-auto w-full max-w-2xl rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  type="text"
                  placeholder="Search by name, brand, model..."
                  autoFocus
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 border-b"
                  >
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {product.brand} {product.model}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {search && searchResults.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
