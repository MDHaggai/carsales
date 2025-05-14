import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ estimatedDuration, isMoving }) => {
  const [timeLeft, setTimeLeft] = useState(estimatedDuration * 60); // Convert minutes to seconds

  useEffect(() => {
    let timer;
    if (isMoving && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isMoving, timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg">
      <p className="text-sm font-semibold text-gray-600">Estimated Time Remaining</p>
      <p className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</p>
    </div>
  );
};

export default CountdownTimer;