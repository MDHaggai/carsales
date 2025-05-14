import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCarSide, FaCreditCard, FaShippingFast, FaTools, FaHandshake, FaQuestionCircle } from 'react-icons/fa';

const FAQ = () => {
  // Track active category and question
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeQuestion, setActiveQuestion] = useState(null);

  // FAQ Categories with icons
  const categories = [
    { id: 'general', name: 'General', icon: FaQuestionCircle },
    { id: 'payment', name: 'Payment Plans', icon: FaCreditCard },
    { id: 'shipping', name: 'Shipping', icon: FaShippingFast },
    { id: 'warranty', name: 'Warranty', icon: FaTools },
    { id: 'purchase', name: 'Purchase Process', icon: FaHandshake },
  ];

  // FAQ Data
  const faqData = {
    general: [
      {
        question: "How does your auto sales process work?",
        answer: "Our process is simple: Browse our collection online, select your desired vehicle, choose between down payment or full payment options, complete the verification process, and we'll handle the rest including delivery to your location."
      },
      {
        question: "Why are your cars so affordable compared to other dealerships?",
        answer: "We offer competitive pricing because we source vehicles through multiple channels: direct purchases from trusted partners, certified pre-owned programs, manufacturer auctions, fleet vehicle acquisitions, and exclusive dealer networks. Our streamlined operations eliminate traditional overhead costs associated with large physical dealerships. We maintain lower inventory carrying costs through just-in-time procurement and leverage volume purchasing power with our partners. Additionally, our direct-to-consumer model cuts out middlemen, allowing us to pass these savings directly to you without compromising on quality or reliability."
      },
      {
        question: "Do you offer test drives?",
        answer: "Yes! We offer scheduled test drives for all our vehicles. Simply book an appointment through our contact page or call us directly."
      },
      {
        question: "What documents do I need to purchase a car?",
        answer: "You'll need: Valid government-issued ID, Proof of income, Proof of residence, Driver's license, Insurance information, and Banking details for payment processing."
      }
    ],
    payment: [
      {
        question: "What are your down payment terms?",
        answer: "Down payments typically range from 10-30% of the vehicle's total cost. We offer flexible payment plans with competitive interest rates based on your credit history."
      },
      {
        question: "How are monthly payments structured?",
        answer: "Monthly payments are calculated based on: Purchase price minus down payment, Interest rate (varies by credit score), Loan term (24-72 months available), and Additional warranty coverage if selected."
      },
      {
        question: "Do you offer financing options?",
        answer: "Yes, we partner with multiple financial institutions to offer competitive rates. We can work with various credit situations and offer terms up to 72 months."
      }
    ],
    shipping: [
      {
        question: "How is vehicle delivery handled?",
        answer: "We offer both pickup at our location and nationwide delivery. Delivery costs vary by distance and are calculated during checkout. All vehicles are fully insured during transport."
      },
      {
        question: "What's your delivery timeframe?",
        answer: "Local deliveries typically take 1-3 business days. National deliveries range from 5-10 business days depending on location. You'll receive real-time tracking information."
      }
    ],
    warranty: [
      {
        question: "What warranty coverage is included?",
        answer: "All vehicles come with a standard 3-month/3,000-mile warranty. Extended warranty options are available for up to 5 years/60,000 miles."
      },
      {
        question: "How are repairs and maintenance handled?",
        answer: "Warranty repairs can be performed at any certified mechanic. We have a network of preferred service centers nationwide."
      }
    ],
    purchase: [
      {
        question: "Can I trade in my current vehicle?",
        answer: "Yes! We accept trade-ins and offer competitive market values. Our team will evaluate your vehicle and apply the value to your purchase."
      },
      {
        question: "What's your return policy?",
        answer: "We offer a 7-day/700-mile money-back guarantee. If you're not satisfied, return the vehicle in original condition for a full refund."
      }
    ]
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our auto sales process, financing options,
            and customer service policies.
          </p>
        </motion.div>

        {/* Category Navigation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all
                  ${activeCategory === category.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
              >
                <Icon className="text-2xl" />
                <span className="font-medium">{category.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* FAQ Questions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqData[activeCategory].map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <motion.button
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <motion.span
                  animate={{ rotate: activeQuestion === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-blue-600"
                >
                  ↓
                </motion.span>
              </motion.button>
              
              <AnimatePresence>
                {activeQuestion === index && (
                  <motion.div
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="px-6 py-4 bg-blue-50"
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;