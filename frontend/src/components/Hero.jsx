import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaChevronRight,
  FaShieldAlt,
  FaLeaf,
  FaTachometerAlt,
  FaChevronDown,
  FaStar,
  FaCog,
  FaGlobeAsia,
  FaAngleRight,
  FaAngleLeft,
  FaPlay
} from 'react-icons/fa';
import { assets } from '../assets/assets';

const HONDA_FACTS = [
  "Founded in 1948 by Soichiro Honda",
  "World's largest motorcycle manufacturer since 1959",
  "Produces over 14 million engines annually",
  "Ranked 5th among world's top automotive manufacturers",
  "Pioneered VTEC variable valve timing technology"
];

// Honda car models showcase data
const SHOWCASE_MODELS = [
  { 
    name: "Civic Type R",
    tagline: "Track-Ready Street Performance", 
    highlights: ["306 HP Turbo Engine", "6-Speed Manual", "Adaptive Suspension"],
    image: assets.black || "https://images.unsplash.com/photo-1633106838279-798caee97a75"
  },
  { 
    name: "CR-V Hybrid",
    tagline: "Efficiency Meets Adventure", 
    highlights: ["38 MPG Combined", "Real-Time AWD", "Hands-Free Access"],
    image: "https://images.unsplash.com/photo-1623869673865-9d79076ad166"
  },
  { 
    name: "Accord",
    tagline: "Redefined Sophistication", 
    highlights: ["Turbocharged Power", "Hybrid Available", "Wireless CarPlay"],
    image: "https://images.unsplash.com/photo-1567173772087-5d6d8504dede"
  }
];

