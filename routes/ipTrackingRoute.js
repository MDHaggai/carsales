import express from 'express';
import {
  trackClicks,
  trackVideos,
  trackPageViews,
  trackAddToCart
} from '../controllers/ipTrackingController.js';

const router = express.Router();

// Route to track product clicks
router.post('/track-click', trackClicks);

// Route to track video views
router.post('/track-videos', trackVideos);

// Route to track page views
router.post('/track-pageviews', trackPageViews);

// Route to track add-to-cart actions
router.post('/track-addtocart', trackAddToCart);

export default router;
