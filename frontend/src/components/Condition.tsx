import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { backendUrl, currency } from '../App';
import {
  FaHeart, 
  FaChevronLeft, 
  FaChevronRight, 
  FaCar, 
  FaTachometerAlt
} from 'react-icons/fa';
// Import the background from your local assets directory
import backgroundImg from '../assets/background.jpg';

// Define TypeScript interfaces (can be ignored if using JS)
interface Product {
  _id: string;
  name: string;
  condition: string;
  price: number;
  images: string[];
  brand: string;
}

interface GroupedProducts {
  [key: string]: Product[];
}

const Condition: React.FC = () => {
  // --------------- State Variables ---------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [selectedCondition, setSelectedCondition] = useState<string>('New');
  const [loading, setLoading] = useState(true);
  
  // Example conditions
  const conditions = ['New', 'Used', 'Certified Pre-Owned'];

  // --------------- Data Fetching ---------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          const allProducts = response.data.products;
          // Group products by condition
          const grouped = allProducts.reduce((acc: GroupedProducts, product: Product) => {
            if (!acc[product.condition]) {
              acc[product.condition] = [];
            }
            acc[product.condition].push(product);
            return acc;
          }, {});
          setProducts(allProducts);
          setGroupedProducts(grouped);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --------------- Scroll-Based Parallax ---------------
  // Just in case you want advanced scroll animations
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // --------------- Container & Card Animation Variants ---------------
  // We'll remove flipping, and do a fade/slide with added micro-interactions.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15, 
        delayChildren: 0.3 
      }
    }
  };

  // For each product card: fade in from top and gently scale
  const cardTransitionVariants = {
    enter: {
      opacity: 0,
      y: 40,
      scale: 0.8
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        type: 'spring',
        stiffness: 120,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 0.85,
      transition: { 
        duration: 0.6, 
        ease: 'easeInOut' 
      }
    }
  };

  // Subtle overlay text animations
  const overlayTextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  // --------------- Auto-Play Carousel ---------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlay && groupedProducts[selectedCondition]) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          const length = groupedProducts[selectedCondition].length;
          return prev === length - 1 ? 0 : prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [autoPlay, groupedProducts, selectedCondition]);

  // --------------- Navigation Handlers ---------------
  const handleNext = () => {
    if (groupedProducts[selectedCondition]) {
      setCurrentIndex(prev => {
        const length = groupedProducts[selectedCondition].length;
        return prev === length - 1 ? 0 : prev + 1;
      });
    }
  };

  const handlePrev = () => {
    if (groupedProducts[selectedCondition]) {
      setCurrentIndex(prev => {
        const length = groupedProducts[selectedCondition].length;
        return prev === 0 ? length - 1 : prev - 1;
      });
    }
  };

  // --------------- Render ---------------
  return (
    // Use a big background image from src/assets/background.jpg
    <section 
      className="min-h-screen py-20 relative overflow-hidden"
      style={{
        background: `url(${backgroundImg}) center center / cover no-repeat`, 
        // Add a subtle overlay
        backgroundAttachment: 'fixed'
      }}
    >
      {/* A large overlay for a tinted effect */}
      <div className="absolute inset-0 bg-white/60 mix-blend-multiply pointer-events-none"></div>

      {/* Additional floating shapes for micro-interactions */}
      {/* 1) Purple Circle */}
      <motion.div
        className="absolute w-64 h-64 bg-purple-200 rounded-full top-[10%] left-[5%] mix-blend-screen filter blur-2xl opacity-60 z-0"
        animate={{ y: [0, -20, 0, 20, 0], x: [0, 10, 0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 2) Blue Circle */}
      <motion.div
        className="absolute w-72 h-72 bg-blue-200 rounded-full bottom-[10%] right-[8%] mix-blend-screen filter blur-2xl opacity-70 z-0"
        animate={{ y: [0, 20, 0, -20, 0], x: [0, -10, 0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main Container for content */}
      <motion.div 
        className="container mx-auto px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-purple-800 drop-shadow-lg"
          >
            Shop by <span className="text-blue-700">Condition</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-purple-800 mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="max-w-xl mx-auto text-gray-700 text-lg"
          >
            Discover the perfect vehicle to suit your lifestyle and budget.
            Whether you’re after a brand-new model, a dependable used option,
            or a certified pre-owned gem, we’ve got it all!
          </motion.p>
        </div>

        {/* Condition Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {conditions.map((condition) => (
            <motion.button
              key={condition}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCondition(condition);
                setCurrentIndex(0);
              }}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all text-base md:text-lg
                ${selectedCondition === condition 
                  ? 'bg-purple-700 text-white shadow-xl scale-105' 
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 hover:text-purple-900 shadow'}
              `}
            >
              {condition}
            </motion.button>
          ))}
        </div>

        {/* Carousel Showcase Section */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading spinner or animation
              <motion.div
                key="loader"
                className="flex justify-center items-center h-[600px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full absolute top-2 left-2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : groupedProducts[selectedCondition]?.length > 0 ? (
              <motion.div
                key={`${selectedCondition}-${currentIndex}`}
                variants={cardTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px]"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
              >
                {/* Product Image */}
                <div className="relative h-[400px] overflow-hidden">
                  <motion.img
                    src={groupedProducts[selectedCondition][currentIndex].images[0]}
                    alt={groupedProducts[selectedCondition][currentIndex].name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00000090] to-transparent" />
                </div>

                {/* Product Info Overlay */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 px-6 py-4 text-white 
                             backdrop-blur-sm bg-gradient-to-t from-[#000000a0] to-transparent"
                  variants={overlayTextVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">
                    {groupedProducts[selectedCondition][currentIndex].name}
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap mb-2">
                    <span className="flex items-center gap-2 text-purple-100">
                      <FaCar /> {groupedProducts[selectedCondition][currentIndex].brand}
                    </span>
                    <span className="flex items-center gap-2 text-purple-100">
                      <FaTachometerAlt /> {groupedProducts[selectedCondition][currentIndex].condition}
                    </span>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-purple-200 drop-shadow-lg">
                    {currency}{groupedProducts[selectedCondition][currentIndex].price.toLocaleString()}
                  </span>
                </motion.div>

                {/* Navigation Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 
                             bg-purple-200/70 hover:bg-purple-300/80 p-4 
                             rounded-full text-purple-800 transition-colors 
                             backdrop-blur-sm"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 
                             bg-purple-200/70 hover:bg-purple-300/80 p-4 
                             rounded-full text-purple-800 transition-colors 
                             backdrop-blur-sm"
                >
                  <FaChevronRight className="text-2xl" />
                </button>

                {/* Progress Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {groupedProducts[selectedCondition].map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1 rounded-full ${
                        index === currentIndex 
                          ? 'w-8 bg-purple-600' 
                          : 'w-2 bg-purple-300'
                      }`}
                      initial={false}
                      animate={{ width: index === currentIndex ? 32 : 8 }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              // No Products State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-purple-900 py-20"
              >
                No vehicles available in this condition
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Condition;
