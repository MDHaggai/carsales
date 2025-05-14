import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FaCarSide, 
  FaHandshake, 
  FaShieldAlt, 
  FaCertificate,
  FaCarCrash,
  FaTools,
  FaChartLine
} from 'react-icons/fa';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -100]);

  const containerVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut", // Changed from cubic-bezier
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -100,
      transition: {
        duration: 0.8,
        ease: "easeIn" // Added valid easing
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" // Changed from cubic-bezier
      }
    }
  };

  const statsData = [
    { number: "1.8K+", label: "Cars Sold", icon: FaCarSide },
    { number: "98%", label: "Customer Satisfaction", icon: FaHandshake },
    { number: "24/7", label: "Support Available", icon: FaTools },
    { number: "15+", label: "Years Experience", icon: FaChartLine },
  ];

  return (
    <motion.div 
      className="bg-gradient-to-b from-white to-gray-50 min-h-screen"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div
        style={{ opacity, y }}
        className="relative h-[60vh] bg-black overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 z-10"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        />
        <motion.img
          src={assets.about_img}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div 
          className="relative z-20 h-full flex flex-col justify-center items-center text-white text-center px-4"
          style={{ scale }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Drive Your Dreams
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your trusted partner in finding the perfect vehicle for your lifestyle
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto py-16 px-4"
        variants={containerVariants}
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon className="text-4xl text-blue-600" />
            </motion.div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* About Content */}
      <motion.div 
        className="max-w-7xl mx-auto py-16 px-4"
        variants={containerVariants}
      >
        <motion.div 
          className="grid md:grid-cols-2 gap-16 items-center"
          variants={itemVariants}
        >
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">Your Journey to the Perfect Vehicle</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Since 2008, we've revolutionized the car buying experience by combining 
              cutting-edge technology with personalized service. Our mission is to make 
              car shopping transparent, convenient, and enjoyable.
            </p>
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {[
                { icon: FaShieldAlt, text: "Verified Vehicles" },
                { icon: FaHandshake, text: "Fair Pricing" },
                { icon: FaCarCrash, text: "Full Insurance" },
                { icon: FaCertificate, text: "Certified Pre-owned" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="text-blue-600 text-xl" />
                  <span className="text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div
            className="relative h-[500px] rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={assets.about_img} 
              alt="Showroom"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Newsletter Section with Enhanced Animation */}
      <motion.div
        variants={containerVariants}
        className="bg-blue-600 py-20"
      >
        <NewsletterBox />
      </motion.div>
    </motion.div>
  );
};

export default About;
