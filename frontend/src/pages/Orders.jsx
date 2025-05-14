import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaCheck, FaTruck, FaSpinner, FaTimesCircle, FaCalendar, FaMoneyBill, FaChevronDown } from 'react-icons/fa';
import TrackingModal from '../components/TrackingModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Add this helper function at the top level
const calculatePaymentSchedule = (item) => {
  console.log('Calculating schedule for item:', item);

  if (!item || !item.price) return null;

  const totalPrice = item.totalPrice || item.price;
  const downPayment = item.downPayment || 0;
  const monthlyPayment = item.monthlyPayment || 0;

  // Calculate initial remaining balance after down payment
  const initialRemainingBalance = totalPrice - downPayment;
  
  // Calculate total months needed
  const totalMonths = Math.ceil(initialRemainingBalance / monthlyPayment);

  const startDate = new Date(item.date);
  startDate.setDate(startDate.getDate() + 30); // First payment after 30 days

  const payments = [];
  let totalPaid = downPayment; // Track total amount paid including down payment

  // Add down payment as first payment
  payments.push({
    dueDate: new Date(item.date),
    amount: downPayment,
    isPaid: true,
    paymentNumber: 0,
    isDownPayment: true
  });

  // Calculate monthly payments
  for (let i = 0; i < totalMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i);
    
    const remainingBeforePayment = totalPrice - totalPaid;
    const amount = Math.min(monthlyPayment, remainingBeforePayment);

    if (amount > 0) {
      const payment = {
        dueDate: paymentDate,
        amount: Number(amount.toFixed(2)),
        isPaid: false,
        paymentNumber: i + 1,
        isDownPayment: false
      };
      payments.push(payment);
      
      // Only add to totalPaid if payment is marked as paid
      if (payment.isPaid) {
        totalPaid += amount;
      }
    }
  }

  // Calculate current remaining balance
  const remainingAmount = totalPrice - totalPaid;

  return {
    totalPayments: totalMonths,
    totalPrice,
    amountPaid: totalPaid,
    remainingAmount: Number(remainingAmount.toFixed(2)),
    nextPayment: payments.find(p => !p.isPaid && !p.isDownPayment),
    payments,
    monthlyPayment,
    downPayment
  };
};

// Add this helper function at the top of the file
const shouldShowPaymentSchedule = (status) => {
  const status_lc = status?.toLowerCase();
  return ['order placed', 'processing', 'shipped', 'out for delivery', 'delivered'].includes(status_lc);
};

// Update the shouldShowTrackButton function
const shouldShowTrackButton = (status, shipping) => {
  const status_lc = status?.toLowerCase();
  const validStatuses = ['shipped', 'out for delivery'];
  
  if (!validStatuses.includes(status_lc)) {
      return false;
  }

  return shipping && 
         shipping.origin && 
         shipping.destination;
};

