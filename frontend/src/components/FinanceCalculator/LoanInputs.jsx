import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';


const LoanInputs = ({ onLoanDetailsChange }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'loanAmount') setLoanAmount(value);
    if (name === 'interestRate') setInterestRate(value);
    if (name === 'loanTerm') setLoanTerm(value);

    onLoanDetailsChange({
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseInt(loanTerm) || 0,
    });
  };

  const validateInput = (value) => {
    return !isNaN(value) && value >= 0;
  };

  return (
    <motion.div
      className="loan-inputs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Loan Inputs</h2>
      <div className="input-group">
        <label htmlFor="loanAmount">Loan Amount ($)</label>
        <input
          type="number"
          id="loanAmount"
          name="loanAmount"
          value={loanAmount}
          onChange={handleInputChange}
          required
        />
        {!validateInput(loanAmount) && <span className="error">Please enter a valid amount.</span>}
      </div>
      <div className="input-group">
        <label htmlFor="interestRate">Interest Rate (%)</label>
        <input
          type="number"
          id="interestRate"
          name="interestRate"
          value={interestRate}
          onChange={handleInputChange}
          required
        />
        {!validateInput(interestRate) && <span className="error">Please enter a valid rate.</span>}
      </div>
      <div className="input-group">
        <label htmlFor="loanTerm">Loan Term (years)</label>
        <input
          type="number"
          id="loanTerm"
          name="loanTerm"
          value={loanTerm}
          onChange={handleInputChange}
          required
        />
        {!validateInput(loanTerm) && <span className="error">Please enter a valid term.</span>}
      </div>
    </motion.div>
  );
};

LoanInputs.propTypes = {
  onLoanDetailsChange: PropTypes.func.isRequired,
};

export default LoanInputs;