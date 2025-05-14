import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaTruck, 
  FaCheck,
  FaUser,  
  FaShip, 
  FaChevronDown
} from 'react-icons/fa';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { backendUrl, currency } from '../App';

// Add this helper function at the top with other utility functions
const formatCountdown = (minutes) => {
  if (!minutes || minutes <= 0) return '0:00';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Define components in order of dependency
const LocationMarker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  return null;
};

// Update the RouteCalculator component
const RouteCalculator = ({ origin, destination, onRouteCalculated, updateShippingInfo }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!origin || !destination || !map) return;

    const calculateRoute = async () => {
      try {
        // Clear existing route
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
        }

        // Create routing control
        const routingControl = new L.Routing.Control({
          waypoints: [
            L.latLng(origin.lat, origin.lng),
            L.latLng(destination.lat, destination.lng)
          ],
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
          }),
          lineOptions: {
            styles: [{ color: '#4F46E5', opacity: 0.8, weight: 6 }],
            addWaypoints: false,
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          show: false,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: true,
          showAlternatives: false
        });

        routingControlRef.current = routingControl;

        // Handle route calculation
        routingControl.on('routesfound', async (e) => {
          const route = e.routes[0];
          if (route) {
            // Create route coordinates
            const coords = route.coordinates;
            
            // Draw polyline
            if (polylineRef.current) {
              map.removeLayer(polylineRef.current);
            }
            polylineRef.current = L.polyline(coords, {
              color: '#4F46E5',
              weight: 6,
              opacity: 0.8
            }).addTo(map);

            // Fit bounds to show entire route
            map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });

            // Save route info
            const routeInfo = {
              route: coords.map(coord => ({ lat: coord.lat, lng: coord.lng })),
              distance: route.summary.totalDistance / 1000,
              duration: route.summary.totalTime / 60,
              movementStatus: 'not_started'
            };

            await updateShippingInfo({
              ...routeInfo,
              orderId: origin.orderId,
              currentLocation: origin,
              progress: 0,
              timeTracking: {
                estimatedDuration: routeInfo.duration,
                remainingTime: routeInfo.duration
              }
            });

            onRouteCalculated(routeInfo);
          }
        });

        routingControl.addTo(map);

      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };

    calculateRoute();

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
    };
  }, [origin, destination, map, onRouteCalculated, updateShippingInfo]);

  return null;
};

const AddressSearch = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false
    }).on('markgeocode', (e) => {
      const { center, name } = e.geocode;
      onLocationSelect({
        lat: center.lat,
        lng: center.lng,
        address: name
      });
      map.flyTo(center, map.getZoom());
    });
    geocoder.addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, onLocationSelect]);

  return null;
};

const StableMarkerTracker = React.memo(({ position, icon, popup, markerRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon }).addTo(map);
      markerRef.current.bindPopup(popup);
    } else {
      markerRef.current.setLatLng(position);
      markerRef.current.getPopup().setContent(popup);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, position, icon, popup, markerRef]);

  return null;
});

