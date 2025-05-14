import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  FaCarSide, 
  FaTags, 
  FaShieldAlt, 
  FaHeadset,
  FaSyncAlt,
  FaCheckCircle,
  FaHandshake,
  FaStar
} from 'react-icons/fa';
import { assets } from '../assets/assets';

// Background particle component for futuristic effect
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {[...Array(50)].map((_, i) => (
        <motion.div 
          key={i}
          className="absolute bg-blue-500 rounded-full opacity-20"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * -100 - 50],
            opacity: [0.2, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Interface for feature cards
interface FeatureCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
  index: number;
}

// Feature card with 3D transform effects
const FeatureCard: React.FC<FeatureCardProps & {index: number}> = ({ title, description, icon, index }) => {
  const [hover, setHover] = useState(false);
  const cardControls = useAnimation();
  const iconControls = useAnimation();
  
  useEffect(() => {
    if (hover) {
      cardControls.start({
        rotateY: [0, 5],
        rotateX: [0, -5],
        transition: { duration: 0.3 }
      });
      iconControls.start({ 
        rotate: 360,
        transition: { duration: 1, ease: "easeInOut" }
      });
    } else {
      cardControls.start({
        rotateY: 0,
        rotateX: 0,
        transition: { duration: 0.3 }
      });
    }
  }, [hover, cardControls, iconControls]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ 
        opacity: 1,
        y: 0,
        transition: { 
          duration: 0.6,
          delay: index * 0.15,
          ease: [0.25, 0.1, 0.25, 1] 
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      animate={cardControls}
      className="relative group p-1 rounded-xl z-10 perspective-1000"
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-sky-500 rounded-xl opacity-70 blur-sm group-hover:opacity-100 group-hover:blur transition-all duration-300"></div>
      
      {/* Main card */}
      <div className="relative bg-slate-800/90 backdrop-blur-xl p-6 rounded-lg border border-slate-700/60 h-full
        shadow-[0_0_15px_rgba(0,85,255,0.15)] group-hover:shadow-[0_0_30px_rgba(0,85,255,0.3)] 
        transition-all duration-500">
        
        {/* Futuristic corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400"></div>
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400"></div>
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400"></div>
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400"></div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Glowing icon container */}
          <motion.div 
            animate={iconControls}
            className="relative p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                      shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]
                      transition-all duration-500 z-10"
          >
            <div className="text-white">
              {icon}
            </div>
            
            {/* Orbital ring animation */}
            <motion.div 
              className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            ></motion.div>
          </motion.div>
          
          <h3 className="text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            {title}
          </h3>
          
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            {description}
          </p>
          
          {/* Futuristic button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 text-sm
                      hover:bg-blue-500/30 transition-colors duration-300 flex items-center gap-2"
          >
            <span>Learn More</span>
            <FaSyncAlt className="text-xs" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// New interface for better partner brands
interface PartnerBrand {
  logo: string;
  name: string;
  details?: string;
  tier: 'platinum' | 'gold' | 'silver';
  vehicles?: number;
}

// Main component
const About1: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  // Parallax scrolling effect
  const scrollY = useMotionValue(0);
  useEffect(() => {
    const handleScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);
  
  const y1 = useTransform(scrollY, [0, 300], [0, -100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  // For partner logo carousel
  const [activeCategory, setActiveCategory] = useState<'all' | 'platinum' | 'gold' | 'silver'>('all');
  
  // Updated feature cards
  const featureCards = [
    {
      title: 'Quantum Vehicle Selection',
      description:
        'Access our neural-network powered catalog with thousands of vehicles, personalized to your exact preferences and driving patterns.',
      icon: <FaCarSide className="w-8 h-8" />,
    },
    {
      title: 'Transparent Blockchain Pricing',
      description:
        'All pricing is secured on our proprietary blockchain, ensuring complete transparency and the most competitive rates available anywhere.',
      icon: <FaTags className="w-8 h-8" />,
    },
    {
      title: 'AI Quality Assurance',
      description:
        'Each vehicle is analyzed by our machine learning algorithms that perform 1,000+ inspection points for unmatched quality standards.',
      icon: <FaShieldAlt className="w-8 h-8" />,
    },
    {
      title: 'Holographic Support',
      description:
        'Connect with our support team through immersive AR assistance. Get real-time guidance from experts throughout your journey.',
      icon: <FaHeadset className="w-8 h-8" />,
    },
  ];

  // Enhanced trusted brands data with tiers and additional information
  const trustedBrands: PartnerBrand[] = [
    { 
      logo: assets.toyota, 
      name: "Toyota", 
      details: "Global leader in hybrid technology",
      tier: 'platinum',
      vehicles: 4500
    },
    { 
      logo: assets.honda, 
      name: "Honda",
      details: "Renowned for reliability and innovation",
      tier: 'platinum',
      vehicles: 3800
    },
    { 
      logo: assets.ford, 
      name: "Ford",
      details: "American heritage and pickup excellence",
      tier: 'gold',
      vehicles: 3200
    },
    { 
      logo: assets.chevrolet, 
      name: "Chevrolet",
      details: "Performance and American muscle",
      tier: 'gold',
      vehicles: 2900
    },
    { 
      logo: assets.nissan, 
      name: "Nissan",
      details: "Japanese engineering and affordability",
      tier: 'gold',
      vehicles: 2700
    },
    { 
      logo: assets.lexus, 
      name: "Lexus",
      details: "Luxury division of Toyota Motor Corporation",
      tier: 'platinum',
      vehicles: 1800
    },
    { 
      logo: assets.suzuki, 
      name: "Suzuki",
      details: "Compact specialists with global reach",
      tier: 'silver',
      vehicles: 1100
    },
    { 
      logo: assets.hyndia, 
      name: "Hyundai",
      details: "Korean innovation and value",
      tier: 'gold',
      vehicles: 3100
    }, 
    { 
      logo: assets.landrover, 
      name: "Land Rover",
      details: "British luxury all-terrain vehicles",
      tier: 'platinum',
      vehicles: 1400
    },
  ];
  
  // Filter brands based on active category
  const filteredBrands = activeCategory === 'all' 
    ? trustedBrands 
    : trustedBrands.filter(brand => brand.tier === activeCategory);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Stats for partnerships section
  const partnershipStats = [
    { value: "250K+", label: "Vehicles Listed", icon: <FaCarSide className="w-5 h-5" /> },
    { value: "96%", label: "Customer Satisfaction", icon: <FaStar className="w-5 h-5" /> },
    { value: "50+", label: "Global Partners", icon: <FaHandshake className="w-5 h-5" /> },
  ];

  return (
    <motion.section 
      className="relative py-20 md:py-32 bg-[#050816] text-gray-100 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Particle background for futuristic feel */}
      <ParticleBackground />
      
      {/* Background grid lines */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-[linear-gradient(rgba(0,85,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,85,255,0.15)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>
      
      {/* Animated light flare */}
      <div className="absolute -top-52 -left-52 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 -right-52 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Hero Section */}
      <div className="container relative mx-auto px-6 text-center mb-24 md:mb-32 z-10">
        <motion.div
          style={{ y: y1 }}
          className="relative"
        >
          {/* Animated text reveal */}
          <motion.div
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tighter">
              Welcome to{" "}
              <span className="relative">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  CARSALES
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 blur-xl opacity-30"></span>
              </span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <p className="text-lg md:text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
              The next evolution in automotive discovery. Using quantum algorithms and neural networks
              to redefine how you find, compare, and purchase vehicles.
            </p>
          </motion.div>
          
          {/* Futuristic CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 py-4 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                      rounded-full text-lg font-medium overflow-hidden relative"
          >
            <span className="relative z-10">Begin Experience</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
              animate={{ 
                x: ["0%", "100%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Feature Cards Section */}
      <motion.div
        style={{ y: y2 }}
        className="relative container mx-auto px-6 z-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-24 md:mb-32">
          {featureCards.map((feature, index) => (
            <FeatureCard 
              key={index}
              {...feature}
              index={index} 
            />
          ))}
        </div>
      </motion.div>

      {/* COMPLETELY REDESIGNED PARTNERS SECTION */}
      <div ref={ref} className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          {/* Section header with enhanced design */}
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-6 py-2 border border-blue-500/30 rounded-full bg-blue-500/10 backdrop-blur-sm mb-4">
              <span className="text-blue-400 text-sm font-medium tracking-wider">TRUSTED GLOBALLY</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Premium Manufacturer Partnerships
              </span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-10 max-w-3xl mx-auto">
              Exclusive relationships with the world's leading automotive brands ensure our customers 
              receive privileged access to the latest models, competitive pricing, and manufacturer-backed guarantees.
            </p>
          
            {/* Partnership stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {partnershipStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4">
                    <div className="text-blue-400">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            
            {/* Tier filter buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['all', 'platinum', 'gold', 'silver'].map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                    activeCategory === category 
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300' 
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} Partners
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Grid layout for partner logos - replaces the 3D rotation with something more elegant */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5 }
                  }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <div className={`relative p-1 rounded-xl ${
                  brand.tier === 'platinum' 
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500' 
                    : brand.tier === 'gold'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
                }`}>
                  <div className="bg-slate-900 rounded-lg p-6 h-full">
                    {/* Brand tier badge */}
                    <div className={`absolute -top-3 -right-2 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                      brand.tier === 'platinum' ? 'bg-indigo-600 text-white' :
                      brand.tier === 'gold' ? 'bg-amber-500 text-white' :
                      'bg-slate-400 text-slate-900'
                    }`}>
                      {brand.tier.charAt(0).toUpperCase() + brand.tier.slice(1)}
                    </div>
                    
                    {/* Logo container */}
                    <div className="flex flex-col items-center h-full">
                      {/* Logo image */}
                      <div className="h-16 flex items-center justify-center mb-4">
                        <img
                          src={brand.logo}
                          alt={`${brand.name} Logo`}
                          className="max-h-12 max-w-[120px] object-contain"
                        />
                      </div>
                      
                      {/* Brand name */}
                      <h4 className="font-bold text-center mb-2">{brand.name}</h4>
                      
                      {/* Brand details */}
                      <p className="text-sm text-gray-400 text-center mb-3">{brand.details}</p>
                      
                      {/* Vehicle count */}
                      {brand.vehicles && (
                        <div className="flex items-center mt-auto text-xs text-blue-300">
                          <FaCarSide className="mr-1" />
                          <span>{brand.vehicles.toLocaleString()} vehicles available</span>
                        </div>
                      )}
                      
                      {/* View inventory button with subtle animation */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 w-full px-3 py-2 bg-blue-500/10 border border-blue-500/30 
                                rounded-md text-blue-300 text-sm transition-colors duration-300
                                hover:bg-blue-500/20"
                      >
                        View Inventory
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5 mt-16 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <FaCheckCircle className="text-blue-500 mr-2" />
              <span>Authorized Dealer Network</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-blue-500 mr-2" />
              <span>Manufacturer Warranty Support</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-blue-500 mr-2" />
              <span>Genuine OEM Parts</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Floating tech elements for decoration */}
      <div className="absolute top-1/4 right-10 w-24 h-24 border border-blue-500/20 rounded-full"></div>
      <div className="absolute top-1/3 left-10 w-40 h-40 border border-blue-500/20 rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-purple-500/20 rounded-full"></div>
    </motion.section>
  );
};

export default About1;
