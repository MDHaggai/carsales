import React from 'react';
import './Button.css'; // Assuming you have a CSS file for styling

const Button = ({ onClick, children, variant = 'primary', size = 'medium', disabled = false }) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;