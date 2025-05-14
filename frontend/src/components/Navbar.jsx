import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaTrash,
  FaStar,
  FaAngleDown,
  FaBell,
  FaRegClock,
  FaChevronRight,
  FaChevronUp,
  FaCar
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [compactNav, setCompactNav] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const cartRef = useRef(null);
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  
  const location = useLocation();

  const {
    setShowSearch,
    getCartCount,
    token,
    setToken,
    setCartItems,
    cartItems,
    products,
    removeFromCart,
    clearCart,
    currency,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  
  // Framer-motion scroll handling
  const { scrollY } = useScroll();
  
  // Transform navbar based on scroll position
  useMotionValueEvent(scrollY, "change", (latest) => {
    // When scrolled past threshold, enable compact mode
    if (latest > 60) {
      setIsScrolled(true);
      if (latest > 120) {
        setCompactNav(true);
      }
    } else {
      setIsScrolled(false);
      setCompactNav(false);
    }
  });

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  // Lock body scroll if mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuVisible ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuVisible]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setSearchFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Reset states on location change
  useEffect(() => {
    setMenuVisible(false);
    setShowSearchResults(false);
  }, [location.pathname]);

  // Top nav items (matching the BaT design)
  const topNavItems = [
    { name: 'Auctions', path: '/auctions', highlight: true },
    { name: 'Submit a Vehicle', path: '/submit' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  // Bottom nav items (matching the BaT design)
  const bottomNavItems = [
    { name: 'Shipping', path: '/shipping' },
    { name: 'Makes and Models', path: '/makes-models' },
    { name: 'Categories', path: '/categories' },
    { name: 'Locations', path: '/locations' },
    { name: 'Get Alerts', path: '/alerts' },
    { name: 'Verified Checkout', path: '/checkout', highlight: true },
    { name: 'BaT Stories', path: '/stories' },
    { name: 'Event Calendar', path: '/events' },
    { name: 'Podcast', path: '/podcast' },
    { name: 'About BaT', path: '/about' },
    { name: 'Gear Store', path: '/store' },
  ];
  
  // Mock search results for animation demo
  const searchResults = [
    { type: 'make', name: 'Ferrari', count: 42 },
    { type: 'model', name: 'Testarossa', count: 8 },
    { type: 'category', name: 'Exotic', count: 120 },
    { type: 'model', name: 'F40', count: 3 },
  ];

  const variants = {
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hidden: { 
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Get the height of the navbar for proper spacing in the application
  useEffect(() => {
    // Function to set navbar height as CSS variable for proper layout spacing
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    // Update immediately and on window resize
    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    
    // Update whenever the navbar might change size
    const observer = new ResizeObserver(updateNavbarHeight);
    if (navbarRef.current) {
      observer.observe(navbarRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
      observer.disconnect();
    };
  }, [compactNav, isScrolled]);

  return (
    <>
      {/* Fixed navbar wrapper */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-[999] w-full will-change-transform"
        ref={navbarRef}
        initial={{ y: 0 }}
        animate={{ 
          y: 0, // Always keep at top
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.12)" : "none",
        }}
        style={{
          backdropFilter: isScrolled ? 'blur(8px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'none',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Main black header */}
        <div 
          className={`bg-black bg-opacity-95 text-white transition-all duration-300 ${
            isScrolled ? "py-2" : "py-3"
          }`}
        >
          <div className="container mx-auto px-4">
            {/* Top navigation bar */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ 
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Link to="/" className="flex items-center">
                  <motion.img 
                    src={assets.logo || "/bat-logo.png"} 
                    alt="Bring a Trailer" 
                    className={`transition-all duration-300 ${isScrolled ? "h-7" : "h-8"}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </Link>
              </motion.div>

              {/* Search bar */}
              <div className={`flex-grow mx-4 max-w-3xl transition-all duration-300 relative ${
                searchFocused ? "scale-105" : "scale-100"
              }`}>
                <div 
                  ref={searchInputRef}
                  className="relative"
                >
                  <div className={`flex items-center transition-all relative ${
                    searchFocused ? "shadow-lg" : ""
                  }`}>
                    <input
                      type="text"
                      placeholder="Search for make, model, category..."
                      className={`w-full py-2 px-4 pr-10 rounded text-black transition-all duration-300 border-2 ${
                        searchFocused 
                          ? "border-blue-500 pl-5" 
                          : "border-transparent hover:border-gray-300"
                      }`}
                      onFocus={() => {
                        setSearchFocused(true);
                        setShowSearchResults(true);
                      }}
                      onChange={(e) => e.target.value ? setShowSearchResults(true) : null}
                    />
                    <motion.button 
                      className={`absolute right-3 ${
                        searchFocused ? "text-blue-600" : "text-gray-600"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaSearch />
                    </motion.button>
                  </div>
                  
                  {/* Search results dropdown */}
                  <AnimatePresence>
                    {showSearchResults && (
                      <motion.div 
                        className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-md shadow-xl border border-gray-200 z-20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3">
                          <div className="text-gray-500 text-sm mb-2">Quick Results</div>
                          {searchResults.map((result, index) => (
                            <motion.div 
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.1 }}
                            >
                              <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-full mr-3 flex items-center justify-center ${
                                  result.type === 'make' ? 'bg-blue-100 text-blue-600' : 
                                  result.type === 'model' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  <FaCar size={14} />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{result.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                                </div>
                              </div>
                              <div className="text-gray-500 text-sm font-medium">{result.count}</div>
                            </motion.div>
                          ))}
                          <button className="w-full mt-2 text-center text-blue-600 text-sm hover:underline py-2 font-medium">
                            See all results
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right side navigation */}
              <div className="flex items-center space-x-5">
                {/* Top nav items */}
                <div className="hidden md:flex space-x-5">
                  {topNavItems.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.path}
                      className={({ isActive }) => `
                        text-white hover:text-gray-300 transition-colors relative group
                        ${isActive ? 'text-blue-400' : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <span className={item.highlight ? "font-medium" : ""}>{item.name}</span>
                        {item.path === '/auctions' && (
                          <FaAngleDown className="ml-1 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                        )}
                      </div>
                      <motion.span 
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </NavLink>
                  ))}
                </div>

                {/* Activity bell with indicator */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/notifications" className="text-white hover:text-gray-300 group">
                    <div className="p-1">
                      <FaBell size={19} />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      2
                    </div>
                  </Link>
                </motion.div>

                {/* Star/favorite icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/favorites" className="text-white hover:text-gray-300 group">
                    <div className="p-1">
                      <FaStar size={19} />
                    </div>
                  </Link>
                </motion.div>

                {/* Login/Profile button with dropdown */}
                <div className="relative">
                  <motion.button 
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center text-white hover:text-gray-300 gap-1.5 group"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                      <FaUser size={13} />
                    </div>
                    <FaAngleDown className={`transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20"
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <div className="p-3">
                          {token ? (
                            <>
                              <div className="flex items-center space-x-3 p-2 border-b border-gray-200 pb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <FaUser />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">John Doe</div>
                                  <div className="text-xs text-gray-500">Premium Member</div>
                                </div>
                              </div>
                              <div className="py-2">
                                <Link to="/profile" className="flex items-center justify-between py-2 px-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                  <span>My Profile</span>
                                  <FaChevronRight className="text-gray-400" size={12} />
                                </Link>
                                <Link to="/my-vehicles" className="flex items-center justify-between py-2 px-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                  <span>My Vehicles</span>
                                  <FaChevronRight className="text-gray-400" size={12} />
                                </Link>
                                <Link to="/settings" className="flex items-center justify-between py-2 px-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                  <span>Settings</span>
                                  <FaChevronRight className="text-gray-400" size={12} />
                                </Link>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <button onClick={logout} className="w-full text-left py-2 px-2 text-red-600 hover:bg-gray-100 rounded-md">
                                  Sign Out
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-center py-3">
                                <h3 className="text-lg font-medium text-gray-900">Welcome</h3>
                                <p className="text-sm text-gray-500 mb-3">Sign in to access all features</p>
                                <Link 
                                  to="/login" 
                                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                  onClick={() => setShowProfile(false)}
                                >
                                  Log In
                                </Link>
                                <div className="mt-2 text-sm text-gray-600">
                                  Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline" onClick={() => setShowProfile(false)}>Sign up</Link>
                                </div>
                              </div>
                              <div className="border-t border-gray-200 pt-2">
                                <div className="text-xs text-gray-500 p-2">Continue as guest to:</div>
                                <Link to="/auctions" className="flex items-center py-2 px-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setShowProfile(false)}>
                                  <FaRegClock className="mr-2 text-gray-500" />
                                  <span>Browse Auctions</span>
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu button */}
                <motion.button
                  onClick={() => setMenuVisible(true)}
                  className="md:hidden text-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <FaBars size={24} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation (light gray) */}
        <motion.div 
          className="bg-gray-100 border-b transition-all shadow-sm"
          animate={{ 
            height: compactNav && !searchFocused ? 0 : "auto",
            opacity: compactNav && !searchFocused ? 0 : 1,
            overflow: compactNav && !searchFocused ? "hidden" : "visible"
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center overflow-x-auto whitespace-nowrap py-2">
              {bottomNavItems.map((item, index) => (
                <React.Fragment key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `text-sm py-1 px-2 hover:text-blue-600 transition-colors relative ${
                        isActive 
                          ? 'text-blue-600 font-medium' 
                          : item.highlight 
                            ? 'text-green-700 font-medium' 
                            : 'text-gray-800'
                      }`
                    }
                  >
                    <span>{item.name}</span>
                    {item.highlight && !item.path.includes('checkout') && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                    {/* Special treatment for verified checkout */}
                    {item.path.includes('checkout') && (
                      <motion.span 
                        className="ml-1 inline-block bg-green-600/10 text-green-700 text-xs px-1 rounded"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        New
                      </motion.span>
                    )}
                  </NavLink>
                  {index < bottomNavItems.length - 1 && (
                    <span className="text-gray-400 mx-1">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        {isScrolled && !compactNav && (
          <motion.div 
            className="absolute -bottom-1 left-0 h-0.5 bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, (scrollY.get() / 1000) * 100)}%` }}
            transition={{ type: "tween" }}
          />
        )}
      </motion.header>

      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer" style={{ height: 'var(--navbar-height, 80px)' }}></div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuVisible && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[1000] flex flex-col"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="container mx-auto px-4 py-6">
              {/* Close button */}
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center" onClick={() => setMenuVisible(false)}>
                  <img 
                    src={assets.logo || "/bat-logo.png"} 
                    alt="Bring a Trailer" 
                    className="h-8"
                  />
                </Link>
                
                <motion.button 
                  onClick={() => setMenuVisible(false)}
                  className="text-white p-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={24} />
                </motion.button>
              </div>
              
              {/* Search in mobile menu */}
              <div className="mb-8">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-3 px-4 pr-10 rounded-lg text-black bg-white/90 backdrop-blur-md border border-white/10"
                  />
                  <button className="absolute right-3 text-gray-600">
                    <FaSearch size={18} />
                  </button>
                </div>
              </div>

              {/* Mobile menu links */}
              <div className="flex flex-col space-y-1">
                {/* Top nav items */}
                {topNavItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `text-white text-xl py-3 px-2 flex items-center justify-between ${
                          isActive ? 'bg-white/10 rounded-md' : ''
                        }`
                      }
                      onClick={() => setMenuVisible(false)}
                    >
                      <span>{item.name}</span>
                      <FaChevronRight size={14} className="text-gray-400" />
                    </NavLink>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="py-2 my-2 border-t border-b border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-white/50 text-xs tracking-wider uppercase py-2">Quick Links</div>
                </motion.div>
                
                {/* Bottom nav items */}
                {bottomNavItems.map((item, index) => (
                  <motion.div
                    key={`bottom-${index}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: topNavItems.length * 0.05 + 0.3 + index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `text-white text-lg py-2 px-2 flex items-center justify-between ${
                          isActive ? 'bg-white/10 rounded-md' : ''
                        } ${item.highlight ? 'text-green-400' : ''}`
                      }
                      onClick={() => setMenuVisible(false)}
                    >
                      <span>{item.name}</span>
                      {item.highlight && (
                        <span className="bg-green-900/50 text-green-400 text-xs px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Login */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: (topNavItems.length + bottomNavItems.length) * 0.05 + 0.3 }}
                >
                  <NavLink
                    to="/login"
                    className="text-white text-xl py-3 mt-4 border border-white/20 rounded-md flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    onClick={() => setMenuVisible(false)}
                  >
                    <FaUser />
                    <span>Log In</span>
                  </NavLink>
                </motion.div>
              </div>
              
              {/* Bottom footer in mobile menu */}
              <motion.div 
                className="mt-auto pt-6 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex justify-between items-center text-white/50 text-sm">
                  <span>© 2025 Bring a Trailer</span>
                  <motion.button 
                    onClick={() => {
                      setMenuVisible(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-white/70 hover:text-white"
                    whileHover={{ y: -2 }}
                  >
                    <FaChevronUp size={14} />
                    <span>Top</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;