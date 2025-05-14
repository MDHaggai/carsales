import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PaymentBreakdown = ({ loanAmount, interestRate, loanTerm, monthlyPayment, totalPayment, totalInterest }) => {
  const principal = loanAmount;
  const interest = totalInterest;

  return (
    <motion.div 
      className="payment-breakdown"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Payment Breakdown</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Loan Amount:</span>
          <span>${principal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Interest Rate:</span>
          <span>{interestRate}%</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Loan Term:</span>
          <span>{loanTerm} years</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Monthly Payment:</span>
          <span>${monthlyPayment.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Total Payment:</span>
          <span>${totalPayment.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Total Interest:</span>
          <span>${interest.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
};

PaymentBreakdown.propTypes = {
  loanAmount: PropTypes.number.isRequired,
  interestRate: PropTypes.number.isRequired,
  loanTerm: PropTypes.number.isRequired,
  monthlyPayment: PropTypes.number.isRequired,
  totalPayment: PropTypes.number.isRequired,
  totalInterest: PropTypes.number.isRequired,
};

export default PaymentBreakdown;