import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const LiveMarker = React.memo(({ initialPosition, icon }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    // Create marker only once
    markerRef.current = L.marker(initialPosition, { icon }).addTo(map);
    popupRef.current = L.popup().setContent('Loading...');
    markerRef.current.bindPopup(popupRef.current);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []); // Empty dependency array - create only once

  // Expose update methods
  React.useImperativeHandle(ref, () => ({
    updatePosition: (newPos) => {
      if (markerRef.current) {
        markerRef.current.setLatLng(newPos);
      }
    },
    updatePopup: (content) => {
      if (popupRef.current) {
        popupRef.current.setContent(content);
      }
    }
  }));

  return null;
});

export default LiveMarker;