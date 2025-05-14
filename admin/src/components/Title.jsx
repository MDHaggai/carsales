// src/components/Title.jsx
import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <div className="text-center mb-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
        {text1} <span className="text-blue-600">{text2}</span>
      </h2>
      <div className="w-24 h-1 bg-blue-600 mx-auto mt-2"></div>
    </div>
  );
};

export default Title;
