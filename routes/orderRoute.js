import express from 'express';
import { 
    placeOrder, 
    allOrders, 
    userOrders, 
    updateStatus, 
    deleteOrder, 
    getOrderDetails, 
    trackOrder,
    updateShippingLocation,
    updateMovementStatus,
    updateShippingInfo,// Add this import
    getPaymentSchedule,
    validatePayment,
    getPaymentDetails,
    clearShippingInfo,
    getShippingStatus
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/list', adminAuth, allOrders);
router.post('/status', adminAuth, updateStatus);
router.delete('/delete/:orderId', adminAuth, deleteOrder);
router.post('/details', adminAuth, getOrderDetails);
router.post('/shipping', adminAuth, updateShippingInfo); // Add shipping route
router.post('/movement', adminAuth, updateMovementStatus); // Add movement route
router.post('/location', adminAuth, updateShippingLocation); // Add location route
// Add these new routes
router.post('/payment-schedule', adminAuth, getPaymentSchedule);
router.post('/validate-payment', adminAuth, validatePayment);
router.post('/payment-details', adminAuth, getPaymentDetails);
// Add new route for clearing shipping info
router.post('/shipping/clear', adminAuth, clearShippingInfo);
router.post('/shipping/status', adminAuth, getShippingStatus); // Add shipping status route

// User routes
router.post('/place', authMiddleware, placeOrder);
router.post('/userorders', authMiddleware, userOrders);
router.post('/track', authMiddleware, trackOrder);

export default router;
