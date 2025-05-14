import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const StableMarker = React.memo(({ position, icon, popupContent }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon }).addTo(map);
      popupRef.current = L.popup().setContent(popupContent);
      markerRef.current.bindPopup(popupRef.current);
    } else {
      markerRef.current.setLatLng(position);
      popupRef.current.setContent(popupContent);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [position, popupContent, map, icon]);

  return null;
});

export default StableMarker;