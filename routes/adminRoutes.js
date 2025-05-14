import express from 'express';
import { adminLogin, getAllUsers } from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users/all', adminAuthMiddleware, getAllUsers);

export default router;
