import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import StableMarker from './StableMarker';

const MovementTracker = React.memo(({ 
  origin, 
  route, 
  movementStatus, 
  totalDuration, 
  onPositionUpdate,
  initialProgress = 0
}) => {
  const progressRef = useRef(initialProgress);
  const positionRef = useRef(origin);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const updatePosition = (timestamp) => {
    if (!route?.length || movementStatus !== 'moving') return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    progressRef.current = Math.min(progressRef.current + (deltaTime * 0.01), 100);
    const routeIndex = Math.floor((route.length - 1) * (progressRef.current / 100));
    const newPosition = route[routeIndex];
    
    if (newPosition) {
      positionRef.current = newPosition;
      const remainingTime = totalDuration * (1 - progressRef.current / 100);
      onPositionUpdate(newPosition, progressRef.current, remainingTime);
    }

    if (progressRef.current < 100) {
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }
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

  const position = positionRef.current || origin;
  const progress = progressRef.current || 0;

  if (!position) return null;

  const popupContent = `
    <div class="text-center">
      <p class="font-semibold">Vehicle Location</p>
      <p class="text-sm text-gray-600">Progress: ${progress.toFixed(1)}%</p>
      <p class="text-sm text-blue-600">
        ETA: ${Math.round(totalDuration * (1 - progress / 100))} mins
      </p>
    </div>
  `;

  return (
    <StableMarker
      position={[position.lat, position.lng]}
      icon={L.divIcon({
        className: 'custom-truck-icon',
        html: `<div class="animate-pulse">🚚</div>`,
        iconSize: [25, 25]
      })}
      popupContent={popupContent}
    />
  );
});

export default MovementTracker;