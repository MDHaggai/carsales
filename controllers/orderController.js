import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; // Add this import

// Placing orders
const placeOrder = async (req, res) => {
  try {
    const { address, items, amount, paymentMethod } = req.body;
    const userId = req.userId;

    // Validate input
    if (!address || !items || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Process items with all necessary details
    const processedItems = items.map(item => ({
      price: Number(item.price || 0),
      totalPrice: Number(item.totalPrice || item.price || 0),
      downPayment: Number(item.downPayment || 0),
      monthlyPayment: Number(item.monthlyPayment || 0),
      quantity: Number(item.quantity || 1),
      images: item.images || [],
      brand: item.brand || '',
      model: item.model || '',
      year: item.year || '',
      _id: item._id
    }));

    const orderData = {
      userId,
      address,
      items: processedItems,
      amount: Number(amount),
      paymentMethod,
      status: 'Pending Confirmation', // Updated status
      payment: false,
      date: new Date()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id
    });

  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fetch all orders for Admin Panel
const allOrders = async (req, res) => {
    try {
        // Get all orders
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        
        // Enhance orders with product details
        const enhancedOrders = await Promise.all(
            orders.map(async (order) => {
                // Process each order's items
                const enhancedItems = await Promise.all(
                    order.items.map(async (item) => {
                        try {
                            // Fetch product details using the stored _id
                            const product = await productModel.findById(item._id);
                            
                            if (!product) {
                                console.log(`Product not found for ID: ${item._id}`);
                                return {
                                    ...item.toObject(),
                                    productName: 'Product Not Found',
                                    productImage: null
                                };
                            }

                            // Return item with product details
                            return {
                                ...item.toObject(),
                                productName: product.name || product.brand + ' ' + product.model,
                                productImage: product.images?.[0] || null,
                                brand: product.brand,
                                model: product.model,
                                year: product.year
                            };
                        } catch (error) {
                            console.error(`Error fetching product ${item._id}:`, error);
                            return item;
                        }
                    })
                );

                // Return enhanced order
                return {
                    ...order.toObject(),
                    items: enhancedItems
                };
            })
        );

        res.json({ 
            success: true, 
            orders: enhancedOrders 
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Fetch user-specific orders for Frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Fetch orders
        const orders = await orderModel.find({ userId }).sort({ date: -1 });

        if (!orders || orders.length === 0) {
            return res.json({ 
                success: true, 
                orders: [] 
            });
        }

        // Process orders with product details
        const processedOrders = await Promise.all(orders.map(async (order) => {
            // Process items with product details
            const processedItems = await Promise.all(order.items.map(async (item) => {
                try {
                    // Fetch product details using the item's _id
                    const product = await productModel.findById(item._id);
                    
                    console.log('Found product:', product); // Debug log

                    if (!product) {
                        console.log(`No product found for ID: ${item._id}`);
                        return {
                            _id: item._id,
                            productName: 'Product Not Found',
                            price: item.price || 0,
                            totalPrice: item.totalPrice || 0,
                            downPayment: item.downPayment || 0,
                            monthlyPayment: item.monthlyPayment || 0,
                            quantity: item.quantity || 1,
                            images: [],
                            productImage: null
                        };
                    }

                    return {
                        _id: item._id,
                        productName: `${product.brand} ${product.model} ${product.year}`.trim(),
                        brand: product.brand,
                        model: product.model,
                        year: product.year,
                        price: product.price,
                        totalPrice: item.totalPrice || product.price,
                        downPayment: product.downPayment,
                        monthlyPayment: product.monthlyPayment,
                        quantity: item.quantity || 1,
                        images: product.images,
                        productImage: product.images[0] // Get first image as main product image
                    };
                } catch (error) {
                    console.error(`Error processing item ${item._id}:`, error);
                    return {
                        _id: item._id,
                        productName: 'Error Loading Product',
                        price: item.price || 0,
                        totalPrice: item.totalPrice || 0,
                        downPayment: item.downPayment || 0,
                        monthlyPayment: item.monthlyPayment || 0,
                        quantity: item.quantity || 1,
                        images: [],
                        productImage: null
                    };
                }
            }));

            return {
                orderId: order._id,
                date: order.date,
                status: order.status,
                payment: order.payment,
                paymentMethod: order.paymentMethod,
                shipping: order.shipping,
                address: order.address,
                items: processedItems
            };
        }));

        // Debug logging
        console.log('Processed Orders:', JSON.stringify(processedOrders, null, 2));

        res.json({
            success: true,
            orders: processedOrders
        });

    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await orderModel.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting order'
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order ID is required' 
            });
        }

        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Enhance order with product details
        const enhancedItems = await Promise.all(
            order.items.map(async (item) => {
                try {
                    const product = await productModel.findById(item._id);
                    
                    return {
                        ...item.toObject(),
                        productName: product ? (product.name || `${product.brand} ${product.model}`) : 'Product Not Found',
                        productImage: product?.images?.[0] || null,
                        brand: product?.brand,
                        model: product?.model,
                        year: product?.year
                    };
                } catch (error) {
                    console.error(`Error fetching product ${item._id}:`, error);
                    return item;
                }
            })
        );

        const enhancedOrder = {
            ...order.toObject(),
            items: enhancedItems
        };

        res.json({ 
            success: true, 
            order: enhancedOrder 
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching order details' 
        });
    }
};

// Add this new controller function

const updateShippingLocation = async (req, res) => {
  try {
    const { orderId, currentLocation, progress, remainingTime } = req.body;

    // Validate location coordinates
    if (!currentLocation?.lat || !currentLocation?.lng) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location coordinates'
      });
    }

    const updateData = {
      'shipping.currentLocation': {
        lat: parseFloat(currentLocation.lat),
        lng: parseFloat(currentLocation.lng)
      },
      'shipping.progress': parseFloat(progress),
      'shipping.timeLeft': parseFloat(remainingTime),
      'shipping.lastUpdated': new Date()
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated',
      shipping: updatedOrder.shipping
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new controller function to clear shipping info
const clearShippingInfo = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const clearedShipping = {
      origin: null,
      destination: null,
      route: [],
      currentLocation: null,
      distance: 0,
      duration: 0,
      movementStatus: 'not_started',
      progress: 0,
      timeTracking: {
        startedAt: null,
        pausedAt: null,
        totalPausedTime: 0,
        estimatedDuration: 0,
        remainingTime: 0,
        lastCalculatedAt: null
      },
      lastUpdated: new Date()
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: { shipping: clearedShipping } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipping info cleared successfully',
      shipping: updatedOrder.shipping
    });

  } catch (error) {
    console.error('Error clearing shipping info:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove the first updateMovementStatus function and keep this improved version
const updateMovementStatus = async (req, res) => {
  try {
    const { orderId, movementStatus } = req.body;
    
    // Validate movement status
    if (!['not_started', 'on_transit', 'paused'].includes(movementStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movement status. Must be not_started, on_transit, or paused'
      });
    }

    const now = new Date();
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Initialize shipping if it doesn't exist
    if (!order.shipping) {
      order.shipping = {
        origin: null,
        destination: null,
        route: [],
        currentLocation: null,
        distance: 0,
        duration: 0,
        movementStatus: 'not_started',
        progress: 0,
        timeTracking: {
          startedAt: null,
          pausedAt: null,
          totalPausedTime: 0,
          estimatedDuration: 0,
          remainingTime: 0
        },
        lastUpdated: now
      };
    }

    let updateData = {
      'shipping.movementStatus': movementStatus,
      'shipping.lastUpdated': now
    };

    switch (movementStatus) {
      case 'not_started':
        updateData = {
          ...updateData,
          'shipping.timeTracking.startedAt': null,
          'shipping.timeTracking.pausedAt': null,
          'shipping.timeTracking.totalPausedTime': 0,
          'shipping.progress': 0,
          'shipping.timeTracking.remainingTime': order.shipping.timeTracking?.estimatedDuration || 0
        };
        break;

      case 'on_transit':
        if (!order.shipping.timeTracking?.startedAt) {
          updateData['shipping.timeTracking.startedAt'] = now;
          updateData['shipping.timeTracking.estimatedDuration'] = order.shipping.duration;
          updateData['shipping.timeTracking.remainingTime'] = order.shipping.duration;
        } else if (order.shipping.movementStatus === 'paused') {
          const pauseDuration = (now - new Date(order.shipping.timeTracking.pausedAt)) / (1000 * 60);
          updateData['shipping.timeTracking.totalPausedTime'] = 
            (order.shipping.timeTracking.totalPausedTime || 0) + pauseDuration;
        }
        updateData['shipping.timeTracking.pausedAt'] = null;
        break;

      case 'paused':
        updateData['shipping.timeTracking.pausedAt'] = now;
        break;
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    // Calculate remaining time
    const remainingTime = updatedOrder.calculateRemainingTime();
    await updatedOrder.save();

    res.json({
      success: true,
      message: `Movement ${movementStatus.replace('_', ' ')}`,
      shipping: updatedOrder.shipping
    });

  } catch (error) {
    console.error('Error updating movement status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update the trackOrder function to calculate remaining time
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log('Tracking request for orderId:', orderId);

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure shipping exists
    if (!order.shipping) {
      order.shipping = {
        origin: null,
        destination: null,
        route: [],
        currentLocation: null,
        distance: 0,
        duration: 0,
        movementStatus: 'not_started',
        progress: 0,
        timeTracking: {
          startedAt: null,
          estimatedDuration: 0,
          remainingTime: 0
        }
      };
      await order.save();
    }

    // Log the actual movement status from database
    console.log('Database movement status:', order.shipping.movementStatus);

    // Calculate progress and remaining time if in transit
    let progress = order.shipping.progress || 0;
    let remainingTime = order.shipping.timeTracking?.remainingTime || 0;

    if (order.shipping.movementStatus === 'on_transit') {
      const startTime = new Date(order.shipping.timeTracking?.startedAt);
      const now = new Date();
      const elapsedMinutes = (now - startTime) / (1000 * 60);
      const totalPausedTime = order.shipping.timeTracking?.totalPausedTime || 0;
      const actualElapsed = elapsedMinutes - totalPausedTime;

      // Update progress and remaining time
      progress = Math.min(100, (actualElapsed / order.shipping.timeTracking.estimatedDuration) * 100);
      remainingTime = Math.max(0, order.shipping.timeTracking.estimatedDuration - actualElapsed);

      // Update order with new calculations
      order.shipping.progress = progress;
      order.shipping.timeTracking.remainingTime = remainingTime;
      await order.save();
    }

    const trackingData = {
      origin: order.shipping.origin,
      destination: order.shipping.destination,
      currentLocation: order.shipping.currentLocation || order.shipping.origin,
      route: order.shipping.route || [],
      progress,
      movementStatus: order.shipping.movementStatus,
      distance: order.shipping.distance || 0,
      duration: order.shipping.duration || 0,
      estimatedDuration: order.shipping.timeTracking?.estimatedDuration || 0,
      remainingTime,
      lastUpdated: new Date()
    };

    console.log('Sending tracking data:', trackingData);

    res.json({
      success: true,
      tracking: trackingData
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to validate coordinates
const isValidCoordinates = (coords) => {
  return coords && 
         typeof coords.lat === 'number' && 
         typeof coords.lng === 'number' &&
         !isNaN(coords.lat) && 
         !isNaN(coords.lng) &&
         coords.lat >= -90 && coords.lat <= 90 &&
         coords.lng >= -180 && coords.lng <= 180;
};

// Update the updateShippingInfo function
const updateShippingInfo = async (req, res) => {
  try {
    const { 
      orderId, 
      origin, 
      destination, 
      route, 
      distance, 
      duration, 
      movementStatus = 'not_started' 
    } = req.body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates provided'
      });
    }

    const updateData = {
      'shipping.origin': {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      },
      'shipping.destination': {
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng)
      },
      'shipping.route': route || [],
      'shipping.distance': parseFloat(distance) || 0,
      'shipping.duration': parseFloat(duration) || 0,
      'shipping.movementStatus': movementStatus,
      'shipping.lastUpdated': new Date(),
      'shipping.progress': 0,
      'shipping.currentLocation': {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      },
      'shipping.timeTracking': {
        estimatedDuration: parseFloat(duration) || 0,
        remainingTime: parseFloat(duration) || 0
      }
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.json({
      success: true,
      shipping: updatedOrder.shipping
    });

  } catch (error) {
    console.error('Error updating shipping info:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add these new controller functions

const getPaymentSchedule = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Calculate payment schedule if not already exists
        if (!order.paymentSchedule || order.paymentSchedule.length === 0) {
            const schedule = calculatePaymentSchedule(order);
            order.paymentSchedule = schedule.payments;
            order.paymentTracking = {
                totalPayments: schedule.totalPayments,
                totalPrice: schedule.totalPrice,
                amountPaid: schedule.amountPaid,
                remainingAmount: schedule.remainingAmount,
                nextPaymentDue: schedule.nextPayment?.dueDate,
                monthlyPayment: schedule.monthlyPayment,
                downPayment: schedule.downPayment
            };
            await order.save();
        }

        res.json({
            success: true,
            schedule: {
                payments: order.paymentSchedule,
                tracking: order.paymentTracking
            }
        });
    } catch (error) {
        console.error('Error fetching payment schedule:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const validatePayment = async (req, res) => {
    try {
        const { 
            orderId, 
            paymentNumber, 
            paymentMethod, 
            transactionId, 
            notes 
        } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Find the payment in schedule
        const paymentIndex = order.paymentSchedule.findIndex(
            p => p.paymentNumber === paymentNumber
        );

        if (paymentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found in schedule'
            });
        }

        // Update payment status
        order.paymentSchedule[paymentIndex] = {
            ...order.paymentSchedule[paymentIndex],
            isPaid: true,
            paidDate: new Date(),
            paidBy: req.userId, // Admin who validated
            paymentMethod,
            transactionId,
            notes
        };

        // Update tracking information
        const amountPaid = order.paymentSchedule.reduce((sum, payment) => {
            return payment.isPaid ? sum + payment.amount : sum;
        }, 0);

        order.paymentTracking.amountPaid = amountPaid;
        order.paymentTracking.remainingAmount = 
            order.paymentTracking.totalPrice - amountPaid;

        // Find next unpaid payment
        const nextPayment = order.paymentSchedule.find(p => !p.isPaid);
        order.paymentTracking.nextPaymentDue = nextPayment?.dueDate;

        await order.save();

        res.json({
            success: true,
            message: 'Payment validated successfully',
            paymentSchedule: order.paymentSchedule,
            tracking: order.paymentTracking
        });
    } catch (error) {
        console.error('Error validating payment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to calculate payment schedule
const calculatePaymentSchedule = (order) => {
    const firstItem = order.items[0];
    if (!firstItem) return null;

    const totalPrice = firstItem.totalPrice || firstItem.price;
    const downPayment = firstItem.downPayment || 0;
    const monthlyPayment = firstItem.monthlyPayment || 0;

    const initialRemainingBalance = totalPrice - downPayment;
    const totalMonths = Math.ceil(initialRemainingBalance / monthlyPayment);

    const startDate = new Date(order.date);
    startDate.setDate(startDate.getDate() + 30);

    const payments = [];
    let totalPaid = downPayment;

    // Add down payment
    payments.push({
        dueDate: new Date(order.date),
        amount: downPayment,
        isPaid: true,
        paymentNumber: 0,
        isDownPayment: true,
        paidDate: new Date(order.date)
    });

    // Calculate monthly payments
    for (let i = 0; i < totalMonths; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i);
        
        const remainingBeforePayment = totalPrice - totalPaid;
        const amount = Math.min(monthlyPayment, remainingBeforePayment);

        if (amount > 0) {
            payments.push({
                dueDate: paymentDate,
                amount: Number(amount.toFixed(2)),
                isPaid: false,
                paymentNumber: i + 1,
                isDownPayment: false
            });
        }
    }

    return {
        totalPayments: totalMonths,
        totalPrice,
        amountPaid: totalPaid,
        remainingAmount: totalPrice - totalPaid,
        nextPayment: payments.find(p => !p.isPaid),
        payments,
        monthlyPayment,
        downPayment
    };
};

// Add this new controller function
const getPaymentDetails = async (req, res) => {
    try {
        const { orderId, paymentNumber } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const payment = order.paymentSchedule?.find(p => p.paymentNumber === paymentNumber);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add new controller function to get current shipping status
const getShippingStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);

    if (!order || !order.shipping) {
      return res.status(404).json({
        success: false,
        message: 'Order or shipping info not found'
      });
    }

    // Calculate remaining time and progress
    if (order.shipping.movementStatus === 'on_transit') {
      const startTime = new Date(order.shipping.timeTracking.startedAt);
      const now = new Date();
      const elapsedMinutes = (now - startTime) / (1000 * 60);
      const totalPausedTime = order.shipping.timeTracking.totalPausedTime || 0;
      const actualElapsed = elapsedMinutes - totalPausedTime;

      // Update remaining time
      const remainingTime = Math.max(0, order.shipping.timeTracking.estimatedDuration - actualElapsed);
      order.shipping.timeTracking.remainingTime = remainingTime;

      // Update progress
      const progress = Math.min(100, (actualElapsed / order.shipping.timeTracking.estimatedDuration) * 100);
      order.shipping.progress = progress;

      await order.save();
    }

    res.json({
      success: true,
      shipping: order.shipping
    });
  } catch (error) {
    console.error('Error getting shipping status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update the exports section to include getPaymentDetails
export { 
    placeOrder, 
    allOrders, 
    userOrders, 
    updateStatus, 
    getOrderDetails,
    updateShippingLocation,
    updateMovementStatus,
    trackOrder,
    updateShippingInfo,
    deleteOrder,
    getPaymentSchedule,
    validatePayment,
    getPaymentDetails, // Add this export
    clearShippingInfo, // Add this export
    getShippingStatus // Add this export
};
