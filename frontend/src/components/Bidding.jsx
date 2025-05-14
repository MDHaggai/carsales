import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../App';
import {
  FaArrowRight,
  FaCar,
  FaClock,
  FaDollarSign,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaGasPump,
  FaUserCircle,
  FaRegStar,
  FaStar,
  FaHeart,
  FaBolt
} from 'react-icons/fa';

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Format relative time
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${diffHr}h ${diffMin % 60}m ago`;
};

// Generate mock bids
const generateMockBids = (basePrice, count = 5) => {
  const bids = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Scale the pool of bidders based on price - more expensive cars attract different bidders
  const expensiveUsernames = [
    'LuxuryCollector', 'EliteGarage', 'ExoticBuyer', 'MillionaireMotors',
    'PremiumAutos', 'WealthyMotorist', 'HighEndBuyer', 'SupercarFan'
  ];
  
  const midrangeUsernames = [
    'CarEnthusiast88', 'SpeedLover', 'LuxuryDreamer', 'ClassicCollector',
    'RoadRunner42', 'AutoExpert', 'VintageHunter', 'TurboFan'
  ];
  
  const budgetUsernames = [
    'PracticalDriver', 'SmartShopper', 'ValueSeeker', 'BudgetMotor',
    'ThriftyDriver', 'DealFinder', 'EconomyCar', 'SensibleBuyer'
  ];
  
  // Select username pool based on price
  let usernames;
  if (basePrice > 80000) {
    usernames = expensiveUsernames;
  } else if (basePrice > 30000) {
    usernames = midrangeUsernames;
  } else {
    usernames = budgetUsernames;
  }
  
  // Scale bid increments based on price
  const minIncrement = Math.max(100, basePrice * 0.005); // 0.5% of price minimum
  const maxIncrement = Math.max(500, basePrice * 0.015); // 1.5% of price maximum
  
  for (let i = 0; i < count; i++) {
    // More expensive cars have bids further apart in time
    const timeFactor = basePrice > 80000 ? 3 : basePrice > 30000 ? 2 : 1;
    const bidTime = new Date(now - (i * (Math.random() * 120000 + 60000) * timeFactor));
    
    // Scale bid amount based on price
    const increment = Math.round((Math.random() * (maxIncrement - minIncrement) + minIncrement) / 50) * 50;
    const bidAmount = currentPrice + increment;
    currentPrice = bidAmount;
    
    bids.push({
      id: i,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      amount: bidAmount,
      time: bidTime,
      isHighest: i === 0
    });
  }
  
  return bids.reverse();
};

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < Math.floor(rating) ? 
            <FaStar className="text-amber-600 text-sm" /> : 
            <FaRegStar className="text-amber-600 text-sm" />
          }
        </span>
      ))}
    </div>
  );
};

// Live auction component
const LiveAuction = ({ product }) => {
  // Generate a realistic base price based on the car brand, model, and year
  const basePrice = () => {
    const yearFactor = parseInt(product.year) - 2010;
    const brandFactors = {
      'mercedes': 50000, 'bmw': 45000, 'audi': 42000, 'lexus': 45000,
      'toyota': 25000, 'honda': 22000, 'ford': 28000, 'chevrolet': 27000,
      'ferrari': 180000, 'porsche': 80000, 'lamborghini': 200000
    };
    
    // Set a default base if the brand is not in our map
    const brandBase = brandFactors[product.brand?.toLowerCase()] || 30000;
    return brandBase + (yearFactor * 2000);
  };
  
  const [bids, setBids] = useState([]);
  const [auctionEnds, setAuctionEnds] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Setup mock auction data
  useEffect(() => {
    const price = basePrice();
    setBids(generateMockBids(price));
    
    // Set auction end time (3-24 hours from now)
    // More expensive cars have longer auctions
    const minHours = 3;
    const maxHours = price > 100000 ? 48 : price > 50000 ? 36 : 24;
    const hours = Math.floor(Math.random() * (maxHours - minHours)) + minHours;
    
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);
    setAuctionEnds(endTime);
    
    // Simulate new bids coming in
    const bidInterval = setInterval(() => {
      setBids(prev => {
        if (prev.length === 0) return prev;
        
        // Bid frequency is inversely proportional to car price
        // Expensive cars get fewer bids but larger increments
        const bidFrequency = price > 100000 ? 0.15 : price > 50000 ? 0.2 : 0.25;
        
        if (Math.random() > (1 - bidFrequency)) {
          const lastBid = prev[prev.length - 1];
          
          // Scale bid increments based on price
          const minIncrement = Math.max(50, price * 0.002);
          const maxIncrement = Math.max(300, price * 0.01);
          const bidIncrement = Math.round((Math.random() * (maxIncrement - minIncrement) + minIncrement) / 50) * 50;
          
          const newBidAmount = lastBid.amount + bidIncrement;
          
          // Select username pool based on price
          let usernames;
          if (price > 80000) {
            usernames = [
              'LuxuryCollector', 'EliteGarage', 'ExoticBuyer', 'MillionaireMotors',
              'PremiumAutos', 'WealthyMotorist', 'HighEndBuyer', 'SupercarFan'
            ];
          } else if (price > 30000) {
            usernames = [
              'CarEnthusiast88', 'SpeedLover', 'LuxuryDreamer', 'ClassicCollector',
              'RoadRunner42', 'AutoExpert', 'VintageHunter', 'TurboFan'
            ];
          } else {
            usernames = [
              'PracticalDriver', 'SmartShopper', 'ValueSeeker', 'BudgetMotor',
              'ThriftyDriver', 'DealFinder', 'EconomyCar', 'SensibleBuyer'
            ];
          }
          
          const newBid = {
            id: prev.length,
            username: usernames[Math.floor(Math.random() * usernames.length)],
            amount: newBidAmount,
            time: new Date(),
            isHighest: true,
            isNew: true // Flag for animation
          };
          
          // Update previous highest bid
          const updatedBids = prev.map(bid => ({...bid, isHighest: false}));
          
          // Keep only the most recent 5 bids
          return [...updatedBids, newBid].slice(-5);
        }
        return prev;
      });
    }, 8000);
    
    // Update time remaining
    const timeInterval = setInterval(() => {
      if (auctionEnds) {
        const now = new Date();
        const diff = auctionEnds - now;
        
        if (diff <= 0) {
          setTimeLeft('Auction ended');
          clearInterval(timeInterval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(bidInterval);
      clearInterval(timeInterval);
    };
  }, [product.id]);
  
  const highestBid = bids.length > 0 ? bids[bids.length - 1] : null;
  
  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Live Auction</h3>
        <div className="flex items-center text-amber-600">
          <FaClock className="mr-1" />
          <span className="text-sm font-medium">{timeLeft}</span>
        </div>
      </div>
      
      {/* Current highest bid */}
      {highestBid && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid</span>
            <motion.span 
              className="font-bold text-xl text-green-600"
              key={highestBid.amount}
              initial={{ scale: 1.2, color: '#D97706' }}
              animate={{ scale: 1, color: '#059669' }}
              transition={{ duration: 0.5 }}
            >
              {formatCurrency(highestBid.amount)}
            </motion.span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>by {highestBid.username}</span>
            <span>{getRelativeTime(highestBid.time)}</span>
          </div>
        </div>
      )}
      
      {/* Recent bids */}
      <div className="space-y-3 max-h-[150px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <h4 className="text-sm text-gray-600 mb-2">Bid History</h4>
        <AnimatePresence>
          {bids.map((bid) => (
            <motion.div
              key={bid.id}
              className={`flex justify-between items-center p-2 rounded ${
                bid.isHighest ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
              initial={bid.isNew ? { opacity: 0, y: -20, backgroundColor: 'rgba(16, 185, 129, 0.1)' } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0, backgroundColor: bid.isHighest ? 'rgba(16, 185, 129, 0.05)' : 'rgba(249, 250, 251, 0.8)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <FaUserCircle className={`mr-2 ${bid.isHighest ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium text-gray-800">{bid.username}</div>
                  <div className="text-xs text-gray-500">{getRelativeTime(bid.time)}</div>
                </div>
              </div>
              <div className={`font-medium ${bid.isHighest ? 'text-green-600' : 'text-gray-700'}`}>
                {formatCurrency(bid.amount)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Bid button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
                 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300
                 flex items-center justify-center"
      >
        <FaDollarSign className="mr-2" />
        Place Your Bid
      </motion.button>
      
      {/* Watchers indicator */}
      <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
        <FaEye className="mr-2" />
        <span>
          {/* More expensive cars attract more watchers */}
          {Math.floor(Math.random() * (basePrice() > 80000 ? 80 : 50) + 10)} people watching
        </span>
      </div>
    </div>
  );
};

// Main Bidding component
const Bidding = () => {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          const allProducts = response.data.products;
          const grouped = allProducts.reduce((acc, product) => {
            if (!acc[product.year]) {
              acc[product.year] = [];
            }
            acc[product.year].push(product);
            return acc;
          }, {});
          setProducts(allProducts);
          setGroupedProducts(grouped);

          // Sort years in descending order
          const yearArr = Object.keys(grouped).map(Number).sort((a, b) => b - a);
          setYears(yearArr);
          setSelectedYear(Math.max(...yearArr));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Auto-advance to the next vehicle every 4 seconds
  useEffect(() => {
    if (!loading && autoAdvance && selectedYear && groupedProducts[selectedYear]?.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveProductIndex(prevIndex => {
          const productsInYear = groupedProducts[selectedYear].length;
          return (prevIndex + 1) % productsInYear;
        });
      }, 4000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, autoAdvance, selectedYear, groupedProducts]);

  // Pause auto-advance when user interacts with the component
  useEffect(() => {
    const handleInteraction = () => {
      // Pause auto-advance on interaction
      setAutoAdvance(false);
      
      // Restart auto-advance after 30 seconds of inactivity
      clearTimeout(intervalRef.current);
      intervalRef.current = setTimeout(() => {
        setAutoAdvance(true);
      }, 30000);
    };

    // Add event listeners to the container
    if (containerRef.current) {
      containerRef.current.addEventListener('mouseover', handleInteraction);
      containerRef.current.addEventListener('click', handleInteraction);
      containerRef.current.addEventListener('touchstart', handleInteraction);
    }

    return () => {
      // Clean up event listeners
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseover', handleInteraction);
        containerRef.current.removeEventListener('click', handleInteraction);
        containerRef.current.removeEventListener('touchstart', handleInteraction);
      }
      
      clearTimeout(intervalRef.current);
    };
  }, [containerRef.current]);

  // Helper functions for navigation
  const navigateProduct = (direction) => {
    if (!groupedProducts[selectedYear]) return;
    
    // Pause auto-advance when manually navigating
    setAutoAdvance(false);
    clearTimeout(intervalRef.current);
    intervalRef.current = setTimeout(() => {
      setAutoAdvance(true);
    }, 30000);
    
    const productsInYear = groupedProducts[selectedYear].length;
    if (direction === 'next') {
      setActiveProductIndex((prev) => (prev + 1) % productsInYear);
    } else {
      setActiveProductIndex((prev) => (prev - 1 + productsInYear) % productsInYear);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
        >
          <FaCar className="text-4xl text-amber-600 mb-3" />
          <p className="text-xl font-medium">Loading vehicle information...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
            LIVE VEHICLE AUCTIONS
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bid on premium vehicles with real-time updates. Find your dream car and make it yours!
          </p>
        </div>
        
        {/* Current vehicle and bidding */}
        {selectedYear && groupedProducts[selectedYear]?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicle info */}
            <div className="lg:col-span-2">
              <motion.div 
                className="relative rounded-xl overflow-hidden mb-6 shadow-lg"
                key={activeProductIndex}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={groupedProducts[selectedYear][activeProductIndex].images[0]}
                  alt={groupedProducts[selectedYear][activeProductIndex].name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    {groupedProducts[selectedYear][activeProductIndex].brand}{' '}
                    <span className="text-amber-400">
                      {groupedProducts[selectedYear][activeProductIndex].model}
                    </span>
                  </h2>
                  <p className="text-gray-200 mt-2">
                    {groupedProducts[selectedYear][activeProductIndex].description?.substring(0, 100)}...
                  </p>
                </div>
              </motion.div>
              
              {/* Navigation controls */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => navigateProduct('prev')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center transition-colors"
                >
                  <FaChevronLeft className="mr-2" /> Previous
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-amber-600 font-medium">
                    {activeProductIndex + 1} of {groupedProducts[selectedYear].length}
                  </div>
                  {/* Auto-advance indicator */}
                  <div 
                    className={`text-xs ${autoAdvance ? 'text-green-600' : 'text-gray-400'} cursor-pointer`}
                    onClick={() => setAutoAdvance(!autoAdvance)}
                    title={autoAdvance ? "Auto-advance on" : "Auto-advance off"}
                  >
                    {autoAdvance ? 'Auto • ON' : 'Auto • OFF'}
                  </div>
                </div>
                
                <button
                  onClick={() => navigateProduct('next')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center transition-colors"
                >
                  Next <FaChevronRight className="ml-2" />
                </button>
              </div>
              
              {/* Vehicle specs */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                key={`specs-${activeProductIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-500 mb-1">Year</h3>
                  <div className="text-xl font-semibold text-gray-900">
                    {groupedProducts[selectedYear][activeProductIndex].year}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-500 mb-1">Engine</h3>
                  <div className="text-xl font-semibold text-gray-900">
                    {Math.random() > 0.5 ? 'Electric' : 'V8'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-500 mb-1">Mileage</h3>
                  <div className="text-xl font-semibold text-gray-900">
                    {Math.floor(Math.random() * 80000 + 5000).toLocaleString()} mi
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-500 mb-1">Color</h3>
                  <div className="text-xl font-semibold text-gray-900">
                    {['Black', 'White', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)]}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Bidding panel */}
            <motion.div
              key={`auction-${activeProductIndex}`}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <LiveAuction product={groupedProducts[selectedYear][activeProductIndex]} />
            </motion.div>
          </div>
        )}
        
        {/* More vehicles from this year */}
        {selectedYear && groupedProducts[selectedYear]?.length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <span className="mr-2">More vehicles</span>
              <div className="h-px bg-gradient-to-r from-amber-500 to-transparent flex-grow ml-4"></div>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {groupedProducts[selectedYear].map((product, index) => (
                index !== activeProductIndex && (
                  <motion.div
                    key={product._id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
                    onClick={() => {
                      setActiveProductIndex(index);
                      // Pause auto-advance when selecting a vehicle
                      setAutoAdvance(false);
                      clearTimeout(intervalRef.current);
                      intervalRef.current = setTimeout(() => {
                        setAutoAdvance(true);
                      }, 30000);
                    }}
                  >
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-800 truncate">
                        {product.brand} {product.model}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex items-center text-amber-600">
                          <FaCar className="mr-1" />
                          <span>{product.year}</span>
                        </div>
                        <div className="bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                          View Details
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Eye icon component
const FaEye = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 576 512"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
  </svg>
);

export default Bidding;