import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  FaEnvelope, 
  FaCheckCircle, 
  FaCar, 
  FaGift, 
  FaNewspaper, 
  FaTag,
  FaBell
} from 'react-icons/fa';
import { MdClose, MdDirectionsCar } from 'react-icons/md';
import { GiSteeringWheel, GiSpeedometer } from 'react-icons/gi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { backendUrl } from '../App';

const NewsletterBox = () => {
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2
      }
    });
  }, [controls]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/subscriptions/subscribe`, {
        email
      });

      if (response.data.success) {
        setShowThankYou(true);
        setEmail('');
        toast.success('Successfully subscribed to our AutoElite newsletter!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: <FaCheckCircle className="text-green-500" />
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Error subscribing to newsletter', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation Variants
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02 }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      backgroundColor: '#1D4ED8',
      boxShadow: '0px 5px 15px rgba(37, 99, 235, 0.3)'
    },
    tap: { scale: 0.95 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  };

  const benefits = [
    { 
      icon: <FaGift className="text-amber-400 text-xl" />, 
      text: "Exclusive Offers" 
    },
    { 
      icon: <FaNewspaper className="text-blue-400 text-xl" />, 
      text: "New Arrivals" 
    },
    { 
      icon: <FaTag className="text-green-400 text-xl" />, 
      text: "VIP Pricing" 
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -right-10 top-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 bottom-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 top-1/4 text-white opacity-5">
          <GiSteeringWheel size={380} />
        </div>
      </div>
      
      {/* Car Shape Decorative Elements */}
      <div className="absolute -bottom-10 -left-10 text-blue-500 opacity-10">
        <MdDirectionsCar size={180} />
      </div>
      <div className="absolute -top-10 -right-10 text-blue-500 opacity-10">
        <MdDirectionsCar size={180} style={{ transform: 'scaleX(-1)' }} />
      </div>

      <div className="container mx-auto relative z-10 max-w-5xl">
        <div className="grid md:grid-cols-5 gap-10 items-center">
          {/* Left Content */}
          <div className="md:col-span-2 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 py-2 px-4 rounded-full text-sm font-medium mb-6">
                <FaBell className="animate-pulse" />
                <span>Join 10,000+ car enthusiasts</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Get VIP Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">Premium Vehicles</span> Before Anyone Else
              </h2>
              
              <motion.div
                className="h-1 w-16 bg-blue-500 rounded mb-6"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
              
              <p className="text-blue-100 text-lg mb-8">
                Subscribe to the AutoElite newsletter and be the first to know about exclusive deals, new inventory, and automotive insights.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (index * 0.2) }}
                    className="flex items-center gap-3"
                  >
                    <div className="bg-gray-800/60 p-2 rounded-full">
                      {benefit.icon}
                    </div>
                    <span className="text-white">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Right Form */}
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 md:p-10 border border-white/10"
            >
              <div className="flex justify-center mb-6">
                <motion.div 
                  animate={controls}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-full text-white"
                >
                  <FaCar size={32} />
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Join The AutoElite Club
              </h3>
              
              <p className="text-blue-100 text-center mb-6">
                Enter your email to receive exclusive car offers and automotive updates.
              </p>
              
              <motion.form
                onSubmit={onSubmitHandler}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={formVariants}
              >
                <div className="mb-6 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaEnvelope />
                  </div>
                  <motion.input
                    type="email"
                    placeholder="Your email address"
                    required
                    className="w-full bg-white/20 text-white border border-blue-300/30 rounded-lg px-12 py-4 outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-blue-200/60"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variants={inputVariants}
                    whileFocus="focus"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-600"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Subscribe Now</span>
                      <GiSpeedometer />
                    </>
                  )}
                </motion.button>
                
                <p className="text-xs text-blue-100/70 text-center mt-4">
                  By subscribing, you agree to receive marketing emails from AutoElite. 
                  You can unsubscribe at any time.
                </p>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 relative w-full max-w-md shadow-2xl overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Top decorative element */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                onClick={() => setShowThankYou(false)}
                aria-label="Close"
              >
                <MdClose size={18} />
              </button>
              
              {/* Content */}
              <div className="text-center pt-2">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="bg-green-100 p-5 rounded-full"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <FaCheckCircle className="text-green-500 text-4xl" />
                  </motion.div>
                </div>
                
                {/* Message */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Welcome to AutoElite!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  You're now part of our exclusive club. Get ready for premium vehicle offers, insider news, and VIP deals delivered straight to your inbox.
                </p>
                
                {/* Car icon */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-6"
                >
                  <FaCar className="text-5xl mx-auto text-blue-600" />
                </motion.div>
                
                {/* Next steps */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-bold text-gray-700 mb-2">What's Next?</h4>
                  <p className="text-gray-600 text-sm">
                    Check your inbox for a welcome email with a special offer just for new subscribers!
                  </p>
                </div>
                
                {/* CTA Button */}
                <motion.button
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-100 transition duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowThankYou(false)}
                >
                  Continue Shopping
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default NewsletterBox;
