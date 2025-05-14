import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import CountdownTimer from './CountdownTimer';

const LiveVehicle = ({ map, route, movementStatus, onPositionUpdate, duration }) => {
  const markerRef = useRef(null);
  const progressRef = useRef(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!route?.length) return;

    // Create or update marker
    if (!markerRef.current) {
      markerRef.current = L.marker(route[0], {
        icon: L.divIcon({
          className: 'vehicle-marker',
          html: `
            <div class="relative">
              <div class="text-3xl transform -rotate-90">🚛</div>
              <div class="absolute -bottom-2 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).addTo(map);
    }

    const animate = (timestamp) => {
      if (movementStatus !== 'moving') return;

      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      progressRef.current = Math.min(progressRef.current + (deltaTime * 0.1), 100);
      
      const routeIndex = Math.floor((route.length - 1) * (progressRef.current / 100));
      const currentPos = route[routeIndex];
      const nextPos = route[Math.min(routeIndex + 1, route.length - 1)];

      if (currentPos && markerRef.current) {
        // Calculate bearing for vehicle rotation
        const bearing = getBearing(currentPos, nextPos);
        markerRef.current.setLatLng(currentPos);
        markerRef.current._icon.style.transform += ` rotate(${bearing}deg)`;

        onPositionUpdate(currentPos, progressRef.current, duration * (1 - progressRef.current / 100));
      }

      if (progressRef.current < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (movementStatus === 'moving') {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [route, movementStatus, map]);

  return null;
};

const LiveTrackingMap = ({ 
  origin, 
  destination, 
  route, 
  movementStatus, 
  onPositionUpdate 
}) => {
  const mapRef = useRef(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (route?.length && mapRef.current) {
      // Draw route
      const routeLine = L.polyline(route, {
        color: '#4F46E5',
        weight: 3,
        opacity: 0.7
      }).addTo(mapRef.current);

      // Add markers for origin and destination
      const originMarker = L.marker(route[0], {
        icon: L.divIcon({
          className: 'origin-marker',
          html: '<div class="text-2xl">📍</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(mapRef.current);

      const destMarker = L.marker(route[route.length - 1], {
        icon: L.divIcon({
          className: 'destination-marker',
          html: '<div class="text-2xl">🏁</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(mapRef.current);

      // Fit bounds to show entire route
      mapRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

      return () => {
        routeLine.remove();
        originMarker.remove();
        destMarker.remove();
      };
    }
  }, [route]);

  return (
    <div className="relative h-[400px]">
      <MapContainer
        ref={mapRef}
        center={origin || [51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {route && (
          <LiveVehicle
            map={mapRef.current}
            route={route}
            movementStatus={movementStatus}
            onPositionUpdate={onPositionUpdate}
            duration={duration}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000]">
        <CountdownTimer 
          estimatedDuration={duration} 
          isMoving={movementStatus === 'moving'} 
        />
      </div>
    </div>
  );
};

// Helper function to calculate bearing between points
const getBearing = (start, end) => {
  const startLat = start.lat * Math.PI / 180;
  const startLng = start.lng * Math.PI / 180;
  const endLat = end.lat * Math.PI / 180;
  const endLng = end.lng * Math.PI / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

export default LiveTrackingMap;