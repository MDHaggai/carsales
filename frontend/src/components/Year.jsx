import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { backendUrl } from '../App';
import {
  FaArrowRight,
  FaCar,
  FaClock,
  FaDollarSign,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaGasPump,
  FaUserCircle,
  FaRegStar,
  FaStar,
  FaHeart,
  FaBolt,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaSortAmountUp,
  FaSortAmountDown,
  FaTrophy,
  FaFire
} from 'react-icons/fa';

// -------------------------------------
// Extended yearHistories with all years
// -------------------------------------
const yearHistories = {
  2025: {
    title: "The Age of Autonomous Luxury",
    subtitle: "Tomorrow's Technology, Today",
    description: (productName) => `
      2025 heralds the true dawn of autonomous luxury vehicles. ${productName} exemplifies this new era, where AI-driven systems and sustainable luxury converge. This year marked the first Level 5 autonomous vehicles reaching mainstream markets.

      Milestone Releases:
      • Rolls-Royce's first fully-electric Spectre evolution
      • Mercedes-Benz EQXX with 1,200km range
      • BMW's revolutionary i8 successor
      • Porsche's flying car concept prototype
      • Lucid's quantum-computer enhanced Air

      The industry achieved complete wireless charging infrastructure in major cities, while solid-state batteries became standard in luxury vehicles.`,
    innovations: [
      "Level 5 autonomy standardization",
      "Quantum-enhanced navigation",
      "Neural-link vehicle control",
      "Holographic HUD displays",
      "Smart glass technology"
    ]
  },
  2024: {
    title: "The Dawn of AI-Driven Mobility",
    subtitle: "The Year of Revolutionary Tech",
    description: (productName) => `
      In 2024, the automotive industry witnessed an unprecedented fusion of artificial intelligence and sustainable technology. The ${productName} emerged as a pinnacle achievement, showcasing what's possible when cutting-edge technology meets automotive excellence.

      Key Milestones:
      • Mercedes-Benz Vision EQXX shattered range records with its groundbreaking 1,000+ km capability
      • BMW i7 M70 xDrive redefined electric performance with 660 hp
      • Porsche's electric Macan brought sports car dynamics to the EV SUV segment
      • Tesla's updated Model 3 Highland set new standards for efficiency
      • Lucid Air Sapphire achieved sub-2-second 0-60 times

      This year marked the mainstream adoption of:
      • Quantum computing in vehicle AI systems
      • Commercial solid-state batteries with 5-minute charging
      • Level 4 autonomous driving capabilities
      • Advanced driver monitoring systems
      • Sustainable interior materials

      The industry saw a dramatic shift toward zero-emission vehicles, with global EV sales surpassing traditional ICE vehicles for the first time. ${productName} stood as one of the best examples from 2024, incorporating these advances while maintaining the essence of driving pleasure.`,
    innovations: [
      "Quantum-enhanced autonomous systems",
      "Solid-state battery technology",
      "Neural network driver assistance",
      "Biometric vehicle access",
      "Zero-emission powertrains"
    ]
  },
  2023: {
    title: "Electric Revolution Accelerates",
    subtitle: "Performance Meets Sustainability",
    description: (productName) => `
      2023 represented a watershed moment in automotive history, as electric vehicles became the preferred choice for luxury and performance. ${productName} stood as one of the best from 2023, exemplifying this perfect balance.

      Breakthrough Models:
      • Tesla Cybertruck finally reached production, revolutionizing pickup capabilities
      • Lucid Air Sapphire redefined performance with 1,200+ hp
      • BMW i5 brought executive luxury into the electric age
      • Mercedes-AMG EQE demonstrated the future of performance
      • Rivian R2 made adventure vehicles accessible

      Industry Achievements:
      • First network of 350kW+ ultra-fast chargers
      • Standardization of 800V architecture
      • Introduction of vehicle-to-grid technology
      • Advanced battery recycling programs
      • Wireless charging infrastructure

      The year saw unprecedented advancements in charging infrastructure and battery technology. ${productName} embodied these innovations while setting new standards for electric mobility.`,
    innovations: [
      "800V architecture standardization",
      "Bi-directional charging",
      "Advanced battery management",
      "Over-the-air performance updates",
      "Enhanced regenerative braking"
    ]
  },
  2022: {
    title: "Electric Performance Revolution",
    subtitle: "Speed Meets Sustainability",
    description: (productName) => `
      2022 was the year electric vehicles proved they could outperform their combustion counterparts. ${productName} emerged as a standout performer, demonstrating the incredible potential of electric powertrains.

      Notable Launches:
      • Rimac Nevera set new speed records
      • Ford F-150 Lightning revolutionized trucks
      • Porsche Taycan GTS set Nürburgring records
      • Mercedes-AMG EQS 53 redefined luxury performance
      • Audi RS e-tron GT challenged conventions`,
    innovations: [
      "800V charging systems",
      "Torque vectoring EVs",
      "Carbon-neutral manufacturing",
      "Advanced aerodynamics",
      "Sustainable luxury materials"
    ]
  },
  2021: {
    title: "Digital Transformation Era",
    subtitle: "Connected Mobility Takes Flight",
    description: (productName) => `
      2021 marked the integration of digital ecosystems with automotive excellence. ${productName} showcased how connectivity could enhance the driving experience.

      Key Releases:
      • Tesla Model S Plaid pushed acceleration limits
      • Genesis GV60 introduced facial recognition
      • BMW iX set new tech standards
      • Hyundai Ioniq 5 redefined charging speed
      • Lucid Air challenged Tesla's dominance`,
    innovations: [
      "5G vehicle connectivity",
      "Over-the-air updates",
      "Augmented reality displays",
      "Digital key technology",
      "Vehicle-to-grid systems"
    ]
  },
  2020: {
    title: "Resilient Innovation",
    subtitle: "Adapting to New Realities",
    description: (productName) => `
      Despite global challenges, 2020 proved to be a pivotal year for automotive innovation. ${productName} demonstrated the industry's resilience and ability to adapt.

      Breakthrough Models:
      • Porsche Taycan established performance EVs
      • Tesla Model Y democratized electric SUVs
      • Honda e brought retro-future design
      • Volkswagen ID.3 started the electric revolution
      • Polestar 2 challenged premium segments`,
    innovations: [
      "Contactless vehicle delivery",
      "Digital showrooms",
      "Advanced air filtration",
      "Remote vehicle management",
      "Predictive maintenance"
    ]
  },
  // ---------------------------
  // Additional missing years
  // ---------------------------
  2019: {
    title: "Global EV Upsurge",
    subtitle: "Electric Goes Mainstream",
    description: (productName) => `
      2019 was a milestone as global sales of electric and hybrid vehicles spiked. ${productName} led the charge with accessible pricing and advanced features.

      Notable Cars:
      • Tesla Model 3 took global markets by storm
      • Porsche Taycan made a stunning EV debut
      • Audi e-tron redefined electric SUVs
      • Toyota introduced advanced hybrid powertrains
      • Rivian unveiled its R1T electric truck concept`,
    innovations: [
      "Widespread DC fast charging",
      "Enhanced battery lifecycles",
      "Proliferation of hybrid models",
      "In-car virtual assistants",
      "Lane-keeping advanced ADAS"
    ]
  },
  2018: {
    title: "Autopilot & Semi-Autonomous Boom",
    subtitle: "Rise of the Driver's Aides",
    description: (productName) => `
      By 2018, semi-autonomous technology was becoming more commonplace. ${productName} showed the world how driver assists could provide both safety and comfort.

      Key Developments:
      • Tesla Autopilot improvements
      • Volvo's City Safety expansions
      • GM's Super Cruise for highways
      • Enhanced smartphone integration
      • Kia & Hyundai advanced ADAS features`,
    innovations: [
      "Lane-centering technology",
      "Adaptive cruise control mainstream",
      "Automatic emergency braking",
      "Improved in-cabin voice control",
      "Augmented vehicle apps"
    ]
  },
  2017: {
    title: "Urban Mobility & Electrification",
    subtitle: "Cities Turn to EV Solutions",
    description: (productName) => `
      2017 saw cities worldwide invest heavily in electric buses and infrastructure. ${productName} capitalized on this trend with a focus on efficient, urban-friendly design.

      Notable Trends:
      • Introduction of the Tesla Model 3
      • Renault Zoe became Europe's favorite EV
      • More robust city-based EV sharing
      • Massive rollout of fast-charging stations
      • Smarter route planning software`,
    innovations: [
      "High-capacity EV batteries",
      "Vehicle-to-home integration",
      "City-centric connectivity apps",
      "Lightweight EV chassis materials",
      "Enhanced pedestrian safety"
    ]
  },
  2016: {
    title: "Performance Hybrids Dominate",
    subtitle: "Eco-Friendly Speed",
    description: (productName) => `
      2016 was the year performance hybrids proved their worth, blending fuel economy with jaw-dropping acceleration. ${productName} showcased how a hybrid could truly excite.

      Milestone Launches:
      • Acura NSX redefined hybrid supercars
      • BMW i8 gained massive fandom
      • Porsche 918 Spyder delivered hypercar status
      • Lexus LC 500h dazzled grand tourers
      • Toyota Prius advanced eco-friendly tech`,
    innovations: [
      "Hybrid torque fill tech",
      "Mixed-material chassis",
      "Aggressive regen braking",
      "Dynamic all-wheel drive systems",
      "Aerodynamic active flaps"
    ]
  },
  2015: {
    title: "Hybrid Evolution",
    subtitle: "Transitional Green Tech",
    description: (productName) => `
      In 2015, hybrids were transitioning from niche to near-mainstream. ${productName} demonstrated how hybrid tech could be both practical and performance-oriented.

      Highlights:
      • Toyota Prius sales soared
      • Chevy Volt offered extended range
      • Ford introduced eco-boost hybrids
      • Tesla Model S gained autopilot features
      • Audi e-tron set new efficiency records`,
    innovations: [
      "Improved battery management",
      "Lightweight aluminum frames",
      "Regenerative braking advancements",
      "Semi-autonomous lane assist",
      "Enhanced infotainment integration"
    ]
  },
  2014: {
    title: "Rise of the Modern EV",
    subtitle: "Electric Steps Forward",
    description: (productName) => `
      2014 was the year EVs truly began stepping into the limelight. ${productName} proved that quiet, zero-emission cars could be surprisingly fun.

      Notable EVs:
      • BMW i3 brought futuristic design
      • Kia Soul EV entered mainstream
      • Nissan Leaf gained range upgrades
      • Tesla Model S P85D thrilled performance fans
      • VW e-Golf expanded Europe's EV scene`,
    innovations: [
      "Increased battery range at lower cost",
      "DC fast charging expansion",
      "Lightweight carbon-fiber bodies",
      "Connected in-car apps",
      "Regenerative braking improvements"
    ]
  },
  2013: {
    title: "Tech & Infotainment Explosion",
    subtitle: "Cars Go Digital",
    description: (productName) => `
      2013 saw car interiors revolutionized with large touchscreens, connected apps, and digital dashboards. ${productName} symbolized how quickly cabin tech could evolve.

      Key Additions:
      • Tesla's massive 17-inch center display
      • Enhanced smartphone syncing (CarPlay prototypes)
      • Ford SYNC improvements
      • In-car 4G hotspots
      • Virtual gauge clusters from Audi & BMW`,
    innovations: [
      "Touchscreen HMI emergence",
      "App-based remote controls",
      "Wireless hotspots in vehicles",
      "Gesture-based infotainment",
      "Improved voice recognition"
    ]
  },
  2012: {
    title: "Mainstream Electrification",
    subtitle: "Early Adopters Expand",
    description: (productName) => `
      2012 laid the groundwork for EV adoption. ${productName} captured public imagination by proving electric cars could blend practicality and style.

      Pioneers:
      • Tesla Model S debuted as an electric benchmark
      • Nissan Leaf gained traction in urban centers
      • Chevy Volt refined plug-in hybrid usability
      • Toyota Prius variants soared
      • Mitsubishi i-MiEV tested city commutes`,
    innovations: [
      "Extended range EV batteries",
      "Quick-charging protocols",
      "Hybrid synergy drive improvements",
      "Lightweight composites for EVs",
      "Urban-focused design"
    ]
  },
  2011: {
    title: "Stepping into Electric Future",
    subtitle: "First True Steps to EV Domination",
    description: (productName) => `
      2011 ushered in a surge of global interest in environmentally friendly cars. ${productName} led the way in blending comfort, style, and zero emissions.

      Landmark Highlights:
      • Nissan Leaf recognized globally
      • Chevy Volt bridged EV & ICE
      • Tesla Roadster validated performance EVs
      • Volkswagen e-Up tested Europe's taste for small EVs
      • Fisker Karma introduced hybrid exotic`,
    innovations: [
      "Pioneering full-electric powertrains",
      "Mixed city-highway EV strategies",
      "Renewable interior materials",
      "Rapid AC charging improvements",
      "Budding public charging networks"
    ]
  },
  2010: {
    title: "Connected Car Dawn",
    subtitle: "Smart Solutions Emerge",
    description: (productName) => `
      2010 saw the real dawn of connected cars. ${productName} proved early technology like built-in navigation and fledgling smartphone integration could transform the driving experience.

      Tech Milestones:
      • First wide-scale nav app usage
      • OnStar offered remote diagnostics
      • Early smartphone pairing capabilities
      • Hybrid interest soared
      • Car-based Wi-Fi hotspots tested`,
    innovations: [
      "Integrated GPS navigation",
      "Remote emergency services",
      "Mobile app synergy",
      "Early alternative fuel expansions",
      "Prototype advanced driver assist"
    ]
  }
};

