import React, { useState, useEffect } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { backendUrl } from '../App';
import { 
  FaCar, FaTachometerAlt, FaGasPump, FaCog, 
  FaFilter, FaSortAmountDown, FaSearch, FaChevronDown,
  FaHeart
} from 'react-icons/fa';
import ReactGA from 'react-ga4';

ReactGA.initialize('G-M8WD1CFN81');

const Collection = () => {
  // State management for vehicles, filters, etc.
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  // Filter states
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [brandModels, setBrandModels] = useState({});
  const [activeModel, setActiveModel] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [mileageRange, setMileageRange] = useState([0, 300000]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // <-- controls filter panel visibility

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const brandId = searchParams.get('brand');
  const brandName = location.state?.brandName;

  // Add this function inside the Collection component, before the useEffect hooks

const fetchProductsByBrand = async (brandId) => {
  try {
    setLoading(true);
    const response = await axios.get(`${backendUrl}/api/product/list?brand=${brandId}`);
    
    if (response.data.success) {
      const brandProducts = response.data.products;
      setVehicles(brandProducts);
      setFilteredVehicles(brandProducts);
      setSelectedBrand(brandName || 'all'); // Use the brandName from location state
    } else {
      toast.error('Failed to fetch brand products');
    }
  } catch (error) {
    console.error('Error fetching brand products:', error);
    toast.error('Error loading brand products');
  } finally {
    setLoading(false);
  }
};

  // Fetch vehicles and brands data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, brandsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/product/list`),
          axios.get(`${backendUrl}/api/brand/list`)
        ]);
        if (vehiclesRes.data.success && brandsRes.data.success) {
          const products = vehiclesRes.data.products;
          const brandsData = brandsRes.data.brands;
          
          // Extract unique fuel types
          const fuels = [...new Set(products.map(p => p.fuelType))];
          setFuelTypes(fuels);

          // Group models by brand
          const modelsByBrand = products.reduce((acc, product) => {
            if (!acc[product.brand]) {
              acc[product.brand] = [];
            }
            if (product.model && !acc[product.brand].includes(product.model)) {
              acc[product.brand].push(product.model);
            }
            return acc;
          }, {});

          setVehicles(products);
          setFilteredVehicles(products);
          setBrands(brandsData);
          setBrandModels(modelsByBrand);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (brandId) {
      fetchProductsByBrand(brandId);
    }
  }, [brandId, brandName]); // Add brandName to dependencies

  // Update filtered vehicles when any filter changes
  useEffect(() => {
    let filtered = vehicles;
    // Filter by brand and model
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.brand === selectedBrand);
      if (activeModel) {
        filtered = filtered.filter(vehicle => vehicle.model === activeModel);
      }
    }
    // Filter by fuel type
    if (selectedFuel !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.fuelType === selectedFuel);
    }
    // Filter by price and mileage
    filtered = filtered.filter(vehicle => 
      vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1] &&
      vehicle.mileage >= mileageRange[0] && vehicle.mileage <= mileageRange[1]
    );

    // Sort if necessary
    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'mileage-asc') {
      filtered.sort((a, b) => a.mileage - b.mileage);
    } else if (sortOption === 'mileage-desc') {
      filtered.sort((a, b) => b.mileage - a.mileage);
    }

    setFilteredVehicles(filtered);
  }, [
    vehicles, 
    selectedBrand, 
    activeModel, 
    selectedFuel, 
    priceRange, 
    mileageRange, 
    sortOption
  ]);

  // Handlers for filter selections
  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setActiveModel(null);
  };

  const handleModelSelect = (model) => {
    setActiveModel(model);
  };

  const handleFuelSelect = (fuel) => {
    setSelectedFuel(fuel);
  };

  // Toggle the filter panel
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  // Filter Sidebar Animation
  const filterPanelVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: -300, opacity: 0, transition: { duration: 0.5 } }
  };

  // Advanced Sort Options Animation
  const sortVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // Product Card Animation Variants (Pop-up effect)
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Image Animation: subtle zoom for longer images
  const imageVariants = {
    hidden: { scale: 0.8, filter: "brightness(0.8)" },
    visible: { 
      scale: 1, 
      filter: "brightness(1)",
      transition: { duration: 0.8, ease: "easeOut" }
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  // Filter Section Component (Drop-down sidebar)
  const FilterSection = () => (
    <AnimatePresence>
      {isFilterOpen && (
        <motion.div
          variants={filterPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 left-0 w-[80%] sm:w-[50%] md:w-80 h-full bg-white shadow-2xl rounded-tr-2xl rounded-br-2xl p-6 space-y-8 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-black">Filters</h3>
            <button 
              onClick={toggleFilterPanel}
              className="text-black hover:text-blue-600 transition-colors text-lg"
            >
              Close
            </button>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Brands</h4>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBrandSelect('all')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all duration-300
                  ${selectedBrand === 'all' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                <FaCar className="w-8 h-8" />
                <span className="text-sm font-medium">All</span>
              </motion.button>
              {brands.map(brand => (
                <motion.button
                  key={brand._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBrandSelect(brand.name)}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition-all duration-300
                    ${selectedBrand === brand.name ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
                >
                  <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                  <span className="text-sm font-medium">{brand.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Models Filter */}
          {selectedBrand !== 'all' && brandModels[selectedBrand] && (
            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Models</h4>
              <div className="grid grid-cols-2 gap-4">
                {brandModels[selectedBrand].map((model) => (
                  <motion.button
                    key={model}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleModelSelect(model)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all
                      ${activeModel === model ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
                  >
                    {model}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Fuel Type Filter */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Fuel Type</h4>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFuel('all')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300
                  ${selectedFuel === 'all' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                All
              </motion.button>
              {fuelTypes.map(fuel => (
                <motion.button
                  key={fuel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300
                    ${selectedFuel === fuel ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
                >
                  {fuel}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Price Range</h4>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="1000000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-black mt-1">
                <span>$0</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Mileage Range Filter */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Mileage Range</h4>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="300000"
                step="1000"
                value={mileageRange[1]}
                onChange={(e) => setMileageRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-black mt-1">
                <span>0km</span>
                <span>{mileageRange[1].toLocaleString()}km</span>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Sort By</h4>
            <motion.div
              variants={sortVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortOption('default')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${sortOption === 'default' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                Default
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortOption('price-asc')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${sortOption === 'price-asc' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                Price ↑
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortOption('price-desc')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${sortOption === 'price-desc' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                Price ↓
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortOption('mileage-asc')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${sortOption === 'mileage-asc' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                Mileage ↑
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortOption('mileage-desc')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${sortOption === 'mileage-desc' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-400 text-black'}`}
              >
                Mileage ↓
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Vehicle Card Component
  const VehicleCard = ({ vehicle }) => {
    const [isLiked, setIsLiked] = useState(false);
  
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -8 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl 
                   transition-shadow duration-300 flex flex-col h-[600px]"
      >
        {/* Image Section */}
        <div className="relative h-[350px] overflow-hidden">
          <motion.img
            src={vehicle.images[0]}
            alt={vehicle.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm 
                          text-white px-4 py-2 rounded-full text-sm font-medium">
            {vehicle.condition}
          </div>
          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-4 left-4 p-3 rounded-full bg-white/80 backdrop-blur-sm
                       hover:bg-white transition-all duration-300"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <FaHeart className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
            </motion.div>
          </motion.button>
        </div>
  
        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          {/* Vehicle Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{vehicle.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-1">
              {vehicle.brand} {vehicle.model}
            </p>
            <div className="flex items-center gap-4 mb-4 text-gray-600">
              <span className="flex items-center gap-1">
                <FaTachometerAlt className="w-4 h-4" />
                {vehicle.mileage.toLocaleString()}km
              </span>
              <span className="flex items-center gap-1">
                <FaGasPump className="w-4 h-4" />
                {vehicle.fuelType}
              </span>
            </div>
          </div>
  
          {/* Price and Actions */}
          <div className="mt-auto">
            {/* Price Tag */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Price</span>
              <span className="text-2xl font-bold text-blue-600">
                ${vehicle.price.toLocaleString()}
              </span>
            </div>
  
            {/* Action Button */}
            <Link to={`/product/${vehicle._id}`}>
              <motion.button
                whileHover={{ 
                  backgroundColor: '#3B82F6',
                  color: '#ffffff',
                  scale: 1.05
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-6 border-2 border-blue-600 text-blue-600 
                         rounded-lg font-semibold flex items-center justify-center 
                         gap-2 bg-white group transition-all duration-300"
              >
                <span>View Details</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="group-hover:text-white"
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };
  

  // Vehicle Grid Component
  const VehicleGrid = ({ vehicles }) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {vehicles.length > 0 ? (
        vehicles.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full text-center py-12"
        >
          <FaCar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">
            No vehicles found matching your criteria
          </h3>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Discover Your Perfect <span className="text-black">Vehicle</span>
            </h1>
            <p className="text-black max-w-2xl mx-auto">
              Browse through our extensive collection of premium vehicles.
            </p>
          </motion.div>

          {/* Filter Toggle Button */}
          <div className="flex justify-end mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFilterPanel}
              className="bg-black text-white px-5 py-3 rounded-lg font-semibold shadow transition-colors"
            >
              <FaFilter className="inline-block mr-2" />
              Filter
            </motion.button>
          </div>

          {/* Filter Panel & Vehicle Grid */}
          <motion.div 
            layout
            className="relative"
            layoutRoot
            style={{ 
              marginLeft: isFilterOpen ? '320px' : '0',
              transition: 'margin-left 0.3s ease-in-out'
            }}
          >
            {/* Filter Panel */}
            <AnimatePresence mode="wait">
              {isFilterOpen && (
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    layout: { duration: 0.3 }
                  }}
                  className="fixed left-0 top-0 w-80 h-full bg-white shadow-2xl 
                             border-r border-gray-200 overflow-y-auto z-50"
                  layoutId="filterPanel"
                >
                  <FilterSection />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle Grid with stable layout */}
            <motion.div 
              layout
              className="w-full"
              layoutId="vehicleGrid"
            >
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
                </div>
              ) : (
                <VehicleGrid vehicles={filteredVehicles} />
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default Collection;
