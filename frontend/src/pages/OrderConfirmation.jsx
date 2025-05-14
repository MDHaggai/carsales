import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const OrderConfirmation = () => {
  const navigate = useNavigate();

  // Automatically open the mail client after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href =
        'mailto:1Autocarsales@gmail.com?subject=I%20will%20like%20to%20complete%20my%20order%20now';
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center
      bg-gradient-to-b from-blue-50 to-blue-100 px-4 py-8"
    >
      {/* AnimatePresence for possible fade-in effects */}
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center bg-white rounded-md shadow-md p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Confetti-like background (optional simple approach) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-blue-400 rounded-full w-2 h-2"
                initial={{ opacity: 0, top: '50%', left: '50%' }}
                animate={{
                  opacity: 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                transition={{
                  delay: i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>

          {/* Animated checkmark circle */}
          <motion.div
            className="relative w-32 h-32 mb-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            <div className="absolute w-32 h-32 bg-green-200 rounded-full animate-ping"></div>
            <div className="absolute w-28 h-28 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl">
              ✓
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Order Confirmed!
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-center mb-6 max-w-md">
            Your shipping details have been received. We’ll automatically open
            your email client in a few seconds so you can complete your order. 
            You may also directly send an email to{' '}
            <a
              href="mailto:1Autocarsales@gmail.com"
              className="text-blue-600 underline"
            >
              1Autocarsales@gmail.com
            </a>{' '}
            or wait for our email in the next 20 minutes with payment information.
          </p>

          {/* Back to Home button */}
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OrderConfirmation;
