import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt,
  FaSearch,
  FaBars,
  FaUsers,
  FaHome,
  FaTags,
  FaCarAlt,
  FaList,
  FaShoppingBag,
  FaCalendarAlt,
  FaEnvelope
} from 'react-icons/fa';

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

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New order received', time: '5m ago' },
    { id: 2, text: 'Vehicle listing updated', time: '1h ago' },
  ]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.img
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              src={assets.logo}
              alt="Logo"
              className="h-10 w-10 rounded-full border-2 border-blue-500 p-1"
            />
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 mx-4 lg:mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications - Always visible */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white notification-dot">
                  2
                </span>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                  >
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="text-sm text-gray-800">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Users Link - Hidden on mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/users')}
              className="hidden md:flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
            >
              <FaUsers className="h-5 w-5 text-gray-600" />
            </motion.button>

            {/* Settings - Hidden on mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:block p-2 rounded-full hover:bg-gray-100"
            >
              <FaCog className="h-5 w-5 text-gray-600" />
            </motion.button>

            {/* Profile - Hidden on mobile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:block"
            >
              <FaUserCircle className="h-8 w-8 text-gray-600" />
            </motion.div>

            {/* Hamburger Menu - Only visible on mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              <FaBars className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 right-0 left-0 bg-white shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-2 border-t border-gray-200">
              {menuItems.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span>{item.label}</span>
                </motion.button>
              ))}

              <div className="border-t border-gray-200 mt-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setToken('');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;