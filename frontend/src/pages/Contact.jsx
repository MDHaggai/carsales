// components/Contact.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <motion.div
        className="text-center text-3xl pt-10 border-t"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Title text1={'CONTACT'} text2={'US'} />
      </motion.div>

      {/* Main Contact Section */}
      <motion.div
        className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 px-4 md:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Contact Image */}
        <motion.img
          className="w-full md:max-w-[480px] rounded-lg shadow-lg"
          src={assets.contact_img}
          alt="Contact Us"
          loading="lazy"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Contact Information */}
        <motion.div
          className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600"
          variants={containerVariants}
        >
          {/* Email */}
          <motion.div
            className="flex flex-col gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-green-500 text-2xl" />
              <h3 className="font-semibold text-xl text-gray-800">Email Us</h3>
            </div>
            <p className="text-gray-600">
              For more information, please email us at <a href="mailto:1Autocarsales@gmail.com" className="text-indigo-600 hover:underline">1Autocarsales@gmail.com</a>
            </p>
          </motion.div>

          {/* Phone */}
          <motion.div
            className="flex flex-col gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-yellow-500 text-2xl" />
              <h3 className="font-semibold text-xl text-gray-800">Call Us</h3>
            </div>
            <p className="text-gray-600">
              Phone: <a href="tel:+18137733282" className="text-indigo-600 hover:underline">+1 (813) 7733282</a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Optional Call-to-Action Button */}
      <motion.div
        className="flex justify-center mb-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.a
          href="mailto:1Autocarsales@gmail.com"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105"
          variants={itemVariants}
        >
          Get in Touch
        </motion.a>
      </motion.div>

      {/* Newsletter Box */}
      <NewsletterBox />
    </div>
  );
};

export default Contact;
