import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaChevronRight,
  FaRegCheckCircle,
  FaCar,
  FaShieldAlt,
  FaLeaf,
  FaTachometerAlt,
  FaWrench,
  FaChartLine,
  FaMedal,
  FaChevronDown
} from 'react-icons/fa';
import { assets } from '../assets/assets';

const Hero = () => {
  // Scroll detection
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const lastScrollY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const heroTextY = useTransform(scrollYProgress, [0, 0.5], [0, -70]);
  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.7]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolledDown(currentY > 50);
      lastScrollY.current = currentY;
      
      const totalScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (currentY / totalScroll) * 100));
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic highlights effect
  const DynamicHighlights = () => {
    return (
      <div className="absolute inset-0 z-1 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={`highlight-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0) 70%)`,
              width: 300 + i * 100,
              height: 300 + i * 100,
              x: 200 - i * 80,
              y: 200 + i * 60,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    );
  };

  // Honda features
  const features = [
    { icon: FaShieldAlt, text: "Safety Sensing™" },
    { icon: FaLeaf, text: "Eco-Friendly" },
    { icon: FaTachometerAlt, text: "Performance" },
  ];

  // Honda models
  const models = [
    { name: "Civic", type: "Sedan", highlight: "Advanced" },
    { name: "Accord", type: "Sedan", highlight: "Elegant" },
    { name: "CR-V", type: "SUV", highlight: "Versatile" },
  ];

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.15
      }
    },
    exit: { opacity: 0 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1.0]
      }
    })
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gray-900"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `url(${assets.black})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          y: backgroundPositionY,
          scale: backgroundScale,
          opacity: backgroundOpacity,
        }}
      >
        {/* Red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-transparent to-black/60"></div>
        
        {/* Bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
        
        <DynamicHighlights />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-red-600 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Content - Split Layout */}
      <div className="absolute inset-0 z-10">
        <div className="h-full w-full flex flex-col lg:flex-row">
          {/* Text content - Left side */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 md:px-12 lg:px-20">
            <motion.div style={{ y: heroTextY }}>
              {/* Logo and branding */}
              <motion.div
                variants={fadeInUp}
                custom={0.1}
                initial="hidden"
                animate="visible"
                className="mb-3"
              >
                <h3 className="text-red-600 text-xl font-bold tracking-wider">HONDA</h3>
              </motion.div>
              
              {/* Main heading */}
              <motion.h1
                variants={fadeInUp}
                custom={0.2}
                initial="hidden"
                animate="visible"
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
              >
                Power of <span className="text-red-600">Dreams</span> in Motion
              </motion.h1>
              
              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                custom={0.3}
                initial="hidden"
                animate="visible"
                className="text-lg text-gray-300 max-w-xl mb-8"
              >
                Experience Japanese engineering excellence with Honda's innovative design, reliability, and performance.
              </motion.p>
              
              {/* Features */}
              <motion.div
                variants={fadeInUp}
                custom={0.4}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-5 mb-8"
              >
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                      <feature.icon className="text-red-500" />
                    </span>
                    <span className="text-gray-200">{feature.text}</span>
                  </div>
                ))}
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                custom={0.5}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/models" className="bg-red-600 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                  Explore Models
                  <FaChevronRight />
                </Link>
                <Link to="/test-drive" className="border border-white/30 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  Schedule Test Drive
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Visual elements - Right side */}
          <div className="hidden lg:flex w-1/2 h-full items-center justify-center relative">
            {/* Model cards */}
            <AnimatePresence>
              {!isScrolledDown && (
                <div className="relative h-1/2 w-full">
                  {models.map((model, index) => (
                    <motion.div
                      key={model.name}
                      className="absolute bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
                      style={{
                        width: '280px',
                        height: '150px',
                        left: `calc(50% - 140px)`,
                        top: `calc(50% - 75px + ${(index - 1) * 80}px)`,
                        zIndex: models.length - index
                      }}
                      initial={{
                        opacity: 0,
                        y: 50,
                        rotateX: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: {
                          delay: 0.6 + index * 0.15,
                          duration: 0.8,
                          ease: [0.215, 0.61, 0.355, 1.0]
                        }
                      }}
                      exit={{
                        opacity: 0,
                        y: -30,
                        transition: {
                          duration: 0.5
                        }
                      }}
                      whileHover={{
                        y: -5,
                        scale: 1.03,
                        transition: {
                          duration: 0.2
                        }
                      }}
                    >
                      <div className="p-5">
                        <span className="text-xs text-red-500 font-medium tracking-wider">{model.highlight}</span>
                        <h3 className="text-2xl font-bold text-white mb-1">{model.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">{model.type}</span>
                          <FaMedal className="text-red-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-800"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          <span className="text-gray-400 text-sm mb-2">Scroll to discover</span>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
            <FaChevronDown className="text-white" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Hero;