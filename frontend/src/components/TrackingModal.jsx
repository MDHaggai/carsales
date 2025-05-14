import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTruck, FaMapMarkerAlt, FaClock, FaRoute } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App'; // Make sure you have this config file

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom van/truck icons
const originTruckIcon = L.divIcon({
  className: 'custom-origin-icon',
  html: `<div style="font-size: 24px;">🚛</div>`, // Truck emoji for origin
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const movingVanIcon = L.divIcon({
  className: 'custom-van-icon',
  html: `<div style="font-size: 24px;">🚚</div>`, // Van emoji for current location
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Update the icon definitions at the top of the file
const originIcon = L.divIcon({
  className: 'custom-origin-icon',
  html: `<div style="font-size: 24px;">📍</div>`, // Origin pin
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const destinationIcon = L.divIcon({
  className: 'custom-destination-icon',
  html: `<div style="font-size: 24px;">🎯</div>`, // Destination target
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const vehicleIcon = L.divIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="font-size: 24px;">🚚</div>`, // Delivery truck
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Add these helper functions at the top of the file after the icon definitions
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const calculateProgress = (currentLocation, origin, destination) => {
  if (!currentLocation || !origin || !destination) return 0;
  
  const totalDistance = calculateDistance(origin, destination);
  const coveredDistance = calculateDistance(origin, currentLocation);
  
  // Check if we've reached the destination (within 50 meters)
  if (calculateDistance(currentLocation, destination) < 0.05) {
    return 100;
  }
  
  return Math.min(100, (coveredDistance / totalDistance) * 100);
};

const RouteCalculator = ({ origin, destination, onRouteCalculated }) => {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      // Remove existing routing control
      if (map.routingControl) {
        map.removeControl(map.routingControl);
      }

      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(origin.lat, origin.lng),
          L.latLng(destination.lat, destination.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        lineOptions: {
          styles: [{ color: '#4F46E5', opacity: 0.8, weight: 6 }]
        },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false
      }).addTo(map);

      routingControl.on('routesfound', (e) => {
        const route = e.routes[0];
        if (route) {
          const coords = route.coordinates.map(coord => ({
            lat: coord.lat,
            lng: coord.lng
          }));

          onRouteCalculated({
            route: coords,
            distance: route.summary.totalDistance / 1000, // km
            duration: route.summary.totalTime / 60 // minutes
          });

          // Fit map to show entire route
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      });

      return () => {
        if (map.routingControl) {
          map.removeControl(map.routingControl);
        }
      };
    }
  }, [origin, destination, map, onRouteCalculated]);

  return null;
};

// Update TrackingModal to properly display shipping info
const TrackingModal = ({ isOpen, onClose, orderData, tracking, isLoading, token }) => {
  // Move all useState declarations to the top
  const [currentTracking, setCurrentTracking] = useState(tracking);
  const [initialCenter] = useState([4.0511, 9.7679]);
  const defaultCenter = [0, 0];

  // Helper functions
  const getValidCoordinates = (location) => {
    if (!location) return null;
    const { lat, lng } = location;
    return (typeof lat === 'number' && typeof lng === 'number') ? [lat, lng] : null;
  };

  const getStatusText = () => {
    switch (currentTracking?.movementStatus) {
      case 'on_transit':
        return 'In Transit';
      case 'paused':
        return 'On Hold';
      case 'not_started':
        return 'Waiting to Start';
      default:
        return 'Status Unknown';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 mins';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
  };

  // Calculate map center from tracking data
  const mapCenter = getValidCoordinates(currentTracking?.currentLocation) || 
                   getValidCoordinates(currentTracking?.origin?.coordinates) || 
                   initialCenter || 
                   defaultCenter;

  useEffect(() => {
    let pollInterval;

    const fetchTracking = async () => {
      try {
        if (!orderData?.orderId) return;

        const response = await axios.post(
          `${backendUrl}/api/order/track`,
          { orderId: orderData.orderId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          const tracking = response.data.tracking;
          
          // Calculate actual progress based on location
          if (tracking.currentLocation && tracking.origin && tracking.destination) {
            tracking.progress = calculateProgress(
              tracking.currentLocation,
              tracking.origin.coordinates,
              tracking.destination.coordinates
            );

            // Update movement status if reached destination
            if (tracking.progress === 100) {
              tracking.movementStatus = 'delivered';
            }
          }

          console.log('Setting tracking data:', tracking);
          setCurrentTracking(tracking);
        }
      } catch (error) {
        console.error('Error fetching tracking update:', error);
      }
    };

    if (isOpen && orderData?.orderId) {
      fetchTracking();
      const pollTime = currentTracking?.movementStatus === 'on_transit' ? 5000 : 30000;
      pollInterval = setInterval(fetchTracking, pollTime);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, orderData?.orderId, token]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 mt-24" // Changed items-center to items-start and mt-16 to mt-24
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaTruck className="text-blue-500" />
                Track Order
              </h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Powered by</span>
                <img
                  src={assets.fedex}
                  alt="FedEx"
                  className="h-6 object-contain"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group"
                aria-label="Close tracking modal"
              >
                <FaTimes 
                  className="text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-all duration-200" 
                  size={20}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : !currentTracking ? (
              <div className="text-center py-8 text-gray-500">
                Tracking information not available yet
              </div>
            ) : (
              <>
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaRoute className="text-blue-500" />
                      <span className="text-sm text-blue-600">Estimated Distance</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {(currentTracking?.distance || 0).toFixed(1)} km
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-green-500" />
                      <span className="text-sm text-green-600">Estimated Time</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatDuration(currentTracking?.estimatedDuration)}
                    </p>
                  </div>
                  <div className={`${
                    currentTracking?.movementStatus === 'on_transit' ? 'bg-blue-50' : 
                    currentTracking?.movementStatus === 'paused' ? 'bg-yellow-50' : 
                    currentTracking?.movementStatus === 'delivered' ? 'bg-green-50' :
                    'bg-gray-50'
                  } p-3 rounded-lg`}>
                    <div className="flex items-center gap-2">
                      <FaTruck className={`${
                        currentTracking?.movementStatus === 'on_transit' ? 'text-blue-500' : 
                        currentTracking?.movementStatus === 'paused' ? 'text-yellow-500' : 
                        currentTracking?.movementStatus === 'delivered' ? 'text-green-500' :
                        'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        currentTracking?.movementStatus === 'on_transit' ? 'text-blue-600' : 
                        currentTracking?.movementStatus === 'paused' ? 'text-yellow-600' : 
                        currentTracking?.movementStatus === 'delivered' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {getStatusText()}
                      </span>
                    </div>
                    <p className="text-lg font-semibold">
                      {currentTracking?.progress === 100 ? '100' : (currentTracking?.progress || 0).toFixed(1)}% Complete
                    </p>
                  </div>
                </div>

                {/* Map Section */}
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap'
                    />

                    {currentTracking?.origin?.coordinates && currentTracking?.destination?.coordinates && (
                      <RouteCalculator
                        origin={currentTracking.origin.coordinates}
                        destination={currentTracking.destination.coordinates}
                        onRouteCalculated={(routeInfo) => {
                          console.log('Route calculated:', routeInfo);
                        }}
                      />
                    )}

                    {/* Route Line */}
                    {currentTracking?.route && (
                      <Polyline
                        positions={currentTracking.route}
                        pathOptions={{ color: '#4F46E5', weight: 6, opacity: 0.8 }}
                      />
                    )}

                    {/* Origin Marker */}
                    {currentTracking?.origin?.coordinates && (
                      <Marker
                        position={[
                          currentTracking.origin.coordinates.lat,
                          currentTracking.origin.coordinates.lng
                        ]}
                        icon={originIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">Starting Point</p>
                            <p className="text-sm text-gray-600">{currentTracking.origin.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Destination Marker */}
                    {currentTracking?.destination?.coordinates && (
                      <Marker
                        position={[
                          currentTracking.destination.coordinates.lat,
                          currentTracking.destination.coordinates.lng
                        ]}
                        icon={destinationIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">Destination</p>
                            <p className="text-sm text-gray-600">{currentTracking.destination.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Current Location Marker */}
                    {currentTracking?.currentLocation && (
                      <Marker
                        position={[currentTracking.currentLocation.lat, currentTracking.currentLocation.lng]}
                        icon={vehicleIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">Current Location</p>
                            <p className="text-sm">{currentTracking.progress?.toFixed(1)}% Complete</p>
                            {currentTracking.remainingTime && (
                              <p className="text-sm text-blue-600">
                                ETA: {formatDuration(currentTracking.remainingTime)}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackingModal;