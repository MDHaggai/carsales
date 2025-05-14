import React from 'react';
import { Slider } from '@mui/material';
import PropTypes from 'prop-types';

const CalculatorSlider = ({ value, onChange, min, max, step, label }) => {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-lg font-semibold mb-2">{label}</label>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        className="slider"
        sx={{
          color: '#3f51b5',
          height: 8,
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            '&:hover': {
              boxShadow: 'inherit',
            },
          },
          '& .MuiSlider-track': {
            height: 8,
            borderRadius: 4,
          },
          '& .MuiSlider-rail': {
            height: 8,
            borderRadius: 4,
          },
        }}
      />
      <div className="text-center mt-2">
        <span className="text-lg font-medium">{value}</span>
      </div>
    </div>
  );
};

CalculatorSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default CalculatorSlider;