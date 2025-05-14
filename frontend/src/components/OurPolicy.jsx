import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaTrophy, 
  FaHandshake, 
  FaCar,
  FaMoneyCheckAlt,
  FaHeadset,
  FaExchangeAlt,
  FaTools,
  FaSearchDollar,
  FaChevronRight
} from 'react-icons/fa';
import { MdDirectionsCar, MdSecurity, MdLocalOffer, MdOutlineVerified } from 'react-icons/md';
import { GiSteeringWheel, GiSpeedometer } from 'react-icons/gi';
import { BiSupport } from 'react-icons/bi';

const OurPolicy = () => {
  const [activePolicy, setActivePolicy] = useState(null);

  const policies = [
    {
      icon: <MdDirectionsCar className="text-5xl" />,
      title: "Premium Vehicle Selection",
      description: "Access to an extensive inventory of premium vehicles, meticulously curated and quality-checked by our automotive experts",
      color: "from-blue-600 to-blue-400",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      features: [
        "Exclusive luxury models available",
        "Thoroughly inspected vehicles",
        "Full vehicle history reports",
        "Regular inventory updates"
      ]
    },
    {
      icon: <FaTrophy className="text-5xl" />,
      title: "Industry-Leading Warranty",
      description: "Comprehensive warranty coverage that exceeds industry standards, giving you peace of mind long after your purchase",
      color: "from-emerald-600 to-emerald-400",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      features: [
        "Extended powertrain protection",
        "24/7 roadside assistance",
        "Transferable warranty terms",
        "Zero deductible service plans"
      ]
    },
    {
      icon: <FaHandshake className="text-5xl" />,
      title: "Transparent Pricing",
      description: "Crystal-clear pricing with no hidden fees or surprise charges, ensuring a straightforward and honest purchase experience",
      color: "from-amber-600 to-amber-400",
      image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      features: [
        "Market-based pricing analysis",
        "No document or hidden fees",
        "Price match guarantee",
        "Detailed cost breakdown"
      ]
    },
    {
      icon: <GiSteeringWheel className="text-5xl" />,
      title: "VIP Test Drive Experience",
      description: "Schedule personalized test drives at your convenience, including extended test periods and at-home driving experiences",
      color: "from-purple-600 to-purple-400",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
      features: [
        "Door-to-door test drive service",
        "Extended 24-hour test periods",
        "Multiple vehicle comparison drives",
        "Virtual reality previews"
      ]
    },
    {
      icon: <FaMoneyCheckAlt className="text-5xl" />,
      title: "Tailored Financing Solutions",
      description: "Customized financial packages with competitive rates designed to fit your budget and financial situation perfectly",
      color: "from-green-600 to-green-400",
      image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      features: [
        "Competitive interest rates",
        "Flexible payment plans",
        "Trade-in value maximization",
        "Pre-approval in minutes"
      ]
    },
    {
      icon: <BiSupport className="text-5xl" />,
      title: "Dedicated Concierge Service",
      description: "A personal automotive concierge available 24/7 to assist with every aspect of your ownership experience",
      color: "from-red-600 to-red-400",
      image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      features: [
        "Personal vehicle specialist",
        "Priority maintenance scheduling",
        "Annual vehicle check-ups",
        "Vehicle delivery and pickup service"
      ]
    },
    {
      icon: <FaExchangeAlt className="text-5xl" />,
      title: "Hassle-Free Vehicle Exchange",
      description: "Our 7-day exchange policy allows you to swap your vehicle if it doesn't meet your expectations completely",
      color: "from-indigo-600 to-indigo-400",
      image: "https://images.unsplash.com/photo-1627454822466-0b05093cb001?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      features: [
        "7-day exchange guarantee",
        "No-questions-asked policy",
        "Free vehicle swaps",
        "Full satisfaction guarantee"
      ]
    },
    {
      icon: <FaTools className="text-5xl" />,
      title: "Premium Service Package",
      description: "Complimentary maintenance package with every purchase including oil changes, tire rotations, and routine servicing",
      color: "from-cyan-600 to-cyan-400",
      image: "https://images.unsplash.com/photo-1635006775236-a54c2d1be392?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      features: [
        "3-year maintenance included",
        "Genuine OEM parts guarantee",
        "Loaner vehicles during service",
        "Digital service history tracking"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const detailsVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      }
    },
    exit: { 
      opacity: 0, 
      x: 50, 
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <section className="py-20 bg-[#f8f9fa] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-72 -right-72 w-144 h-144 bg-blue-50 rounded-full opacity-70 blur-3xl" />
      <div className="absolute -bottom-72 -left-72 w-144 h-144 bg-indigo-50 rounded-full opacity-70 blur-3xl" />
      
      {/* Vehicle silhouettes */}
      <div className="absolute top-10 right-10 text-gray-100 opacity-10">
        <MdDirectionsCar size={120} />
      </div>
      <div className="absolute bottom-10 left-10 text-gray-100 opacity-10">
        <FaCar size={120} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-3">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full inline-block mb-4"
            >
              <MdSecurity size={32} />
            </motion.div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            The <span className="text-blue-600">AutoElite</span> Promise
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "180px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6 rounded-full"
          />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We set the industry standard with our comprehensive customer commitments, 
            designed to make your car buying experience exceptional from start to finish
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-6"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <MdOutlineVerified className="mr-2" />
              Trusted by over 50,000 satisfied customers nationwide
            </div>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Policy Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:w-3/5"
          >
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                onClick={() => setActivePolicy(activePolicy === index ? null : index)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                  activePolicy === index 
                    ? 'border-blue-500 bg-white shadow-xl' 
                    : 'bg-white border-gray-200 shadow-md hover:border-blue-200'
                }`}
              >
                <div className="absolute top-0 right-0 mt-2 mr-2">
                  {activePolicy === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-blue-600 text-white p-1 rounded-full"
                    >
                      <FaChevronRight size={8} />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className={`bg-gradient-to-r ${policy.color} p-4 rounded-full mb-3 text-white`}>
                    {policy.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">{policy.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Policy Details Panel */}
          <div className="lg:w-2/5 lg:mt-0">
            <AnimatePresence mode="wait">
              {activePolicy !== null && (
                <motion.div
                  key={activePolicy}
                  variants={detailsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 h-full"
                >
                  <div className="h-56 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                    <img 
                      src={policies[activePolicy].image} 
                      alt={policies[activePolicy].title} 
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                      <div className={`bg-gradient-to-r ${policies[activePolicy].color} p-3 rounded-full inline-block mb-3`}>
                        {policies[activePolicy].icon}
                      </div>
                      <h3 className="text-2xl font-bold">{policies[activePolicy].title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {policies[activePolicy].description}
                    </p>
                    
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <MdLocalOffer className="mr-2 text-blue-600" />
                      Key Benefits
                    </h4>
                    
                    <ul className="space-y-3">
                      {policies[activePolicy].features.map((feature, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start"
                        >
                          <div className="bg-blue-100 p-1 rounded-full mt-0.5 mr-3">
                            <FaCheck className="text-xs text-blue-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-blue-100 flex items-center justify-center"
                    >
                      <FaSearchDollar className="mr-2" />
                      Learn More About This Policy
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {activePolicy === null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-inner border border-gray-200 h-full flex flex-col justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="bg-blue-100 p-5 rounded-full inline-block mb-6"
                    >
                      <GiSpeedometer className="text-5xl text-blue-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Explore Our Policies</h3>
                    <p className="text-gray-600 mb-6">
                      Select any policy from the left to see detailed information about the premium services and guarantees we offer with every vehicle purchase.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Premium", "Transparent", "Reliable", "Comprehensive"].map((tag, idx) => (
                        <div key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-blue-600 font-medium border border-blue-100">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {["Trusted Partner", "100% Satisfaction", "Top Rated Dealer", "Award Winning"].map((trust, idx) => (
            <div key={idx} className="flex items-center text-gray-500">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <FaTrophy className="text-amber-500 mr-2" />
              </motion.div>
              <span className="text-sm font-medium">{trust}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurPolicy;
