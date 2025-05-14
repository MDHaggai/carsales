// components/PromoSection.jsx

import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your actual backend URL
const backendUrl ="http://localhost:4000";

const PromoSection = () => {
  // State for Latest Collection Images
  const [latestImages, setLatestImages] = useState([]);
  const [currentLatestIndex, setCurrentLatestIndex] = useState(0);
  const [isLatestLoading, setIsLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState(null);

  // State for Best Sellers Images
  const [bestSellerImages, setBestSellerImages] = useState([]);
  const [currentBestSellerIndex, setCurrentBestSellerIndex] = useState(0);
  const [isBestSellerLoading, setIsBestSellerLoading] = useState(true);
  const [bestSellerError, setBestSellerError] = useState(null);

  // Fetch Latest Collection Images
  useEffect(() => {
    const fetchLatestCollection = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/latest`);
        if (response.data.success) {
          const images = response.data.products.map((product) => product.image[0]);
          setLatestImages(images);
        } else {
          setLatestError('Failed to fetch latest collection.');
        }
      } catch (error) {
        console.error('Error fetching latest collection:', error);
        setLatestError('An error occurred while fetching latest collection.');
      } finally {
        setIsLatestLoading(false);
      }
    };

    fetchLatestCollection();
  }, []);

  // Fetch Best Sellers Images
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/best-sellers`);
        if (response.data.success) {
          const images = response.data.products.map((product) => product.image[0]);
          setBestSellerImages(images);
        } else {
          setBestSellerError('Failed to fetch best sellers.');
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setBestSellerError('An error occurred while fetching best sellers.');
      } finally {
        setIsBestSellerLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  // Cycle Latest Collection Images Every 3 Seconds
  useEffect(() => {
    if (latestImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentLatestIndex((prevIndex) => (prevIndex + 1) % latestImages.length);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [latestImages]);

  // Cycle Best Sellers Images Every 3 Seconds
  useEffect(() => {
    if (bestSellerImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBestSellerIndex((prevIndex) => (prevIndex + 1) % bestSellerImages.length);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [bestSellerImages]);

  // Animation Variants for Background Images
  const imageVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="py-8 px-4 md:px-6 bg-gray-100 mt-8">
      {/* Container for Promo Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* First Promo Block - Latest Collection */}
        <div className="relative h-80 md:h-96 overflow-hidden rounded-lg shadow-lg group transform transition-transform duration-500 hover:scale-105">
          {/* Background Image Animation */}
          <AnimatePresence>
            {!isLatestLoading && latestImages.length > 0 && (
              <motion.div
                key={latestImages[currentLatestIndex]}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${latestImages[currentLatestIndex]})` }}
              />
            )}
            {isLatestLoading && (
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <span className="text-white text-lg">Loading...</span>
              </div>
            )}
            {latestError && (
              <div className="absolute inset-0 bg-red-500 flex items-center justify-center">
                <span className="text-white text-lg">{latestError}</span>
              </div>
            )}
          </AnimatePresence>

          {/* Semi-transparent Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          {/* Static Overlay Content */}
          <div className="relative flex flex-col justify-center items-center text-white px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
              Exclusive Deals on Miniature Firearms
            </h2>
            <p className="text-2xl md:text-3xl text-yellow-400">
              Up to 40% OFF
            </p>
            <Link
              to="/collection"
              className="mt-6 flex items-center bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-6 text-lg font-semibold rounded-md transition duration-300 ease-in-out transform hover:scale-110 shadow-md"
            >
              <FaShoppingCart className="mr-2" />
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Second Promo Block - Remains Unchanged */}
        <div
          className="relative h-80 md:h-96 bg-cover bg-center overflow-hidden rounded-lg shadow-lg group transform transition-transform duration-500 hover:scale-105"
          style={{ backgroundImage: `url(${assets.hero_img3})` }}
        >
          {/* Semi-transparent Overlay to Reduce Image Opacity */}
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>

          {/* Animated Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 transition duration-500 group-hover:bg-opacity-70">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 animate-bounce">
              Premium Selection
            </h2>
            <p className="text-xl md:text-2xl text-center font-medium leading-tight animate-fade-in-up">
              Explore our range of meticulously crafted miniature firearms for enthusiasts and collectors.
            </p>
            <p className="mt-4 text-lg md:text-xl font-semibold animate-pulse">
              Quality Guaranteed
            </p>
          </div>
        </div>

        {/* Third Promo Block - Best Sellers */}
        <div className="relative h-80 md:h-96 overflow-hidden rounded-lg shadow-lg group transform transition-transform duration-500 hover:scale-105">
          {/* Background Image Animation */}
          <AnimatePresence>
            {!isBestSellerLoading && bestSellerImages.length > 0 && (
              <motion.div
                key={bestSellerImages[currentBestSellerIndex]}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bestSellerImages[currentBestSellerIndex]})` }}
              />
            )}
            {isBestSellerLoading && (
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <span className="text-white text-lg">Loading...</span>
              </div>
            )}
            {bestSellerError && (
              <div className="absolute inset-0 bg-red-500 flex items-center justify-center">
                <span className="text-white text-lg">{bestSellerError}</span>
              </div>
            )}
          </AnimatePresence>

          {/* Semi-transparent Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          {/* Static Overlay Content */}
          <div className="relative flex flex-col justify-center items-center text-white px-4">
            <h2 className="text-yellow-400 text-2xl md:text-3xl font-bold">
              Limited Time Offer
            </h2>
            <p className="text-5xl md:text-6xl font-extrabold text-red-500 mt-2">
              50% OFF
            </p>
            <p className="text-xl md:text-2xl mt-4">
              Exclusive Models Available!
            </p>
            <Link
              to="/collection"
              className="mt-6 flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-lg font-semibold rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Learn More
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        /* Gradient Text Animation */
        .bg-gradient-to-r.from-red-500.to-orange-500 {
          background-size: 200% 200%;
          animation: gradientMove 5s linear infinite;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Fade In Up Animation */
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s forwards;
          animation-delay: 0.5s;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Bounce Animation */
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Fade In Down Animation */
        .animate-fade-in-down {
          opacity: 0;
          transform: translateY(-20px);
          animation: fadeInDown 1s forwards;
          animation-delay: 0.3s;
        }
        @keyframes fadeInDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Zoom In Animation */
        .animate-zoom-in {
          opacity: 0;
          transform: scale(0.5);
          animation: zoomIn 0.5s forwards;
          animation-delay: 0.7s;
        }
        @keyframes zoomIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Wiggle Animation */
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PromoSection;