const MovementTracker = React.memo(({ 
  origin, 
  destination, 
  route, 
  movementStatus, 
  totalDuration, 
  initialProgress = 0, 
  onPositionUpdate 
}) => {
  const markerRef = useRef(null);
  const progressRef = useRef(initialProgress);
  const lastUpdateRef = useRef(Date.now());
  const animationFrameRef = useRef(null);

  // Calculate current position based on progress
  const calculateCurrentPosition = useCallback((progress) => {
    if (!route?.length) return origin;
    const routeIndex = Math.floor((route.length - 1) * (progress / 100));
    return route[routeIndex] || origin;
  }, [route, origin]);

  // Update movement every frame when in transit
  const animate = useCallback(() => {
    if (movementStatus === 'on_transit') {
      const now = Date.now();
      const timeDiff = (now - lastUpdateRef.current) / 1000; // seconds
      const totalTime = totalDuration * 60; // convert minutes to seconds
      const progressIncrement = (timeDiff / totalTime) * 100;

      let newProgress = Math.min(progressRef.current + progressIncrement, 100);
      const currentPosition = calculateCurrentPosition(newProgress);
      
      // Calculate remaining time
      const remainingTime = totalDuration * (1 - newProgress / 100);

      progressRef.current = newProgress;
      lastUpdateRef.current = now;

      onPositionUpdate(currentPosition, newProgress, remainingTime);
      
      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
  }, [movementStatus, totalDuration, calculateCurrentPosition, onPositionUpdate]);

  // Start/stop animation based on movement status
  useEffect(() => {
    if (movementStatus === 'on_transit') {
      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [movementStatus, animate]);

  // ...rest of the component
});

const StableMapContainer = React.memo(({ children, ...props }) => {
  return <MapContainer {...props}>{children}</MapContainer>;
});

// Update the initial state setup in ShippingTracker
const ShippingTracker = ({ order, onLocationUpdate, token }) => {
  const defaultCoords = { lat: 4.0511, lng: 9.7679 };
  
  // Update state initialization to properly handle the shipping data structure
  const [origin, setOrigin] = useState(() => {
    if (order?.shipping?.origin) {
      return {
        lat: parseFloat(order.shipping.origin.lat),
        lng: parseFloat(order.shipping.origin.lng)
      };
    }
    return defaultCoords;
  });
  
  const [destination, setDestination] = useState(() => {
    if (order?.shipping?.destination) {
      return {
        lat: parseFloat(order.shipping.destination.lat),
        lng: parseFloat(order.shipping.destination.lng)
      };
    }
    return null;
  });

  const [routeInfo, setRouteInfo] = useState(() => {
    if (order?.shipping) {
      return {
        route: order.shipping.route || [],
        distance: parseFloat(order.shipping.distance) || 0,
        duration: parseFloat(order.shipping.duration) || 0
      };
    }
    return null;
  });

  // Add useEffect to update state when order changes
  useEffect(() => {
    if (order?.shipping) {
      // Update origin
      if (order.shipping.origin) {
        setOrigin({
          lat: parseFloat(order.shipping.origin.lat),
          lng: parseFloat(order.shipping.origin.lng)
        });
      }

      // Update destination
      if (order.shipping.destination) {
        setDestination({
          lat: parseFloat(order.shipping.destination.lat),
          lng: parseFloat(order.shipping.destination.lng)
        });
      }

      // Update route info
      if (order.shipping.route) {
        setRouteInfo({
          route: order.shipping.route,
          distance: parseFloat(order.shipping.distance) || 0,
          duration: parseFloat(order.shipping.duration) || 0
        });
      }

      // Update movement status
      setMovementStatus(order.shipping.movementStatus || 'stopped');

      // Update persisted data
      setPersistedData({
        progress: parseFloat(order.shipping.progress) || 0,
        currentLocation: order.shipping.currentLocation || order.shipping.origin,
        remainingTime: parseFloat(order.shipping.timeLeft) || 0
      });
    }
  }, [order]);

  const [showMap, setShowMap] = useState(true);
  const [selectingMode, setSelectingMode] = useState(null);

  // If “stopped” or “paused”, show “Continue Movement”; if “moving”, show “Pause Movement”
  const [movementStatus, setMovementStatus] = useState(
    order?.shipping?.movementStatus || 'stopped'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const [persistedData, setPersistedData] = useState({
    progress: order?.shipping?.progress || 0,
    currentLocation: order?.shipping?.currentLocation || defaultCoords,
    remainingTime: order?.shipping?.remainingTime || 0
  });

  // typed text + auto-suggestions
  const [originSearchTerm, setOriginSearchTerm] = useState('');
  const [originSearchResults, setOriginSearchResults] = useState([]);
  const [destinationSearchTerm, setDestinationSearchTerm] = useState('');
  const [destinationSearchResults, setDestinationSearchResults] = useState([]);

  const mapInstanceRef = useRef(null);

  // Movement button label: if “moving” => Pause, else => Continue
  let movementButtonLabel = 'Continue Movement';
  if (movementStatus === 'moving') {
    movementButtonLabel = 'Pause Movement';
  }

  // Add new states for movement control
  const [canStartMovement, setCanStartMovement] = useState(false);

  // Add these states in the ShippingTracker component
  const [timeLeft, setTimeLeft] = useState(
    order?.shipping?.estimatedDuration || 0
  );

  // ----------------------------------------------------------------
  const updateShippingInfo = async (additionalInfo = {}, shouldToast = false) => {
    if (!origin || !destination) {
      console.log('Missing coordinates:', { origin, destination }); // Debug log
      if (shouldToast) toast.error('Please select both origin and destination');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Ensure coordinates are properly formatted
      const payload = {
        orderId: order._id,
        origin: {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        },
        destination: {
          lat: parseFloat(destination.lat),
          lng: parseFloat(destination.lng)
        },
        ...(routeInfo && {
          route: routeInfo.route,
          distance: parseFloat(routeInfo.distance),
          duration: parseFloat(routeInfo.duration)
        }),
        ...persistedData,
        ...additionalInfo
      };

      console.log('Sending shipping update payload:', payload); // Debug log

      const response = await axios.post(
        `${backendUrl}/api/order/shipping`,
        payload,
        { headers: { token, 'Content-Type': 'application/json' } }
      );

      console.log('Shipping update response:', response.data); // Debug log

      if (response.data.success) {
        setRouteInfo(prev => ({
          ...prev,
          ...response.data.shipping
        }));
        onLocationUpdate();
      } else {
        console.error('Shipping update failed:', response.data);
      }
    } catch (error) {
      console.error('Shipping update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // ----------------------------------------------------------------
  const toggleMovement = async () => {
    // if currently moving => paused, else => moving
    const newStatus = movementStatus === 'moving' ? 'paused' : 'moving';
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/movement`,
        { orderId: order._id, movementStatus: newStatus },
        { headers: { token, 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        setMovementStatus(newStatus);
        if (newStatus === 'moving') {
          toast.success('Vehicle movement started or continued');
        } else {
          toast.success('Vehicle movement paused');
        }
      } else {
        toast.error(response.data.message || 'Failed to update movement status');
      }
    } catch (error) {
      console.error('Movement toggle error:', error);
      toast.error(error.response?.data?.message || 'Failed to update movement status');
    }
  };

  // movement tracker calls this every 5 min
  const handlePositionUpdate = async (position, progress, remainingTime) => {
    const updatedData = {
      progress,
      currentLocation: position,
      remainingTime,
      lastUpdated: new Date()
    };

    setPersistedData((prev) => ({
      ...prev,
      ...updatedData
    }));

    // Save to backend without showing toast
    await updateShippingInfo(updatedData, false);
  };

  // ----------------------------------------------------------------
  // Real-time auto-suggest for origin
  useEffect(() => {
    const fetchOriginSuggestions = async () => {
      if (originSearchTerm.trim().length < 3) {
        setOriginSearchResults([]);
        return;
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&q=${encodeURIComponent(
          originSearchTerm
        )}`;
        const res = await axios.get(url);
        if (Array.isArray(res.data)) {
          setOriginSearchResults(res.data);
        }
      } catch (err) {
        console.error('Error searching origin:', err);
      }
    };
    fetchOriginSuggestions();
  }, [originSearchTerm]);

  // Real-time auto-suggest for destination
  useEffect(() => {
    const fetchDestinationSuggestions = async () => {
      if (destinationSearchTerm.trim().length < 3) {
        setDestinationSearchResults([]);
        return;
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&q=${encodeURIComponent(
          destinationSearchTerm
        )}`;
        const res = await axios.get(url);
        if (Array.isArray(res.data)) {
          setDestinationSearchResults(res.data);
        }
      } catch (err) {
        console.error('Error searching destination:', err);
      }
    };
    fetchDestinationSuggestions();
  }, [destinationSearchTerm]);

  const handleSelectOriginResult = (result) => {
    setOriginSearchTerm(result.display_name);
    setOriginSearchResults([]);
    setOrigin({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    });
    toast.success(`Origin set: ${result.display_name}`);
  };

  // Update the handleSelectDestinationResult function
  const handleSelectDestinationResult = async (result) => {
    console.log('Selected destination:', result); // Debug log
    
    const newDestination = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
    };
    
    setDestinationSearchTerm(result.display_name);
    setDestinationSearchResults([]);
    setDestination(newDestination);
    
    // Save immediately when destination is selected
    await updateShippingInfo({
        destination: newDestination
    }, false);
  };

  // user selects from map or geocoder
  const handleAddressSearch = useCallback((location) => {
    if (selectingMode === 'origin') {
      setOrigin({ ...location });
      setOriginSearchTerm(location.address || '');
    } else if (selectingMode === 'destination') {
      setDestination({ ...location });
      setDestinationSearchTerm(location.address || '');
    }
    setSelectingMode(null);
  }, [selectingMode]);

  // Update the map click handler for destination
  const handleMapClick = (latlng) => {
    if (selectingMode === 'destination') {
      const newDestination = {
        lat: latlng.lat,
        lng: latlng.lng
      };
      setDestination(newDestination);
      setSelectingMode(null);
      
      // Save immediately when destination is selected from map
      updateShippingInfo({
        destination: newDestination
      }, false);
    }
  };

  // ----------------------------------------------------------------
  const renderRouteInfo = () => {
    if (!routeInfo || !routeInfo.distance) return null;

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow">
        <h4 className="font-semibold mb-2">Route Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Distance</p>
            <p className="font-medium">{routeInfo.distance.toFixed(2)} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Time</p>
            <p className="font-medium">{formatTime(routeInfo.duration)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="font-medium text-blue-600">
              {formatTime(persistedData.remainingTime || routeInfo.duration)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${persistedData.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add helper function to format time
  const formatTime = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // ----------------------------------------------------------------
  // on mount if there's shipping info in the order
  useEffect(() => {
    if (order.shipping?.origin?.coordinates && order.shipping?.destination?.coordinates) {
      if (!origin) setOrigin(order.shipping.origin.coordinates);
      if (!destination) setDestination(order.shipping.destination.coordinates);
      if (order.shipping.route && !routeInfo) {
        setRouteInfo({
          route: order.shipping.route,
          distance: order.shipping.distance,
          duration: order.shipping.duration
        });
      }
    }
  }, [order, origin, destination, routeInfo]);

  // Add this effect in the ShippingTracker component
  useEffect(() => {
    let timer;
    
    if (movementStatus === 'moving' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(current => {
          const newTime = current - (1/60); // Decrease by 1 second
          if (newTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
  
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [movementStatus, routeInfo?.duration]);

  // map section
  const mapSection = useMemo(() => {
    return (
      <div className="h-[400px] rounded-lg overflow-hidden mb-4">
        <StableMapContainer
          center={origin || defaultCoords}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => { mapInstanceRef.current = map; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          {selectingMode && (
            <LocationMarker
              onLocationSelect={(latlng) => {
                if (selectingMode === 'origin') {
                  setOrigin(latlng);
                  setOriginSearchTerm('');
                } else if (selectingMode === 'destination') {
                  setDestination(latlng);
                  setDestinationSearchTerm('');
                }
                setSelectingMode(null);
              }}
            />
          )}

          {origin && (
            <Marker
              position={[origin.lat, origin.lng]}
              icon={L.divIcon({
                className: 'origin-marker',
                html: `<div class="text-2xl">📍</div>`,
                iconSize: [30, 30]
              })}
            >
              <Popup>Origin</Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={L.divIcon({
                className: 'destination-marker',
                html: `<div class="text-2xl">🏁</div>`,
                iconSize: [30, 30]
              })}
            >
              <Popup>Destination</Popup>
            </Marker>
          )}

          {origin && destination && routeInfo && (
            <MovementTracker
              key={`tracker-${movementStatus}`}
              origin={origin}
              destination={destination}
              route={routeInfo.route}
              onPositionUpdate={handlePositionUpdate}
              movementStatus={movementStatus}
              totalDuration={routeInfo.duration}
              initialProgress={persistedData.progress}
              timeLeft={timeLeft}
            />
          )}

          <AddressSearch onLocationSelect={handleAddressSearch} />

          {origin && destination && (
            <RouteCalculator
              origin={origin}
              destination={destination}
              updateShippingInfo={updateShippingInfo} // Pass the function
              onRouteCalculated={(newRouteInfo) => {
                setRouteInfo(newRouteInfo);
              }}
            />
          )}
        </StableMapContainer>
      </div>
    );
  }, [
    origin,
    destination,
    routeInfo,
    movementStatus,
    selectingMode,
    persistedData.progress,
    handlePositionUpdate,
    updateShippingInfo // Add to dependencies
  ]);

  // auto-saves shipping info every 5 minutes if moving & progress < 100
  useEffect(() => {
    const autoUpdateInterval = setInterval(() => {
      if (movementStatus === 'moving' && persistedData.progress < 100) {
        updateShippingInfo({}, false);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(autoUpdateInterval);
  }, [movementStatus, persistedData.progress]);

  // Update the useEffect for initial data loading
  useEffect(() => {
    if (order?.shipping) {
      // Set origin
      if (order.shipping.origin?.lat) {
        setOrigin({
          lat: order.shipping.origin.lat,
          lng: order.shipping.origin.lng
        });
      }
      
      // Set destination
      if (order.shipping.destination?.lat) {
        setDestination({
          lat: order.shipping.destination.lat,
          lng: order.shipping.destination.lng
        });
      }
    }
  }, [order]);

  // Update the useEffect that watches route changes
  useEffect(() => {
    if (origin && destination && routeInfo) {
      setCanStartMovement(true);
    } else {
      setCanStartMovement(false);
    }
  }, [origin, destination, routeInfo]);

  // Add clearShippingInfo function
  const clearShippingInfo = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/shipping/clear`,
        { orderId: order._id },
        { headers: { token } }
      );

      if (response.data.success) {
        setOrigin(null);
        setDestination(null);
        setRouteInfo(null);
        setMovementStatus('paused');
        setPersistedData({
          progress: 0,
          currentLocation: null,
          remainingTime: 0
        });
        toast.success('Shipping info cleared');
        onLocationUpdate();
      }
    } catch (error) {
      console.error('Error clearing shipping info:', error);
      toast.error('Failed to clear shipping info');
    }
  };

  // Update the renderMovementControls function
  const renderMovementControls = () => {
    if (!canStartMovement) return null;

    return (
      <div className="flex gap-4 justify-center">
        {movementStatus === 'paused' ? (
          <button
            onClick={async () => {
              try {
                await updateShippingInfo({
                  movementStatus: 'on_transit',
                  startTime: new Date(),
                  estimatedDuration: routeInfo.duration,
                  remainingTime: routeInfo.duration
                });
                setMovementStatus('on_transit');
                toast.success('Shipment started/resumed');
              } catch (error) {
                toast.error('Failed to start movement');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={isUpdating}
          >
            {order.shipping?.startTime ? 'Resume Movement' : 'Start Movement'}
          </button>
        ) : (
          <button
            onClick={async () => {
              try {
                await updateShippingInfo({
                  movementStatus: 'paused',
                  lastPausedAt: new Date()
                });
                setMovementStatus('paused');
                toast.success('Shipment paused');
              } catch (error) {
                toast.error('Failed to pause movement');
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            disabled={isUpdating}
          >
            Pause Movement
          </button>
        )}

        <button
          onClick={clearShippingInfo}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          disabled={isUpdating}
        >
          Clear Shipping Info
        </button>
      </div>
    );
  };

  // Add movement control button rendering
  const renderMovementControlsOld = () => {
    if (!canStartMovement) return null;

    switch (movementStatus) {
      case 'stopped':
        return (
          <button
            onClick={async () => {
              try {
                // Save initial movement data
                await updateShippingInfo({
                  movementStatus: 'moving',
                  startTime: new Date(),
                  estimatedDuration: routeInfo.duration,
                  totalDistance: routeInfo.distance,
                  currentLocation: origin,
                  progress: 0,
                  timeLeft: routeInfo.duration
                });
                setMovementStatus('moving');
              } catch (error) {
                toast.error('Failed to start movement');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={isUpdating}
          >
            Start Movement
          </button>
        );
      case 'moving':
        return (
          <button
            onClick={async () => {
              try {
                await updateShippingInfo({ 
                  movementStatus: 'paused',
                  lastPausedTime: new Date()
                });
                setMovementStatus('paused');
              } catch (error) {
                toast.error('Failed to pause movement');
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            disabled={isUpdating}
          >
            Pause Movement
          </button>
        );
      case 'paused':
        return (
          <button
            onClick={async () => {
              try {
                await updateShippingInfo({ movementStatus: 'moving' });
                setMovementStatus('moving');
              } catch (error) {
                toast.error('Failed to resume movement');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isUpdating}
          >
            Resume Movement
          </button>
        );
      default:
        return null;
    }
  };

  // Add status polling
  useEffect(() => {
    let statusPoll;
    
    const fetchShippingStatus = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/order/shipping/status`,
          { orderId: order._id },
          { headers: { token } }
        );

        if (response.data.success) {
          const { shipping } = response.data;
          setPersistedData(prev => ({
            ...prev,
            progress: shipping.progress || 0,
            remainingTime: shipping.timeTracking.remainingTime,
            currentLocation: shipping.currentLocation
          }));
          setMovementStatus(shipping.movementStatus);

          if (mapInstanceRef.current && shipping.currentLocation) {
            const { lat, lng } = shipping.currentLocation;
            mapInstanceRef.current.setView([lat, lng]);
          }
        }
      } catch (error) {
        console.error('Error fetching shipping status:', error);
      }
    };

    // Poll more frequently when in transit
    if (order?.shipping?.movementStatus === 'on_transit') {
      statusPoll = setInterval(fetchShippingStatus, 5000); // Poll every 5 seconds
      fetchShippingStatus(); // Initial fetch
    } else {
      statusPoll = setInterval(fetchShippingStatus, 30000); // Poll every 30 seconds
      fetchShippingStatus(); // Initial fetch
    }

    return () => {
      if (statusPoll) clearInterval(statusPoll);
    };
  }, [order?._id, order?.shipping?.movementStatus, token]);

  // Add handleMovementStatusChange function
  const handleMovementStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      const response = await axios.post(
        `${backendUrl}/api/order/movement`,
        {
          orderId: order._id,
          movementStatus: newStatus
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setMovementStatus(newStatus);
        // Fetch updated shipping status immediately after status change
        const statusResponse = await axios.post(
          `${backendUrl}/api/order/shipping/status`,
          { orderId: order._id },
          { headers: { token } }
        );

        if (statusResponse.data.success) {
          const { shipping } = statusResponse.data;
          setPersistedData(prev => ({
            ...prev,
            remainingTime: shipping.timeTracking.remainingTime,
            currentLocation: shipping.currentLocation
          }));
        }
        toast.success(`Movement ${newStatus.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error('Error updating movement status:', error);
      toast.error('Failed to update movement status');
    } finally {
      setIsUpdating(false);
    }
  };

  // ----------------------------------------------------------------
  return (
    <motion.div
      className="mt-6 bg-white rounded-lg shadow-md overflow-hidden"
      initial={false}
      animate={{ height: showMap ? 'auto' : 64 }}
    >
      <div className="p-4 border-b">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center justify-between w-full"
        >
          <span className="text-lg font-semibold flex items-center gap-2">
            <FaShip className="text-blue-500" />
            Shipping Tracker
          </span>
          <FaChevronDown className={`transition-transform ${showMap ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`transition-all duration-300 ${showMap ? 'block' : 'hidden'}`}>
        <div className="p-4">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ORIGIN */}
            <div className="space-y-2 relative">
              <button
                onClick={() => {
                  setSelectingMode((prev) => (prev === 'origin' ? null : 'origin'));
                  toast.info('Click on the map to select origin point');
                }}
                className={`w-full p-2 rounded ${
                  selectingMode === 'origin' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {origin ? 'Change Origin by Map Click' : 'Select Origin by Map Click'}
              </button>
              {origin && typeof origin.lat === 'number' && typeof origin.lng === 'number' && (
                <p className="text-sm text-gray-600">
                  Origin: {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
                </p>
              )}

              {/* typed search for origin */}
              <input
                type="text"
                placeholder="Type origin address..."
                className="border p-2 w-full rounded"
                value={originSearchTerm}
                onChange={(e) => setOriginSearchTerm(e.target.value)}
              />
              {originSearchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-auto">
                  {originSearchResults.map((r) => (
                    <li
                      key={r.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectOriginResult(r)}
                    >
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DESTINATION */}
            <div className="space-y-2 relative">
              <button
                onClick={() => {
                  setSelectingMode((prev) => (prev === 'destination' ? null : 'destination'));
                  toast.info('Click on the map to select destination point');
                }}
                className={`w-full p-2 rounded ${
                  selectingMode === 'destination' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {destination
                  ? 'Change Destination by Map Click'
                  : 'Select Destination by Map Click'}
              </button>
              {destination && typeof destination.lat === 'number' && typeof destination.lng === 'number' && (
                <p className="text-sm text-gray-600">
                  Destination: {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                </p>
              )}

              {/* typed search for destination */}
              <input
                type="text"
                placeholder="Type destination address..."
                className="border p-2 w-full rounded"
                value={destinationSearchTerm}
                onChange={(e) => setDestinationSearchTerm(e.target.value)}
              />
              {destinationSearchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-auto">
                  {destinationSearchResults.map((r) => (
                    <li
                      key={r.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectDestinationResult(r)}
                    >
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* The map */}
          {mapSection}

          {/* Movement Controls */}
          <div className="mt-4 flex justify-center">
            {renderMovementControls()}
          </div>

          {/* Route info */}
          {renderRouteInfo()}

          {/* Save shipping info */}
          <div className="flex justify-end">
            <button
              onClick={() => updateShippingInfo()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Save Shipping Info'}
            </button>
          </div>

          {/* Movement controls */}
          {renderMovementControlsOld()}
        </div>
      </div>
    </motion.div>
  );
};

const ShippingTimer = ({ orderId, movementStatus, token }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const fetchShippingStatus = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/shipping/status`,
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        const { remainingTime } = response.data.shipping.timeTracking;
        setTimeLeft(remainingTime);
      }
    } catch (error) {
      console.error('Error fetching shipping status:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchShippingStatus();

    // Set up polling interval
    if (movementStatus === 'on_transit') {
      timerRef.current = setInterval(fetchShippingStatus, 30000); // Poll every 30 seconds
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [orderId, movementStatus]);

  if (!timeLeft && timeLeft !== 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg mt-4">
      <h3 className="font-semibold mb-2">Delivery Time Remaining</h3>
      <div className="text-2xl font-bold text-blue-600">
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

// Add this helper function before the OrderDetails component
const isSameOrder = (oldOrder, newOrder) => {
  if (!oldOrder || !newOrder) return false;
  
  // Compare basic properties
  if (oldOrder._id !== newOrder._id) return false;
  if (oldOrder.status !== newOrder.status) return false;
  
  // Compare shipping data if exists
  if (oldOrder.shipping || newOrder.shipping) {
    const oldShipping = oldOrder.shipping || {};
    const newShipping = newOrder.shipping || {};
    
    if (oldShipping.progress !== newShipping.progress) return false;
    if (oldShipping.movementStatus !== newShipping.movementStatus) return false;
    if (oldShipping.currentLocation?.lat !== newShipping.currentLocation?.lat) return false;
    if (oldShipping.currentLocation?.lng !== newShipping.currentLocation?.lng) return false;
  }
  
  return true;
};

// Then your existing OrderDetails component
const OrderDetails = ({ token }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only allow fetch every 5min unless forced
  const lastFetchTimeRef = useRef(0);
  const MIN_FETCH_INTERVAL = 5 * 60 * 1000; // 5 min in ms

  const fetchOrder = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/details`,
        { orderId },
        { headers: { token, 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        const newOrder = response.data.order;
        
        // Ensure shipping data is properly structured
        if (newOrder.shipping) {
          newOrder.shipping = {
            ...newOrder.shipping,
            origin: newOrder.shipping.origin || null,
            destination: newOrder.shipping.destination || null,
            route: newOrder.shipping.route || [],
            currentLocation: newOrder.shipping.currentLocation || null,
          };
        }

        if (!isSameOrder(order, newOrder)) {
          console.log('Updating order with new data:', newOrder);
          setOrder(newOrder);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, token, order]);

  useEffect(() => {
    if (token && orderId) {
      fetchOrder(true);
    }
  }, [orderId, token, fetchOrder]);

  const updateStatus = async (newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        if (order && order.status !== newStatus) {
          setOrder((prev) => ({ ...prev, status: newStatus }));
        }
        toast.success('Order status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  // ----------------------------------------------------------
  // Status Display
  const statusSteps = [
    'Pending Confirmation',
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for delivery',
    'Delivered'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Confirmation':
        return 'text-orange-500 bg-orange-100';
      case 'Order Placed':
        return 'text-blue-500 bg-blue-100';
      case 'Processing':
        return 'text-purple-500 bg-purple-100';
      case 'Shipped':
        return 'text-indigo-500 bg-indigo-100';
      case 'Out for delivery':
        return 'text-yellow-500 bg-yellow-100';
      case 'Delivered':
        return 'text-green-500 bg-green-100';
      case 'Cancelled':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const currentStep = statusSteps.indexOf(order.status);

  const renderTimeline = () => {
    return (
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-0 top-[50%] w-full h-1 bg-gray-200 -translate-y-1/2" />
          <div
            className="absolute left-0 top-[50%] h-1 bg-blue-500 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  index <= currentStep ? getStatusColor(step) : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStep
                      ? getStatusColor(step)
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {index < currentStep ? <FaCheck /> : index === currentStep ? <FaTruck /> : ''}
                </div>
                <span className="text-xs mt-2 whitespace-nowrap">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
      >
        <FaArrowLeft />
        <span>Back to Orders</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Order Details</h2>
            {renderTimeline()}

            {/* Items */}
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.productImage || assets.defaultProduct}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-green-600 font-bold">
                      {currency}{item.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Customer Details & Actions */}
          <div className="lg:border-l lg:pl-8">
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  {order.address.email}
                </p>
                <p className="flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  {order.address.phone}
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  {order.address.street}, {order.address.city}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {currency}{order.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {currency}{order.amount}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <select
                onChange={(e) => updateStatus(e.target.value)}
                value={order.status}
                className="w-full p-3 border rounded-lg"
              >
                {statusSteps.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={() => { /* Add print functionality */ }}
                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Only show the ShippingTracker if status is Shipped */}
      {order.status === 'Shipped' && (
        <ShippingTracker
          order={order}
          onLocationUpdate={fetchOrder}
          token={token}
        />
      )}

      {movementStatus === 'on_transit' && (
        <ShippingTimer 
          orderId={order._id}
          movementStatus={movementStatus}
          token={token}
        />
      )}
    </motion.div>
  );
};

// Export at the end of file, outside of any component
export default OrderDetails;