const Hero = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Parallax effects setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const heroTextY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroImageScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, 50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const backgroundBlur = useTransform(scrollYProgress, [0, 0.3], [0, 5]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const totalScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (currentY / totalScroll) * 100));
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate through Honda facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prevIndex => (prevIndex + 1) % HONDA_FACTS.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Honda features - expanded
  const features = [
    { icon: FaShieldAlt, text: "Honda Sensing™", description: "Advanced safety suite" },
    { icon: FaLeaf, text: "Eco Assist™", description: "Optimized efficiency" },
    { icon: FaTachometerAlt, text: "VTEC Performance", description: "Revolutionary engine technology" },
    { icon: FaCog, text: "Reliability", description: "Built to last" },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.7,
        ease: "easeOut"
      }
    })
  };

  const slideIn = {
    hidden: { x: 60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: {
      x: -60,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  // Navigate between showcase models
  const navigateModels = (direction) => {
    setCurrentModelIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % SHOWCASE_MODELS.length;
      } else {
        return prev === 0 ? SHOWCASE_MODELS.length - 1 : prev - 1;
      }
    });
  };

  // Handle video modal
  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  const closeVideo = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const currentModel = SHOWCASE_MODELS[currentModelIndex];

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dynamic background with multiple layers for depth */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main background image with parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            scale: heroImageScale,
            y: heroImageY,
            filter: `blur(${backgroundBlur.get()}px)`
          }}
        >
          <img 
            src={currentModel.image}
            alt="Honda Background"
            className="object-cover object-center w-full h-full"
          />
        </motion.div>
        
        {/* Multiple gradient overlays for depth and emphasis */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-blue-900/10 to-black/80"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-950 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/50 to-transparent"></div>
        
        {/* Animated light beams for dramatic effect */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[50vw] h-[150vh] bg-gradient-to-b from-red-500/30 to-transparent skew-y-12"
            animate={{ 
              x: [0, 100, 0], 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-[-20vh] right-1/3 w-[30vw] h-[100vh] bg-gradient-to-b from-blue-500/20 to-transparent -skew-y-12"
            animate={{ 
              x: [0, -50, 0], 
              opacity: [0.05, 0.15, 0.05] 
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yNSIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNIDYwIDAgTCAwIDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yNSIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNIDAgMCBMIDAgNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yNSIgZmlsbD0ibm9uZSIgLz48cGF0aCBkPSJNIDYwIDAgTCA2MCA2MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjI1IiBmaWxsPSJub25lIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-[0.03]"></div>
      </div>

      {/* Premium progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-900/80 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-700"
          style={{ width: `${scrollProgress}%`, boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)' }}
        />
      </div>

      {/* Main content container */}
      <div className="absolute inset-0 z-10">
        <div className="container mx-auto px-4 h-full flex flex-col">
          {/* Animated Honda DNA strip at the top */}
          <motion.div 
            className="w-full pt-8 overflow-hidden"
            variants={fadeInUp}
            custom={0.05}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-3 py-2 px-4"
              animate={{ x: [-500, 0] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="h-px bg-red-500 flex-grow max-w-[80px]"></div>
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border border-white/10">
                <span className="text-white/80 text-xs tracking-widest uppercase">Honda DNA</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Animated fact rotation */}
                <div className="h-5 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={factIndex}
                      className="absolute text-white/70 text-xs whitespace-nowrap"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {HONDA_FACTS[factIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <FaGlobeAsia className="text-red-500 text-xs" />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero content with two columns */}
          <div className="flex-grow flex flex-col lg:flex-row items-center">
            {/* Left column - Main content */}
            <motion.div 
              className="w-full lg:w-7/12 flex flex-col justify-center pt-12 lg:pt-0"
              style={{ y: heroTextY, opacity: heroOpacity }}
            >
              <div className="max-w-2xl">
                {/* Premium Honda badge */}
                <motion.div
                  variants={fadeInUp}
                  custom={0.1}
                  initial="hidden"
                  animate="visible"
                  className="mb-6"
                >
                  <div className="inline-block relative">
                    <div className="absolute inset-0 bg-red-600 blur-md opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-red-600 to-red-800 px-5 py-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-6 h-6 text-white">
                          <rect width="16" height="16" rx="2" fill="currentColor"/>
                          <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8Z" fill="#e11"/>
                        </svg>
                        <h3 className="text-white font-bold tracking-wider">HONDA</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Model showcase with animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentModelIndex}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-6"
                  >
                    <h2 className="text-lg text-white/80 mb-2 font-light">{currentModel.tagline}</h2>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3">
                      {currentModel.name}
                    </h1>
                    
                    <div className="flex gap-4 items-center mb-6">
                      {currentModel.highlights.map((highlight, index) => (
                        <div 
                          key={index} 
                          className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5 text-white/90 text-sm"
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Engaging description */}
                <motion.p
                  variants={fadeInUp}
                  custom={0.4}
                  initial="hidden"
                  animate="visible"
                  className="text-base md:text-lg text-white/70 mb-8 max-w-xl"
                >
                  Discover the perfect harmony of precision engineering and innovative design. 
                  Every Honda vehicle is crafted with meticulous attention to detail, 
                  delivering a driving experience that's both exhilarating and reliable.
                </motion.p>
                
                {/* Enhanced features section */}
                <motion.div
                  variants={fadeInUp}
                  custom={0.5}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
                >
                  {features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="group bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform duration-300">
                          <feature.icon className="text-white text-sm" />
                        </div>
                        <span className="text-white font-medium">{feature.text}</span>
                      </div>
                      <p className="text-white/60 text-xs pl-11">{feature.description}</p>
                    </div>
                  ))}
                </motion.div>
                
                {/* Enhanced CTA Buttons */}
                <motion.div
                  variants={fadeInUp}
                  custom={0.6}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-4 items-center"
                >
                  <Link to="/models" className="relative group">
                    <div className="absolute inset-0 bg-red-600 rounded-md blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 border border-red-500/20 group-hover:translate-y-[-2px] transition-transform">
                      Explore Models
                      <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  
                  <Link to="/test-drive" className="relative group">
                    <div className="absolute inset-0 rounded-md blur-sm opacity-50 group-hover:opacity-70 transition-opacity bg-white/5"></div>
                    <div className="relative border border-white/20 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all group-hover:translate-y-[-2px]">
                      Schedule Test Drive
                    </div>
                  </Link>
                  
                  <button 
                    onClick={playVideo}
                    className="flex items-center gap-2 text-white/70 px-4 py-2 hover:text-white transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors">
                      <FaPlay className="text-xs ml-0.5" />
                    </div>
                    <span>Watch Video</span>
                  </button>
                </motion.div>
                
                {/* Model navigation arrows */}
                <motion.div 
                  variants={fadeInUp}
                  custom={0.7}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-3 mt-10"
                >
                  <button 
                    onClick={() => navigateModels('prev')}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <FaAngleLeft />
                  </button>
                  
                  <div className="text-white/50 text-sm">
                    <span className="text-white font-medium">{currentModelIndex + 1}</span>
                    <span>/</span>
                    <span>{SHOWCASE_MODELS.length}</span>
                  </div>
                  
                  <button 
                    onClick={() => navigateModels('next')}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <FaAngleRight />
                  </button>
                  
                  <div className="ml-4 h-px bg-white/20 flex-grow"></div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Right column - Visual elements (only on desktop) */}
            <motion.div 
              className="hidden lg:block lg:w-5/12 relative"
              style={{ opacity: heroOpacity }}
            >
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px]"
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full border border-white/5 relative"></div>
                <div className="absolute top-1/2 left-1/2 w-5/6 h-5/6 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"></div>
                <div className="absolute top-1/2 left-1/2 w-2/3 h-2/3 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"></div>
                
                <motion.div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <motion.div 
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                />
                
                <motion.div 
                  className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 blur-[1px]"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                />
              </motion.div>
              
              {/* Stats display */}
              <div className="absolute top-1/3 right-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 w-56">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Performance</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`text-xs ${i < 4 ? 'text-red-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <motion.div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <motion.div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-1/4 left-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 w-40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                    <FaLeaf className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">ECO Mode</div>
                    <div className="text-green-400 text-xs">Active</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex justify-center pb-8 mt-auto"
          >
            <motion.div
              animate={{ 
                y: [0, 8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <span className="text-white/50 text-xs uppercase tracking-widest mb-2">
                Discover Innovation
              </span>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                <FaChevronDown className="text-white/70 text-sm" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl p-2"
            >
              <button 
                onClick={closeVideo}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white/80 hover:bg-black hover:text-white"
              >
                ✕
              </button>
              <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                <iframe 
                  ref={videoRef}
                  src="https://www.youtube.com/embed/CKvO4mmBvFM" 
                  title="Honda Promotional Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Hero;