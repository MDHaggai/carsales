import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaShieldAlt
} from 'react-icons/fa';
import { assets } from '../assets/assets';

const Footer = () => {
  const navigate = useNavigate();

  // Container variants to stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    },
  };

  // Individual item variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  };

  return (
    <motion.footer
      className="bg-black text-white pt-4 pb-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Top Navigation Bar */}
      <motion.div 
        className="max-w-7xl mx-auto border-b border-gray-800 pb-4"
        variants={containerVariants}
      >
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
          {[
            { name: "About Honda", path: "/about" },
            { name: "Vehicle Models", path: "/models" },
            { name: "Service Centers", path: "/service" },
            { name: "Honda Events", path: "/events" },
            { name: "Resources", path: "/resources" },
            { name: "Careers", path: "/careers" },
            { name: "FAQ", path: "/faq" }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors duration-200"
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </motion.div>
          ))}
          
          <motion.a
            href="https://www.instagram.com/honda"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="text-gray-300 hover:text-red-500"
          >
            <FaInstagram size={18} />
          </motion.a>
          
          <motion.a
            href="https://www.facebook.com/Honda"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="text-gray-300 hover:text-red-500"
          >
            <FaFacebookF size={18} />
          </motion.a>
          
          <motion.a
            href="https://twitter.com/Honda"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="text-gray-300 hover:text-red-500"
          >
            <FaTwitter size={18} />
          </motion.a>
        </div>
      </motion.div>
      
      {/* Copyright Section */}
      <motion.div 
        className="text-center my-6"
        variants={itemVariants}
      >
        <p className="text-gray-400 text-sm">© 2025 Honda Motor Co., Ltd. All Rights Reserved.</p>
      </motion.div>
      
      {/* Bottom Legal Links */}
      <motion.div 
        className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 text-sm px-4"
        variants={containerVariants}
      >
        {[
          { name: "Privacy Notice", path: "/privacy" },
          { name: "California Notice at Collection", path: "/california-privacy" },
          { name: "DAA Industry Opt Out", path: "/opt-out" },
          { name: "Your CA Privacy Rights", path: "/ca-privacy-rights" },
          { name: "Terms of Use", path: "/terms" }
        ].map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="text-gray-400 hover:text-gray-300 cursor-pointer transition-colors duration-200"
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </motion.div>
        ))}
        
        <motion.button
          className="flex items-center gap-2 border border-gray-700 rounded-md px-3 py-1 text-gray-400 hover:text-white hover:border-gray-500"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <FaShieldAlt size={14} />
          <span>Your Privacy Choices</span>
        </motion.button>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
