import express from 'express';
import { subscribe, unsubscribe, getAllSubscribers } from '../controllers/subscriptionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.put('/unsubscribe/:email', authMiddleware, unsubscribe);
router.get('/subscribers', authMiddleware, adminAuth, getAllSubscribers);

export default router;