import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import {
  FaSearch,
  FaAngleDown,
  FaCarSide,
  FaFilter,
  FaTimes,
  FaArrowRight,
  FaMapMarkerAlt,
  FaSlidersH,
  FaCar,
  FaTachometerAlt,
  FaGasPump,
  FaCalendarAlt,
  FaDollarSign,
  FaCheck,
  FaStar,
  FaAngleLeft,
  FaAngleRight,
  FaLocationArrow,
  FaInfoCircle,
  FaBolt,
  FaSun,
  FaCog,
  FaTint,
  FaShieldAlt,
  FaEye
} from 'react-icons/fa';
import { IoCar, IoCarSport, IoSpeedometerOutline } from 'react-icons/io5';
import { MdLocalGasStation, MdDirectionsCar, MdLocationOn, MdTune } from 'react-icons/md';
import { RiPinDistanceLine, RiRoadMapLine } from 'react-icons/ri';
import { GiRoad, GiSpeedometer, GiCarSeat } from 'react-icons/gi';
import { TbEngine } from 'react-icons/tb';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const VehicleFinderTool = () => {
  // Finder states
  const [activeTab, setActiveTab] = useState('all');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [bodyType, setBodyType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [distance, setDistance] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [stickyFilters, setStickyFilters] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [filterChanged, setFilterChanged] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  
  // Animation controls
  const searchButtonControls = useAnimation();
  const filterControls = useAnimation();
  
  // References
  const finderRef = useRef(null);
  const resultsRef = useRef(null);
  const priceSliderRef = useRef(null);
  
  // Mock data for filters
  const makes = ['Honda', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Chevrolet', 'Volkswagen', 'Tesla', 'Lexus', 'Ferrari', 'Porsche'];
  
  const models = {
    Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
    Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Supra'],
    BMW: ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'i8'],
    Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'AMG GT'],
    Audi: ['A4', 'A6', 'Q5', 'Q7', 'e-tron', 'R8'],
    Ford: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco'],
    Chevrolet: ['Silverado', 'Malibu', 'Equinox', 'Traverse', 'Camaro', 'Corvette'],
    Volkswagen: ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4'],
    Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
    Lexus: ['ES', 'RX', 'NX', 'IS', 'GX', 'LC'],
    Ferrari: ['488', 'F8', 'Roma', 'SF90', 'Portofino', 'LaFerrari'],
    Porsche: ['911', 'Taycan', 'Cayenne', 'Macan', 'Panamera', 'Boxster']
  };

  const years = Array.from({ length: 30 }, (_, i) => 2025 - i);
  
  const bodyTypes = [
    { value: 'sedan', label: 'Sedan', icon: <MdDirectionsCar />, color: 'from-blue-400 to-blue-600' },
    { value: 'suv', label: 'SUV', icon: <FaCar />, color: 'from-green-400 to-green-600' },
    { value: 'truck', label: 'Truck', icon: <FaCarSide />, color: 'from-red-400 to-red-600' },
    { value: 'coupe', label: 'Coupe', icon: <IoCarSport />, color: 'from-purple-400 to-purple-600' },
    { value: 'convertible', label: 'Convertible', icon: <IoCar />, color: 'from-yellow-400 to-yellow-600' },
    { value: 'wagon', label: 'Wagon', icon: <RiRoadMapLine />, color: 'from-indigo-400 to-indigo-600' },
    { value: 'hybrid', label: 'Hybrid', icon: <FaSun />, color: 'from-teal-400 to-teal-600' },
    { value: 'electric', label: 'Electric', icon: <FaBolt />, color: 'from-cyan-400 to-cyan-600' },
  ];
  
  const fuelTypes = [
    { value: 'gas', label: 'Gasoline', icon: <FaGasPump />, color: 'bg-orange-100 text-orange-600' },
    { value: 'diesel', label: 'Diesel', icon: <FaTint />, color: 'bg-gray-100 text-gray-600' },
    { value: 'hybrid', label: 'Hybrid', icon: <FaSun />, color: 'bg-teal-100 text-teal-600' },
    { value: 'electric', label: 'Electric', icon: <FaBolt />, color: 'bg-blue-100 text-blue-600' },
  ];
  
  // Toggle sticky filters based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (finderRef.current) {
        const { top } = finderRef.current.getBoundingClientRect();
        setStickyFilters(top < 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Load recent searches from local storage
  useEffect(() => {
    const saved = localStorage.getItem('recentVehicleSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }
  }, []);
  
  // Run animation when filter changes
  useEffect(() => {
    if (filterChanged) {
      filterControls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.4 }
      });
      setFilterChanged(false);
    }
  }, [filterChanged, filterControls]);
  
  // Run animation when search completes
  useEffect(() => {
    if (searchComplete) {
      setTimeout(() => {
        setSearchComplete(false);
      }, 2000);
    }
  }, [searchComplete]);
  
  // Watch for any filter changes
  useEffect(() => {
    setFilterChanged(true);
  }, [selectedMake, selectedModel, selectedYear, bodyType, priceRange, distance]);
  
  // Save recent searches to local storage
  const saveRecentSearch = (search) => {
    const updatedSearches = [search, ...recentSearches.filter(s => 
      s.make !== search.make || s.model !== search.model
    )].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentVehicleSearches', JSON.stringify(updatedSearches));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setPriceRange([0, 200000]);
    setBodyType('');
    setKeyword('');
    setDistance(50);
    
    // Animation feedback for reset
    filterControls.start({
      opacity: [1, 0.7, 1],
      transition: { duration: 0.3 }
    });
  };
  
  // Search vehicles
  const searchVehicles = async () => {
    if (!selectedMake && !keyword && !bodyType) {
      // Shake animation for validation feedback
      searchButtonControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock search results - in reality, this would come from your backend
      const resultCount = Math.floor(Math.random() * 25) + 5;
      const mockResults = Array.from({ length: resultCount }, (_, index) => {
        const randomMake = selectedMake || makes[Math.floor(Math.random() * makes.length)];
        const randomModels = models[randomMake] || ['Model A', 'Model B'];
        const randomModel = selectedModel || randomModels[Math.floor(Math.random() * randomModels.length)];
        const randomYear = selectedYear || (2010 + Math.floor(Math.random() * 15));
        const randomPrice = Math.floor(Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0]);
        const randomFuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)].value;
        
        return {
          id: `car-${index}-${Date.now()}`,
          make: randomMake,
          model: randomModel,
          year: randomYear,
          price: randomPrice,
          mileage: Math.floor(Math.random() * 100000),
          fuelType: randomFuelType,
          bodyType: bodyType || bodyTypes[Math.floor(Math.random() * bodyTypes.length)].value,
          image: `https://source.unsplash.com/featured/?car,${randomMake},${randomModel}`,
          location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'][Math.floor(Math.random() * 5)],
          distance: Math.floor(Math.random() * distance),
          rating: Math.floor(Math.random() * 5) + 1,
          features: ['Bluetooth', 'Leather Seats', 'Navigation', 'Sunroof', 'Backup Camera'].slice(0, Math.floor(Math.random() * 5) + 1)
        };
      });
      
      setSearchResults(mockResults);
      setSearchCount(mockResults.length);
      setSearchComplete(true);
      
      // Save this search to recent searches
      if (selectedMake || keyword) {
        saveRecentSearch({
          make: selectedMake,
          model: selectedModel,
          year: selectedYear,
          bodyType: bodyType,
          timestamp: new Date().toISOString()
        });
      }
      
      // Scroll to results
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tab variant animations
  const tabVariants = {
    active: {
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      scale: 1.03,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    inactive: {
      backgroundColor: 'transparent',
      color: '#64748b',
      boxShadow: 'none',
      scale: 1,
      transition: { duration: 0.2 }
    }
  };
  
  // Search result animations
  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };
  
  // Sticky filter animations
  const stickyFilterVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    },
    exit: { y: -100, opacity: 0, transition: { duration: 0.2 } }
  };
  
  // Child animations for staggered effects
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Get label for price range
  const getPriceRangeLabel = () => {
    if (priceRange[1] === 200000) return `$${priceRange[0].toLocaleString()}+`;
    return `$${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`;
  };

  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white" ref={finderRef}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-4">
            Find Your Perfect Vehicle
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use our powerful search tools to find the exact vehicle that matches your needs,
            preferences, and budget from our extensive inventory.
          </p>
        </motion.div>
        
        {/* Sticky filter bar that appears when scrolling past the main filter */}
        <AnimatePresence>
          {stickyFilters && (
            <motion.div 
              className="fixed top-[var(--navbar-height)] left-0 right-0 bg-white backdrop-blur-lg bg-opacity-90 shadow-xl z-40 py-3 px-4 border-b border-gray-200"
              variants={stickyFilterVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="container mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                <motion.div 
                  className="flex items-center space-x-3"
                  variants={childVariants}
                >
                  <span className="font-semibold text-gray-700 whitespace-nowrap">Quick Search:</span>
                  <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2 border border-blue-100">
                    <select 
                      value={selectedMake}
                      onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedModel('');
                      }}
                      className="bg-transparent border-none focus:outline-none text-gray-700 mr-2"
                    >
                      <option value="">Any Make</option>
                      {makes.map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                    <span className="text-gray-400">|</span>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-transparent border-none focus:outline-none text-gray-700 mx-2"
                      disabled={!selectedMake}
                    >
                      <option value="">Any Model</option>
                      {selectedMake && models[selectedMake]?.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={childVariants}
                  className="hidden md:flex items-center space-x-2"
                >
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium bg-blue-50 text-blue-800 py-1 px-3 rounded-full">
                    {getPriceRangeLabel()}
                  </span>
                  
                  {bodyType && (
                    <>
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium bg-indigo-50 text-indigo-800 py-1 px-3 rounded-full capitalize">
                        {bodyType}
                      </span>
                    </>
                  )}
                </motion.div>
                
                <motion.button
                  variants={childVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md shadow-blue-200 ml-auto"
                  onClick={searchVehicles}
                  animate={searchButtonControls}
                >
                  <motion.div 
                    className="mr-2"
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ repeat: isLoading ? Infinity : 0, duration: 1 }}
                  >
                    {isLoading ? <FaCog /> : <FaSearch />}
                  </motion.div>
                  <span>Search</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main search interface */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"
          animate={filterControls}
        >
          {/* Search tabs */}
          <div className="flex flex-wrap md:flex-nowrap border-b border-gray-200">
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'all' ? 'active' : 'inactive'}
              className="flex-1 py-4 px-4 text-center font-medium border-b-2 border-transparent"
              onClick={() => setActiveTab('all')}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                <FaCar className="text-lg" />
                <span>All Vehicles</span>
              </div>
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'new' ? 'active' : 'inactive'}
              className="flex-1 py-4 px-4 text-center font-medium border-b-2 border-transparent"
              onClick={() => setActiveTab('new')}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                <FaShieldAlt className="text-lg" />
                <span>New</span>
              </div>
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'used' ? 'active' : 'inactive'}
              className="flex-1 py-4 px-4 text-center font-medium border-b-2 border-transparent"
              onClick={() => setActiveTab('used')}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                <GiSpeedometer className="text-lg" />
                <span>Used</span>
              </div>
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'certified' ? 'active' : 'inactive'}
              className="flex-1 py-4 px-4 text-center font-medium border-b-2 border-transparent"
              onClick={() => setActiveTab('certified')}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                <FaCheck className="text-lg" />
                <span>Certified Pre-Owned</span>
              </div>
            </motion.button>
          </div>
          
          {/* Search filters */}
          <div className="p-6">
            {/* Basic search row */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 mb-6">
              <motion.div 
                className="w-full lg:w-1/4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <div className="relative">
                  <select
                    value={selectedMake}
                    onChange={(e) => {
                      setSelectedMake(e.target.value);
                      setSelectedModel(''); // Reset model when make changes
                    }}
                    className="block w-full pl-3 pr-10 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white shadow-sm transition-all duration-200"
                  >
                    <option value="">Any Make</option>
                    {makes.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FaAngleDown size={16} className="opacity-70" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    animate={{
                      boxShadow: selectedMake ? '0 0 0 2px rgba(37, 99, 235, 0.3)' : '0 0 0 0 rgba(37, 99, 235, 0)',
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="w-full lg:w-1/4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedMake}
                    className={`block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none shadow-sm transition-all duration-200 ${
                      !selectedMake ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Any Model</option>
                    {selectedMake && models[selectedMake]?.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FaAngleDown size={16} className="opacity-70" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    animate={{
                      boxShadow: selectedModel ? '0 0 0 2px rgba(37, 99, 235, 0.3)' : '0 0 0 0 rgba(37, 99, 235, 0)',
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                  <span className="ml-1 text-blue-600 font-semibold">${priceRange[1].toLocaleString()}</span>
                </label>
                <div className="px-2 pt-2">
                  <div className="relative mb-2 pt-1">
                    <div className="w-full h-2 bg-gray-200 rounded-lg appearance-none">
                      <div
                        className="absolute h-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500"
                        style={{ width: `${(priceRange[1] / 200000) * 100}%` }}
                      ></div>
                    </div>
                    <div 
                      className="absolute -top-1 -mt-1 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow cursor-pointer border-2 border-blue-500"
                      style={{ left: `calc(${(priceRange[1] / 200000) * 100}% - 8px)` }}
                    ></div>
                  </div>
                  <input
                    ref={priceSliderRef}
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 opacity-0 absolute top-9 cursor-pointer"
                  />
                </div>
              </motion.div>
              
              <div className="w-full lg:w-1/4 flex items-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium shadow-md shadow-blue-100 transition-all duration-300"
                  onClick={searchVehicles}
                  disabled={isLoading}
                  animate={searchButtonControls}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <>
                      <span className="flex items-center">
                        <motion.span
                          animate={{ 
                            scale: searchComplete ? [1, 1.3, 1] : 1,
                            rotate: searchComplete ? [0, 10, -10, 0] : 0
                          }}
                          transition={{ duration: 0.5 }}
                          className="mr-2 inline-block"
                        >
                          <FaSearch className="text-white" />
                        </motion.span>
                        <span>Find Vehicles</span>
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Advanced filters toggle */}
            <div className="flex justify-between items-center">
              <motion.button
                onClick={() => setAdvancedMode(!advancedMode)}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                whileHover={{ x: 2 }}
              >
                <motion.div
                  animate={{ rotate: advancedMode ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="mr-2 bg-blue-100 rounded-full p-1 group-hover:bg-blue-200 transition-colors"
                >
                  <MdTune />
                </motion.div>
                {advancedMode ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </motion.button>
              
              {(selectedMake || selectedModel || selectedYear || bodyType || keyword || priceRange[0] > 0 || priceRange[1] < 200000) && (
                <motion.button
                  onClick={resetFilters}
                  className="flex items-center text-gray-600 hover:text-red-600 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    className="mr-1 group-hover:text-red-500"
                  >
                    <FaTimes />
                  </motion.div>
                  Reset Filters
                </motion.button>
              )}
            </div>
            
            {/* Advanced filters */}
            <AnimatePresence>
              {advancedMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 pb-4 border-t border-gray-200 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        Year
                      </label>
                      <div className="relative">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="block w-full pl-3 pr-10 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white shadow-sm"
                          data-tooltip-id="year-tooltip"
                          data-tooltip-content="Select the vehicle year"
                        >
                          <option value="">Any Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <Tooltip id="year-tooltip" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <FaAngleDown size={16} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaCarSide className="mr-2 text-blue-500" />
                        Body Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {bodyTypes.slice(0, 4).map((type) => (
                          <motion.button
                            key={type.value}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBodyType(bodyType === type.value ? '' : type.value)}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg shadow-sm ${
                              bodyType === type.value
                                ? `bg-gradient-to-r ${type.color} text-white border-none`
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                            } transition-all duration-200`}
                            data-tooltip-id={`bodytype-${type.value}`}
                            data-tooltip-content={`Show only ${type.label}s`}
                          >
                            <div className={`text-xl mb-1 ${bodyType === type.value ? 'text-white' : ''}`}>
                              {type.icon}
                            </div>
                            <span className={`text-xs font-medium ${bodyType === type.value ? 'text-white' : ''}`}>
                              {type.label}
                            </span>
                            <Tooltip id={`bodytype-${type.value}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <RiPinDistanceLine className="mr-2 text-blue-500" />
                        Distance ({distance} miles)
                      </label>
                      <div className="px-2 pt-2">
                        <div className="relative mb-2">
                          <div className="w-full h-2 bg-gray-200 rounded-lg">
                            <div
                              className="absolute h-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500"
                              style={{ width: `${(distance / 500) * 100}%` }}
                            ></div>
                          </div>
                          <div 
                            className="absolute -top-1 -mt-1 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow border-2 border-green-500"
                            style={{ left: `calc(${(distance / 500) * 100}% - 8px)` }}
                          ></div>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="500"
                          step="10"
                          value={distance}
                          onChange={(e) => setDistance(parseInt(e.target.value))}
                          className="w-full h-1 opacity-0 absolute cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>10 miles</span>
                          <span>500 miles</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaSearch className="mr-2 text-blue-500" />
                        Keyword Search
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="Features, colors, specs..."
                          className="block w-full pl-3 pr-10 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white shadow-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                          <FaSearch size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TbEngine className="mr-2 text-blue-500" />
                        Additional Body Types
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {bodyTypes.slice(4).map((type) => (
                          <motion.button
                            key={type.value}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBodyType(bodyType === type.value ? '' : type.value)}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg shadow-sm ${
                              bodyType === type.value
                                ? `bg-gradient-to-r ${type.color} text-white border-none`
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                            } transition-all duration-200`}
                          >
                            <div className={`text-xl mb-1 ${bodyType === type.value ? 'text-white' : ''}`}>
                              {type.icon}
                            </div>
                            <span className={`text-xs font-medium ${bodyType === type.value ? 'text-white' : ''}`}>
                              {type.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaGasPump className="mr-2 text-blue-500" />
                        Fuel Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {fuelTypes.map((type) => (
                          <motion.button
                            key={type.value}
                            whileHover={{ y: -2, x: 0 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center px-3 py-2 rounded-full text-sm ${type.color} shadow-sm border border-transparent`}
                          >
                            <div className="mr-1.5">{type.icon}</div>
                            <span>{type.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Recent searches */}
        <AnimatePresence>
          {recentSearches.length > 0 && !searchResults && (
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaClock className="mr-2 text-blue-500" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full px-4 py-2 flex items-center text-sm cursor-pointer shadow-sm"
                    onClick={() => {
                      setSelectedMake(search.make || '');
                      setSelectedModel(search.model || '');
                      setSelectedYear(search.year || '');
                      setBodyType(search.bodyType || '');
                      searchVehicles();
                    }}
                  >
                    <FaSearch className="text-blue-500 mr-2" />
                    <span className="font-medium">{search.make || 'Any'}</span>
                    {search.model && (
                      <>
                        <span className="mx-1 text-gray-400">•</span>
                        <span>{search.model}</span>
                      </>
                    )}
                    {search.year && (
                      <>
                        <span className="mx-1 text-gray-400">•</span>
                        <span>{search.year}</span>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search results */}
        <AnimatePresence mode="wait">
          {searchResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <motion.h3 
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600"
                  animate={{ 
                    scale: searchComplete ? [1, 1.05, 1] : 1,
                    color: searchComplete ? ['#1f2937', '#3b82f6', '#1f2937'] : '#1f2937'
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-3 py-1 rounded-full">{searchCount}</span>
                  Results {selectedMake && `for ${selectedMake}`} {selectedModel && selectedModel}
                </motion.h3>
                
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 border border-gray-200 transition-colors"
                  >
                    <FaFilter size={14} className="text-blue-500" />
                    {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <select
                      className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 pl-10"
                      defaultValue="newest"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="mileage">Lowest Mileage</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <MdTune />
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <FaAngleDown size={14} />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Filters sidebar */}
                <AnimatePresence>
                  {filtersVisible && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="lg:col-span-3 overflow-hidden"
                    >
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-[calc(var(--navbar-height)+20px)]">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <FaFilter className="mr-2 text-blue-500" />
                          Refine Results
                        </h4>
                        
                        <div className="border-t border-gray-200 pt-4 pb-2">
                          <h5 className="font-medium text-gray-700 mb-3">Make & Model</h5>
                          <div className="space-y-3 ml-1">
                            {/* Make selection */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Make</span>
                              <motion.span 
                                className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
                                whileHover={{ y: -1 }}
                              >
                                {selectedMake || 'Any'}
                              </motion.span>
                            </div>
                            
                            {/* Model selection */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Model</span>
                              <motion.span 
                                className="text-sm font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md"
                                whileHover={{ y: -1 }}
                              >
                                {selectedModel || 'Any'}
                              </motion.span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 pb-2">
                          <h5 className="font-medium text-gray-700 mb-3">Price</h5>
                          <div className="px-2">
                            <div className="relative pt-1">
                              <div className="w-full h-2 bg-gray-200 rounded-lg">
                                <div
                                  className="absolute h-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500"
                                  style={{ width: `${(priceRange[1] / 200000) * 100}%` }}
                                ></div>
                              </div>
                              <div 
                                className="absolute -top-1 -mt-1 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow cursor-pointer border-2 border-blue-500"
                                style={{ left: `calc(${(priceRange[1] / 200000) * 100}% - 8px)` }}
                              ></div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="200000"
                              step="5000"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                              className="w-full h-2 opacity-0 absolute cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-gray-600 mt-4">
                              <span className="font-medium text-green-600">${priceRange[0].toLocaleString()}</span>
                              <span className="font-medium text-green-600">${priceRange[1].toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 pb-2">
                          <h5 className="font-medium text-gray-700 mb-3">Year</h5>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white"
                          >
                            <option value="">Any Year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 pb-2">
                          <h5 className="font-medium text-gray-700 mb-3">Body Style</h5>
                          <div className="space-y-2">
                            {bodyTypes.map((type) => (
                              <div key={type.value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`body-${type.value}`}
                                  checked={bodyType === type.value}
                                  onChange={() => setBodyType(bodyType === type.value ? '' : type.value)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`body-${type.value}`}
                                  className="ml-2 text-sm text-gray-700 flex items-center"
                                >
                                  <span className="mr-1.5">{type.icon}</span>
                                  {type.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md font-medium shadow-md shadow-blue-100"
                            onClick={searchVehicles}
                          >
                            Update Results
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Results grid */}
                <div className={`${filtersVisible ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.map((vehicle, index) => (
                      <motion.div
                        key={vehicle.id}
                        custom={index}
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        layoutId={vehicle.id}
                        onHoverStart={() => setHoveredVehicle(vehicle.id)}
                        onHoverEnd={() => setHoveredVehicle(null)}
                        className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                      >
                        {/* Vehicle image */}
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={vehicle.image}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-0 left-0 m-3 flex flex-col gap-2">
                            <div className={`
                              ${vehicle.fuelType === 'electric' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                                vehicle.fuelType === 'hybrid' ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 
                                'bg-gradient-to-r from-orange-500 to-orange-600'}
                              text-white text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm flex items-center
                            `}>
                              {vehicle.fuelType === 'electric' ? (
                                <><FaBolt className="mr-1" /> Electric</>
                              ) : vehicle.fuelType === 'hybrid' ? (
                                <><FaSun className="mr-1" /> Hybrid</>
                              ) : (
                                <><FaGasPump className="mr-1" /> Gas</>
                              )}
                            </div>
                            
                            {index % 3 === 0 && (
                              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm flex items-center">
                                <FaShieldAlt className="mr-1" /> Certified
                              </div>
                            )}
                          </div>
                          
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredVehicle === vehicle.id ? 0.6 : 0 }}
                          />
                          
                          <motion.div 
                            className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ 
                              y: hoveredVehicle === vehicle.id ? 0 : 20, 
                              opacity: hoveredVehicle === vehicle.id ? 1 : 0 
                            }}
                          >
                            <div className="flex items-center text-sm">
                              <FaEye className="mr-1" />
                              <span>Quick view</span>
                            </div>
                          </motion.div>
                          
                          <div className="absolute bottom-0 right-0 m-3">
                            <div className="bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-sm flex items-center backdrop-blur-sm">
                              <MdLocationOn className="mr-1 text-red-400" />
                              {vehicle.distance} mi away
                            </div>
                          </div>
                        </div>
                        
                        {/* Vehicle details */}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                              ${vehicle.price.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="text-gray-500 text-sm mb-3 flex items-center">
                            <MdLocationOn className="mr-1 text-red-500" />
                            {vehicle.location}
                            
                            {/* Star rating */}
                            <div className="ml-auto flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={`${i < vehicle.rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Vehicle specs */}
                          <div className="grid grid-cols-2 gap-y-2 mb-4">
                            <div className="flex items-center text-gray-700">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              <span>{vehicle.year}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FaTachometerAlt className="mr-2 text-gray-400" />
                              <span>{vehicle.mileage.toLocaleString()} mi</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FaGasPump className="mr-2 text-gray-400" />
                              <span>{vehicle.fuelType}</span>
                            </div>
                            <div className="flex items-center text-gray-700 capitalize">
                              <FaCarSide className="mr-2 text-gray-400" />
                              <span>{vehicle.bodyType}</span>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <Link
                              to={`/product/${vehicle.id}`}
                              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors"
                            >
                              View Details
                            </Link>
                            <button className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors">
                              <FaHeart />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Results pagination */}
                  {searchResults.length > 0 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100">
                          <FaAngleLeft />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md">
                          1
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100">
                          2
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100">
                          3
                        </button>
                        <span className="px-2 text-gray-500">...</span>
                        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100">
                          10
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100">
                          <FaAngleRight />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Additional icon needed for the heart/save feature
const FaHeart = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    className={className} 
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/>
  </svg>
);

export default VehicleFinderTool;