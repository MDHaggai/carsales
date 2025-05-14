import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome,
  FaTags,
  FaCarAlt,
  FaList,
  FaShoppingBag,
  FaEnvelope,
  FaUsers,
  FaChevronLeft,
  FaCalendarAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Sidebar mounted');
    console.log('Current location:', location.pathname);
  }, []);

  const menuItems = [
    { path: "/admin/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/admin/brands", icon: FaTags, label: "Brands" },
    { path: "/admin/add", icon: FaCarAlt, label: "Add Vehicle" },
    { path: "/admin/list", icon: FaList, label: "List Vehicles" },
    { path: "/admin/orders", icon: FaShoppingBag, label: "Orders" },
    { path: "/admin/reviews", icon: FaCalendarAlt, label: "Reviews" },
    { path: "/admin/subscribers", icon: FaEnvelope, label: "Subscribers" },
    { path: "/admin/users", icon: FaUsers, label: "Users" }
  ];

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  const menuItemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <motion.div 
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative min-h-screen bg-white border-r border-gray-200 shadow-lg overflow-hidden z-50 hidden md:block" // Add hidden md:block here
    >
      {/* Collapse Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 p-1.5 rounded-full bg-white shadow-lg border border-gray-200 z-50"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronLeft className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Menu Items Container */}
      <div className="py-8 px-3 h-full overflow-y-auto custom-scrollbar">
        <nav className="space-y-2">
          <AnimatePresence mode="wait">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                    transition-all duration-300 group relative
                    hover:bg-blue-50 active:scale-95
                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}
                  `}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      p-2.5 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  
                  <motion.span 
                    variants={menuItemVariants}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Active Indicator */}
                  {isActive && !isCollapsed && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-3 w-2 h-2 rounded-full bg-blue-600" 
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
      </div>

      {/* Admin Info Section */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4"
        animate={{ 
          paddingLeft: isCollapsed ? '0.75rem' : '1rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start' 
        }}
      >
        <motion.div 
          className="flex items-center gap-3"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaUsers className="w-5 h-5 text-blue-600" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-gray-700 truncate">Admin Panel</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
