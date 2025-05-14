import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Tab, Box } from '@mui/material';
import LoanInputs from './LoanInputs';
import PaymentBreakdown from './PaymentBreakdown';
import LoanSummary from './LoanSummary';
import FinanceOptions from './FinanceOptions';
import CalculatorSlider from './CalculatorSlider';
import { FaCalculator, FaDollarSign, FaChartPie, FaCheckCircle, FaCar } from 'react-icons/fa';

// Simple finance calculations hook implementation
const useFinanceCalculations = (loanAmount, interestRate, loanTerm) => {
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0
  });

  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      // Monthly interest rate
      const monthlyRate = interestRate / 100 / 12;
      
      // Total number of payments
      const totalPayments = loanTerm * 12;
      
      // Calculate monthly payment
      const x = Math.pow(1 + monthlyRate, totalPayments);
      const monthly = (loanAmount * x * monthlyRate) / (x - 1);
      
      // Calculate total payment and interest
      const total = monthly * totalPayments;
      const interest = total - loanAmount;
      
      setResults({
        monthlyPayment: monthly,
        totalInterest: interest,
        totalPayment: total
      });
    } else {
      setResults({
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0
      });
    }
  }, [loanAmount, interestRate, loanTerm]);

  return [results.monthlyPayment, results.totalInterest, results.totalPayment];
};

