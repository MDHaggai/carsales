import axios from 'axios';
import React, { useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaUserShield, FaLock, FaSpinner } from 'react-icons/fa';
import iconImg from '../assets/logo.png'; // Make sure logo.png exists in your assets folder

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/admin/login`, { 
        email, 
        password 
      });

      if (response.data.success) {
        // Store token in localStorage for persistence
        localStorage.setItem('adminToken', response.data.token);
        setToken(response.data.token);
        toast.success('Login successful!');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.message || 
        'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <motion.div 
        className="bg-white shadow-2xl rounded-lg px-10 py-8 max-w-md w-full relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Branding Icon */}
        <motion.div 
          className="flex justify-center mb-6"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={iconImg} 
            alt="Admin Icon" 
            className="w-20 h-20 object-contain rounded-full" 
          />
        </motion.div>
        <motion.h1 
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          variants={itemVariants}
        >
          Admin Panel
        </motion.h1>
        <form onSubmit={onSubmitHandler} className="space-y-6">
          <motion.div className="min-w-[18rem]" variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <span className="px-3 text-gray-500">
                <FaUserShield />
              </span>
              <input 
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 outline-none"
                disabled={isLoading}
              />
            </div>
          </motion.div>
          <motion.div className="min-w-[18rem]" variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <span className="px-3 text-gray-500">
                <FaLock />
              </span>
              <input 
                type="password"
                placeholder="Enter admin password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 outline-none"
                disabled={isLoading}
              />
            </div>
          </motion.div>
          <motion.button 
            type="submit"
            className="w-full py-3 px-4 rounded-md text-white bg-black hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            variants={itemVariants}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Logging in...
              </span>
            ) : (
              'Login as Admin'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
