// backend/routes/analyticsRoute.js
import express from 'express';
import {
  getClickData,
  getVideoData,
  getUserData,
  getCartData,
  getVisitorData,
} from '../analyticsBackend.js'; // Directly import from analyticsBackend.js

const router = express.Router();

// Route to get click data
router.get('/analytics/clicks', getClickData);

// Route to get video data
router.get('/analytics/videos', getVideoData);

// Route to get user data
router.get('/analytics/users', getUserData);

// Route to get cart data
router.get('/analytics/cart', getCartData);

// Route to get visitor data
router.get('/analytics/visitors', getVisitorData);

export default router;
