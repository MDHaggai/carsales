import React from 'react';
import PropTypes from 'prop-types';
import './Tooltip.css'; // Assuming you will create a CSS file for styling

const Tooltip = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-content">
        {text}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Tooltip;