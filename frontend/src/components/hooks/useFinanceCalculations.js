import { useState, useEffect } from 'react';
import { calculateMonthlyPayment, calculateTotalInterest, calculateAmortizationSchedule } from '../utils/financialFormulas';

const useFinanceCalculations = (loanAmount, interestRate, loanTerm) => {
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      const payment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
      const totalInt = calculateTotalInterest(payment, loanTerm, loanAmount);
      const schedule = calculateAmortizationSchedule(loanAmount, interestRate, loanTerm);

      setMonthlyPayment(payment);
      setTotalInterest(totalInt);
      setAmortizationSchedule(schedule);
    }
  }, [loanAmount, interestRate, loanTerm]);

  return { monthlyPayment, totalInterest, amortizationSchedule };
};

export default useFinanceCalculations;