import React from 'react';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const ComparisonChart = ({ loanOptions }) => {
  const data = {
    labels: loanOptions.map(option => option.name),
    datasets: [
      {
        label: 'Monthly Payment',
        data: loanOptions.map(option => option.monthlyPayment),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Interest Paid',
        data: loanOptions.map(option => option.totalInterest),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };

  return (
    <div className="comparison-chart">
      <h2>Loan Comparison Chart</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

ComparisonChart.propTypes = {
  loanOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      monthlyPayment: PropTypes.number.isRequired,
      totalInterest: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ComparisonChart;