// Update the payment status display helper function
const getPaymentStatusInfo = (status) => {
  const statusLower = status?.toLowerCase();
  
  // Show pending only for 'Pending Confirmation' status
  if (statusLower === 'pending confirmation') {
    return {
      text: 'Pending',
      icon: null,
      className: 'text-yellow-600'
    };
  }
  
  // Show confirmed for all other valid statuses
  if (['order placed', 'processing', 'shipped', 'out for delivery', 'delivered'].includes(statusLower)) {
    return {
      text: 'Confirmed',
      icon: <FaCheck className="text-green-500" />,
      className: 'text-green-600'
    };
  }
  
  // Default fallback
  return {
    text: 'Pending',
    icon: null,
    className: 'text-yellow-600'
  };
};

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  const validateToken = async () => {
    if (!token) {
        navigate('/login');
        return;
    }

    try {
        const response = await axios.get(`${backendUrl}/api/user/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.success) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        navigate('/login');
    }
};

useEffect(() => {
    validateToken();
}, [token, navigate]);

// Update the loadOrderData function to properly handle images
const loadOrderData = async () => {
    try {
        if (!token) {
            console.log('No token found');
            navigate('/login');
            return;
        }

        setLoading(true);
        const response = await axios.post(
            `${backendUrl}/api/order/userorders`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('API Response:', response.data); // Debug log

        if (response.data.success) {
            if (!response.data.orders || response.data.orders.length === 0) {
                setOrderData([]);
                return;
            }

            // Process orders and flatten items
            const processedOrders = response.data.orders.flatMap(order => 
                order.items.map(item => ({
                    orderId: order.orderId,
                    date: order.date,
                    status: order.status,
                    payment: order.payment,
                    paymentMethod: order.paymentMethod,
                    productName: item.productName || `${item.brand} ${item.model} ${item.year}`,
                    productImage: item.productImage || item.images?.[0],
                    price: item.price,
                    totalPrice: item.totalPrice,
                    downPayment: item.downPayment,
                    monthlyPayment: item.monthlyPayment,
                    quantity: item.quantity,
                    shipping: order.shipping,
                    address: order.address
                }))
            );

            console.log('Processed Orders:', processedOrders); // Debug log
            setOrderData(processedOrders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        if (error.response?.status === 401) {
            navigate('/login');
        }
    } finally {
        setLoading(false);
    }
};

  // Update the fetchTrackingInfo function
const fetchTrackingInfo = async (orderId) => {
    try {
        console.log('Fetching tracking for order:', orderId);
        setIsTrackingLoading(true);

        const response = await axios.post(
            `${backendUrl}/api/order/track`,
            { orderId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success && response.data.tracking) {
            const tracking = response.data.tracking;
            
            // Validate tracking data
            if (!tracking.origin || !tracking.destination) {
                console.log('Missing origin or destination data');
                setTrackingInfo(null);
                setIsTrackingOpen(false);
                return;
            }

            // Format tracking data for display
            const formattedTracking = {
                origin: {
                    coordinates: {
                        lat: parseFloat(tracking.origin.lat),
                        lng: parseFloat(tracking.origin.lng)
                    }
                },
                destination: {
                    coordinates: {
                        lat: parseFloat(tracking.destination.lat),
                        lng: parseFloat(tracking.destination.lng)
                    }
                },
                currentLocation: tracking.currentLocation ? {
                    lat: parseFloat(tracking.currentLocation.lat),
                    lng: parseFloat(tracking.currentLocation.lng)
                } : null,
                route: tracking.route || [],
                progress: parseFloat(tracking.progress) || 0,
                movementStatus: tracking.movementStatus || 'stopped',
                distance: parseFloat(tracking.distance) || 0,
                duration: parseFloat(tracking.duration) || 0,
                remainingTime: parseFloat(tracking.remainingTime) || 0,
                estimatedDuration: parseFloat(tracking.estimatedDuration) || 0,
                lastUpdated: tracking.lastUpdated ? new Date(tracking.lastUpdated) : new Date()
            };

            console.log('Formatted tracking data:', formattedTracking);
            setTrackingInfo(formattedTracking);
            setIsTrackingOpen(true);
        } else {
            console.log('No tracking data available');
            setTrackingInfo(null);
        }
    } catch (error) {
        console.error('Error fetching tracking info:', error);
        setTrackingInfo(null);
    } finally {
        setIsTrackingLoading(false);
    }
};

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadOrderData();
  }, [token, navigate]);

  // Update the useEffect for real-time tracking updates
useEffect(() => {
    let interval;
    if (isTrackingOpen && selectedOrder) {
        // Initial fetch
        fetchTrackingInfo(selectedOrder);
        
        // Set up interval for real-time updates
        interval = setInterval(() => {
            if (isTrackingOpen && selectedOrder) {
                fetchTrackingInfo(selectedOrder);
            }
        }, 30000); // Update every 30 seconds
    }

    return () => {
        if (interval) {
            clearInterval(interval);
        }
    };
}, [isTrackingOpen, selectedOrder]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FaCheck className="text-green-500" />;
      case 'shipped': return <FaTruck className="text-blue-500" />;
      case 'processing': return <FaSpinner className="text-yellow-500 animate-spin" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaBox className="text-gray-500" />;
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Update the handleTrackOrder function
const handleTrackOrder = async (order) => {
  try {
    setIsLoadingTracking(true);
    setSelectedOrder(order);

    console.log('Tracking order:', order); // Debug log

    // Add authorization header
    const response = await axios.post(
      `${backendUrl}/api/order/track`,
      { 
        orderId: order.orderId // Use order.orderId instead of order._id
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('Tracking response:', response.data); // Debug log
      setTrackingInfo(response.data.tracking);
      setIsTrackingModalOpen(true);
    } else {
      toast.error(response.data.message || 'Failed to load tracking information');
    }
  } catch (error) {
    console.error('Error fetching tracking info:', error);
    toast.error('Failed to load tracking information');
    setIsTrackingModalOpen(false);
    setSelectedOrder(null);
  } finally {
    setIsLoadingTracking(false);
  }
};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-2xl mb-8">
          <Title text1={'MY'} text2={'ORDERS'} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {orderData.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 py-8"
                >
                  No orders found
                </motion.p>
              ) : (
                orderData.map((item, index) => (
                  <motion.div
                    key={`${item.orderId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'path/to/fallback/image.jpg'; // Add a fallback image
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaBox className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {item.productName}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                <p>Price: {currency}{item.totalPrice?.toLocaleString()}</p>
                                <p>Down Payment: {currency}{item.downPayment?.toLocaleString()}</p>
                                <p>Monthly Payment: {currency}{item.monthlyPayment?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                            {getStatusIcon(item.status)}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <p>Order Date: {new Date(item.date).toLocaleDateString()}</p>
                                <p>Payment Method: {item.paymentMethod}</p>
                                <div className="flex items-center gap-1">
                                  <span>Payment Status: </span>
                                  <span className={getPaymentStatusInfo(item.status).className}>
                                    {getPaymentStatusInfo(item.status).text}
                                  </span>
                                  {getPaymentStatusInfo(item.status).icon}
                                </div>
                            </div>
                            {shouldShowTrackButton(item.status, item.shipping) && (
                                <motion.button
                                    onClick={() => handleTrackOrder(item)}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <FaTruck />
                                    Track Order
                                </motion.button>
                            )}
                        </div>
                        {/* ... rest of your order details ... */}
                    </div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <button
                            onClick={() => toggleOrderExpansion(item.orderId)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                        >
                            <FaCalendar />
                            Payment Schedule
                            <FaChevronDown className={`transform transition-transform ${
                                expandedOrders.has(item.orderId) ? 'rotate-180' : ''
                            }`} />
                        </button>

                        {expandedOrders.has(item.orderId) && (
                            <div className="mt-4 space-y-4">
                                {(() => {
                                    const schedule = calculatePaymentSchedule(item);
                                    if (!schedule) return null;

                                    return (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Total Price: 
                                                        <span className="font-semibold ml-2">{currency}{schedule.totalPrice?.toLocaleString()}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">Down Payment: 
                                                        <span className="font-semibold ml-2">{currency}{schedule.downPayment?.toLocaleString()}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">Monthly Payment: 
                                                        <span className="font-semibold ml-2">{currency}{schedule.monthlyPayment?.toLocaleString()}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Amount Paid: 
                                                        <span className="font-semibold ml-2">{currency}{schedule.amountPaid?.toLocaleString()}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">Remaining Amount: 
                                                        <span className="font-semibold ml-2">{currency}{schedule.remainingAmount?.toLocaleString()}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">Total Payments: 
                                                        <span className="font-semibold ml-2">{schedule.totalPayments}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="font-semibold text-gray-800 mb-2">Payment Schedule</h4>
                                                <div className="space-y-2">
                                                    {schedule.payments.map((payment, index) => (
                                                        <div 
                                                            key={index}
                                                            className="flex justify-between items-center p-2 bg-white rounded border"
                                                        >
                                                            <div>
                                                                <span className="text-sm font-medium">
                                                                    {payment.isDownPayment ? 'Down Payment' : `Payment ${payment.paymentNumber}`}
                                                                </span>
                                                                <span className="text-sm text-gray-600 ml-4">
                                                                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">
                                                                    {currency}{payment.amount?.toLocaleString()}
                                                                </span>
                                                                {payment.isPaid ? (
                                                                    <FaCheck className="text-green-500" />
                                                                ) : (
                                                                    <FaMoneyBill className="text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {schedule.nextPayment && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        Next Payment Due: {new Date(schedule.nextPayment.dueDate).toLocaleDateString()}
                                                        <span className="font-semibold ml-2">
                                                            {currency}{schedule.nextPayment.amount?.toLocaleString()}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setSelectedOrder(null);
          setTrackingInfo(null);
          setIsTrackingLoading(false);
        }}
        orderData={orderData.find(order => order.orderId === selectedOrder)}
        tracking={trackingInfo}
        isLoading={isTrackingLoading}
      />
      {isLoadingTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-700">Loading tracking information...</p>
          </div>
        </div>
      )}
      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedOrder(null);
          setTrackingInfo(null);
        }}
        orderData={selectedOrder}
        tracking={trackingInfo}
        isLoading={isLoadingTracking}
        token={token} // Pass token to modal
      />
    </motion.div>
  );
};

export default Orders;
