import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { FaChevronDown } from 'react-icons/fa';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  // Define display limits
  const MOBILE_LIMIT = 6;
  const DESKTOP_LIMIT = 8;

  // Get displayed brands based on screen size and showAll state
  const getDisplayedBrands = () => {
    if (showAll) return brands;
    return brands.slice(0, window.innerWidth < 640 ? MOBILE_LIMIT : DESKTOP_LIMIT);
  };

  // Handle brand click
  const handleBrandClick = (brandId, brandName) => {
    navigate(`/collection?brand=${brandId}`, { 
      state: { brandName } 
    });
  };

  // Add view more button variant
  const viewMoreVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/brand/list`);
        if (response.data.success) {
          setBrands(response.data.brands);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // ---------------------------------------------------
  // Animation Variants
  // ---------------------------------------------------

  // Container variant: fade in + stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.2 
      }
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.5 } 
    }
  };

  // Each brand card: fade/scale in from below, pop out on exit
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.9,
      transition: { duration: 0.4 }
    }
  };

  // Optional “whileHover” variant: subtle scale on hover
  const hoverVariants = {
    hover: {
      scale: 1.03,
      transition: { duration: 0.3 }
    }
  };

  // Title variant: fade in from top
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.5 } }
  };

  return (
    // If you want a background image, you can do:
    // style={{ background: `url(${backgroundImg}) center/cover no-repeat` }}
    // then add an overlay if needed.
    <section className="relative py-12 overflow-hidden bg-white">
      <div className="container mx-auto px-2 sm:px-4 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-8"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-100px' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Shop by Brand
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '90px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"
          />
          <p className="text-gray-600 max-w-xl mx-auto mt-4">
            Find your perfect fit among the world’s top automotive manufacturers.
          </p>
        </motion.div>

        {/* Brands Grid */}
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ once: false, margin: '-50px' }}
          >
            {loading ? (
              // Show placeholders if loading
              [...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 animate-pulse w-full h-40 rounded-lg"
                />
              ))
            ) : (
              // Actual brand cards
              getDisplayedBrands().map((brand) => (
                <motion.div
                  key={brand._id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  variants={cardVariants}
                  whileHover="hover"
                  // Because we define "hover" in hoverVariants, we combine them
                  // in an array of variants. This merges the scale from cardVariants
                  // with the scale from hoverVariants.
                  animate="visible"
                  exit="exit"
                  onClick={() => handleBrandClick(brand._id, brand.name)}
                >
                  {/* Image that fills the entire card. No padding, full coverage */}
                  <motion.img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                    variants={hoverVariants}
                  />

                  {/* Brand Name Overlay (hidden until hover) */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-2
                               opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0
                               transition-all duration-300"
                  >
                    {brand.name}
                  </motion.div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* View More Button */}
        <AnimatePresence>
          {!loading && brands.length > (window.innerWidth < 640 ? MOBILE_LIMIT : DESKTOP_LIMIT) && (
            <motion.div
              className="flex justify-center mt-8"
              variants={viewMoreVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              <motion.button
                onClick={() => setShowAll(!showAll)}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                         text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                whileHover="hover"
              >
                <span>{showAll ? 'Show Less' : 'View More Brands'}</span>
                <motion.div
                  animate={{ rotate: showAll ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="text-lg" />
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Brands;
