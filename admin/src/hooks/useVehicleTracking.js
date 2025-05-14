import { useRef, useEffect, useState } from 'react';

export const useVehicleTracking = ({ route, movementStatus, totalDuration, onPositionUpdate }) => {
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const progressRef = useRef(0);
  const positionRef = useRef(route?.[0] || null);

  const updatePosition = (timestamp) => {
    if (!route?.length || movementStatus !== 'moving') return;

    const deltaTime = timestamp - lastUpdateRef.current;
    lastUpdateRef.current = timestamp;

    // Update progress (0.1% per second)
    progressRef.current += (deltaTime / 1000) * 0.1;

    if (progressRef.current >= 100) {
      progressRef.current = 100;
      return;
    }

    // Calculate new position along route
    const routeIndex = Math.floor((route.length - 1) * (progressRef.current / 100));
    const newPosition = route[routeIndex];
    positionRef.current = newPosition;

    const remainingTime = totalDuration * (1 - progressRef.current / 100);
    onPositionUpdate(newPosition, progressRef.current, remainingTime);

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    if (movementStatus === 'moving') {
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [movementStatus, route]);

  return {
    currentPosition: positionRef.current,
    progress: progressRef.current
  };
};