import React from 'react';
import PropTypes from 'prop-types';

const LoanSummary = ({ loanAmount, interestRate, loanTerm, totalPayment, totalInterest }) => {
  return (
    <div className="loan-summary bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Loan Summary</h2>
      <div className="summary-details">
        <div className="detail-item mb-2">
          <span className="font-medium">Loan Amount:</span>
          <span className="text-gray-700">${loanAmount.toLocaleString()}</span>
        </div>
        <div className="detail-item mb-2">
          <span className="font-medium">Interest Rate:</span>
          <span className="text-gray-700">{interestRate}%</span>
        </div>
        <div className="detail-item mb-2">
          <span className="font-medium">Loan Term:</span>
          <span className="text-gray-700">{loanTerm} years</span>
        </div>
        <div className="detail-item mb-2">
          <span className="font-medium">Total Payment:</span>
          <span className="text-gray-700">${totalPayment.toLocaleString()}</span>
        </div>
        <div className="detail-item mb-2">
          <span className="font-medium">Total Interest:</span>
          <span className="text-gray-700">${totalInterest.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

LoanSummary.propTypes = {
  loanAmount: PropTypes.number.isRequired,
  interestRate: PropTypes.number.isRequired,
  loanTerm: PropTypes.number.isRequired,
  totalPayment: PropTypes.number.isRequired,
  totalInterest: PropTypes.number.isRequired,
};

export default LoanSummary;