// Mock bid data generator for the live auction animation
const generateMockBids = (basePrice, count = 5) => {
  const bids = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  const usernames = [
    'CarEnthusiast88', 'SpeedLover', 'LuxuryDreamer', 'ClassicCollector',
    'RoadRunner42', 'AutoExpert', 'VintageHunter', 'TurboFan', 'WheelsDeal'
  ];
  
  for (let i = 0; i < count; i++) {
    const bidTime = new Date(now - (i * (Math.random() * 120000 + 60000)));
    const bidAmount = currentPrice + Math.round((Math.random() * 500 + 100) / 100) * 100;
    currentPrice = bidAmount;
    
    bids.push({
      id: i,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      amount: bidAmount,
      time: bidTime,
      isHighest: i === 0
    });
  }
  
  return bids.reverse();
};

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Format relative time
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${diffHr}h ${diffMin % 60}m ago`;
};

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < Math.floor(rating) ? 
            <FaStar className="text-amber-400 text-sm" /> : 
            <FaRegStar className="text-amber-400 text-sm" />
          }
        </span>
      ))}
    </div>
  );
};

// Vehicle specs component
const VehicleSpecs = ({ product }) => {
  // Generate realistic specs based on product details
  // In a real app, these would come from your database
  const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const year = parseInt(product.year);
  const isElectric = product.description?.toLowerCase().includes('electric') || 
                     product.description?.toLowerCase().includes('ev');
  
  const specs = {
    power: isElectric ? 
      `${getRandomInRange(200, 800)} kW` : 
      `${getRandomInRange(120, 600)} hp`,
    acceleration: `${(getRandomInRange(30, 90) / 10).toFixed(1)}s`,
    topSpeed: `${getRandomInRange(120, 330)} km/h`,
    range: isElectric ? 
      `${getRandomInRange(200, 650)} km` : 
      `${getRandomInRange(400, 900)} km`,
    weight: `${getRandomInRange(1200, 2500)} kg`,
    efficiency: isElectric ? 
      `${getRandomInRange(15, 25)} kWh/100km` : 
      `${getRandomInRange(6, 15)} L/100km`,
    rating: (getRandomInRange(37, 49) / 10) // 3.7 to 4.9
  };
  
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="col-span-2">
        <StarRating rating={specs.rating} />
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 flex flex-col">
        <span className="text-xs text-gray-400">Power</span>
        <div className="flex items-center">
          <FaBolt className="text-blue-400 mr-2" />
          <span className="font-semibold">{specs.power}</span>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 flex flex-col">
        <span className="text-xs text-gray-400">0-100 km/h</span>
        <div className="flex items-center">
          <FaTachometerAlt className="text-red-400 mr-2" />
          <span className="font-semibold">{specs.acceleration}</span>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 flex flex-col">
        <span className="text-xs text-gray-400">Max Speed</span>
        <div className="flex items-center">
          <FaTachometerAlt className="text-yellow-400 mr-2" />
          <span className="font-semibold">{specs.topSpeed}</span>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 flex flex-col">
        <span className="text-xs text-gray-400">Range</span>
        <div className="flex items-center">
          <FaGasPump className="text-green-400 mr-2" />
          <span className="font-semibold">{specs.range}</span>
        </div>
      </div>
    </div>
  );
};

// Live auction component
const LiveAuction = ({ product }) => {
  // Generate a realistic base price based on the car brand, model, and year
  const basePrice = () => {
    const yearFactor = parseInt(product.year) - 2010;
    const brandFactors = {
      'mercedes': 50000, 'bmw': 45000, 'audi': 42000, 'lexus': 45000,
      'toyota': 25000, 'honda': 22000, 'ford': 28000, 'chevrolet': 27000,
      'ferrari': 180000, 'porsche': 80000, 'lamborghini': 200000
    };
    
    // Set a default base if the brand is not in our map
    const brandBase = brandFactors[product.brand?.toLowerCase()] || 30000;
    return brandBase + (yearFactor * 2000);
  };
  
  const [bids, setBids] = useState([]);
  const [auctionEnds, setAuctionEnds] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Setup mock auction data
  useEffect(() => {
    const price = basePrice();
    setBids(generateMockBids(price));
    
    // Set auction end time (3-24 hours from now)
    const hours = Math.floor(Math.random() * 22) + 3;
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);
    setAuctionEnds(endTime);
    
    // Simulate new bids coming in
    const bidInterval = setInterval(() => {
      setBids(prev => {
        if (prev.length === 0) return prev;
        
        // 25% chance of new bid
        if (Math.random() > 0.75) {
          const lastBid = prev[prev.length - 1];
          const newBidAmount = lastBid.amount + Math.round((Math.random() * 500 + 50) / 50) * 50;
          const usernames = ['CarEnthusiast88', 'SpeedLover', 'LuxuryDreamer', 'ClassicCollector',
                           'RoadRunner42', 'AutoExpert', 'VintageHunter', 'TurboFan', 'WheelsDeal'];
          const newBid = {
            id: prev.length,
            username: usernames[Math.floor(Math.random() * usernames.length)],
            amount: newBidAmount,
            time: new Date(),
            isHighest: true,
            isNew: true // Flag for animation
          };
          
          // Update previous highest bid
          const updatedBids = prev.map(bid => ({...bid, isHighest: false}));
          
          // Keep only the most recent 5 bids
          return [...updatedBids, newBid].slice(-5);
        }
        return prev;
      });
    }, 8000);
    
    // Update time remaining
    const timeInterval = setInterval(() => {
      if (auctionEnds) {
        const now = new Date();
        const diff = auctionEnds - now;
        
        if (diff <= 0) {
          setTimeLeft('Auction ended');
          clearInterval(timeInterval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(bidInterval);
      clearInterval(timeInterval);
    };
  }, [product.id]);
  
  const highestBid = bids.length > 0 ? bids[bids.length - 1] : null;
  
  return (
    <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Live Auction</h3>
        <div className="flex items-center text-yellow-400">
          <FaClock className="mr-1" />
          <span className="text-sm font-medium">{timeLeft}</span>
        </div>
      </div>
      
      {/* Current highest bid */}
      {highestBid && (
        <div className="bg-white/10 rounded-lg p-3 mb-4 border border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Current Bid</span>
            <motion.span 
              className="font-bold text-xl text-green-400"
              key={highestBid.amount}
              initial={{ scale: 1.2, color: '#FBBF24' }}
              animate={{ scale: 1, color: '#34D399' }}
              transition={{ duration: 0.5 }}
            >
              {formatCurrency(highestBid.amount)}
            </motion.span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>by {highestBid.username}</span>
            <span>{getRelativeTime(highestBid.time)}</span>
          </div>
        </div>
      )}
      
      {/* Recent bids */}
      <div className="space-y-3 max-h-[150px] overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <h4 className="text-sm text-gray-400 mb-2">Bid History</h4>
        <AnimatePresence>
          {bids.map((bid, index) => (
            <motion.div
              key={bid.id}
              className={`flex justify-between items-center p-2 rounded ${
                bid.isHighest ? 'bg-green-900/20 border border-green-500/30' : 'bg-white/5'
              }`}
              initial={bid.isNew ? { opacity: 0, y: -20, backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0, backgroundColor: bid.isHighest ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <FaUserCircle className={`mr-2 ${bid.isHighest ? 'text-green-500' : 'text-gray-500'}`} />
                <div>
                  <div className="text-sm font-medium">{bid.username}</div>
                  <div className="text-xs text-gray-500">{getRelativeTime(bid.time)}</div>
                </div>
              </div>
              <div className={`font-medium ${bid.isHighest ? 'text-green-400' : 'text-white'}`}>
                {formatCurrency(bid.amount)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Bid button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 
                 text-black font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300
                 flex items-center justify-center"
      >
        <FaDollarSign className="mr-2" />
        Place Your Bid
      </motion.button>
      
      {/* Watchers indicator */}
      <div className="flex items-center justify-center mt-4 text-sm text-gray-400">
        <FaEye className="mr-2" />
        <span>{Math.floor(Math.random() * 50) + 10} people watching this auction</span>
      </div>
    </div>
  );
};

// Main Year component
const Year = () => {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const isMobile = useRef(window.innerWidth < 768); // Track mobile screens

  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [showBidPanel, setShowBidPanel] = useState(true); // Show bid panel by default

  // Store previous scroll to detect direction
  const prevScrollY = useRef(0);
  const navigate = useNavigate();

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
      // Hide bid panel on smaller screens
      setShowBidPanel(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------
  // Fetch all products on mount & group by years
  // ---------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          const allProducts = response.data.products;
          const grouped = allProducts.reduce((acc, product) => {
            if (!acc[product.year]) {
              acc[product.year] = [];
            }
            acc[product.year].push(product);
            return acc;
          }, {});
          setProducts(allProducts);
          setGroupedProducts(grouped);

          // Sort years in descending order
          const yearArr = Object.keys(grouped).map(Number).sort((a, b) => b - a);
          setYears(yearArr);
          setSelectedYear(Math.max(...yearArr));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // -----------------------
  // Detect scroll direction
  // -----------------------
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;
      if (currentY > prevScrollY.current) {
        setScrollDirection("up"); 
      } else {
        setScrollDirection("down");
      }
      prevScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper functions for navigation
  const navigateProduct = (direction) => {
    if (!groupedProducts[selectedYear]) return;
    
    const productsInYear = groupedProducts[selectedYear].length;
    if (direction === 'next') {
      setActiveProductIndex((prev) => (prev + 1) % productsInYear);
    } else {
      setActiveProductIndex((prev) => (prev - 1 + productsInYear) % productsInYear);
    }
  };

  // ----------------------------
  // Animation Variants & Effects
  // ----------------------------
  const textRevealVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const textChildVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Card-like container for each product’s image
  const cardVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.8, filter: "blur(10px)" },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8,
        delay: Math.min(custom * 0.1, 0.8)
      }
    }),
    hover: { 
      scale: 1.05, // Reduced scale effect for better mobile experience
      transition: { duration: 0.3 } 
    }
  };

  // Auto-switch effect with random year selection sometimes
  useEffect(() => {
    if (!isHovered && Object.keys(groupedProducts).length > 0) {
      intervalRef.current = setInterval(() => {
        const yearsList = Object.keys(groupedProducts).map(Number).sort((a,b) => b-a);
        const currentYearIndex = yearsList.indexOf(selectedYear);
        
        if (Math.random() > 0.7 && yearsList.length > 1) {
          // 30% chance to switch to the next year
          const nextYearIndex = (currentYearIndex + 1) % yearsList.length;
          setSelectedYear(yearsList[nextYearIndex]);
          setActiveProductIndex(0);
        } else {
          // Switch product within current year
          const productsInYear = groupedProducts[selectedYear]?.length || 0;
          if (productsInYear > 0) {
            setActiveProductIndex(prev => (prev + 1) % productsInYear);
          }
        }
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [selectedYear, activeProductIndex, isHovered, groupedProducts]);

  // Helper to get product name (or fallback)
  const getCurrentProductName = (year, index) => {
    if (!groupedProducts[year] || !groupedProducts[year][index]) return 'this vehicle';
    return (
      groupedProducts[year][index].name ||
      `${groupedProducts[year][index].brand} ${groupedProducts[year][index].model}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
        >
          <FaCar className="text-4xl text-yellow-400 mb-3" />
          <p className="text-xl font-medium">Loading vehicle history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    // Consistent color scheme: gradient background 
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4
                       bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 
                       text-transparent bg-clip-text
                       drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                       tracking-tight"
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            WHAT OUR EXPERTS SAY
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              ABOUT CARS
            </span>
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"
          />
        </motion.div>
        {/* Year Selector at top right */}
        <div className="flex justify-end mb-12">
          <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-xl backdrop-blur-sm">
            {years.map((year) => (
              <motion.button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setActiveProductIndex(0);
                }}
                className={`
                  px-4 py-2 rounded-lg text-base font-medium transition-all
                  ${selectedYear === year 
                    ? 'bg-yellow-400 text-black shadow-xl' 
                    : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {year}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Section: If we have products for selectedYear */}
        <AnimatePresence mode="wait">
          {selectedYear && groupedProducts[selectedYear]?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Image / Product Visual */}
              <motion.div
                key={`${selectedYear}-${activeProductIndex}`}
                variants={cardVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
                className="relative w-full max-w-[600px] aspect-[16/9] rounded-2xl overflow-hidden
                           backdrop-blur-sm border border-white/10 bg-white/5 
                           order-1 lg:order-2 mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.img
                  src={groupedProducts[selectedYear][activeProductIndex].images[0]}
                  alt={groupedProducts[selectedYear][activeProductIndex].name}
                  className="w-full h-full object-contain md:object-cover rounded-2xl"
                  initial={{ scale: 1.2, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                {/* Quick info overlay - Adjusted text sizes for mobile */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 p-2 sm:p-3
                             bg-gradient-to-t from-black/80 to-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                    {groupedProducts[selectedYear][activeProductIndex].brand}{' '}
                    <span className="text-yellow-400">
                      {groupedProducts[selectedYear][activeProductIndex].model}
                    </span>
                  </h3>
                </motion.div>
              </motion.div>

              {/* Text / History / Innovations */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1 space-y-8"
              >
                <motion.div
                  className="space-y-6"
                  variants={textRevealVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Year Title */}
                  <motion.h2 
                    variants={textChildVariants}
                    className="text-5xl md:text-7xl font-bold text-white"
                  >
                    {selectedYear}
                    <span className="text-yellow-400">.</span>
                  </motion.h2>

                  {/* Year Histories Title */}
                  <motion.h3 
                    variants={textChildVariants}
                    className="text-2xl font-semibold text-yellow-400"
                  >
                    {yearHistories[selectedYear]?.title}
                  </motion.h3>

                  {/* Year Histories Description */}
                  <motion.div 
                    variants={textChildVariants}
                    className="prose prose-lg prose-invert max-w-none leading-relaxed"
                  >
                    {yearHistories[selectedYear]?.description(
                      getCurrentProductName(selectedYear, activeProductIndex)
                    )}
                  </motion.div>

                  {/* Key Innovations */}
                  <motion.div className="space-y-4 mt-6">
                    <motion.h4
                      variants={textChildVariants}
                      className="text-xl font-medium text-white/90"
                    >
                      Key Innovations
                    </motion.h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {yearHistories[selectedYear]?.innovations?.map((innovation, index) => (
                        <motion.div
                          key={index}
                          variants={textChildVariants}
                          className="flex items-center gap-3 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10"
                        >
                          <span className="text-yellow-400 text-xl">•</span>
                          <span className="text-white/80">{innovation}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

// Missing component definition
const FaEye = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 576 512"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
  </svg>
);

export default Year;
