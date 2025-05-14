import React from 'react';
import { motion } from 'framer-motion';

const FinanceOptions = ({ options, onSelectOption }) => {
  return (
    <div className="finance-options-container">
      <h2 className="text-2xl font-bold mb-4">Choose Your Financing Option</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.div
            key={index}
            className="option-card p-4 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            onClick={() => onSelectOption(option)}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-semibold">{option.name}</h3>
            <p className="text-gray-600">Interest Rate: {option.interestRate}%</p>
            <p className="text-gray-600">Loan Term: {option.term} years</p>
            <p className="text-lg font-bold">Monthly Payment: ${option.monthlyPayment}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FinanceOptions;