const FinanceCalculator = () => {
  // State
  const [loanAmount, setLoanAmount] = useState(30000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(5);
  const [downPayment, setDownPayment] = useState(5000);
  const [tabValue, setTabValue] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [activeFinanceOption, setActiveFinanceOption] = useState(null);

  // Calculate loan payments
  const [monthlyPayment, totalInterest, totalPayment] = useFinanceCalculations(loanAmount - downPayment, interestRate, loanTerm);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle loan amount slider change
  const handleLoanAmountChange = (event, newValue) => {
    setLoanAmount(newValue);
  };

  // Handle down payment slider change
  const handleDownPaymentChange = (event, newValue) => {
    setDownPayment(newValue);
  };

  // Handle interest rate slider change
  const handleInterestRateChange = (event, newValue) => {
    setInterestRate(newValue);
  };

  // Handle loan term slider change
  const handleLoanTermChange = (event, newValue) => {
    setLoanTerm(newValue);
  };

  // Calculate button click
  const handleCalculate = () => {
    setIsCalculated(true);
  };

  // Sample finance options
  const financeOptions = [
    {
      name: "Standard Financing",
      interestRate: 4.5,
      term: 5,
      monthlyPayment: (loanAmount - downPayment) * 0.01897
    },
    {
      name: "Premium Financing",
      interestRate: 3.9,
      term: 6,
      monthlyPayment: (loanAmount - downPayment) * 0.01665
    },
    {
      name: "Special Offer",
      interestRate: 2.9,
      term: 4,
      monthlyPayment: (loanAmount - downPayment) * 0.02225
    },
    {
      name: "Lease Option",
      interestRate: 5.1,
      term: 3,
      monthlyPayment: (loanAmount - downPayment) * 0.03016
    }
  ];

  return (
    <motion.div 
      className="finance-calculator bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="finance calculator tabs"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              px: 3,
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#3b82f6',
              height: 3
            }
          }}
        >
          <Tab icon={<FaCalculator className="mr-2" />} label="Calculator" />
          <Tab icon={<FaChartPie className="mr-2" />} label="Payment Breakdown" />
          <Tab icon={<FaCheckCircle className="mr-2" />} label="Finance Options" />
        </Tabs>
      </Box>

      {/* Calculator Tab */}
      <AnimatePresence mode="wait">
        {tabValue === 0 && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calculator Inputs */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaDollarSign className="mr-2 text-blue-500" />
                  Loan Details
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Vehicle Price: ${loanAmount.toLocaleString()}</label>
                      <span className="text-blue-600 font-semibold">${loanAmount.toLocaleString()}</span>
                    </div>
                    <CalculatorSlider
                      value={loanAmount}
                      onChange={handleLoanAmountChange}
                      min={5000}
                      max={150000}
                      step={1000}
                      label=""
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Down Payment: ${downPayment.toLocaleString()}</label>
                      <span className="text-green-600 font-semibold">${downPayment.toLocaleString()}</span>
                    </div>
                    <CalculatorSlider
                      value={downPayment}
                      onChange={handleDownPaymentChange}
                      min={0}
                      max={loanAmount / 2}
                      step={500}
                      label=""
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Interest Rate: {interestRate}%</label>
                      <span className="text-indigo-600 font-semibold">{interestRate}%</span>
                    </div>
                    <CalculatorSlider
                      value={interestRate}
                      onChange={handleInterestRateChange}
                      min={0.5}
                      max={15}
                      step={0.1}
                      label=""
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Loan Term: {loanTerm} years</label>
                      <span className="text-purple-600 font-semibold">{loanTerm} years</span>
                    </div>
                    <CalculatorSlider
                      value={loanTerm}
                      onChange={handleLoanTermChange}
                      min={1}
                      max={10}
                      step={1}
                      label=""
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200 transition duration-300 flex items-center justify-center"
                    onClick={handleCalculate}
                  >
                    <FaCalculator className="mr-2" />
                    Calculate Payment
                  </motion.button>
                </div>
              </div>
              
              {/* Results Panel */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-inner">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Summary</h3>
                
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                  <h4 className="text-lg font-bold mb-2 text-gray-700">Monthly Payment</h4>
                  <div className="flex items-end">
                    <span className="text-4xl font-extrabold text-blue-600">${monthlyPayment.toFixed(2)}</span>
                    <span className="text-gray-500 ml-2 mb-1">/ month</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="text-sm font-bold mb-1 text-gray-600">Loan Amount</h4>
                    <p className="text-2xl font-bold text-indigo-600">${(loanAmount - downPayment).toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="text-sm font-bold mb-1 text-gray-600">Total Interest</h4>
                    <p className="text-2xl font-bold text-red-600">${totalInterest.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Principal:</span>
                    <span className="font-semibold">${(loanAmount - downPayment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-semibold">${totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Payment:</span>
                    <span>${totalPayment.toFixed(2)}</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition duration-300 flex items-center justify-center"
                  onClick={() => setTabValue(2)}
                >
                  <FaCar className="mr-2" />
                  View Financing Options
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Breakdown Tab */}
        {tabValue === 1 && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <PaymentBreakdown 
              loanAmount={loanAmount - downPayment}
              interestRate={interestRate}
              loanTerm={loanTerm}
              monthlyPayment={monthlyPayment}
              totalPayment={totalPayment}
              totalInterest={totalInterest}
            />
            
            {/* Add visualization of payment breakdown */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Payment Distribution</h3>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
                      style={{ width: `${((loanAmount - downPayment) / totalPayment) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-medium text-blue-600 w-24">
                    {((loanAmount - downPayment) / totalPayment * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full"
                      style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-medium text-red-600 w-24">
                    {(totalInterest / totalPayment * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex mt-4">
                  <div className="flex items-center mr-6">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Principal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Interest</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoanSummary 
                loanAmount={loanAmount - downPayment}
                interestRate={interestRate}
                loanTerm={loanTerm}
                totalPayment={totalPayment}
                totalInterest={totalInterest}
              />
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-100">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Loan Details</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between">
                    <span>Vehicle Price:</span>
                    <span className="font-semibold">${loanAmount.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Down Payment:</span>
                    <span className="font-semibold">${downPayment.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span className="font-semibold">${(loanAmount - downPayment).toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold">{interestRate}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Loan Term:</span>
                    <span className="font-semibold">{loanTerm} years</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 mt-2">
                    <span>Monthly Payment:</span>
                    <span className="font-bold text-blue-700">${monthlyPayment.toFixed(2)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finance Options Tab */}
        {tabValue === 2 && (
          <motion.div
            key="options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <h3 className="text-2xl font-bold mb-6">Financing Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financeOptions.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                    activeFinanceOption === index 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : 'border-transparent hover:border-blue-200'
                  }`}
                  onClick={() => setActiveFinanceOption(index)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold">{option.name}</h4>
                      {activeFinanceOption === index && (
                        <div className="bg-blue-100 p-1 rounded-full">
                          <FaCheckCircle className="text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{option.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Term:</span>
                        <span className="font-medium">{option.term} years</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="text-2xl font-bold text-blue-700">
                            ${option.monthlyPayment.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Total: ${(option.monthlyPayment * option.term * 12).toFixed(2)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Apply Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {activeFinanceOption !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md"
              >
                <h4 className="text-lg font-bold mb-4">Selected Financing Details</h4>
                <p className="mb-4">
                  You've selected our <strong>{financeOptions[activeFinanceOption].name}</strong> package with an interest rate of <strong>{financeOptions[activeFinanceOption].interestRate}%</strong> over <strong>{financeOptions[activeFinanceOption].term} years</strong>.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full md:w-auto py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition duration-300 flex items-center justify-center"
                >
                  <FaCheckCircle className="mr-2" />
                  Continue with This Option
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FinanceCalculator;